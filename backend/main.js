// server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const Redis = require("redis");

const app = express();
const port = 3000;
const redisClient = Redis.createClient();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Redis
redisClient.connect();

// ===========================
// CSV Loader Helper Function
// ===========================
async function loadFromCSV(start, limit) {
  const results = [];
  let lineCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream("../RealData/EQ_ITR_6758_20250604.csv")
      .pipe(csv())
      .on("data", (row) => {
        if (lineCount >= start && lineCount < start + limit) {
          results.push(row);
        }
        lineCount++;
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// ===========================
// Preload Fixed Range in Redis
// ===========================
async function preloadInitialRecords() {
  const key = "csv:fixed:0-299";
  const exists = await redisClient.exists(key);

  if (exists) {
    console.log("✅ Initial 300 records already cached in Redis");
    return;
  }

  const fixedData = await loadFromCSV(0, 300);
  await redisClient.set(key, JSON.stringify(fixedData));
  console.log("✅ Preloaded 0–299 records into Redis");
}

// ===========================
// API Route
// ===========================
app.get("/fetchmock", async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 100;

    const fixedKey = "csv:fixed:0-299";

    // ========================
    // Case 1: Exact match for 0–299
    // ========================
    if (start === 0 && limit === 300) {
      const cached = await redisClient.get(fixedKey);

      if (cached) {
        console.log("✅ Served from Redis (fixed 0–299)");
        return res.json(JSON.parse(cached));
      }

      console.log("❌ Redis missing 0–299, loading from CSV...");
      const data = await loadFromCSV(0, 300);
      await redisClient.set(fixedKey, JSON.stringify(data));
      return res.json(data);
    }

    // ========================
    // Case 2: Hybrid response 0–899 (Redis + CSV stream)
    // ========================
    if (start === 0 && limit === 900) {
  res.setHeader("Content-Type", "application/json");
  res.write("[");

  let firstChunk = true;

  // ----- Part 1: Redis (0–299) -----
  let part1 = [];
  const redisData = await redisClient.get(fixedKey);

  if (redisData) {
    console.log("✅ Part 1: Served 0–299 from Redis");
    part1 = JSON.parse(redisData);
  } else {
    console.log("❌ Redis missing 0–299, loading from CSV...");
    part1 = await loadFromCSV(0, 300);
    await redisClient.set(fixedKey, JSON.stringify(part1));
  }

  for (const row of part1) {
    res.write((firstChunk ? "" : ",") + JSON.stringify(row));
    firstChunk = false;
  }

  // ----- Part 2: CSV (300–899) -----
  console.log("⏳ Part 2: Loading 300–899 from CSV...");
  const part2 = await loadFromCSV(300, 600);

  for (const row of part2) {
    res.write("," + JSON.stringify(row));
  }

  res.write("]");
  res.end();

  console.log(`✅ Sent 0–899 (${part1.length + part2.length} records)`);

  // ----- Post-send: Preload 900–1199 into Redis with TTL -----
  const nextKey = "csv:dynamic:900-1199";
  const exists = await redisClient.exists(nextKey);

  if (!exists) {
    console.log("📦 Preloading next 300 (900–1199) into Redis with TTL...");
    const nextChunk = await loadFromCSV(900, 300);
    await redisClient.setEx(nextKey, 300, JSON.stringify(nextChunk)); // TTL: 5 minutes
    console.log("✅ Cached 900–1199 with 5min TTL");
  } else {
    console.log("♻️  Next 300 (900–1199) already cached");
  }

  return;
}

    // ========================
    // Case 3: Fallback for any other range
    // ========================
if (limit === 900 && start % 300 === 0 && start !== 0) {
  res.setHeader("Content-Type", "application/json");
  res.write("[");

  let firstChunk = true;

  // ----- Part 1: Redis (start–start+299) -----
  const redisKey = `csv:dynamic:${start}-${start + 299}`;
  let redisPart = [];

  const redisData = await redisClient.get(redisKey);

  if (redisData) {
    console.log(`✅ Redis hit for ${redisKey}`);
    redisPart = JSON.parse(redisData);
  } else {
    console.log(`❌ Redis miss for ${redisKey}, loading from CSV...`);
    redisPart = await loadFromCSV(start, 300);
    await redisClient.setEx(redisKey, 300, JSON.stringify(redisPart));
  }

  for (const row of redisPart) {
    res.write((firstChunk ? "" : ",") + JSON.stringify(row));
    firstChunk = false;
  }

  // ----- Part 2: CSV (start+300–start+899) -----
  const csvStart = start + 300;
  console.log(`⏳ Loading CSV part ${csvStart}–${csvStart + 599}...`);
  const csvPart = await loadFromCSV(csvStart, 600);

  for (const row of csvPart) {
    res.write("," + JSON.stringify(row));
  }

  res.write("]");
  res.end();

  console.log(`✅ Sent ${start}–${start + 899} (${redisPart.length + csvPart.length} records)`);

  // ----- Preload next 300 rows (start+900–start+1199) with TTL -----
  const nextStart = start + 900;
  const nextKey = `csv:dynamic:${nextStart}-${nextStart + 299}`;
  const nextExists = await redisClient.exists(nextKey);

  if (!nextExists) {
    console.log(`📦 Preloading ${nextStart}–${nextStart + 299} into Redis with TTL...`);
    const nextChunk = await loadFromCSV(nextStart, 300);
    await redisClient.setEx(nextKey, 300, JSON.stringify(nextChunk));
    console.log("✅ Cached next 300 with TTL (5 mins)");
  } else {
    console.log("♻️  Next chunk already in Redis");
  }

  return;
}

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).send("Server error");
  }
});

// ===========================
// Redis Events & App Launch
// ===========================
redisClient.on("ready", async () => {
  console.log("🔗 Redis connected");
  await preloadInitialRecords();
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});
