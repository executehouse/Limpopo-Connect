/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for use throughout the application.
 * It uses environment variables from Vite to securely configure the connection.
 * 
 * Security Notes:
 * - VITE_SUPABASE_URL: Public Supabase project URL (safe to expose)
 * - VITE_SUPABASE_ANON_KEY: Public anonymous key (safe to expose)
 *   - This key has limited permissions controlled by Row Level Security (RLS)
 *   - RLS policies in the database determine what data users can access
 * - NEVER use SUPABASE_SERVICE_ROLE_KEY in frontend code!
 *   - Service role key bypasses ALL RLS policies
 *   - Only use in server-side code (Vercel API routes, Edge Functions)
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
// Vite exposes env vars prefixed with VITE_ to the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate environment variables
if (!supabaseUrl) {
  console.error('[supabaseClient] VITE_SUPABASE_URL is not set. Please check your .env.local file.');
}

if (!supabaseAnonKey) {
  console.error('[supabaseClient] VITE_SUPABASE_ANON_KEY is not set. Please check your .env.local file.');
}

// Create and export Supabase client
// This client is safe to use in frontend code as it respects RLS policies
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Environment Variable Setup:
 * 
 * 1. Copy .env.example to .env.local
 * 2. Fill in your Supabase project credentials:
 *    - VITE_SUPABASE_URL: Get from Supabase Dashboard → Settings → API → URL
 *    - VITE_SUPABASE_ANON_KEY: Get from Supabase Dashboard → Settings → API → anon public key
 * 
 * 3. For production (Vercel):
 *    - Add environment variables in Vercel Dashboard → Project Settings → Environment Variables
 *    - Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 *    - Optionally add SUPABASE_SERVICE_ROLE_KEY for server-side API routes
 * 
 * Security Reminder:
 * - .env.local is gitignored (never commit it!)
 * - Only use anon key in frontend code
 * - Service role key should ONLY be used in:
 *   - Vercel serverless functions (api/ directory)
 *   - Supabase Edge Functions
 *   - Backend server code
 */

export default supabase;
