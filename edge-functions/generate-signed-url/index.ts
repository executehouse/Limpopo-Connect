// Supabase Edge Function (TypeScript)
// Place this folder at `edge-functions/generate-signed-url` before deploying with `supabase functions deploy generate-signed-url`.

import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE')!; // Must be set in project secrets for function runtime
const BUCKET_NAME = Deno.env.get('IMAGES_BUCKET') ?? 'private-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE env variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false }
});

serve(async (req) => {
  try {
    // Expect a JSON body: { path: "user-id/filename.jpg", ttl: 3600 }
    const url = new URL(req.url);

    // Simple Auth: verify authorization header contains a valid JWT (optional but recommended)
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing Bearer token' }), { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Optional: validate token by calling Supabase /auth endpoint
    // A basic check: call supabase.auth.getUser if you want server-side verification (may cost a round-trip)
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const filePath = body.path;
    const ttl = Math.min(body.ttl || 3600, 3600); // max 1 hour

    if (!filePath) {
      return new Response(JSON.stringify({ error: 'Missing file path' }), { status: 400 });
    }

    const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(filePath, ttl);
    if (error || !data) {
      console.error('Signed URL error', error);
      return new Response(JSON.stringify({ error: error?.message || 'Failed to create signed URL' }), { status: 500 });
    }

    return new Response(JSON.stringify({ signedUrl: data.signedUrl, expiresIn: ttl }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
});
