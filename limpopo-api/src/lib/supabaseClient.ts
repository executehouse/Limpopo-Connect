import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // optional for privileged server ops

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[supabaseClient] SUPABASE_URL or SUPABASE_ANON_KEY not set. Supabase features will be unavailable.');
}

// Client for standard (RLS enforced) operations
export const supabase: SupabaseClient | null = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Service role client for secure server-side operations bypassing RLS when needed
export const supabaseAdmin: SupabaseClient | null = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

export const requireSupabase = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.');
  }
  return supabase;
};

export const requireSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdmin) {
    throw new Error('Supabase service role client not initialized. Ensure SUPABASE_SERVICE_ROLE_KEY is set for admin operations.');
  }
  return supabaseAdmin;
};

export default supabase;