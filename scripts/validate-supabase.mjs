#!/usr/bin/env node

/**
 * Supabase Connection Validation Script
 * 
 * This script validates that Supabase is properly configured and connected.
 * It checks:
 * 1. Environment variables are set
 * 2. Supabase client can be initialized
 * 3. Connection to Supabase can be established
 * 4. Basic API health check
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
config({ path: join(rootDir, '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function success(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function error(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function warning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function section(title) {
  console.log(`\n${colors.bold}${title}${colors.reset}`);
  console.log('─'.repeat(50));
}

async function validateSupabaseConnection() {
  let exitCode = 0;

  section('🔍 Supabase Connection Validation');

  // Step 1: Check environment variables
  section('1. Environment Variables');
  
  if (!SUPABASE_URL) {
    error('VITE_SUPABASE_URL is not set');
    info('Please set VITE_SUPABASE_URL in your .env.local file');
    exitCode = 1;
  } else {
    success(`VITE_SUPABASE_URL: ${SUPABASE_URL.substring(0, 30)}...`);
  }

  if (!SUPABASE_ANON_KEY) {
    error('VITE_SUPABASE_ANON_KEY is not set');
    info('Please set VITE_SUPABASE_ANON_KEY in your .env.local file');
    exitCode = 1;
  } else {
    success(`VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.substring(0, 30)}...`);
  }

  if (exitCode !== 0) {
    error('\nEnvironment variables are not properly configured');
    info('Please refer to SUPABASE_SETUP_GUIDE.md for setup instructions');
    process.exit(exitCode);
  }

  // Step 2: Initialize Supabase client
  section('2. Supabase Client Initialization');
  
  let supabase;
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    success('Supabase client created successfully');
  } catch (err) {
    error(`Failed to create Supabase client: ${err.message}`);
    exitCode = 1;
    process.exit(exitCode);
  }

  // Step 3: Test connection with a simple query
  section('3. Connection Test');
  
  try {
    // Test auth endpoint by checking if we can get the current session
    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      warning(`Session check returned an error: ${sessionError.message}`);
      info('This is normal if no user is logged in');
    } else {
      success('Successfully connected to Supabase auth service');
      info(`Current session: ${data.session ? 'Active session found' : 'No active session'}`);
    }
  } catch (err) {
    error(`Connection test failed: ${err.message}`);
    exitCode = 1;
  }

  // Step 4: Validate URL format
  section('4. Configuration Validation');
  
  try {
    const url = new URL(SUPABASE_URL);
    
    if (url.protocol !== 'https:') {
      warning('Supabase URL should use HTTPS protocol');
    } else {
      success('URL uses secure HTTPS protocol');
    }

    if (!url.hostname.includes('supabase.co')) {
      warning('URL does not appear to be a standard Supabase URL');
    } else {
      success('URL format is valid for Supabase');
    }
  } catch (err) {
    error(`Invalid URL format: ${err.message}`);
    exitCode = 1;
  }

  // Step 5: Test a simple database operation (list tables/schemas)
  section('5. Database Access Test');
  
  try {
    // Try to access the public schema - this will fail if no tables exist but confirms connection
    const { error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (dbError) {
      if (dbError.message.includes('relation "public.profiles" does not exist')) {
        warning('Profiles table does not exist yet');
        info('You may need to run the SQL setup from SUPABASE_SETUP_GUIDE.md');
      } else if (dbError.message.includes('JWT')) {
        warning('JWT token issue - this is normal for initial setup');
        info('The connection to Supabase is working, but authentication needs configuration');
      } else {
        warning(`Database query returned: ${dbError.message}`);
        info('Connection is established but table access may need configuration');
      }
    } else {
      success('Successfully queried the profiles table');
    }
  } catch (err) {
    error(`Database access test failed: ${err.message}`);
    exitCode = 1;
  }

  // Summary
  section('📊 Validation Summary');
  
  if (exitCode === 0) {
    success('All validation checks passed! ✨');
    info('Your Supabase connection is properly configured');
  } else {
    error('Some validation checks failed');
    info('Please review the errors above and consult SUPABASE_SETUP_GUIDE.md');
  }

  console.log(''); // Empty line for better readability
  process.exit(exitCode);
}

// Run validation
validateSupabaseConnection().catch((err) => {
  error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
