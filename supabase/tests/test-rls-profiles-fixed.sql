-- RLS Profile Exposure Tests
-- Tests for verifying profile privacy policies are working correctly

-- Test 1: User can view their own profile
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-1", "role": "authenticated"}';

SELECT id, first_name, last_name, is_public
FROM public.profiles
WHERE id = 'user-uuid-1';
-- Expected: Should return the user's profile

ROLLBACK;

-- Test 2: User cannot view another user's private profile
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-1", "role": "authenticated"}';

SELECT id, first_name, last_name
FROM public.profiles
WHERE id = 'user-uuid-2' AND is_public = false;
-- Expected: Should return 0 rows

ROLLBACK;

-- Test 3: User can view another user's public profile
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-1", "role": "authenticated"}';

SELECT id, first_name, last_name
FROM public.profiles
WHERE id = 'user-uuid-3' AND is_public = true;
-- Expected: Should return the public profile

ROLLBACK;

-- Test 4: Admin can view all profiles
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "admin-uuid", "role": "authenticated"}';

-- First, ensure the admin user exists and has admin role
INSERT INTO public.profiles (id, email, role, is_public)
VALUES ('admin-uuid', 'admin@test.com', 'admin', false)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

SELECT COUNT(*) FROM public.profiles;
-- Expected: Should return count of all profiles

ROLLBACK;

-- Test 5: User can update their own profile
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-1", "role": "authenticated"}';

UPDATE public.profiles
SET first_name = 'Updated Name', is_public = true
WHERE id = 'user-uuid-1';
-- Expected: Should succeed

ROLLBACK;

-- Test 6: User cannot update another user's profile
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-1", "role": "authenticated"}';

UPDATE public.profiles
SET first_name = 'Hacked'
WHERE id = 'user-uuid-2';
-- Expected: Should affect 0 rows

ROLLBACK;

-- Test 7: Profile changes are logged in audit table
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-1", "role": "authenticated"}';

INSERT INTO public.profiles (id, email, first_name, is_public)
VALUES ('test-user-audit', 'test@audit.com', 'Test', false);

SELECT action, profile_id
FROM public.profile_audit_logs
WHERE profile_id = 'test-user-audit' AND action = 'insert';
-- Expected: Should return audit log entry

ROLLBACK;

-- Test 8: Anon users cannot view any profiles
BEGIN;
SET LOCAL role = anon;

SELECT COUNT(*) FROM public.profiles;
-- Expected: Should return 0

ROLLBACK;

-- Test 9: User can delete their own profile
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-delete", "role": "authenticated"}';

INSERT INTO public.profiles (id, email, first_name)
VALUES ('user-uuid-delete', 'delete@test.com', 'Delete Me');

DELETE FROM public.profiles WHERE id = 'user-uuid-delete';
-- Expected: Should succeed

ROLLBACK;

-- Test 10: User cannot delete another user's profile
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-1", "role": "authenticated"}';

DELETE FROM public.profiles WHERE id = 'user-uuid-2';
-- Expected: Should affect 0 rows

ROLLBACK;
