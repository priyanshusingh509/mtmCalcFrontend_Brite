// clickhouse-example.js

const { createClient } = require('@clickhouse/client');

// Create the ClickHouse client
const clickhouse = createClient({
  host: 'http://192.168.:8123', // or your remote ClickHouse host
  username: 'default',
  password: '',
  database: 'default',
});

// Run a SELECT query
async function runQuery() {
  try {
    const resultSet = await clickhouse.query({
      query: 'SELECT * FROM your_table LIMIT 10',
      format: 'JSON', // or 'JSONEachRow', 'CSV', etc.
    });

    const rows = await resultSet.json(); // Get result as JSON
    console.log('✅ Query result:', rows);
  } catch (error) {
    console.error('❌ ClickHouse query failed:', error);
  }
}

runQuery();
