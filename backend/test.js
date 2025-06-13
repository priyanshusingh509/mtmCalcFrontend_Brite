app.get("/fetchmock", async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 100;

    // This block handles requests where 'limit' is 900 and 'start' is a multiple of 300.
    // It combines Redis caching for the first 300 records and direct CSV streaming for the next 600.
    // It also preloads the subsequent 300 records into Redis.

    if (limit === 900 && start % 300 === 0) {
      res.setHeader("Content-Type", "application/json");
      res.write("["); // Start JSON array for streaming response

      let firstChunkInResponse = true; // Flag to manage comma separation in JSON array
      let redisPart = []; // Array to hold data fetched from Redis
      let currentRedisKey; // Variable to store the Redis key for the current 300-record chunk

      // --- Handling the first 300 records (Part 1: Redis Cache) ---
      // Special case: if start is 0, use the predefined fixed key 'csv:fixed:0-299'
      if (start === 0) {
        currentRedisKey = "csv:fixed:0-299";
        const redisData = await redisClient.get(currentRedisKey);

        if (redisData) {
          // If data is found in Redis for the fixed key
          console.log("✅ Part 1: Served 0–299 from Redis (fixed key)");
          redisPart = JSON.parse(redisData);
        } else {
          // If data is not in Redis for the fixed key, load from CSV and store it (without TTL)
          console.log("❌ Redis missing 0–299 (fixed key), loading from CSV...");
          redisPart = await loadFromClickhouse(0, 300);
          await redisClient.set(currentRedisKey, JSON.stringify(redisPart)); // Use set (no TTL) for fixed data
          console.log("✅ Cached 0–299 (fixed key) in Redis");
        }
      } else {
        // General case: for 'start' values that are multiples of 300 (but not 0), use a dynamic key
        currentRedisKey = `csv:dynamic:${start}-${start + 299}`;
        const redisData = await redisClient.get(currentRedisKey);

        if (redisData) {
          // If data is found in Redis for the dynamic key
          console.log(`✅ Redis hit for ${currentRedisKey}`);
          redisPart = JSON.parse(redisData);
        } else {
          // If data is not in Redis for the dynamic key, load from CSV and store with TTL
          console.log(`❌ Redis miss for ${currentRedisKey}, loading from CSV...`);
          redisPart = await loadFromClickhouse(start, 300);
        }
      }

      // Write the first 300 records (from Redis/CSV) to the response stream
      for (const row of redisPart) {
        res.write((firstChunkInResponse ? "" : ",") + JSON.stringify(row));
        firstChunkInResponse = false;
      }

      // --- Handling the next 600 records (Part 2: Direct CSV Stream) ---
      const csvStart = start + 300; // Calculate the start index for the CSV portion
      console.log(`⏳ Loading CSV part ${csvStart}–${csvStart + 599}...`);
      const csvPart = await loadFromClickhouse(csvStart, 600); // Load 600 records directly from CSV

      // Write the next 600 records (from CSV) to the response stream
      for (const row of csvPart) {
        res.write("," + JSON.stringify(row)); // Prepend with comma as it's not the first chunk
      }

      res.write("]"); // End JSON array
      res.end(); // End the response

      console.log(`✅ Sent ${start}–${start + 899} (${redisPart.length + csvPart.length} records)`);

      // --- Post-send: Preload the *next* 300 records into Redis with TTL ---
      const nextStart = start + 900;
      const nextKey = `csv:dynamic:${nextStart}-${nextStart + 299}`;
      const nextExists = await redisClient.exists(nextKey);

      if (!nextExists) {
        console.log(`📦 Preloading ${nextStart}–${nextStart + 299} into Redis with TTL...`);
        const nextChunk = await loadFromClickhouse(nextStart, 300);
        await redisClient.setEx(nextKey, 300, JSON.stringify(nextChunk));
        console.log("✅ Cached next 300 with 5min TTL");
      } else {
        console.log("♻️  Next chunk already in Redis");
      }

      // --- Post-send: Preload the *previous* 300 records into Redis with TTL ---
      const prevStart = start - 300;
      if (prevStart >= 0) {
        const prevKey = `csv:dynamic:${prevStart}-${prevStart + 299}`;
        const prevExists = await redisClient.exists(prevKey);

        if (!prevExists) {
          console.log(`📦 Preloading ${prevStart}–${prevStart + 299} into Redis with TTL...`);
          const prevChunk = await loadFromClickhouse(prevStart, 300);
          await redisClient.setEx(prevKey, 300, JSON.stringify(prevChunk));
          console.log("✅ Cached previous 300 with 5min TTL");
        } else {
          console.log("♻️  Previous chunk already in Redis");
        }
      }

      return; // Exit the function after handling this specific request type
    }

    // ========================
    // Fallback for any other 'start' and 'limit' combinations not covered above
    // ========================
    // If the request doesn't match the combined Redis/CSV streaming pattern,
    // it falls back to a general CSV load. You can customize this behavior
    // based on your application's requirements.
    console.log(`Handling general request for start: ${start}, limit: ${limit}`);
    const data = await loadFromClickhouse(start, limit);
    res.json(data); // Send the data as a standard JSON response
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).send("Server error"); // Send a 500 error response in case of any exceptions
  }
});