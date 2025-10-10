import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Expected payload: { event: "user.created", user: { id, email, user_metadata } }
serve(async (req) => {
  try {
    const payload = await req.json();
    const { event, user } = payload;

    if (event !== 'user.created' || !user || !user.id) {
      return new Response(JSON.stringify({ ok: false, reason: 'ignored_event' }), { status: 200 });
    }

    const userId: string = user.id;
    const email: string | undefined = user.email;
    const full_name: string | undefined = user.user_metadata?.full_name || user.user_metadata?.name || null;

    // Default role is 'citizen'. DO NOT trust client role values here.
    const defaultRole = 'citizen';

    // Upsert into profiles with service-role key (server-side)
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          full_name,
          role: defaultRole,
          created_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('onAuthSignup: upsert profiles error', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
    }

    // Success
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('onAuthSignup: failed', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});