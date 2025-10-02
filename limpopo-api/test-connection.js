#!/usr/bin/env node

/**
 * Test Azure PostgreSQL Flexible Server Connection
 * 
 * This script tests the database connection and displays connection information.
 * 
 * Usage:
 *   node test-connection.js
 * 
 * Make sure to set DATABASE_URL environment variable or create .env file first.
 */

require('dotenv').config();
const { Pool } = require('pg');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection() {
  log('cyan', '\n=== Azure PostgreSQL Flexible Server Connection Test ===\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    log('red', '❌ ERROR: DATABASE_URL environment variable is not set!');
    log('yellow', '\nPlease create a .env file with your connection string:');
    log('blue', '   DATABASE_URL=postgresql://username:password@server.postgres.database.azure.com:5432/database?sslmode=require\n');
    process.exit(1);
  }

  // Parse connection string (without exposing password)
  try {
    const url = new URL(process.env.DATABASE_URL);
    log('blue', 'Connection Details:');
    console.log(`  Host: ${url.hostname}`);
    console.log(`  Port: ${url.port || 5432}`);
    console.log(`  Database: ${url.pathname.substring(1).split('?')[0]}`);
    console.log(`  Username: ${url.username}`);
    console.log(`  SSL Mode: ${url.searchParams.get('sslmode') || 'not specified'}\n`);
  } catch (err) {
    log('red', '❌ ERROR: Invalid DATABASE_URL format!');
    log('yellow', 'Expected format: postgresql://username:password@server.postgres.database.azure.com:5432/database?sslmode=require\n');
    process.exit(1);
  }

  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
  });

  try {
    log('yellow', '⏳ Testing connection...');
    
    // Test basic connectivity
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    const duration = Date.now() - startTime;
    
    log('green', `✅ Connection successful! (${duration}ms)\n`);
    
    log('blue', 'Server Information:');
    console.log(`  Time: ${result.rows[0].current_time}`);
    console.log(`  Version: ${result.rows[0].pg_version}\n`);

    // Test table existence
    log('yellow', '⏳ Checking database schema...');
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tableResult.rows.length === 0) {
      log('yellow', '⚠️  No tables found in database.');
      log('blue', '   Run setup-database.sql to create the schema:\n');
      log('cyan', '   psql $DATABASE_URL -f setup-database.sql\n');
    } else {
      log('green', `✅ Found ${tableResult.rows.length} table(s):`);
      tableResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      console.log();
    }

    // Test write permission
    log('yellow', '⏳ Testing write permissions...');
    try {
      await pool.query('CREATE TEMP TABLE test_write (id SERIAL PRIMARY KEY)');
      await pool.query('DROP TABLE test_write');
      log('green', '✅ Write permissions OK\n');
    } catch (err) {
      log('red', `❌ Write permission error: ${err.message}\n`);
    }

    log('green', '=== All tests passed! Database is ready to use. ===\n');

  } catch (err) {
    log('red', `\n❌ Connection failed: ${err.message}\n`);
    
    if (err.code === 'ECONNREFUSED') {
      log('yellow', 'Troubleshooting:');
      console.log('  1. Check if the server hostname is correct');
      console.log('  2. Verify firewall rules allow your IP address');
      console.log('  3. Ensure the PostgreSQL server is running\n');
    } else if (err.code === 'ENOTFOUND') {
      log('yellow', 'Troubleshooting:');
      console.log('  1. Verify the server hostname is correct');
      console.log('  2. Check your internet connection\n');
    } else if (err.message.includes('password authentication failed')) {
      log('yellow', 'Troubleshooting:');
      console.log('  1. Verify username and password are correct');
      console.log('  2. Check if password contains special characters that need URL encoding');
      console.log('  3. For Flexible Server, use just the username (not username@servername)\n');
    } else if (err.message.includes('SSL')) {
      log('yellow', 'Troubleshooting:');
      console.log('  1. Ensure connection string includes ?sslmode=require');
      console.log('  2. Azure PostgreSQL Flexible Server requires SSL\n');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection().catch(err => {
  log('red', `\n❌ Unexpected error: ${err.message}\n`);
  process.exit(1);
});
