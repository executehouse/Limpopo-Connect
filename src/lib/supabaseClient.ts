import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
// In production, these should be set in your hosting environment
// For local development, you can use Vite's .env file support
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not configured. Authentication features may not work.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
