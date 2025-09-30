const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

module.exports = { query: (text, params) => pool.query(text, params) };
