// supabase/functions/post-message/index.ts
// Purpose: secure message posting via Edge Function wrapping RPC or direct writes with service role.
// Rationale: enforce membership, validate payload, and avoid exposing service role to clients.

import { createAnonClient, createServiceRoleClient, errorResponse, jsonResponse } from '../_shared/utils.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { room_id, thread_id, body } = await req.json();
    if (!room_id || typeof room_id !== 'string') return errorResponse('room_id required', 400);
    if (typeof body !== 'string' || body.trim().length === 0) return errorResponse('body required', 400);
    if (body.length > 4000) return errorResponse('message too long', 413);

    const anon = createAnonClient();
    const service = createServiceRoleClient();

    // forward auth from client
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');

    // Determine user via anon client
    const { data: userData, error: userErr } = await anon.auth.getUser(jwt);
    if (userErr || !userData?.user) return errorResponse('unauthorized', 401);

    // Use RPC which enforces RLS and membership; runs as invoking user
    const { data, error } = await service.rpc('post_message', {
      p_room_id: room_id,
      p_thread_id: thread_id ?? null,
      p_body: body,
    });

    if (error) return errorResponse(error.message, 400);

    return jsonResponse({ message_id: data, thread_id: thread_id, room_id });
  } catch (e) {
    return errorResponse(e.message || 'unexpected error', 500);
  }
});
