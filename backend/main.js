const express = require("express");
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const Redis = require('redis');

const app = express();
const port = 3000;
const redisClient = Redis.createClient();

app.use(cors());
app.use(express.json());
redisClient.connect();


// function to store first 400 records
async function preloadInitialRecords(){
  const key = 'csv:fixed:0-299';
  const exists = await redisClient.exists(key);

  if(exists){
    console.log("✅ Initial 300 records already cached in Redis");
    return;
  }
  const fixedData = await loadFromCSV(0, 300);
  await redisClient.set('csv:fixed:0-299', JSON.stringify(fixedData));
}


// Helper to read CSV and return specific rows
async function loadFromCSV(start, limit) {
  const results = [];
  return new Promise((resolve, reject) => {
    let lineCount = 0;

    fs.createReadStream('../RealData/tradefile.csv')
      .pipe(csv())
      .on('data', (data) => {
        if (lineCount >= start && lineCount < start + limit) {
          results.push(data);
        }
        lineCount++;
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Route with lazy + fast initial Redis load
app.get('/fetchmock', async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 100;

    // Case 1: Quick serve 0–599 from Redis
    if (start === 0 && limit === 300) {
      const cached = await redisClient.get('csv:fixed:0-299');
      if (cached) {
        console.log('✅ Served from Redis (fixed 0–299)');
        return res.json(JSON.parse(cached));
      } else {
        console.log("❌ Redis missing 0–299, fallback to CSV");
        const data = await loadFromCSV(0, 300);
        await redisClient.set('csv:fixed:0-299', JSON.stringify(data));
        return res.json(data);
      }
    }

    // Case 2: 0–899 — hybrid load (Redis + CSV)
    if (start === 0 && limit === 900) {
      const redisData = await redisClient.get('csv:fixed:0-299');
      let part1 = [];
      if (redisData) {
        console.log('✅ Part 1: Served 0–299 from Redis');
        part1 = JSON.parse(redisData);
      } else {
        console.log("❌ Redis missing 0–299, fallback to CSV");
        part1 = await loadFromCSV(0, 300);
        await redisClient.set('csv:fixed:0-299', JSON.stringify(part1));
      }

      // Part 2: Load 700–1599 from CSV directly
      console.log('⏳ Part 2: Loading 300–899 from CSV...');
      const part2 = await loadFromCSV(300, 900);

      // Merge and respond
      const merged = [...part1, ...part2];
      console.log(`✅ Sent 0–899 (${merged.length} rows total)`);
      return res.json(merged);
    }

    // Case 3: Other ranges (e.g., start=900)
    const data = await loadFromCSV(start, limit);
    console.log(`new data has been taken from backend ${start} and ${limit}`);
    return res.json(data);

  } catch (error) {
    console.error("❌ Error while fetching file data:", error);
    res.status(500).send('Server error');
  }
});



// Start the server
redisClient.on('ready', async () => {
  console.log('🔗 Redis connected');
  await preloadInitialRecords();
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});
