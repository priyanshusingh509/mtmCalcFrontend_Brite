// clickhouse-example.js

const { createClient } = require('@clickhouse/client');

// Create the ClickHouse client
const clickhouse = createClient({
  url: 'http://192.168.4.198:8123', // or your remote ClickHouse host
  username: 'default',
  password: 'admin',
  database: "testDb"
});

// Run a SELECT query
async function runQuery() {
  console.time("query time")
  try {
    const resultSet = await clickhouse.query({
      query: 'SELECT count() FROM bseTradeData2',
      format: 'JSONEachRow', // or 'JSONEachRow', 'CSV', etc.
    });

    const rows = await resultSet.json(); // Get result as JSON
    console.log('✅ Query result:', rows);
  } catch (error) {
    console.error('❌ ClickHouse query failed:', error);
  }
  console.timeEnd("query time")
}

runQuery();
