-- Test RLS Policies for Role-Based Access Control
-- Run with: psql $DATABASE_URL -f supabase/tests/test-rls-roles.sql

BEGIN;

-- Setup test data
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@example.com', now(), now(), now()),
    ('22222222-2222-2222-2222-222222222222', 'citizen@example.com', now(), now(), now()),
    ('33333333-3333-3333-3333-333333333333', 'business@example.com', now(), now(), now()),
    ('44444444-4444-4444-4444-444444444444', 'visitor@example.com', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'Admin', 'User', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'citizen@example.com', 'Citizen', 'User', 'citizen'),
    ('33333333-3333-3333-3333-333333333333', 'business@example.com', 'Business', 'Owner', 'business'),
    ('44444444-4444-4444-4444-444444444444', 'visitor@example.com', 'Visitor', 'User', 'visitor')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;

-- Test 1: Profile Access Policies
\echo '=== Testing Profile Access Policies ==='

-- Simulate admin user context
SELECT set_config('jwt.claims.sub', '11111111-1111-1111-1111-111111111111', true);

-- Test: Admin can view all profiles
SELECT 
    CASE 
        WHEN COUNT(*) = 4 THEN '✓ PASS: Admin can view all profiles'
        ELSE '✗ FAIL: Admin cannot view all profiles'
    END as result
FROM public.profiles;

-- Simulate citizen user context
SELECT set_config('jwt.claims.sub', '22222222-2222-2222-2222-222222222222', true);

-- Test: Citizen can view own profile
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN '✓ PASS: Citizen can view own profile'
        ELSE '✗ FAIL: Citizen cannot view own profile'
    END as result
FROM public.profiles 
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Test: Citizen cannot view other non-public profiles
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ PASS: Citizen cannot view private profiles of others'
        ELSE '✗ FAIL: Citizen can view private profiles of others'
    END as result
FROM public.profiles 
WHERE id != '22222222-2222-2222-2222-222222222222' 
AND is_public = false;

-- Test 2: Room Access Policies
\echo '=== Testing Room Access Policies ==='

-- Create test rooms
INSERT INTO public.rooms (id, name, description, type, created_by)
VALUES 
    ('aaaa1111-1111-1111-1111-111111111111', 'Public Community Room', 'Open to all', 'public', '22222222-2222-2222-2222-222222222222'),
    ('bbbb2222-2222-2222-2222-222222222222', 'Private Business Room', 'Business only', 'private', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Add room memberships
INSERT INTO public.room_members (room_id, user_id, role)
VALUES 
    ('aaaa1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'owner'),
    ('aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'member'),
    ('bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'owner')
ON CONFLICT (room_id, user_id) DO NOTHING;

-- Simulate citizen user context
SELECT set_config('jwt.claims.sub', '22222222-2222-2222-2222-222222222222', true);

-- Test: Citizen can view public rooms they're a member of
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN '✓ PASS: Citizen can view rooms they are members of'
        ELSE '✗ FAIL: Citizen cannot view rooms they are members of'
    END as result
FROM public.rooms r
WHERE EXISTS (
    SELECT 1 FROM room_members rm 
    WHERE rm.room_id = r.id 
    AND rm.user_id = '22222222-2222-2222-2222-222222222222'
);

-- Test: Citizen cannot view private rooms they're not a member of
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ PASS: Citizen cannot view private rooms they are not members of'
        ELSE '✗ FAIL: Citizen can view private rooms they are not members of'
    END as result
FROM public.rooms r
WHERE r.type = 'private' 
AND NOT EXISTS (
    SELECT 1 FROM room_members rm 
    WHERE rm.room_id = r.id 
    AND rm.user_id = '22222222-2222-2222-2222-222222222222'
);

-- Simulate admin user context
SELECT set_config('jwt.claims.sub', '11111111-1111-1111-1111-111111111111', true);

-- Test: Admin can view all rooms
SELECT 
    CASE 
        WHEN COUNT(*) >= 2 THEN '✓ PASS: Admin can view all rooms'
        ELSE '✗ FAIL: Admin cannot view all rooms'
    END as result
FROM public.rooms;

-- Test 3: Message Access Policies
\echo '=== Testing Message Access Policies ==='

-- Insert test messages
INSERT INTO public.messages (id, room_id, user_id, content)
VALUES 
    ('msg11111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Hello from citizen'),
    ('msg22222-2222-2222-2222-222222222222', 'bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Hello from business')
ON CONFLICT (id) DO NOTHING;

-- Simulate citizen user context
SELECT set_config('jwt.claims.sub', '22222222-2222-2222-2222-222222222222', true);

-- Test: Citizen can view messages in rooms they are members of
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN '✓ PASS: Citizen can view messages in their rooms'
        ELSE '✗ FAIL: Citizen cannot view messages in their rooms'
    END as result
FROM public.messages m
WHERE EXISTS (
    SELECT 1 FROM room_members rm 
    WHERE rm.room_id = m.room_id 
    AND rm.user_id = '22222222-2222-2222-2222-222222222222'
);

-- Test: Citizen cannot view messages in rooms they are not members of
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ PASS: Citizen cannot view messages in rooms they are not members of'
        ELSE '✗ FAIL: Citizen can view messages in rooms they are not members of'
    END as result
FROM public.messages m
WHERE NOT EXISTS (
    SELECT 1 FROM room_members rm 
    WHERE rm.room_id = m.room_id 
    AND rm.user_id = '22222222-2222-2222-2222-222222222222'
);

-- Test 4: Business Verification Access
\echo '=== Testing Business Verification Access ==='

-- Insert business verification record
INSERT INTO public.business_verification (id, user_id, business_name, contact_email, status)
VALUES 
    ('biz11111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Test Business', 'business@example.com', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Simulate business user context
SELECT set_config('jwt.claims.sub', '33333333-3333-3333-3333-333333333333', true);

-- Test: Business can view own verification record
SELECT 
    CASE 
        WHEN COUNT(*) = 1 THEN '✓ PASS: Business can view own verification record'
        ELSE '✗ FAIL: Business cannot view own verification record'
    END as result
FROM public.business_verification
WHERE user_id = '33333333-3333-3333-3333-333333333333';

-- Simulate citizen user context
SELECT set_config('jwt.claims.sub', '22222222-2222-2222-2222-222222222222', true);

-- Test: Citizen cannot view other business verification records
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ PASS: Citizen cannot view business verification records of others'
        ELSE '✗ FAIL: Citizen can view business verification records of others'
    END as result
FROM public.business_verification
WHERE user_id != '22222222-2222-2222-2222-222222222222';

-- Simulate admin user context
SELECT set_config('jwt.claims.sub', '11111111-1111-1111-1111-111111111111', true);

-- Test: Admin can view all business verification records
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN '✓ PASS: Admin can view all business verification records'
        ELSE '✗ FAIL: Admin cannot view all business verification records'
    END as result
FROM public.business_verification;

-- Test 5: Role Update Function
\echo '=== Testing Role Update Function ==='

-- Simulate admin user context
SELECT set_config('jwt.claims.sub', '11111111-1111-1111-1111-111111111111', true);

-- Test: Admin can update user roles
SELECT 
    CASE 
        WHEN public.update_user_role(
            '44444444-4444-4444-4444-444444444444'::uuid, 
            'citizen'::user_role, 
            '11111111-1111-1111-1111-111111111111'::uuid,
            'Test role change'
        ) THEN '✓ PASS: Admin can update user roles'
        ELSE '✗ FAIL: Admin cannot update user roles'
    END as result;

-- Verify role was updated
SELECT 
    CASE 
        WHEN role = 'citizen' THEN '✓ PASS: Role was successfully updated'
        ELSE '✗ FAIL: Role was not updated'
    END as result
FROM public.profiles 
WHERE id = '44444444-4444-4444-4444-444444444444';

-- Test: Role change was logged
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN '✓ PASS: Role change was logged in audit'
        ELSE '✗ FAIL: Role change was not logged'
    END as result
FROM public.role_audit_logs
WHERE user_id = '44444444-4444-4444-4444-444444444444'
AND new_role = 'citizen';

-- Simulate regular user context
SELECT set_config('jwt.claims.sub', '22222222-2222-2222-2222-222222222222', true);

-- Test: Regular user cannot update other user roles
DO $$
BEGIN
    BEGIN
        PERFORM public.update_user_role(
            '33333333-3333-3333-3333-333333333333'::uuid, 
            'admin'::user_role, 
            '22222222-2222-2222-2222-222222222222'::uuid,
            'Unauthorized attempt'
        );
        RAISE NOTICE '✗ FAIL: Regular user was able to update other user roles';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✓ PASS: Regular user cannot update other user roles';
    END;
END $$;

-- Test 6: Helper Function Tests
\echo '=== Testing Helper Functions ==='

-- Test role permission checking
SELECT 
    CASE 
        WHEN public.check_role_permission('citizen'::user_role, '22222222-2222-2222-2222-222222222222'::uuid) THEN 
            '✓ PASS: check_role_permission works for exact role match'
        ELSE '✗ FAIL: check_role_permission failed for exact role match'
    END as result;

SELECT 
    CASE 
        WHEN public.check_role_permission('citizen'::user_role, '11111111-1111-1111-1111-111111111111'::uuid) THEN 
            '✓ PASS: check_role_permission works for admin accessing citizen level'
        ELSE '✗ FAIL: check_role_permission failed for admin accessing citizen level'
    END as result;

SELECT 
    CASE 
        WHEN NOT public.check_role_permission('admin'::user_role, '22222222-2222-2222-2222-222222222222'::uuid) THEN 
            '✓ PASS: check_role_permission correctly denies admin access to citizen'
        ELSE '✗ FAIL: check_role_permission incorrectly allows admin access to citizen'
    END as result;

\echo '=== Test Summary ==='
\echo 'All role-based security tests completed.'
\echo 'Review the results above to ensure all policies are working correctly.'
\echo 'Any FAIL results indicate security vulnerabilities that need to be addressed.'

-- Cleanup test data
DELETE FROM public.messages WHERE id LIKE 'msg%';
DELETE FROM public.room_members WHERE room_id IN ('aaaa1111-1111-1111-1111-111111111111', 'bbbb2222-2222-2222-2222-222222222222');
DELETE FROM public.rooms WHERE id IN ('aaaa1111-1111-1111-1111-111111111111', 'bbbb2222-2222-2222-2222-222222222222');
DELETE FROM public.business_verification WHERE id = 'biz11111-1111-1111-1111-111111111111';
DELETE FROM public.role_audit_logs WHERE user_id = '44444444-4444-4444-4444-444444444444';
DELETE FROM public.profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');
DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

COMMIT;