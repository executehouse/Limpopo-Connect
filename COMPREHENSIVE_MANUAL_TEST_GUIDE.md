# 🧪 Comprehensive Manual Test Guide - Limpopo Connect

**Version**: 1.0  
**Date**: October 12, 2025  
**Status**: Complete Feature Testing  

This guide provides a comprehensive manual testing checklist for all features in the Limpopo Connect application.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Authentication Testing](#authentication-testing)
4. [Role-Based Access Control](#role-based-access-control)
5. [Public Features](#public-features)
6. [Protected Features](#protected-features)
7. [Security Testing](#security-testing)
8. [UI/UX Testing](#uiux-testing)
9. [Performance Testing](#performance-testing)
10. [Test Results Template](#test-results-template)

---

## Prerequisites

### Required Tools
- ✅ Modern web browser (Chrome, Firefox, Safari, or Edge)
- ✅ Node.js v18+ and npm v8+
- ✅ Git installed
- ✅ Text editor for recording results

### Pre-Test Setup
```bash
# Clone repository
git clone https://github.com/Tshikwetamakole/Limpopo-Connect.git
cd Limpopo-Connect

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Environment Setup

### ✅ Test 1.1: Development Server Startup
**Objective**: Verify the application starts without errors

**Steps**:
1. Run `npm run dev` in terminal
2. Check console output for errors
3. Navigate to `http://localhost:5173` (or shown URL)
4. Verify page loads

**Expected Results**:
- ✅ Server starts on port 5173 or alternative
- ✅ No compilation errors in console
- ✅ Homepage loads successfully
- ✅ No browser console errors

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 1.2: Build Process
**Objective**: Verify production build works

**Steps**:
1. Run `npm run build`
2. Check for build errors
3. Run `npm run preview`
4. Access preview URL

**Expected Results**:
- ✅ Build completes successfully
- ✅ `dist/` folder created with assets
- ✅ Preview server starts
- ✅ Application functions in production mode

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 1.3: TypeScript & Linting
**Objective**: Verify code quality checks pass

**Steps**:
1. Run `npm run typecheck`
2. Run `npm run lint`

**Expected Results**:
- ✅ TypeScript compilation succeeds
- ✅ No ESLint errors
- ✅ Only acceptable warnings (if any)

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

## Authentication Testing

### ✅ Test 2.1: User Registration - Citizen Role
**Objective**: Test new user registration flow

**Steps**:
1. Navigate to `/auth/register` or click "Register" in header
2. Fill registration form:
   - First Name: `Test`
   - Last Name: `Citizen`
   - Email: `test.citizen.{timestamp}@example.com`
   - Phone: `+27 82 123 4567`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
   - Role: Select "Citizen"
3. Check "I agree to Terms of Service"
4. Click "Create account"
5. Observe result

**Expected Results**:
- ✅ Form validates input in real-time
- ✅ Password strength meter shows
- ✅ Weak passwords are rejected
- ✅ Registration succeeds with valid data
- ✅ User redirected to onboarding or dashboard
- ✅ Success message displayed

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

**Notes**: _______________________

---

### ✅ Test 2.2: User Registration - Business Role
**Objective**: Test business owner registration

**Steps**:
1. Navigate to `/auth/register`
2. Select "Business Owner" role
3. Complete form with business details
4. Submit registration

**Expected Results**:
- ✅ Additional business fields appear (if any)
- ✅ Registration successful
- ✅ Business verification flow initiated (if applicable)
- ✅ User redirected appropriately

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 2.3: User Registration - Visitor Role
**Objective**: Test visitor registration (minimal access)

**Steps**:
1. Navigate to `/auth/register`
2. Select "Visitor" role
3. Complete minimal registration form
4. Submit

**Expected Results**:
- ✅ Simplified registration form
- ✅ Registration successful
- ✅ Limited access granted

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 2.4: Login - Valid Credentials
**Objective**: Test login with correct credentials

**Steps**:
1. Navigate to `/auth/login`
2. Enter valid email and password
3. Click "Sign in"

**Expected Results**:
- ✅ Login successful
- ✅ JWT token stored (check browser DevTools > Application > Storage)
- ✅ User redirected to appropriate dashboard based on role
- ✅ Header shows authenticated state

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 2.5: Login - Invalid Credentials
**Objective**: Test login error handling

**Steps**:
1. Navigate to `/auth/login`
2. Enter invalid email/password combination
3. Click "Sign in"

**Expected Results**:
- ✅ Login fails with clear error message
- ✅ User remains on login page
- ✅ No sensitive information leaked in error
- ✅ Form remains populated (email field only)

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 2.6: Password Reset Flow
**Objective**: Test password recovery

**Steps**:
1. Navigate to `/auth/login`
2. Click "Forgot password?" link
3. Enter registered email
4. Submit request
5. Check for confirmation

**Expected Results**:
- ✅ Forgot password page loads
- ✅ Email validation works
- ✅ Submission shows success message
- ✅ Instructions clear (check email, etc.)

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 2.7: Sign Out
**Objective**: Test logout functionality

**Steps**:
1. While logged in, click user menu in header
2. Click "Sign Out"
3. Observe result

**Expected Results**:
- ✅ User logged out successfully
- ✅ JWT token cleared from storage
- ✅ Redirected to home or login page
- ✅ Header shows unauthenticated state

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 2.8: Session Persistence
**Objective**: Test "Remember me" functionality

**Steps**:
1. Login with "Remember me" checked
2. Close browser completely
3. Reopen and navigate to site
4. Check if still logged in

**Expected Results**:
- ✅ Session persists across browser restarts
- ✅ User remains authenticated
- ✅ No need to login again

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

## Role-Based Access Control

### ✅ Test 3.1: Visitor Dashboard Access
**Objective**: Test visitor-level permissions

**Steps**:
1. Login as visitor (or access without auth)
2. Navigate to `/dashboard/visitor`
3. Explore available features
4. Attempt to access restricted pages

**Expected Results**:
- ✅ Visitor dashboard accessible
- ✅ Limited feature set visible
- ✅ Public content browsing allowed
- ✅ Protected features blocked with clear message

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 3.2: Citizen Dashboard Access
**Objective**: Test citizen-level permissions

**Steps**:
1. Login as citizen
2. Navigate to `/dashboard/citizen` or `/home`
3. Verify available features:
   - Profile management
   - Connections
   - Marketplace access
   - Events registration
   - Chat/messaging

**Expected Results**:
- ✅ Citizen dashboard loads
- ✅ Role badge shows "Citizen" in header
- ✅ All citizen features accessible
- ✅ Business/Admin features not visible

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 3.3: Business Dashboard Access
**Objective**: Test business owner permissions

**Steps**:
1. Login as business owner
2. Navigate to `/dashboard/business`
3. Verify business features:
   - Business profile management
   - Business directory listing
   - Analytics (if available)
   - Customer management

**Expected Results**:
- ✅ Business dashboard loads
- ✅ Role badge shows "Business" in header
- ✅ Business management features visible
- ✅ Admin features still restricted

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 3.4: Admin Dashboard Access
**Objective**: Test admin-level permissions

**Steps**:
1. Login as admin
2. Navigate to `/dashboard/admin` or `/admin`
3. Verify admin features:
   - User management
   - Content moderation
   - System settings
   - Analytics

**Expected Results**:
- ✅ Admin dashboard loads
- ✅ Role badge shows "Admin" in header
- ✅ All admin features accessible
- ✅ Full system access granted

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 3.5: Unauthorized Access Prevention
**Objective**: Verify role-based restrictions work

**Steps**:
1. Login as citizen (non-admin)
2. Manually navigate to `/dashboard/admin`
3. Observe result

**Expected Results**:
- ✅ Access denied
- ✅ Clear error message shown
- ✅ Redirected to appropriate page
- ✅ No admin content leaked

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 3.6: Onboarding Flow
**Objective**: Test first-time user onboarding

**Steps**:
1. Register new account
2. Complete onboarding steps
3. Verify flow completion

**Expected Results**:
- ✅ Onboarding wizard appears for new users
- ✅ Multi-step process clear and intuitive
- ✅ Profile setup guided
- ✅ Redirect to dashboard after completion

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

## Public Features

### ✅ Test 4.1: Home Page / Landing Page
**Objective**: Test public homepage

**Steps**:
1. Navigate to `/` (not logged in)
2. Verify hero section displays
3. Check feature highlights
4. Test call-to-action buttons
5. Verify responsive design

**Expected Results**:
- ✅ Hero image loads properly
- ✅ "Join our community" CTA visible
- ✅ Feature cards display correctly
- ✅ Navigation links work
- ✅ Mobile view adapts properly

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 4.2: Business Directory (Public View)
**Objective**: Test business browsing without auth

**Steps**:
1. Navigate to `/business-directory`
2. View business listings
3. Test search functionality
4. Test category filters
5. Click on a business card

**Expected Results**:
- ✅ Business listings load
- ✅ Search box functional
- ✅ Filters work (category, location)
- ✅ Business cards show key info
- ✅ Clicking opens business details

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 4.3: Business Detail View
**Objective**: Test individual business pages

**Steps**:
1. From directory, click on a business
2. Verify business details page
3. Check displayed information:
   - Business name
   - Description
   - Address
   - Phone/email
   - Hours (if available)
   - Photos/gallery

**Expected Results**:
- ✅ Detail page loads
- ✅ All information displayed correctly
- ✅ Photos render properly
- ✅ Contact buttons functional
- ✅ Map integration works (if present)

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 4.4: Events Page (Public)
**Objective**: Test event browsing

**Steps**:
1. Navigate to `/events`
2. View event listings
3. Test date filters
4. Test category filters
5. Click on an event

**Expected Results**:
- ✅ Event listings display
- ✅ Upcoming events highlighted
- ✅ Filters functional
- ✅ Event cards show date, title, location
- ✅ Event details accessible

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 4.5: Tourism Page
**Objective**: Test tourism information

**Steps**:
1. Navigate to `/tourism`
2. Browse attractions
3. Check location information
4. Test photo galleries

**Expected Results**:
- ✅ Tourism page loads
- ✅ Attractions listed with descriptions
- ✅ Photos display properly
- ✅ Information accurate and helpful

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 4.6: News Page
**Objective**: Test news/updates section

**Steps**:
1. Navigate to `/news`
2. View news articles
3. Click on an article
4. Test pagination (if applicable)

**Expected Results**:
- ✅ News page loads
- ✅ Articles display with headlines and excerpts
- ✅ Article detail view works
- ✅ Dates formatted correctly

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

## Protected Features

### ✅ Test 5.1: Profile View (Own Profile)
**Objective**: Test viewing own profile

**Steps**:
1. Login as any user
2. Navigate to `/profile` or `/profile/me`
3. Verify profile information displays

**Expected Results**:
- ✅ Profile page loads
- ✅ User information displayed correctly
- ✅ Avatar/photo shows (or placeholder)
- ✅ "Edit Profile" button visible
- ✅ Privacy settings visible

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 5.2: Profile Edit
**Objective**: Test profile editing

**Steps**:
1. From profile, click "Edit Profile"
2. Modify fields:
   - First name
   - Last name
   - Phone number
   - Bio/description
3. Click "Save Changes"

**Expected Results**:
- ✅ Edit mode activated
- ✅ Form pre-filled with current data
- ✅ Validation works on inputs
- ✅ Changes saved successfully
- ✅ Success message shown
- ✅ Profile updates reflected immediately

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 5.3: Avatar Upload
**Objective**: Test profile picture upload

**Steps**:
1. In edit profile mode
2. Click on avatar/photo area
3. Select image file from computer
4. Upload and save

**Expected Results**:
- ✅ File picker opens
- ✅ Image preview shows before upload
- ✅ Upload progress indicated
- ✅ Image validation works (size, format)
- ✅ Avatar updates on profile
- ✅ Avatar visible in header

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 5.4: Profile Privacy Settings
**Objective**: Test public/private profile toggle

**Steps**:
1. In profile settings
2. Toggle "Make profile public" checkbox
3. Save changes
4. Logout and try viewing profile URL as guest

**Expected Results**:
- ✅ Privacy toggle works
- ✅ Public profiles viewable by anyone
- ✅ Private profiles restricted to authenticated users
- ✅ Setting persists after logout/login

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 5.5: View Other User Profiles
**Objective**: Test viewing other profiles

**Steps**:
1. Login as User A
2. Navigate to User B's profile URL: `/profile/{userId}`
3. Check what information is visible

**Expected Results**:
- ✅ Public profiles fully visible
- ✅ Private profiles show limited info or access denied
- ✅ Contact options available (if public)
- ✅ No private data leaked

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 5.6: Marketplace Access
**Objective**: Test marketplace features

**Steps**:
1. Login as citizen
2. Navigate to `/marketplace`
3. Browse listings
4. Test search/filter
5. Click on a listing

**Expected Results**:
- ✅ Marketplace accessible to authenticated users
- ✅ Listings display properly
- ✅ Search and filters work
- ✅ Listing details show
- ✅ Contact seller option available

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 5.7: Connections Hub
**Objective**: Test connections/networking features

**Steps**:
1. Login as citizen
2. Navigate to `/connections`
3. Explore sub-sections:
   - Friendship Partners
   - Meaningful Relationships
   - Casual Meetups
   - Shared Interests
   - Community Stories
   - Missed Moments

**Expected Results**:
- ✅ Connections page loads
- ✅ All sub-sections accessible
- ✅ Each section has appropriate content
- ✅ Navigation between sections smooth

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 5.8: Chat/Messaging (Demo)
**Objective**: Test chat functionality

**Steps**:
1. Login as user
2. Navigate to `/chat-demo`
3. Test sending messages
4. Test real-time updates (if applicable)

**Expected Results**:
- ✅ Chat interface loads
- ✅ Can send messages
- ✅ Messages display correctly
- ✅ Real-time updates work (if implemented)

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 5.9: Event Registration
**Objective**: Test registering for events (authenticated)

**Steps**:
1. Login as citizen
2. Go to `/events`
3. Click on an event
4. Click "Register" or "RSVP"
5. Confirm registration

**Expected Results**:
- ✅ Registration button visible when logged in
- ✅ Registration succeeds
- ✅ Confirmation message shown
- ✅ Event added to user's calendar/profile (if applicable)

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

## Security Testing

### ✅ Test 6.1: Password Strength Validation
**Objective**: Test password requirements

**Steps**:
1. Go to registration page
2. Test passwords:
   - `password` (too weak)
   - `Password1` (missing special char)
   - `SecurePass123!` (strong)

**Expected Results**:
- ✅ Password strength meter shows
- ✅ Weak passwords rejected
- ✅ Requirements clearly stated
- ✅ Strong password accepted

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 6.2: JWT Token Validation
**Objective**: Test authentication token handling

**Steps**:
1. Login successfully
2. Open Browser DevTools > Application > Storage
3. Find JWT token
4. Copy token
5. Logout
6. Manually insert expired/invalid token
7. Try accessing protected route

**Expected Results**:
- ✅ Valid token grants access
- ✅ Expired token rejected
- ✅ Invalid token rejected
- ✅ Redirect to login on token failure

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 6.3: Protected Route Access (Unauthenticated)
**Objective**: Verify authentication is required

**Steps**:
1. Ensure logged out
2. Manually navigate to protected routes:
   - `/profile`
   - `/marketplace`
   - `/chat-demo`
   - `/dashboard/citizen`

**Expected Results**:
- ✅ Access denied for all protected routes
- ✅ Redirected to login page
- ✅ Return URL preserved (redirect back after login)
- ✅ No content leaked

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 6.4: XSS Protection
**Objective**: Test cross-site scripting prevention

**Steps**:
1. In profile bio or name field, enter:
   `<script>alert('XSS')</script>`
2. Save and view profile

**Expected Results**:
- ✅ Script tags sanitized/escaped
- ✅ No JavaScript execution
- ✅ Text displayed as plain text
- ✅ HTML entities encoded

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 6.5: SQL Injection Prevention (Client-side)
**Objective**: Test input sanitization

**Steps**:
1. In search boxes, enter SQL injection attempts:
   - `' OR '1'='1`
   - `'; DROP TABLE users; --`
2. Submit search

**Expected Results**:
- ✅ Input treated as literal string
- ✅ No database errors
- ✅ Search returns safe results or no results
- ✅ Application remains functional

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 6.6: Row-Level Security (RLS)
**Objective**: Test database access controls

**Steps**:
1. Login as User A
2. Note User A's profile ID
3. Attempt to access User B's private profile
4. Attempt to edit User B's data (via API if exposed)

**Expected Results**:
- ✅ Users can only view allowed profiles
- ✅ Users cannot edit other users' data
- ✅ RLS policies enforced server-side
- ✅ Error messages don't leak sensitive info

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

## UI/UX Testing

### ✅ Test 7.1: Responsive Design - Mobile
**Objective**: Test mobile device compatibility

**Steps**:
1. Open browser DevTools
2. Toggle device toolbar (mobile view)
3. Test iPhone 12/13 Pro viewport (390x844)
4. Navigate through pages
5. Test forms and inputs

**Expected Results**:
- ✅ Layout adapts to small screen
- ✅ Navigation menu collapses (hamburger)
- ✅ Text readable without zooming
- ✅ Buttons/links large enough to tap
- ✅ Forms usable on mobile

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 7.2: Responsive Design - Tablet
**Objective**: Test tablet compatibility

**Steps**:
1. Use tablet viewport (768x1024)
2. Navigate site
3. Test interactions

**Expected Results**:
- ✅ Layout optimized for medium screens
- ✅ Grid layouts adjust appropriately
- ✅ Touch targets sized correctly

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 7.3: Responsive Design - Desktop
**Objective**: Test desktop experience

**Steps**:
1. Use standard desktop viewport (1920x1080)
2. Test wide screen layout
3. Check spacing and alignment

**Expected Results**:
- ✅ Full layout utilized
- ✅ Content not stretched too wide
- ✅ Multi-column layouts work
- ✅ Images scale appropriately

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 7.4: Navigation Flow
**Objective**: Test site navigation

**Steps**:
1. Start at homepage
2. Click through all main nav items
3. Use breadcrumbs (if present)
4. Test back button
5. Test footer links

**Expected Results**:
- ✅ All nav links functional
- ✅ Current page highlighted in nav
- ✅ Breadcrumbs accurate
- ✅ Back button works correctly
- ✅ Footer links work

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 7.5: Form Validation & Error Messages
**Objective**: Test form UX

**Steps**:
1. Test registration form with invalid data:
   - Empty fields
   - Invalid email format
   - Password mismatch
2. Check error messages

**Expected Results**:
- ✅ Real-time validation on blur/change
- ✅ Clear, helpful error messages
- ✅ Errors displayed near relevant fields
- ✅ Form submits only when valid
- ✅ Success messages clear

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 7.6: Loading States
**Objective**: Test loading indicators

**Steps**:
1. On slow connection, observe:
   - Page loads
   - Form submissions
   - Data fetching
2. Check for loading indicators

**Expected Results**:
- ✅ Loading spinners/skeletons shown
- ✅ User aware something is happening
- ✅ No "flash of unstyled content"
- ✅ Smooth transitions

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 7.7: Accessibility - Keyboard Navigation
**Objective**: Test keyboard-only navigation

**Steps**:
1. Use only Tab, Enter, Escape keys
2. Navigate through forms
3. Access all interactive elements

**Expected Results**:
- ✅ Tab order logical
- ✅ Focus indicators visible
- ✅ Forms submittable with Enter
- ✅ Modals closable with Escape
- ✅ No keyboard traps

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 7.8: Color Contrast & Readability
**Objective**: Test visual accessibility

**Steps**:
1. Check text on backgrounds
2. Test link colors
3. Verify button states

**Expected Results**:
- ✅ Text has sufficient contrast (WCAG AA)
- ✅ Links distinguishable from text
- ✅ Button states clear (hover, focus, disabled)
- ✅ No reliance on color alone for info

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

## Performance Testing

### ✅ Test 8.1: Page Load Times
**Objective**: Measure initial load performance

**Steps**:
1. Clear browser cache
2. Load homepage
3. Check Network tab in DevTools
4. Note load time

**Expected Results**:
- ✅ Homepage loads < 3 seconds
- ✅ Time to Interactive < 5 seconds
- ✅ No blocking resources

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

**Load Time**: _______ seconds

---

### ✅ Test 8.2: Image Optimization
**Objective**: Check image loading

**Steps**:
1. Check image file sizes in Network tab
2. Verify lazy loading works
3. Test responsive images

**Expected Results**:
- ✅ Images optimized (< 500KB each)
- ✅ Lazy loading implemented
- ✅ Proper formats used (WebP, AVIF)
- ✅ Responsive images serve appropriate sizes

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 8.3: Bundle Size
**Objective**: Check JavaScript bundle size

**Steps**:
1. Run `npm run build`
2. Check output bundle sizes
3. Look for warnings

**Expected Results**:
- ✅ Main bundle < 500KB gzipped
- ✅ Code splitting implemented
- ✅ No excessive dependencies

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

**Bundle Size**: _______ KB (gzipped)

---

### ✅ Test 8.4: API Response Times
**Objective**: Test backend performance

**Steps**:
1. Monitor Network tab
2. Test various API calls:
   - Login
   - Fetch businesses
   - Load profile
3. Note response times

**Expected Results**:
- ✅ Most API calls < 1 second
- ✅ No timeouts
- ✅ Efficient queries (no N+1 problems)

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

### ✅ Test 8.5: Caching Strategy
**Objective**: Test browser caching

**Steps**:
1. Load page fully
2. Reload page (Cmd/Ctrl + R)
3. Check Network tab for cache hits

**Expected Results**:
- ✅ Static assets cached
- ✅ Cache headers set appropriately
- ✅ Subsequent loads faster

**Test Status**: [ ] Pass [ ] Fail [ ] N/A

---

## Test Results Template

### Test Summary

**Date**: _____________  
**Tester**: _____________  
**Environment**: Development / Staging / Production  
**Browser**: _____________  
**Device**: _____________

### Results Overview

| Category | Tests | Passed | Failed | N/A |
|----------|-------|--------|--------|-----|
| Environment Setup | 3 | | | |
| Authentication | 8 | | | |
| Role-Based Access | 6 | | | |
| Public Features | 6 | | | |
| Protected Features | 9 | | | |
| Security | 6 | | | |
| UI/UX | 8 | | | |
| Performance | 5 | | | |
| **TOTAL** | **51** | | | |

### Critical Issues Found

1. **Issue**: _______________________  
   **Severity**: Critical / High / Medium / Low  
   **Steps to Reproduce**: _______________________  
   **Expected**: _______________________  
   **Actual**: _______________________  

2. **Issue**: _______________________  
   _(Add more as needed)_

### Recommendations

1. _______________________
2. _______________________
3. _______________________

### Sign-Off

**Tester Signature**: _____________  
**Date**: _____________  
**Status**: Ready for Production / Requires Fixes / Needs Retesting

---

## Quick Reference: Feature Matrix

| Feature | Status | Tested | Notes |
|---------|--------|--------|-------|
| User Registration | ✅ | [ ] | |
| Login/Logout | ✅ | [ ] | |
| Password Reset | ✅ | [ ] | |
| Profile Management | ✅ | [ ] | |
| Avatar Upload | ✅ | [ ] | |
| Business Directory | ✅ | [ ] | |
| Events | ✅ | [ ] | |
| Marketplace | ✅ | [ ] | |
| Connections | ✅ | [ ] | |
| Chat Demo | ✅ | [ ] | |
| Tourism | ✅ | [ ] | |
| News | ✅ | [ ] | |
| Role-Based Access | ✅ | [ ] | |
| Admin Dashboard | ✅ | [ ] | |
| Business Dashboard | ✅ | [ ] | |
| Citizen Dashboard | ✅ | [ ] | |
| Visitor Dashboard | ✅ | [ ] | |

---

## Additional Resources

- **Smoke Test Script**: `./scripts/comprehensive-smoke-test.sh`
- **Web Testing Guide**: `WEB_TESTING_GUIDE.md`
- **Authentication Test Plan**: `AUTHENTICATION_TEST_PLAN.md`
- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`

---

**End of Comprehensive Manual Test Guide**
