// supabase/functions/summary-worker/index.ts
// Purpose: background worker endpoint to claim and process summary jobs.
// This uses service role and is idempotent; can be triggered by cron or manual.

import { createServiceRoleClient, errorResponse, jsonResponse } from '../_shared/utils.ts';

async function claimNextJob(supabase: ReturnType<typeof createServiceRoleClient>) {
  const { data, error } = await supabase
    .from('summary_jobs')
    .update({ status: 'processing', attempts: supabase.rpc('greatest', { a: 0, b: 1 }), updated_at: new Date().toISOString() })
    .eq('status', 'queued')
    .lte('next_run_at', new Date().toISOString())
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .single();
  if (error) return { job: null, error };
  return { job: data, error: null };
}

async function fetchThreadMessages(supabase: ReturnType<typeof createServiceRoleClient>, thread_id: string) {
  const { data, error } = await supabase
    .from('room_messages')
    .select('id, user_id, body, created_at')
    .eq('thread_id', thread_id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

function naiveSummarize(messages: Array<{ body: string }>): string {
  const joined = messages.map(m => m.body).join(' ');
  // simple heuristic: take first 600 chars
  return joined.slice(0, 600) + (joined.length > 600 ? '…' : '');
}

async function writeSummary(supabase: ReturnType<typeof createServiceRoleClient>, thread_id: string, summary: string) {
  // upsert by unique thread_id constraint
  const { error } = await supabase
    .from('thread_summaries')
    .upsert({ thread_id, summary, summarizer: 'naive', updated_at: new Date().toISOString() }, { onConflict: 'thread_id' });
  if (error) throw error;
}

async function markDone(supabase: ReturnType<typeof createServiceRoleClient>, id: number) {
  const { error } = await supabase.from('summary_jobs').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

async function markFailed(supabase: ReturnType<typeof createServiceRoleClient>, id: number, last_error: string) {
  const { error } = await supabase
    .from('summary_jobs')
    .update({ status: 'failed', last_error, attempts: 1, next_run_at: new Date(Date.now() + 60_000).toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  const supabase = createServiceRoleClient();
  try {
    const { job, error } = await claimNextJob(supabase);
    if (error) return errorResponse(error.message, 500);
    if (!job) return jsonResponse({ processed: 0, message: 'no jobs' });

    const messages = await fetchThreadMessages(supabase, job.thread_id);
    const summary = naiveSummarize(messages);
    await writeSummary(supabase, job.thread_id, summary);
    await markDone(supabase, job.id);

    return jsonResponse({ processed: 1, job_id: job.id });
  } catch (e) {
    // best effort attempt to mark failed if job exists in request json
    try {
      const body = await req.json().catch(() => ({}));
      if (body?.job_id) await markFailed(supabase, body.job_id, e.message);
    } catch (_e) {}
    return errorResponse(e.message || 'worker failure', 500);
  }
});
