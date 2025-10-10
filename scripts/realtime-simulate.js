#!/usr/bin/env node
// Quick script to simulate listening to realtime topic naming
// Requires env SUPABASE_URL and SUPABASE_ANON_KEY; listens to a given room id

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const roomId = process.argv[2];
if (!url || !anon) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}
if (!roomId) {
  console.error('Usage: node scripts/realtime-simulate.js <room_id>');
  process.exit(1);
}

const supabase = createClient(url, anon);

const channel = supabase.channel(`room:${roomId}:messages`);
channel.on('broadcast', { event: '*' }, (payload) => {
  console.log('Broadcast:', payload);
});
channel.subscribe((status) => console.log('Channel status:', status));
