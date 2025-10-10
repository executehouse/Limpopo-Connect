-- supabase/migrations/20251010_init_core_schema.sql
-- Source: Supabase docs, common RLS patterns, and project requirements
-- Purpose: Create core chat schema, RLS, policies, indexes, RPCs, triggers, storage policies
-- NOTE: Review before applying to production. Uses non-destructive CREATE IF NOT EXISTS where applicable.

-- Extensions
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz default now(),
  first_name text,
  last_name text,
  phone text,
  email text,
  avatar_url text,
  role text default 'citizen'
);

alter table public.profiles enable row level security;

-- Policies for profiles
drop policy if exists public_profiles_viewable on public.profiles;
create policy public_profiles_viewable on public.profiles
  for select using (true);

drop policy if exists users_insert_own_profile on public.profiles;
create policy users_insert_own_profile on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists users_update_own_profile on public.profiles;
create policy users_update_own_profile on public.profiles
  for update using (auth.uid() = id);

-- Trigger to auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'citizen')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Rooms
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

-- Room members
create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member', -- 'member' | 'admin'
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.room_members enable row level security;

-- Message threads
create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  subject text,
  message_count integer not null default 0,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.message_threads enable row level security;

-- Room messages
create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.room_messages enable row level security;

-- Audit log
create table if not exists public.room_messages_audit (
  id bigserial primary key,
  message_id uuid,
  action text not null check (action in ('insert','update','delete')),
  old_payload jsonb,
  new_payload jsonb,
  performed_by uuid,
  created_at timestamptz not null default now()
);

alter table public.room_messages_audit enable row level security;

-- Summary jobs
create table if not exists public.summary_jobs (
  id bigserial primary key,
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','processing','done','failed')),
  attempts integer not null default 0,
  next_run_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.summary_jobs enable row level security;

-- Thread summaries
create table if not exists public.thread_summaries (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null unique references public.message_threads(id) on delete cascade,
  summary text not null,
  summarizer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.thread_summaries enable row level security;

-- Businesses (basic for future expansion)
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  address text,
  phone text,
  email text,
  website text,
  latitude double precision,
  longitude double precision,
  rating double precision,
  image_url text,
  opening_hours text,
  verified boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

-- Reports (generic content reports)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Indexes
create index if not exists idx_room_members_room_user on public.room_members(room_id, user_id);
create index if not exists idx_room_members_user on public.room_members(user_id);
create index if not exists idx_threads_room on public.message_threads(room_id);
create index if not exists idx_threads_last_activity on public.message_threads(room_id, last_activity_at desc);
create index if not exists idx_messages_thread_created on public.room_messages(thread_id, created_at desc);
create index if not exists idx_messages_room_created on public.room_messages(room_id, created_at desc);
create index if not exists idx_messages_user on public.room_messages(user_id);
create index if not exists idx_audit_message on public.room_messages_audit(message_id);
create index if not exists idx_jobs_status_next_run on public.summary_jobs(status, next_run_at);

-- RLS Policies

-- Rooms policies
drop policy if exists rooms_select_member on public.rooms;
create policy rooms_select_member on public.rooms
  for select using (created_by = auth.uid());

drop policy if exists rooms_insert_auth on public.rooms;
create policy rooms_insert_auth on public.rooms
  for insert with check (created_by = auth.uid());

drop policy if exists rooms_update_admin_or_creator on public.rooms;
create policy rooms_update_admin_or_creator on public.rooms
  for update using (created_by = auth.uid());

drop policy if exists rooms_delete_admin_or_creator on public.rooms;
create policy rooms_delete_admin_or_creator on public.rooms
  for delete using (created_by = auth.uid());

-- Room members policies
drop policy if exists members_select_room_member on public.room_members;
create policy members_select_room_member on public.room_members
  for select using (
    -- Users can see their own memberships
    user_id = auth.uid()
  );

-- self join insert: allow user to join themselves
drop policy if exists members_insert_self on public.room_members;
create policy members_insert_self on public.room_members
  for insert with check (
    user_id = auth.uid() and exists (select 1 from public.rooms r where r.id = room_id)
  );

-- admin can add others
drop policy if exists members_insert_admin on public.room_members;
create policy members_insert_admin on public.room_members
  for insert with check (
    -- Allow room creator to add members
    exists (
      select 1 from public.rooms r 
      where r.id = room_id and r.created_by = auth.uid()
    )
  );

-- allow admin to update roles; user can update own row (e.g., leave)
drop policy if exists members_update_rules on public.room_members;
create policy members_update_rules on public.room_members
  for update using (
    -- Users can update their own membership (to leave, etc.)
    user_id = auth.uid()
    or
    -- Room creator can update any membership
    exists (
      select 1 from public.rooms r 
      where r.id = room_id and r.created_by = auth.uid()
    )
  );

drop policy if exists members_delete_admin_or_self on public.room_members;
create policy members_delete_admin_or_self on public.room_members
  for delete using (
    -- Users can delete their own membership (leave room)
    user_id = auth.uid()
    or
    -- Room creator can remove any member
    exists (
      select 1 from public.rooms r 
      where r.id = room_id and r.created_by = auth.uid()
    )
  );

-- Threads policies
drop policy if exists threads_select_member on public.message_threads;
create policy threads_select_member on public.message_threads
  for select using (created_by = auth.uid());

drop policy if exists threads_insert_member on public.message_threads;
create policy threads_insert_member on public.message_threads
  for insert with check (created_by = auth.uid());

drop policy if exists threads_update_admin_or_creator on public.message_threads;
create policy threads_update_admin_or_creator on public.message_threads
  for update using (created_by = auth.uid());

-- Messages policies
drop policy if exists messages_select_member on public.room_messages;
create policy messages_select_member on public.room_messages
  for select using (user_id = auth.uid());

drop policy if exists messages_insert_member on public.room_messages;
create policy messages_insert_member on public.room_messages
  for insert with check (user_id = auth.uid());

drop policy if exists messages_update_author_or_admin on public.room_messages;
create policy messages_update_author_or_admin on public.room_messages
  for update using (user_id = auth.uid());

drop policy if exists messages_delete_author_or_admin on public.room_messages;
create policy messages_delete_author_or_admin on public.room_messages
  for delete using (user_id = auth.uid());

-- Audit policies: visible to message author only  
drop policy if exists audit_select_room_member on public.room_messages_audit;
create policy audit_select_room_member on public.room_messages_audit
  for select using (exists (
    select 1 from public.room_messages m
    where m.id = room_messages_audit.message_id and m.user_id = auth.uid()
  ));

-- Thread summaries
drop policy if exists summaries_select_member on public.thread_summaries;
create policy summaries_select_member on public.thread_summaries
  for select using (exists (
    select 1 from public.message_threads t
    where t.id = thread_summaries.thread_id and t.created_by = auth.uid()
  ));

-- Only service role may write summaries
drop policy if exists summaries_write_service_role on public.thread_summaries;
create policy summaries_write_service_role on public.thread_summaries
  for all to anon, authenticated using (false) with check (false);

-- Businesses policies: readable by all, writes by creator
drop policy if exists businesses_select_all on public.businesses;
create policy businesses_select_all on public.businesses for select using (true);
drop policy if exists businesses_insert_auth on public.businesses;
create policy businesses_insert_auth on public.businesses for insert with check (created_by = auth.uid());
drop policy if exists businesses_update_owner on public.businesses;
create policy businesses_update_owner on public.businesses for update using (created_by = auth.uid());
drop policy if exists businesses_delete_owner on public.businesses;
create policy businesses_delete_owner on public.businesses for delete using (created_by = auth.uid());

-- Reports: reporter only read own; insert own
drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports for select using (reporter_id = auth.uid());
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports for insert with check (reporter_id = auth.uid());

-- Storage: bucket and policies for user uploads
insert into storage.buckets (id, name, public)
select 'user-uploads', 'user-uploads', false
where not exists (select 1 from storage.buckets where id = 'user-uploads');

-- Allow users to read their own objects and write to their own folder
drop policy if exists user_uploads_read_own on storage.objects;
create policy user_uploads_read_own on storage.objects
  for select using (
    bucket_id = 'user-uploads'
    and (split_part(name, '/', 1) = auth.uid()::text)
  );

drop policy if exists user_uploads_insert_own on storage.objects;
create policy user_uploads_insert_own on storage.objects
  for insert with check (
    bucket_id = 'user-uploads'
    and (split_part(name, '/', 1) = auth.uid()::text)
  );

drop policy if exists user_uploads_update_own on storage.objects;
create policy user_uploads_update_own on storage.objects
  for update using (
    bucket_id = 'user-uploads'
    and (split_part(name, '/', 1) = auth.uid()::text)
  );

drop policy if exists user_uploads_delete_own on storage.objects;
create policy user_uploads_delete_own on storage.objects
  for delete using (
    bucket_id = 'user-uploads'
    and (split_part(name, '/', 1) = auth.uid()::text)
  );

-- Functions and triggers
-- Audit triggers for room_messages
create or replace function public.tg_room_messages_audit_ins()
returns trigger as $$
begin
  insert into public.room_messages_audit(message_id, action, new_payload, performed_by)
  values (new.id, 'insert', 
    jsonb_build_object(
      'id', new.id,
      'thread_id', new.thread_id,
      'room_id', new.room_id,
      'user_id', new.user_id,
      'body', new.body,
      'edited', new.edited,
      'created_at', new.created_at
    ), 
    auth.uid());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.tg_room_messages_audit_upd()
returns trigger as $$
begin
  insert into public.room_messages_audit(message_id, action, old_payload, new_payload, performed_by)
  values (new.id, 'update', 
    jsonb_build_object(
      'id', old.id,
      'thread_id', old.thread_id,
      'room_id', old.room_id,
      'user_id', old.user_id,
      'body', old.body,
      'edited', old.edited,
      'created_at', old.created_at,
      'updated_at', old.updated_at
    ),
    jsonb_build_object(
      'id', new.id,
      'thread_id', new.thread_id,
      'room_id', new.room_id,
      'user_id', new.user_id,
      'body', new.body,
      'edited', new.edited,
      'created_at', new.created_at,
      'updated_at', new.updated_at
    ), 
    auth.uid());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.tg_room_messages_audit_del()
returns trigger as $$
begin
  insert into public.room_messages_audit(message_id, action, old_payload, performed_by)
  values (old.id, 'delete', 
    jsonb_build_object(
      'id', old.id,
      'thread_id', old.thread_id,
      'room_id', old.room_id,
      'user_id', old.user_id,
      'body', old.body,
      'edited', old.edited,
      'created_at', old.created_at,
      'updated_at', old.updated_at
    ), 
    auth.uid());
  return old;
end;
$$ language plpgsql security definer set search_path = public;

-- Update thread counters and last activity
create or replace function public.tg_messages_update_thread()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.message_threads
      set message_count = message_count + 1,
          last_activity_at = now()
      where id = new.thread_id;
  elsif (tg_op = 'UPDATE') then
    update public.message_threads
      set last_activity_at = now()
      where id = new.thread_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = public;

-- Broadcast to realtime channel if available
create or replace function public.tg_broadcast_room_message()
returns trigger as $$
declare
  v_room_id uuid := coalesce(new.room_id, old.room_id);
  v_payload jsonb;
begin
  v_payload := jsonb_build_object(
    'id', coalesce(new.id, old.id),
    'thread_id', coalesce(new.thread_id, old.thread_id),
    'room_id', v_room_id,
    'user_id', coalesce(new.user_id, old.user_id),
    'body', coalesce(new.body, old.body),
    'op', tg_op,
    'created_at', coalesce(new.created_at, old.created_at)
  );

  -- If realtime.broadcast exists, use it
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'realtime' and p.proname = 'broadcast'
  ) then
    perform realtime.broadcast(
      channel => 'room:' || v_room_id::text || ':messages',
      payload => v_payload
    );
  else
    -- Fallback to NOTIFY for clients listening on pg notifications
    perform pg_notify('room:' || v_room_id::text || ':messages', v_payload::text);
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = public;

-- Attach triggers
drop trigger if exists trg_room_messages_audit_ins on public.room_messages;
create trigger trg_room_messages_audit_ins
  after insert on public.room_messages
  for each row execute procedure public.tg_room_messages_audit_ins();

drop trigger if exists trg_room_messages_audit_upd on public.room_messages;
create trigger trg_room_messages_audit_upd
  after update on public.room_messages
  for each row execute procedure public.tg_room_messages_audit_upd();

drop trigger if exists trg_room_messages_audit_del on public.room_messages;
create trigger trg_room_messages_audit_del
  after delete on public.room_messages
  for each row execute procedure public.tg_room_messages_audit_del();

drop trigger if exists trg_room_messages_thread_counter on public.room_messages;
create trigger trg_room_messages_thread_counter
  after insert or update on public.room_messages
  for each row execute procedure public.tg_messages_update_thread();

drop trigger if exists trg_room_messages_broadcast on public.room_messages;
create trigger trg_room_messages_broadcast
  after insert or update or delete on public.room_messages
  for each row execute procedure public.tg_broadcast_room_message();

-- RPC: post_message transactional helper
create or replace function public.post_message(p_room_id uuid, p_thread_id uuid, p_body text)
returns uuid as $$
declare
  v_user_id uuid := auth.uid();
  v_message_id uuid;
  v_thread_id uuid;
  v_is_member boolean;
  v_message_count integer;
begin
  if v_user_id is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;

  if p_body is null or length(btrim(p_body)) = 0 then
    raise exception 'message body required';
  end if;

  if length(p_body) > 4000 then
    raise exception 'message body too long (max 4000)';
  end if;

  select exists (
    select 1 from public.room_members rm where rm.room_id = p_room_id and rm.user_id = v_user_id
  ) into v_is_member;

  if not v_is_member then
    raise exception 'not a member of room %', p_room_id using errcode = '42501';
  end if;

  if p_thread_id is null then
    insert into public.message_threads (room_id, created_by, subject)
    values (p_room_id, v_user_id, null)
    returning id into v_thread_id;
  else
    -- ensure thread belongs to room
    select id into v_thread_id from public.message_threads
    where id = p_thread_id and room_id = p_room_id;
    if v_thread_id is null then
      raise exception 'thread not in room';
    end if;
  end if;

  insert into public.room_messages (thread_id, room_id, user_id, body)
  values (v_thread_id, p_room_id, v_user_id, p_body)
  returning id into v_message_id;

  -- enqueue summary job on thresholds
  select message_count into v_message_count from public.message_threads where id = v_thread_id;
  if v_message_count is not null and v_message_count > 0 and v_message_count % 50 = 0 then
    insert into public.summary_jobs (thread_id, status, next_run_at)
    values (v_thread_id, 'queued', now())
    on conflict do nothing;
  end if;

  return v_message_id;
end;
$$ language plpgsql security invoker set search_path = public;

-- Timestamps update helper
create or replace function public.tg_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_threads_updated_at on public.message_threads;
create trigger trg_threads_updated_at before update on public.message_threads
  for each row execute procedure public.tg_set_updated_at();

drop trigger if exists trg_summaries_updated_at on public.thread_summaries;
create trigger trg_summaries_updated_at before update on public.thread_summaries
  for each row execute procedure public.tg_set_updated_at();

drop trigger if exists trg_room_messages_updated_at on public.room_messages;
create trigger trg_room_messages_updated_at before update on public.room_messages
  for each row execute procedure public.tg_set_updated_at();

-- End of migration