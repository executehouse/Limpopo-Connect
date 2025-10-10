# Authentication Flow Test Plan

This document provides a comprehensive test plan for the Limpopo Connect authentication system with Supabase integration.

## Prerequisites

Before testing, ensure:
- [ ] Supabase project is set up and active
- [ ] Environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured
- [ ] Database migrations have been applied successfully
- [ ] Application is running without errors

## Test Suite

### 1. User Registration Flow

#### 1.1 Basic Registration
- [ ] Navigate to `/register`
- [ ] Fill in all required fields:
  - First Name: "Test"
  - Last Name: "User"
  - Email: "testuser@example.com"
  - Phone: "+27123456789"
  - Password: "Test@123" (should show as "Strong")
  - Confirm Password: "Test@123"
  - Role: "Citizen"
  - Terms: Checked
- [ ] Click "Create account"
- [ ] Verify success message appears
- [ ] Verify redirect to login page with success message
- [ ] Verify email confirmation sent (if enabled)

#### 1.2 Password Strength Validation
- [ ] Enter password "abc" → Should show "Weak" in red
- [ ] Enter password "Abc12345" → Should show "Medium" in yellow
- [ ] Enter password "Abc@1234" → Should show "Strong" in green
- [ ] Verify helper text shows requirements

#### 1.3 Validation Errors
- [ ] Submit with empty fields → Should show "First name and last name are required"
- [ ] Submit with invalid email → Should show "Please enter a valid email address"
- [ ] Submit with password < 6 chars → Should show "Password must be at least 6 characters"
- [ ] Submit with mismatched passwords → Should show "Passwords do not match"
- [ ] Verify all error messages clear when user starts typing

#### 1.4 Already Registered Email
- [ ] Try to register with existing email
- [ ] Verify appropriate error message from Supabase
- [ ] User should be able to navigate to login page

### 2. User Login Flow

#### 2.1 Successful Login
- [ ] Navigate to `/login`
- [ ] Enter valid email and password
- [ ] Check "Remember me"
- [ ] Click "Sign in"
- [ ] Verify redirect to home page
- [ ] Verify user name appears in header
- [ ] Verify "Sign Out" button appears in header
- [ ] Reload page → Verify user stays logged in

#### 2.2 Remember Me Feature
- [ ] Login with "Remember me" checked
- [ ] Close browser and reopen
- [ ] Navigate to login page
- [ ] Verify email field is pre-filled
- [ ] Login without "Remember me"
- [ ] Close and reopen browser
- [ ] Verify email field is NOT pre-filled

#### 2.3 Login Validation
- [ ] Submit empty email → Should show "Email is required"
- [ ] Submit invalid email → Should show "Please enter a valid email address"
- [ ] Submit empty password → Should show "Password is required"
- [ ] Submit wrong credentials → Should show Supabase auth error

#### 2.4 Already Logged In
- [ ] Login successfully
- [ ] Try to navigate to `/login`
- [ ] Verify automatic redirect to home page
- [ ] Same for `/register` page

### 3. Password Reset Flow

#### 3.1 Forgot Password
- [ ] Navigate to `/forgot-password`
- [ ] Enter registered email address
- [ ] Click "Send Reset Link"
- [ ] Verify success message (check spam folder if needed)
- [ ] Check email for reset link
- [ ] Click reset link in email

#### 3.2 Reset Password
- [ ] Reset link should open `/reset-password?token=...`
- [ ] Enter new password
- [ ] Enter confirm password
- [ ] Verify password strength indicator works
- [ ] Click "Reset Password"
- [ ] Verify success message
- [ ] Verify redirect to login after 2 seconds
- [ ] Try logging in with new password
- [ ] Verify old password no longer works

#### 3.3 Invalid Reset Token
- [ ] Navigate to `/reset-password` without token
- [ ] Verify error message about missing token
- [ ] Try with invalid/expired token
- [ ] Verify appropriate error handling

### 4. Profile Management

#### 4.1 View Profile
- [ ] Login successfully
- [ ] Click profile link in header (should show first name)
- [ ] Navigate to `/profile`
- [ ] Verify all profile fields display correctly:
  - First Name (editable)
  - Last Name (editable)
  - Email (read-only)
  - Phone (editable)
  - Role (read-only)

#### 4.2 Edit Profile
- [ ] Click "Edit Profile" button
- [ ] Modify first name, last name, phone
- [ ] Click "Save Changes"
- [ ] Verify success message appears
- [ ] Verify changes persist after page reload
- [ ] Verify header updates with new first name

#### 4.3 Cancel Edit
- [ ] Click "Edit Profile"
- [ ] Modify some fields
- [ ] Click "Cancel"
- [ ] Verify changes are discarded
- [ ] Verify form returns to view mode

#### 4.4 Profile Without Login
- [ ] Sign out
- [ ] Try to navigate to `/profile`
- [ ] Verify redirect to login page

### 5. Navigation & UI

#### 5.1 Authenticated Navigation
- [ ] Login successfully
- [ ] Verify header shows:
  - User's first name with user icon
  - "Sign Out" button with logout icon
- [ ] Mobile: Open menu
- [ ] Verify profile link shows first name
- [ ] Verify sign out button visible

#### 5.2 Unauthenticated Navigation
- [ ] Sign out or browse while logged out
- [ ] Verify header shows:
  - "Sign In" link
  - "Register" button
- [ ] Mobile: Open menu
- [ ] Verify sign in/register buttons visible
- [ ] Verify no profile/sign out options

#### 5.3 Sign Out
- [ ] Click "Sign Out" (desktop or mobile)
- [ ] Verify redirect to home page
- [ ] Verify header updates to show sign in/register
- [ ] Verify session is cleared (check localStorage/cookies)
- [ ] Try to access `/profile` → Should redirect to login

### 6. Database & RLS Policies

#### 6.1 Profile Creation
- [ ] Register new user
- [ ] Check Supabase Dashboard > Table Editor > profiles
- [ ] Verify new profile row created with:
  - Correct user ID
  - Email from registration
  - First/last name from registration
  - Phone from registration
  - Default role from registration

#### 6.2 Profile Update
- [ ] Update profile via UI
- [ ] Check Supabase Table Editor
- [ ] Verify updated_at timestamp changed
- [ ] Verify changes reflected in database

#### 6.3 RLS Policy Verification
- [ ] Try to query profiles table with different user
- [ ] Verify RLS prevents unauthorized access
- [ ] User should only see/update their own profile
- [ ] Public profiles should be viewable by all

### 7. Error Handling

#### 7.1 Network Errors
- [ ] Disconnect internet
- [ ] Try to login
- [ ] Verify appropriate error message
- [ ] Reconnect and retry
- [ ] Verify successful login

#### 7.2 Supabase Errors
- [ ] Use invalid Supabase credentials
- [ ] Verify user-friendly error messages
- [ ] Check console for detailed errors

#### 7.3 Session Expiry
- [ ] Login successfully
- [ ] Wait for session to expire (or manually invalidate)
- [ ] Try to access protected route
- [ ] Verify redirect to login
- [ ] Login again successfully

### 8. Security Tests

#### 8.1 Protected Routes
- [ ] While logged out, try to access:
  - `/profile` → Should redirect to login
  - `/chat-demo` (if protected) → Should redirect to login

#### 8.2 XSS Prevention
- [ ] Try entering `<script>alert('xss')</script>` in form fields
- [ ] Verify proper escaping/sanitization
- [ ] No script execution should occur

#### 8.3 SQL Injection (via Supabase)
- [ ] Try SQL injection patterns in email field
- [ ] Verify Supabase/Postgres prevents injection
- [ ] Example: `admin' OR '1'='1`

### 9. Cross-Browser Testing

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 10. Accessibility Testing

- [ ] Navigate using keyboard only (Tab, Enter, Escape)
- [ ] Verify focus indicators are visible
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Verify form labels are properly associated
- [ ] Check color contrast ratios
- [ ] Verify error messages are announced

## Test Results Template

Use this template to document test results:

```markdown
## Test Run: [Date]
**Tester**: [Name]
**Environment**: [Development/Staging/Production]
**Supabase Project**: [Project URL]

### Results Summary
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

### Failed Tests
1. [Test Name]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]
   - Steps to reproduce: [Steps]
   - Error message: [Error]
   - Priority: [High/Medium/Low]

### Notes
[Any additional observations or comments]
```

## Quick Smoke Test

For rapid verification, run this minimal test suite:

1. [ ] Register new account → Success
2. [ ] Login with new account → Success
3. [ ] View profile → Data correct
4. [ ] Update profile → Saves successfully
5. [ ] Sign out → Session cleared
6. [ ] Login again → Success
7. [ ] Password reset → Email received and works

If all quick tests pass, proceed with full test suite.

## Known Limitations

- Email confirmation requires email service configuration in Supabase
- Rate limiting may affect rapid testing (clear between test runs)
- Some tests may fail without proper Supabase configuration

## Support

For issues during testing:
- Check browser console for errors
- Review Supabase logs in dashboard
- Verify environment variables are set correctly
- See VERCEL_DEPLOYMENT.md troubleshooting section
