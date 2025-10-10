# Supabase Integration Report

Date: 2025-10-10
Branch: supabase-integration/core

This document summarizes schema, RLS policies, triggers, Edge Functions, background worker, tests, and deployment steps.

## Schema map
- Tables: profiles, rooms, room_members, message_threads, room_messages, room_messages_audit, summary_jobs, thread_summaries, businesses, reports
- FKs: room_members(room_id->rooms.id, user_id->auth.users.id), message_threads(room_id->rooms.id, created_by->auth.users.id), room_messages(thread_id->message_threads.id, room_id->rooms.id, user_id->auth.users.id), summary_jobs(thread_id->message_threads.id), thread_summaries(thread_id->message_threads.id)
- Indexes: room_members(room_id,user_id), room_members(user_id), message_threads(room_id), message_threads(room_id,last_activity_at desc), room_messages(thread_id,created_at desc), room_messages(room_id,created_at desc), room_messages(user_id), room_messages_audit(message_id), summary_jobs(status,next_run_at)
- RLS: Enabled on all public tables above

## Policies added
See `supabase/migrations/20251010_init_core_schema.sql` for exact SQL and rationale comments. Highlights:
- Membership-based SELECT for rooms, threads, messages, audit
- Author/admin-based INSERT/UPDATE/DELETE for messages and rooms
- profiles: public readable; user owns own row
- thread_summaries: read by room members; writes limited to service role
- storage: `user-uploads` bucket with per-user folder policies

## Triggers/functions
- handle_new_user: create public.profiles
- tg_room_messages_audit_(ins|upd|del): write to audit table
- tg_messages_update_thread: maintain message_count and last_activity_at
- tg_broadcast_room_message: broadcast payload to `room:{room_id}:messages` via realtime.broadcast or NOTIFY fallback
- post_message RPC: transactional validation + enqueue summary jobs every 50 messages

## Edge Functions
- post-message: POST { room_id, thread_id?, body } using Authorization Bearer token; calls RPC
- summary-worker: Claims next queued job, summarises messages, upserts thread_summaries, marks done/failed
- Shared: `_shared/utils.ts` for env and clients

## Background jobs
- Queue table: summary_jobs with statuses and retry fields
- Worker: `summary-worker` idempotent, safe to run repeatedly; add scheduler via Supabase Dashboard or external cron

## Storage
- Bucket `user-uploads` created if missing
- Policies restrict read/write to `/<auth.uid()>/*`

## Tests
- TODO: add integration tests using Vitest/Node or Playwright to simulate users/rooms/messages and RLS. See Next Steps.

## Observability
- Use `supabase logs functions post-message --project-ref <local>` for function logs
- Use `supabase status -o json` for service info

## Deployment
- Migrations: `supabase/migrations/20251010_init_core_schema.sql`
- Run locally:
  - supabase start
  - supabase db reset
- CI/CD: add a step to run `supabase db push` against remote (requires link and secrets)

## TODO: APPROVAL
- Link to remote project: `supabase link` (requires access) and set env in GitHub Actions secrets
- Add Edge Function deploy: `supabase functions deploy post-message` and `summary-worker`
- Configure a scheduled trigger (cron) for `summary-worker`
- Confirm storage bucket lifecycle/retention policy
- Rotate keys after initial setup if shared

