const { Pool } = require('pg');

// Azure PostgreSQL Flexible Server configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false,
    // Azure PostgreSQL Flexible Server requires SSL but allows self-signed certificates
    // Set to false for Azure Flexible Server compatibility
  } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

module.exports = { query: (text, params) => pool.query(text, params) };
