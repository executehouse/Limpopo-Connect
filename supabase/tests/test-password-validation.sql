-- Password Validation Tests
-- Tests for server-side password strength validation

-- Test 1: Validate strong password
SELECT public.validate_password_strength('MyStr0ng!Pass#2024') as result;
-- Expected: isValid=true, score >= 4

-- Test 2: Validate weak password (too short)
SELECT public.validate_password_strength('weak') as result;
-- Expected: isValid=false, feedback includes length requirement

-- Test 3: Validate password without uppercase
SELECT public.validate_password_strength('nostrongpass123!') as result;
-- Expected: isValid=false or score < 4

-- Test 4: Validate password without numbers
SELECT public.validate_password_strength('NoNumbersHere!') as result;
-- Expected: Feedback includes "Include numbers"

-- Test 5: Validate password without special characters
SELECT public.validate_password_strength('NoSpecial123ABC') as result;
-- Expected: Feedback includes "Include special characters"

-- Test 6: Check password requirements function
SELECT public.check_password_requirements('GoodPass123!') as meets_requirements;
-- Expected: true

SELECT public.check_password_requirements('bad') as fails_requirements;
-- Expected: false

-- Test 7: Common weak patterns are rejected
SELECT public.validate_password_strength('password123') as result;
-- Expected: Low score, feedback about common patterns

SELECT public.validate_password_strength('admin123') as result;
-- Expected: Low score

SELECT public.validate_password_strength('123456qwerty') as result;
-- Expected: Low score

-- Test 8: Medium strength passwords
SELECT public.validate_password_strength('MyPass2024') as result;
-- Expected: score around 3-4, strength = 'medium' or 'good'

-- Test 9: Very strong passwords get highest score
SELECT public.validate_password_strength('Tr0ub@dor&3$ecur3P@ss!') as result;
-- Expected: score >= 5, strength = 'strong'

-- Test 10: Password history logging (integration test)
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "test-user-pw", "role": "authenticated"}';

-- Simulate password change by inserting to password history
INSERT INTO public.password_history (user_id, password_hash)
VALUES ('test-user-pw', encode(digest('test-password-1', 'sha256'), 'hex'));

-- Check history was logged
SELECT COUNT(*) FROM public.password_history WHERE user_id = 'test-user-pw';
-- Expected: 1

-- User can view their own password history
SELECT COUNT(*) FROM public.password_history WHERE user_id = 'test-user-pw';
-- Expected: 1

ROLLBACK;

-- Test 11: User cannot view another user's password history
BEGIN;
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-a", "role": "authenticated"}';

-- Insert password history for another user
INSERT INTO public.password_history (user_id, password_hash)
VALUES ('user-b', 'hash123');

-- Try to view another user's history
SELECT COUNT(*) FROM public.password_history WHERE user_id = 'user-b';
-- Expected: 0 (policy should prevent access)

ROLLBACK;

-- Test 12: Anonymous users cannot access password validation (security check)
BEGIN;
SET LOCAL role = anon;

SELECT public.validate_password_strength('test123') as result;
-- Expected: Should still work (function is granted to anon for registration)

ROLLBACK;

-- Test 13: Edge cases
SELECT public.validate_password_strength('') as empty_password;
-- Expected: Very low score

SELECT public.validate_password_strength(NULL) as null_password;
-- Expected: Should handle gracefully

SELECT public.validate_password_strength(repeat('a', 100)) as very_long;
-- Expected: Should handle long passwords

-- Test 14: Unicode and special characters
SELECT public.validate_password_strength('Pässw0rd!@#') as unicode_test;
-- Expected: Should handle unicode

SELECT public.validate_password_strength('密碼Test123!') as mixed_unicode;
-- Expected: Should handle mixed scripts
