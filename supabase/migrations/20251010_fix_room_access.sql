-- Migration: Fix Unauthorized Room Access
-- Date: 2025-10-10
-- Issue: Room policies only checked creator, not membership
-- Solution: Implement proper membership checks for all room operations

-- Drop existing insecure room policies
DROP POLICY IF EXISTS rooms_select_member ON public.rooms;
DROP POLICY IF EXISTS rooms_update_admin_or_creator ON public.rooms;
DROP POLICY IF EXISTS rooms_delete_admin_or_creator ON public.rooms;

-- Drop existing thread policies
DROP POLICY IF EXISTS threads_select_member ON public.message_threads;
DROP POLICY IF EXISTS threads_insert_member ON public.message_threads;
DROP POLICY IF EXISTS threads_update_admin_or_creator ON public.message_threads;

-- Drop existing message policies
DROP POLICY IF EXISTS messages_select_member ON public.room_messages;
DROP POLICY IF EXISTS messages_insert_member ON public.room_messages;
DROP POLICY IF EXISTS messages_update_author_or_admin ON public.room_messages;
DROP POLICY IF EXISTS messages_delete_author_or_admin ON public.room_messages;

-- ===== ROOMS POLICIES =====

-- Policy: Users can view rooms they are members of
CREATE POLICY "rooms_select_member" ON public.rooms
  FOR SELECT
  USING (
    -- Admin can see all
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR
    -- User is a member of the room
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = rooms.id
      AND rm.user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can create rooms (creator becomes member automatically)
-- The insert policy remains as-is
-- CREATE POLICY rooms_insert_auth stays the same

-- Policy: Only room creator or admin can update room details
CREATE POLICY "rooms_update_creator_or_admin" ON public.rooms
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Policy: Only room creator or admin can delete rooms
CREATE POLICY "rooms_delete_creator_or_admin" ON public.rooms
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ===== MESSAGE THREADS POLICIES =====

-- Policy: Users can view threads in rooms they're members of
CREATE POLICY "threads_select_room_member" ON public.message_threads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = message_threads.room_id
      AND rm.user_id = auth.uid()
    )
  );

-- Policy: Users can create threads in rooms they're members of
CREATE POLICY "threads_insert_room_member" ON public.message_threads
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_id
      AND rm.user_id = auth.uid()
    )
  );

-- Policy: Only thread creator, room creator, or admin can update threads
CREATE POLICY "threads_update_authorized" ON public.message_threads
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = message_threads.room_id
      AND r.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ===== ROOM MESSAGES POLICIES =====

-- Policy: Users can view messages in rooms they're members of
CREATE POLICY "messages_select_room_member" ON public.room_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_messages.room_id
      AND rm.user_id = auth.uid()
    )
  );

-- Policy: Users can insert messages in rooms they're members of
CREATE POLICY "messages_insert_room_member" ON public.room_messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_id
      AND rm.user_id = auth.uid()
    )
  );

-- Policy: Users can update their own messages
CREATE POLICY "messages_update_own" ON public.room_messages
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Policy: Users can delete their own messages, or room creator/admin can delete any
CREATE POLICY "messages_delete_authorized" ON public.room_messages
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_messages.room_id
      AND r.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ===== SUMMARY JOBS POLICIES =====

-- Jobs should only be visible/manageable by service role or admins
DROP POLICY IF EXISTS summary_jobs_admin ON public.summary_jobs;
CREATE POLICY "summary_jobs_admin" ON public.summary_jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ===== HELPER FUNCTION: Auto-add creator to room_members =====

-- When a room is created, automatically add the creator as a member
CREATE OR REPLACE FUNCTION public.auto_add_room_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert creator as room member with 'admin' role
  INSERT INTO public.room_members (room_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (room_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_add_room_creator ON public.rooms;
CREATE TRIGGER trg_auto_add_room_creator
  AFTER INSERT ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_room_creator();

-- ===== INDEXES FOR PERFORMANCE =====

-- Ensure we have proper indexes for membership checks
CREATE INDEX IF NOT EXISTS idx_room_members_user_room ON public.room_members(user_id, room_id);

-- Rollback SQL (to be run manually if needed):
-- DROP POLICY IF EXISTS "rooms_select_member" ON public.rooms;
-- DROP POLICY IF EXISTS "rooms_update_creator_or_admin" ON public.rooms;
-- DROP POLICY IF EXISTS "rooms_delete_creator_or_admin" ON public.rooms;
-- DROP POLICY IF EXISTS "threads_select_room_member" ON public.message_threads;
-- DROP POLICY IF EXISTS "threads_insert_room_member" ON public.message_threads;
-- DROP POLICY IF EXISTS "threads_update_authorized" ON public.message_threads;
-- DROP POLICY IF EXISTS "messages_select_room_member" ON public.room_messages;
-- DROP POLICY IF EXISTS "messages_insert_room_member" ON public.room_messages;
-- DROP POLICY IF EXISTS "messages_update_own" ON public.room_messages;
-- DROP POLICY IF EXISTS "messages_delete_authorized" ON public.room_messages;
-- DROP TRIGGER IF EXISTS trg_auto_add_room_creator ON public.rooms;
-- DROP FUNCTION IF EXISTS public.auto_add_room_creator();
