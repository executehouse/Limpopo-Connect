import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — supabase client disabled');
}

export function getSupabase() {
  if (!supabase) throw new Error('Supabase client not initialized. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
  return supabase;
}

export async function signInWithPassword(email: string, password: string) {
  const client = getSupabase();
  return client.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  const client = getSupabase();
  return client.auth.signUp({ email, password });
}

export async function signOut() {
  const client = getSupabase();
  return client.auth.signOut();
}

export async function sendResetEmail(email: string, redirectTo?: string) {
  const client = getSupabase();
  return client.auth.resetPasswordForEmail(email, { redirectTo });
}

export type { Session, User };

export default supabase;
