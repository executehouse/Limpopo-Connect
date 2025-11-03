import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      // attempt to inspect known shapes safely
      const maybeErr = error as { status?: number } | undefined;
      if (maybeErr?.status === 401 || maybeErr?.status === 403) {
        // Don't retry auth errors
        throw error;
      }
      if (i < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY * Math.pow(2, i)); // Exponential backoff
        continue;
      }
    }
  }
  throw lastError;
}

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'limpopo-connect',
        'x-application-version': import.meta.env.VITE_APP_VERSION || '1.0.0'
      }
    }
  });
} else {
  console.error('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — supabase client disabled');
  throw new Error('Supabase configuration missing. Please check your environment variables.');
}

export function getSupabase() {
  if (!supabase) throw new Error('Supabase client not initialized. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
  return supabase;
}

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export async function signInWithPassword(email: string, password: string) {
  return withRetry(async () => {
    const client = getSupabase();
    const response = await client.auth.signInWithPassword({ email, password });
    if (response.error) {
      throw new SupabaseError(
        response.error.message,
        response.error.name,
        response.error?.status
      );
    }
    return response;
  });
}

export interface SignUpMetadata {
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'citizen' | 'business_owner' | 'visitor';
}

export async function signUpWithEmail(email: string, password: string, metadata: SignUpMetadata) {
  return withRetry(async () => {
    const client = getSupabase();
    const response = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (response.error) {
      throw new SupabaseError(
        response.error.message,
        response.error.name,
        response.error?.status
      );
    }
    return response;
  });
}

export async function signOut() {
  return withRetry(async () => {
    const client = getSupabase();
    const response = await client.auth.signOut();
    if (response.error) {
      throw new SupabaseError(
        response.error.message,
        response.error.name,
        response.error?.status
      );
    }
    return response;
  });
}

export async function sendResetEmail(email: string, redirectTo?: string) {
  return withRetry(async () => {
    const client = getSupabase();
    const response = await client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`
    });
    if (response.error) {
      throw new SupabaseError(
        response.error.message,
        response.error.name,
        response.error?.status
      );
    }
    return response;
  });
}

export type { Session, User };

// Export the configured supabase client for other modules
export { supabase };

export default supabase;
