const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // optional

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[supabaseClient] SUPABASE_URL or SUPABASE_ANON_KEY not set. Supabase features will be unavailable.');
}

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

function requireSupabase() {
  if (!supabase) throw new Error('Supabase client not initialized. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
  return supabase;
}

function requireSupabaseAdmin() {
  if (!supabaseAdmin) throw new Error('Supabase service role client not initialized. Set SUPABASE_SERVICE_ROLE_KEY.');
  return supabaseAdmin;
}

module.exports = { supabase, supabaseAdmin, requireSupabase, requireSupabaseAdmin };
