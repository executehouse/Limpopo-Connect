-- RLS Room Access Tests
-- Tests for verifying room membership-based access control

-- Setup: Create test data
BEGIN;

-- Create test users
INSERT INTO auth.users (id, email) VALUES 
  ('room-owner', 'owner@test.com'),
  ('room-member', 'member@test.com'),
  ('non-member', 'nonmember@test.com'),
  ('admin-user', 'admin@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, role) VALUES
  ('room-owner', 'owner@test.com', 'citizen'),
  ('room-member', 'member@test.com', 'citizen'),
  ('non-member', 'nonmember@test.com', 'citizen'),
  ('admin-user', 'admin@test.com', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Create test room
INSERT INTO public.rooms (id, name, created_by) VALUES
  ('test-room-1', 'Test Room', 'room-owner')
ON CONFLICT (id) DO NOTHING;

-- Add member
INSERT INTO public.room_members (room_id, user_id, role) VALUES
  ('test-room-1', 'room-member', 'member')
ON CONFLICT (room_id, user_id) DO NOTHING;

COMMIT;

-- Test 1: Room owner can view their room
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "room-owner", "role": "authenticated"}';

SELECT id, name FROM public.rooms WHERE id = 'test-room-1';
-- Expected: Should return the room

ROLLBACK;

-- Test 2: Room member can view the room
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "room-member", "role": "authenticated"}';

SELECT id, name FROM public.rooms WHERE id = 'test-room-1';
-- Expected: Should return the room

ROLLBACK;

-- Test 3: Non-member cannot view the room
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "non-member", "role": "authenticated"}';

SELECT id, name FROM public.rooms WHERE id = 'test-room-1';
-- Expected: Should return 0 rows

ROLLBACK;

-- Test 4: Admin can view all rooms
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "admin-user", "role": "authenticated"}';

SELECT id, name FROM public.rooms WHERE id = 'test-room-1';
-- Expected: Should return the room

ROLLBACK;

-- Test 5: Member can post messages in room
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "room-member", "role": "authenticated"}';

-- Create a thread first
INSERT INTO public.message_threads (id, room_id, created_by)
VALUES ('test-thread-1', 'test-room-1', 'room-member');

-- Post message
INSERT INTO public.room_messages (id, thread_id, room_id, user_id, body)
VALUES ('test-msg-1', 'test-thread-1', 'test-room-1', 'room-member', 'Hello from member');
-- Expected: Should succeed

ROLLBACK;

-- Test 6: Non-member cannot post messages
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "non-member", "role": "authenticated"}';

INSERT INTO public.room_messages (id, thread_id, room_id, user_id, body)
VALUES ('test-msg-2', 'test-thread-1', 'test-room-1', 'non-member', 'Unauthorized message');
-- Expected: Should fail with policy violation

ROLLBACK;

-- Test 7: Member can view messages in their room
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "room-member", "role": "authenticated"}';

-- Create message first
INSERT INTO public.message_threads (id, room_id, created_by)
VALUES ('thread-view', 'test-room-1', 'room-owner');

INSERT INTO public.room_messages (thread_id, room_id, user_id, body)
VALUES ('thread-view', 'test-room-1', 'room-owner', 'Test message');

SELECT body FROM public.room_messages WHERE room_id = 'test-room-1';
-- Expected: Should return messages

ROLLBACK;

-- Test 8: Non-member cannot view messages
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "non-member", "role": "authenticated"}';

SELECT body FROM public.room_messages WHERE room_id = 'test-room-1';
-- Expected: Should return 0 rows

ROLLBACK;

-- Test 9: Helper function is_room_member works correctly
BEGIN;
SELECT public.is_room_member('test-room-1', 'room-owner') as owner_check;
-- Expected: true

SELECT public.is_room_member('test-room-1', 'room-member') as member_check;
-- Expected: true

SELECT public.is_room_member('test-room-1', 'non-member') as non_member_check;
-- Expected: false

ROLLBACK;

-- Test 10: Room creator can update room settings
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "room-owner", "role": "authenticated"}';

UPDATE public.rooms SET name = 'Updated Room Name' WHERE id = 'test-room-1';
-- Expected: Should succeed

ROLLBACK;

-- Test 11: Member cannot update room settings
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "room-member", "role": "authenticated"}';

UPDATE public.rooms SET name = 'Hacked Name' WHERE id = 'test-room-1';
-- Expected: Should affect 0 rows

ROLLBACK;

-- Test 12: Room access is audited
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "room-member", "role": "authenticated"}';

-- Post a message to trigger audit
INSERT INTO public.message_threads (id, room_id, created_by)
VALUES ('audit-thread', 'test-room-1', 'room-member');

INSERT INTO public.room_messages (thread_id, room_id, user_id, body)
VALUES ('audit-thread', 'test-room-1', 'room-member', 'Audited message');

-- Check if audit log was created by the triggers
SELECT COUNT(*) FROM public.room_messages_audit WHERE message_id IN (
  SELECT id FROM public.room_messages WHERE body = 'Audited message'
);
-- Expected: Should return 1 or more

ROLLBACK;

-- Cleanup test data
BEGIN;
DELETE FROM public.room_messages WHERE room_id = 'test-room-1';
DELETE FROM public.message_threads WHERE room_id = 'test-room-1';
DELETE FROM public.room_members WHERE room_id = 'test-room-1';
DELETE FROM public.rooms WHERE id = 'test-room-1';
COMMIT;
