-- supabase/migrations/20251012_init_rls_and_indexes.sql
-- Purpose: Add comprehensive RLS policies and indexes for performance optimization
-- Created: 2025-10-12
-- NOTE: This migration reinforces RLS policies on existing tables and adds performance indexes
-- IMPORTANT: Review schema before applying - verify that profiles table uses 'id' column (not 'user_id')

-- Enable RLS on core tables (idempotent - safe to run multiple times)
alter table if exists public.profiles enable row level security;
alter table if exists public.rooms enable row level security;
alter table if exists public.room_members enable row level security;
alter table if exists public.room_messages enable row level security;
alter table if exists public.message_threads enable row level security;

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================

-- Drop existing policies to recreate them (ensures consistency)
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

-- Users can view their own profile
create policy profiles_select_own 
on public.profiles 
for select 
using (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but policy required)
create policy profiles_insert_own 
on public.profiles 
for insert 
with check (auth.uid() = id);

-- Users can update their own profile
create policy profiles_update_own 
on public.profiles 
for update 
using (auth.uid() = id);

-- ============================================
-- ROOMS RLS POLICIES
-- ============================================

drop policy if exists rooms_select_by_membership on public.rooms;
drop policy if exists rooms_insert_authenticated on public.rooms;

-- Users can view rooms they are members of
create policy rooms_select_by_membership 
on public.rooms 
for select 
using (
  exists (
    select 1 from public.room_members
    where room_members.room_id = rooms.id
    and room_members.user_id = auth.uid()
  )
);

-- Authenticated users can create rooms
create policy rooms_insert_authenticated 
on public.rooms 
for insert 
with check (auth.uid() = created_by);

-- ============================================
-- ROOM_MEMBERS RLS POLICIES
-- ============================================

drop policy if exists room_members_select_own_rooms on public.room_members;
drop policy if exists room_members_insert_as_admin on public.room_members;

-- Users can view members of rooms they belong to
create policy room_members_select_own_rooms 
on public.room_members 
for select 
using (
  exists (
    select 1 from public.room_members rm
    where rm.room_id = room_members.room_id
    and rm.user_id = auth.uid()
  )
);

-- Room admins can add members
create policy room_members_insert_as_admin 
on public.room_members 
for insert 
with check (
  exists (
    select 1 from public.room_members
    where room_members.room_id = room_members.room_id
    and room_members.user_id = auth.uid()
    and room_members.role = 'admin'
  )
  or auth.uid() = user_id  -- Users can join rooms themselves
);

-- ============================================
-- ROOM_MESSAGES RLS POLICIES
-- ============================================

drop policy if exists room_messages_select_by_membership on public.room_messages;
drop policy if exists room_messages_insert_by_membership on public.room_messages;

-- Users can view messages in rooms they are members of
create policy room_messages_select_by_membership 
on public.room_messages 
for select 
using (
  exists (
    select 1 from public.room_members
    where room_members.room_id = room_messages.room_id
    and room_members.user_id = auth.uid()
  )
);

-- Users can insert messages in rooms they are members of
create policy room_messages_insert_by_membership 
on public.room_messages 
for insert 
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.room_members
    where room_members.room_id = room_messages.room_id
    and room_members.user_id = auth.uid()
  )
);

-- ============================================
-- MESSAGE_THREADS RLS POLICIES
-- ============================================

drop policy if exists message_threads_select_by_membership on public.message_threads;
drop policy if exists message_threads_insert_by_membership on public.message_threads;

-- Users can view threads in rooms they are members of
create policy message_threads_select_by_membership 
on public.message_threads 
for select 
using (
  exists (
    select 1 from public.room_members
    where room_members.room_id = message_threads.room_id
    and room_members.user_id = auth.uid()
  )
);

-- Users can create threads in rooms they are members of
create policy message_threads_insert_by_membership 
on public.message_threads 
for insert 
with check (
  auth.uid() = created_by
  and exists (
    select 1 from public.room_members
    where room_members.room_id = message_threads.room_id
    and room_members.user_id = auth.uid()
  )
);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Profiles indexes
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);

-- Rooms indexes
create index if not exists idx_rooms_created_by on public.rooms(created_by);
create index if not exists idx_rooms_created_at on public.rooms(created_at desc);

-- Room members indexes
create index if not exists idx_room_members_room_id on public.room_members(room_id);
create index if not exists idx_room_members_user_id on public.room_members(user_id);
create index if not exists idx_room_members_role on public.room_members(role);

-- Room messages indexes
create index if not exists idx_room_messages_room_id on public.room_messages(room_id);
create index if not exists idx_room_messages_user_id on public.room_messages(user_id);
create index if not exists idx_room_messages_thread_id on public.room_messages(thread_id);
create index if not exists idx_room_messages_created_at on public.room_messages(created_at desc);

-- Message threads indexes
create index if not exists idx_message_threads_room_id on public.message_threads(room_id);
create index if not exists idx_message_threads_created_by on public.message_threads(created_by);
create index if not exists idx_message_threads_last_activity on public.message_threads(last_activity_at desc);

-- ============================================
-- SAMPLE POSTS TABLE (if present in your schema)
-- ============================================
-- NOTE: Add this section if you have a posts table in your schema
-- Uncomment and adjust column names as needed:

-- create table if not exists public.posts (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid not null references auth.users(id) on delete cascade,
--   title text not null,
--   content text not null,
--   created_at timestamptz not null default now(),
--   updated_at timestamptz default now()
-- );
-- 
-- alter table public.posts enable row level security;
-- 
-- drop policy if exists posts_select_all on public.posts;
-- create policy posts_select_all on public.posts for select using (true);
-- 
-- drop policy if exists posts_insert_own on public.posts;
-- create policy posts_insert_own on public.posts for insert with check (auth.uid() = user_id);
-- 
-- drop policy if exists posts_update_own on public.posts;
-- create policy posts_update_own on public.posts for update using (auth.uid() = user_id);
-- 
-- drop policy if exists posts_delete_own on public.posts;
-- create policy posts_delete_own on public.posts for delete using (auth.uid() = user_id);
-- 
-- create index if not exists idx_posts_user_id on public.posts(user_id);
-- create index if not exists idx_posts_created_at on public.posts(created_at desc);

-- ============================================
-- COMPLETION
-- ============================================

-- Log migration completion
do $$
begin
  raise notice 'Migration 20251012_init_rls_and_indexes completed successfully';
  raise notice 'RLS policies reinforced on: profiles, rooms, room_members, room_messages, message_threads';
  raise notice 'Performance indexes created on all core tables';
end $$;
