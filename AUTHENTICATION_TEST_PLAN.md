# Authentication Flow Test Plan

This document provides a comprehensive test plan for the Limpopo Connect authentication system with Supabase integration.

## Prerequisites

Before testing, ensure:
- [ ] Supabase project is set up and active
- [ ] Environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured
- [ ] Database migrations have been applied successfully
- [ ] Application is running without errors

## Test Suite

### 1. Role-Based Authentication Tests

#### 1.1 Role Assignment on Registration
- [ ] Register new user with default role
  - Navigate to `/register`
  - Complete registration form
  - Verify user assigned 'citizen' role by default
  - Check profile in database: `SELECT role FROM profiles WHERE email = 'test@example.com'`
- [ ] Register with specified role metadata
  - Use signup with metadata: `{ role: 'business' }`
  - Verify role correctly assigned
  - Check JWT claims include role

#### 1.2 JWT Claims Validation
- [ ] Login as citizen user
- [ ] Call `get_my_role()` RPC function
- [ ] Verify response matches profile role
- [ ] Check session storage contains role claims
- [ ] Verify JWT token contains role in app_metadata

#### 1.3 Role Hierarchy and Permissions
- [ ] Test visitor permissions:
  - Not authenticated user
  - Can access `/explore`, `/business-directory`
  - Cannot access `/home`, `/chat-demo`
  - `hasPermission('canViewPublicContent')` → true
  - `hasPermission('canCreateContent')` → false
- [ ] Test citizen permissions:
  - Login as citizen
  - Can access `/home`, `/connections`, `/chat-demo`
  - Cannot access `/business-dashboard`, `/admin`
  - `hasPermission('canCreateContent')` → true
  - `hasPermission('canJoinRooms')` → true
- [ ] Test business permissions:
  - Login as business user
  - Can access `/business-dashboard`, `/listings`
  - Cannot access `/admin` routes
  - `hasPermission('canManageListings')` → true
- [ ] Test admin permissions:
  - Login as admin user
  - Can access all routes including `/admin`
  - `hasPermission('canManageUsers')` → true
  - `hasPermission('canAccessAdminPanel')` → true

#### 1.4 Role-Based Routing
- [ ] Visitor attempts to access `/home` → Redirected to `/login`
- [ ] Citizen attempts to access `/business-dashboard` → Redirected to `/unauthorized`
- [ ] Business user attempts to access `/admin` → Redirected to `/unauthorized`
- [ ] Admin can access all protected routes
- [ ] Correct default landing pages:
  - Visitor → `/explore`
  - Citizen → `/home`
  - Business → `/business-dashboard`
  - Admin → `/admin`

#### 1.5 Business Verification Workflow
- [ ] Citizen requests business verification:
  - Login as citizen user
  - Navigate to business verification form
  - Submit verification with business details
  - Verify record created in `business_verifications` table
  - Status should be 'pending'
- [ ] Admin reviews and approves:
  - Login as admin user
  - View pending verifications
  - Approve verification with notes
  - Verify user role updated to 'business'
  - Verify audit log entry created
- [ ] Business user gains new permissions:
  - User can now access business dashboard
  - Role hierarchy updated (`hasRoleOrHigher('business')` → true)
  - JWT claims updated with new role

#### 1.6 Role Change Audit Trail
- [ ] Admin changes user role
- [ ] Verify audit log entry created with:
  - Old role, new role
  - Changed by (admin user ID)
  - Timestamp
  - IP address and user agent (if available)
- [ ] User can view their own role change history
- [ ] Admin can view all role change logs

#### 1.7 Role Sync Validation
- [ ] Call `verifyRoleSync()` function
- [ ] Verify profile role matches JWT claims
- [ ] Test role refresh after database update:
  - Update role directly in database
  - Call `refreshJWTClaims()`
  - Verify frontend reflects new role
- [ ] Test role sync status view for admins

#### 1.8 Database Security Tests
- [ ] Test RLS policies with different roles:
  - Citizen tries to read other citizen's private profile → Denied
  - Admin reads any user profile → Allowed
  - Business user reads public profiles → Allowed
  - User reads own profile → Always allowed
- [ ] Test business verification access:
  - Non-admin tries to approve verification → Denied
  - Admin approves verification → Success
  - User views own verification status → Allowed
- [ ] Test role audit log access:
  - Non-admin tries to read all logs → Denied
  - User reads own role changes → Allowed
  - Admin reads all role changes → Allowed

### 2. User Registration Flow

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

### 9. Dashboard Routing and Access Control Tests

#### 9.1 Standardized Dashboard Routes
- [ ] Test `/dashboard/visitor` route
  - Navigate to `/dashboard/visitor` without authentication
  - Verify VisitorDashboard renders correctly
  - Check call-to-action buttons work (Sign up, Login)
  - Confirm public content is accessible
- [ ] Test `/dashboard/citizen` route
  - Login as citizen user
  - Navigate to `/dashboard/citizen`
  - Verify CitizenDashboard renders with appropriate content
  - Check citizen-specific features are available
- [ ] Test `/dashboard/business` route
  - Login as business user
  - Navigate to `/dashboard/business`
  - Verify BusinessDashboard renders with business features
  - Check business management tools are accessible
- [ ] Test `/dashboard/admin` route
  - Login as admin user
  - Navigate to `/dashboard/admin`
  - Verify AdminDashboard renders with admin controls
  - Check administrative functions are available

#### 9.2 Dynamic Login Redirection
- [ ] Test role-based login redirection for each role
  - Login as visitor → redirected to `/dashboard/visitor`
  - Login as citizen → redirected to `/dashboard/citizen`
  - Login as business → redirected to `/dashboard/business`
  - Login as admin → redirected to `/dashboard/admin`
- [ ] Test redirection preservation
  - Visit protected route while unauthenticated
  - Get redirected to login
  - After login, redirected back to original route
- [ ] Test fallback redirection
  - Login without previous route
  - Verify redirect to role's default dashboard

#### 9.3 Role-Based Access Control
- [ ] Test unauthorized access attempts
  - As visitor, try to access `/dashboard/citizen` → Access denied
  - As citizen, try to access `/dashboard/business` → Access denied
  - As citizen, try to access `/dashboard/admin` → Access denied
  - As business, try to access `/dashboard/admin` → Access denied
- [ ] Test access denied page
  - Verify clear error message displayed
  - Check user's current role shown
  - Check required roles displayed
  - Test "Go Back" and "Home" buttons work
  - Test "Contact Support" link works

#### 9.4 Role Helper Functions
- [ ] Test role identification functions
  - Login as each role type
  - Verify `isVisitor()`, `isCitizen()`, `isBusiness()`, `isAdmin()` return correct values
  - Test `hasRoleOrHigher()` function with different role combinations
  - Verify `getRolePriority()` returns correct hierarchy values

#### 9.5 Route Protection Components
- [ ] Test ProtectedRoute component
  - Access protected content while authenticated → Success
  - Access protected content while unauthenticated → Redirect to login
  - Test loading state during authentication check
- [ ] Test RoleGuard component
  - Access with correct role → Success
  - Access with insufficient role → Access denied
  - Test with `requireAuth: false` for visitor access
  - Test custom fallback paths

#### 9.6 Legacy Route Compatibility  
- [ ] Test backwards compatibility
  - Verify `/home` still works for citizens
  - Verify `/business-dashboard` still works for business users
  - Verify `/admin` still works for admin users
- [ ] Test route precedence
  - Confirm new `/dashboard/*` routes take priority
  - Verify legacy routes redirect to new standardized routes

#### 9.7 Edge Cases and Error Handling
- [ ] Test session expiry scenarios
  - Login and wait for session to expire
  - Try to access protected dashboard → Redirect to login
  - Login again → Redirect to correct dashboard
- [ ] Test invalid role data
  - Manually modify user role in database to invalid value
  - Login → Should default to visitor behavior
  - Access dashboards → Should be restricted appropriately
- [ ] Test network connectivity issues
  - Disable network during dashboard access
  - Verify graceful error handling
  - Restore network → Verify recovery

#### 9.8 Performance and UX Tests
- [ ] Test dashboard loading performance
  - Measure time to render each dashboard
  - Verify loading spinners display appropriately
  - Check for layout shifts during loading
- [ ] Test navigation between dashboards
  - Login as admin (highest role)
  - Navigate between different dashboard routes
  - Verify smooth transitions
  - Test browser back/forward buttons

#### 9.9 Security Validation
- [ ] Test JWT token validation
  - Verify role claims in JWT match profile data
  - Test with modified JWT tokens → Should be rejected
  - Test with expired tokens → Should redirect to login
- [ ] Test client-server role sync
  - Modify role in database while user is logged in
  - Verify system detects role changes appropriately
  - Test role refresh mechanisms work correctly
  - Verify CitizenDashboard renders with appropriate features
- [ ] Test `/dashboard/business` route
  - Login as business user
  - Navigate to `/dashboard/business`
  - Verify BusinessDashboard renders with business features
- [ ] Test `/dashboard/admin` route
  - Login as admin user
  - Navigate to `/dashboard/admin`
  - Verify AdminDashboard renders with admin tools

#### 9.2 Role-Based Access Control
- [ ] Test unauthorized dashboard access
  - Login as citizen user
  - Attempt to access `/dashboard/business`
  - Verify access denied page displays
  - Check error message shows correct roles required
- [ ] Test admin access to all dashboards
  - Login as admin user
  - Access `/dashboard/visitor`
  - Access `/dashboard/citizen`
  - Access `/dashboard/business` 
  - Access `/dashboard/admin`
  - Verify all dashboards accessible
- [ ] Test visitor restrictions
  - Access site without authentication
  - Attempt to access `/dashboard/citizen`
  - Verify redirect to login page
  - Check login page includes return URL

#### 9.3 Dynamic Login Redirection
- [ ] Test role-based login redirect
  - Access `/dashboard/citizen` while logged out
  - Complete login as citizen user
  - Verify redirect back to `/dashboard/citizen`
- [ ] Test default role redirects
  - Login as visitor → should redirect to `/dashboard/visitor`
  - Login as citizen → should redirect to `/dashboard/citizen`
  - Login as business → should redirect to `/dashboard/business`
  - Login as admin → should redirect to `/dashboard/admin`

#### 9.4 Role Helper Functions
- [ ] Test `isVisitor()` helper
  - Login as each role type
  - Call `isVisitor()` from auth context
  - Verify returns true only for visitor role
- [ ] Test `isCitizen()`, `isBusiness()`, `isAdmin()` helpers
  - Test each helper function with different role logins
  - Verify correct boolean returns
- [ ] Test `hasRoleOrHigher()` function
  - Login as citizen, test against 'visitor' (should be true)
  - Login as citizen, test against 'business' (should be false)
  - Login as admin, test against all roles (should be true)

#### 9.5 Route Protection Integration
- [ ] Test ProtectedRoute component
  - Access protected route without authentication
  - Verify redirect to login with return path
  - Login and verify redirect back to original route
- [ ] Test RoleGuard component
  - Access route requiring business role as citizen
  - Verify access denied page displays
  - Check upgrade path shown for eligible users
- [ ] Test multiple role access
  - Create route allowing ['citizen', 'business'] roles
  - Test access with citizen user (should work)
  - Test access with business user (should work)
  - Test access with visitor (should deny)

#### 9.6 Edge Cases and Error Handling
- [ ] Test loading states
  - Refresh page on protected route
  - Verify loading spinner displays during auth check
  - Confirm proper render after auth resolves
- [ ] Test network errors
  - Simulate network failure during auth check
  - Verify graceful error handling
  - Test retry mechanisms
- [ ] Test role synchronization
  - Manually update role in database
  - Refresh JWT token
  - Verify UI reflects new permissions
- [ ] Test concurrent sessions
  - Login in multiple browser tabs
  - Change role in one session
  - Verify other sessions update appropriately

#### 9.7 Performance and UX Testing
- [ ] Test dashboard loading performance
  - Measure time to interactive for each dashboard
  - Verify no unnecessary re-renders
  - Check bundle size impact of role-based components
- [ ] Test mobile responsiveness
  - Access dashboards on mobile devices
  - Verify navigation works correctly
  - Test touch interactions on dashboard elements
- [ ] Test accessibility
  - Navigate dashboards using keyboard only
  - Test with screen reader
  - Verify proper ARIA labels and roles

## Known Limitations

- Email confirmation requires email service configuration in Supabase
- Rate limiting may affect rapid testing (clear between test runs)
- Some tests may fail without proper Supabase configuration
- Dashboard routing tests require all role-based components to be implemented

## Support

For issues during testing:
- Check browser console for errors
- Review Supabase logs in dashboard
- Verify environment variables are set correctly
- See VERCEL_DEPLOYMENT.md troubleshooting section
