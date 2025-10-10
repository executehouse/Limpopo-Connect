// supabase/functions/_shared/utils.ts
// Source: Supabase Edge Functions patterns; helper to create admin and anon clients safely.

import { createClient } from 'npm:@supabase/supabase-js@2';

export function getEnv(name: string, opts?: { required?: boolean }) {
  const v = Deno.env.get(name);
  if (!v && opts?.required) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v ?? '';
}

export function createAnonClient() {
  const url = getEnv('SUPABASE_URL', { required: true });
  const anon = getEnv('SUPABASE_ANON_KEY', { required: true });
  return createClient(url, anon);
}

export function createServiceRoleClient() {
  const url = getEnv('SUPABASE_URL', { required: true });
  const service = getEnv('SUPABASE_SERVICE_ROLE_KEY', { required: true });
  return createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}
