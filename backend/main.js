// server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const Redis = require("redis");
const { createClient } = require('@clickhouse/client');

const app = express();
const port = 3000;
const redisClient = Redis.createClient();
const clickhouse = createClient({
  url: 'http://192.168.1.44:8123', // or your remote ClickHouse host
  username: 'default',
  password: '',
  database: "testDb"
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Redis
redisClient.connect();

// ===========================
// CSV Loader Helper Function
// ===========================
async function loadFromClickhouse(start, limit) {
  return new Promise(async (resolve, reject) => {
    try {
      if(start < 0){
        resolve({});
        return;
      }
      const resultSet = await clickhouse.query({
        query: `SELECT * FROM bseTradeData LIMIT ${limit} OFFSET ${start}`,
        format: 'JSONEachRow',
      });

      const rows = await resultSet.json(); // Await the JSON conversion
      // console.log('✅ Query result:', rows);
      resolve(rows); // Resolve with the actual rows
    } catch (error) {
      console.error('❌ ClickHouse query failed:', error);
      reject(error); // Properly reject with error
    }
  });
}


// ===========================
// Preload Fixed Range in Redis
// ===========================
async function preloadInitialRecords() {
  const key = "clickhouse:0-299";
  const exists = await redisClient.exists(key);

  if (exists) {
    console.log("✅ Initial 300 records already cached in Redis");
    return;
  }

  const fixedData = await loadFromClickhouse(0, 300);
  await redisClient.set(key, JSON.stringify(fixedData));
  console.log("✅ Preloaded 0–299 records into Redis");
}

// ===========================
// API Route
// ===========================
app.get("/goto", async (req, res) => {
  try{
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 300;
    let recordCount = 0;

    const currentRedisKey = `clickhouse:${start}-${start+limit-1}`;
    const redisD = await redisClient.get(currentRedisKey); 
    const redisData = await JSON.parse(redisD); 
    
    
    res.setHeader("Content-Type", "application/json");
    res.write("["); // Start JSON array for streaming response
    let firstChunkInResponse = true;
    if(redisData){
      console.log("data found in redis");
      for (const row of redisData) {
        res.write((firstChunkInResponse ? "" : ",") + JSON.stringify(row));
        recordCount++;
        firstChunkInResponse = false;
      }
    }else{
      console.log(`❌ Redis missing ${start}-${start+limit-1} , loading from Clickhouse...`);
      const FromClickhouse = await loadFromClickhouse(start,limit);
      for (const row of FromClickhouse) {
        res.write((firstChunkInResponse ? "" : ",") + JSON.stringify(row));
        recordCount++;
        firstChunkInResponse = false;
      }
    }
    //first 300 records are sent successfully
    //now send next 300 and previous 300 records from clickhouse only


    //next 300:
    const FromClickhouseNext = await loadFromClickhouse(start+300, limit);
    if(!(FromClickhouseNext.length === undefined)){
      for(const row of FromClickhouseNext){
        res.write(","+JSON.stringify(row));
        recordCount++
      }
    }

    //prev 300:
    const FromClickhousePrev = await loadFromClickhouse(start-300,limit);
    if(!(FromClickhousePrev.length === undefined)){
      for(const row of FromClickhousePrev){
        res.write(","+JSON.stringify(row));
        recordCount++;
      }
    }
    res.write("]");
    res.end();
    console.log(recordCount);

    //data caching
    //we cache the next 300 records and the prev 300 records for easy fetching
    const CacheNext = await loadFromClickhouse(start+600,limit);
    const CacheNextRKey = `clickhouse:${start+600}-${start+600+limit-1}`;
    console.log("Next",CacheNextRKey);
    const ttlNext = await redisClient.ttl(CacheNextRKey);  
    if(!(ttlNext == -1) ){
      // console.log(`ran over Next ${CacheNextRKey}`)
      if(!(CacheNext === undefined)){
        await redisClient.setEx(CacheNextRKey, 300, JSON.stringify(CacheNext));
      }
    }else{
      await redisClient.set(CacheNextRKey,JSON.stringify(CacheNext));
    }
    
    const CachePrev = await loadFromClickhouse(start-600,limit);
    const CachePrevRKey = `clickhouse:${start-600}-${start-600+limit-1}`;
    const ttlPrev = await redisClient.ttl(CachePrevRKey);  
    // console.log(CachePrevRKey);

    if(!(ttlPrev == -1) ){
      // console.log(`ran over Prev ${CachePrevRKey}`)
      if(!(CachePrev.length === undefined)){
        console.log("cacheprev ",CachePrev);
        console.log(CachePrev.length);
        await redisClient.setEx(CachePrevRKey, 300, JSON.stringify(CachePrev));
      }
    }else{
      await redisClient.set(CachePrevRKey,JSON.stringify(CachePrev));
    }
    
    return;
  } catch(error){
    console.error("❌ Error: goto ", error);
    res.status(500).send("Server error");

  }
});

app.get("/consecutivesend", async(req,res) => {
  try{
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 300;

    const currentRedisKey = `clickhouse:${start}-${start+limit-1}`;
    const redisD = await redisClient.get(currentRedisKey); 
    const redisData = await JSON.parse(redisD); 
    //data must always be in redis if this route is called under 5 min
    if(redisData){
      console.log("data found in redis");
      res.json(redisData);
    }else{
      console.log("not found in redis");
      const FromClickhouse = await loadFromClickhouse(start,limit);
      res.json(FromClickhouse);
    }
    
    //catching data accordingly
    //next:300
    const FromClickhouseNextRKey = `clickhouse:${start+300}-${start+300+limit-1}`;
    const FromClickhouseNext = await loadFromClickhouse(start+300, limit);
    if(!(FromClickhouseNext.length === undefined)){
      await redisClient.setEx(FromClickhouseNextRKey,300,JSON.stringify(FromClickhouseNext));
      console.log("saved Next ");
    }
    
    //prev:300
    const FromClickhousePrevRKey = `clickhouse:${start-900}-${start-900+limit-1}`;
    const FromClickhousePrev = await loadFromClickhouse(start-900,limit);
    if(!(FromClickhousePrev.length === undefined)){
      await redisClient.setEx(FromClickhousePrevRKey,300,JSON.stringify(FromClickhousePrev));
      console.log("saved Prev");
    }
  } catch(error){
    console.error("❌ Error: consecutivesend ", error);
  }
})


// ===========================
// Redis Events & App Launch
// ===========================
redisClient.on("ready", async () => {
  console.log("🔗 Redis connected");
  await preloadInitialRecords();
  app.listen(port, () => {
    console.log(`🚀 Server running at http://192.168.4.200:${port}`);
  });
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});
