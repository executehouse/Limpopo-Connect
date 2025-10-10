# feat(roles): Role-Based Experience & Journey Integration

## Summary of Changes

This PR implements comprehensive role-based access control and user experience customization for Limpopo Connect. The implementation establishes four distinct user roles (Visitor, Citizen, Business, Admin) with secure, scalable, and user-friendly role-based routing, permissions, and UI customization.

## Problem Statement

The platform lacked role-based differentiation, leading to:
- All users seeing the same interface regardless of their needs
- No proper access controls for sensitive features
- Missing business verification and admin management workflows  
- Insecure RLS policies using `using(true)` patterns
- No clear user onboarding journey based on intended use

## Root Cause Analysis

1. **Missing Role Architecture**: No systematic role definition or enforcement
2. **Security Gaps**: RLS policies not utilizing JWT role claims properly
3. **UI/UX Issues**: Single interface for diverse user types and needs
4. **Routing Problems**: No route protection or role-based access control
5. **Onboarding Gap**: No guided experience for different user types

## Files Changed

### Database & Migrations
- `supabase/migrations/20251010_implement_role_enum.sql` - Role ENUM and verification tables
- `supabase/migrations/20251010_update_rls_role_based.sql` - JWT-based RLS policies

### Core Authentication & Authorization  
- `src/lib/useAuth.ts` - Enhanced with role detection and JWT claims
- `src/lib/AuthProvider.tsx` - Updated context interface for role support
- `src/components/RequireRole.tsx` - **NEW** Route guard component
- `src/config/roles.json` - **UPDATED** Role definitions and permissions
- `src/config/route-map.ts` - **NEW** Centralized route configuration

### User Interface & Experience
- `src/components/layout/Header.tsx` - Role badges and role-specific navigation
- `src/pages/CompleteOnboarding.tsx` - **NEW** Multi-step onboarding flow
- `src/pages/CitizenDashboard.tsx` - **NEW** Community-focused dashboard  
- `src/pages/BusinessDashboard.tsx` - **NEW** Business management interface
- `src/pages/AdminDashboard.tsx` - **NEW** Administrative control panel
- `src/App.tsx` - Role-based routing with RequireRole guards

### Testing & Quality Assurance
- `src/tests/roles/RequireRole.test.tsx` - **NEW** Route guard unit tests
- `src/tests/roles/useAuth.test.tsx` - **NEW** Auth provider tests
- `supabase/tests/test-rls-roles.sql` - **NEW** Database security tests
- `scripts/role-smoke-test.sh` - **NEW** End-to-end smoke tests

### Documentation
- `USER_FLOWS_GUIDE.md` - **NEW** Comprehensive user journey documentation

## SQL Migrations Included

1. **20251010_implement_role_enum.sql**:
   - Creates `user_role` ENUM type
   - Adds `business_verification` table for business KYC
   - Adds `role_audit_logs` for role change tracking
   - Creates secure role update function with audit logging
   - Establishes RLS policies for new tables

2. **20251010_update_rls_role_based.sql**:
   - Updates all RLS policies to use JWT role claims
   - Removes insecure `using(true)` policies  
   - Implements membership-based room access
   - Adds role-based content access controls
   - Creates helper functions for role permission checking

## Tests Added

### Unit Tests
- **RequireRole Component**: Loading states, authentication checks, role validation, access denied flows
- **useAuth Hook**: Role detection, JWT claims management, permission utilities, profile updates

### Integration Tests  
- **Database RLS Policies**: Role-based access validation across all tables
- **Route Protection**: Authenticated vs. unauthenticated access patterns
- **Role Escalation**: Admin privilege testing and audit logging

### Smoke Tests
- **Route Accessibility**: Public vs. protected route access validation
- **Component Integration**: File existence and TypeScript compilation  
- **Configuration Validation**: Role config and route map integrity checks

**Test Commands:**
```bash
# Unit tests
npm test

# Database security tests  
psql $DATABASE_URL -f supabase/tests/test-rls-roles.sql

# Smoke test
./scripts/role-smoke-test.sh

# Build validation
npm run build && npm run lint
```

## Smoke Test Steps

### Manual Testing Workflow

1. **Visitor Experience**:
   ```
   Navigate to / → Should see public content only
   Try /admin → Should redirect to /auth/login
   Try /profile → Should redirect to /auth/login
   ```

2. **Registration & Onboarding**:
   ```
   Register new account → Email verification
   Complete onboarding as Citizen → Redirect to /home
   Complete onboarding as Business → Verification pending → Limited access
   ```

3. **Role-Based Navigation**:
   ```
   Login as Citizen → See blue "Citizen" badge in header
   Check dropdown → Should show citizen-specific quick actions
   Access /admin → Should show "Access Denied" page
   ```

4. **Business Verification Flow**:
   ```
   Register as business → Complete business info step
   Submit for verification → Pending status displayed
   Admin approval → Full business features unlocked
   ```

5. **Admin Functionality**:
   ```
   Login as admin → Access /admin dashboard
   View user list → Can see all roles and users
   Approve business → Verification status updates
   Check audit logs → Role changes are logged
   ```

## Acceptance Criteria

### ✅ Database & Security
- [x] `profiles.role` exists as ENUM with proper constraints
- [x] JWT includes role claim and RLS policies use `current_setting('jwt.claims.role')`  
- [x] No `using(true)` patterns remain in RLS policies
- [x] Business verification workflow implemented with approval process
- [x] Role changes audited in `role_audit_logs` table

### ✅ Authentication & Authorization
- [x] After login, users redirect to role-appropriate landing page
- [x] `RequireRole` component blocks unauthorized access with clear error messages
- [x] AuthProvider exposes role, claims, and permission utilities
- [x] Session management includes role persistence

### ✅ User Experience  
- [x] Role-specific dashboards render appropriate content and quick actions
- [x] Visual role indicators present in header with color-coded badges
- [x] Role-specific navigation and quick-links in dropdown menus
- [x] Onboarding flow guides users based on selected role

### ✅ Testing & Quality
- [x] Unit tests cover role detection, route guards, and permission checking
- [x] Integration tests validate RLS policy enforcement per role
- [x] Smoke tests verify end-to-end role functionality
- [x] TypeScript compilation and ESLint validation pass

### ✅ Documentation
- [x] `USER_FLOWS_GUIDE.md` documents complete user journeys per role
- [x] Test scenarios and acceptance criteria documented
- [x] Database schema changes documented with migration notes

## Security Considerations

### JWT Claims Security
- Role information stored in JWT `claims.role` for client-side UI decisions
- Server-side validation always uses database `profiles.role` as source of truth
- JWT claims refreshed on profile updates to maintain synchronization

### RLS Policy Security  
- All policies validate against authenticated user's database role
- Admin access requires explicit role check in database
- Business features gated behind verification status check
- Audit logging for all role escalations and sensitive operations

### Business Verification Security
- KYC process requires admin approval before business features unlock
- Verification documents handled through secure Supabase Storage
- Business owners can only manage their own verification records
- Admin audit trail for all business approval/rejection decisions

## Notes for Reviewers

### Architecture Decisions
1. **Role Hierarchy**: `visitor < citizen < business < admin` with escalating permissions
2. **JWT vs Database**: JWT used for UI decisions, database as authoritative source
3. **Route Guards**: Component-based guards for reusability and testing
4. **Dashboard Separation**: Role-specific components for maintainable customization

### Performance Considerations  
- Role configuration cached in client-side JSON for fast UI decisions
- Database queries optimized with proper indexing on `profiles.role`
- RLS policies use efficient EXISTS clauses for membership checks
- Session storage caching reduces repeated profile lookups

### Scalability Notes
- Role system designed for easy extension (adding new roles)
- Route map configuration supports dynamic permission management
- Component structure allows role-specific feature development
- Database schema supports audit requirements and compliance

## Rollback Plan

### Immediate Rollback (if critical issues found):
1. **Revert migrations**:
   ```sql
   -- Remove role ENUM constraint
   ALTER TABLE profiles ALTER COLUMN role TYPE text;
   DROP TYPE user_role;
   
   -- Restore simple RLS policies  
   DROP POLICY profiles_select_role_based ON profiles;
   CREATE POLICY profiles_select_simple ON profiles FOR SELECT USING (auth.uid() = id);
   ```

2. **Revert application**:
   ```bash
   git revert <commit-hash>
   npm run build && npm run deploy
   ```

### Data Migration (if partial rollback needed):
- User role data preserved in `profiles.role` column
- Business verification data retained for future use
- Audit logs maintained for compliance and debugging

### Testing Rollback:
```bash
# Verify basic functionality after rollback
./scripts/comprehensive-smoke-test.sh

# Confirm authentication still works
curl -X POST $API_URL/auth/signin -d '{"email":"test@example.com","password":"test123"}'
```

## Breaking Changes

### Route Changes
- `/login` → `/auth/login` (legacy redirect maintained)
- `/register` → `/auth/register` (legacy redirect maintained)
- New protected routes require authentication: `/profile`, `/chat-demo`, `/connections`

### Component API Changes  
- `useAuth()` hook now returns additional properties: `role`, `claims`, permission utilities
- `AuthProvider` context interface expanded with role-based methods
- Header component expects role-based configuration

### Database Schema Changes
- `profiles.role` column now ENUM type (migration handles conversion)
- New tables: `business_verification`, `role_audit_logs`
- Updated RLS policies affect all data access patterns

---

## Deployment Checklist

### Pre-Deployment
- [ ] Run full test suite: `npm test && npm run build && ./scripts/role-smoke-test.sh`
- [ ] Verify environment variables include JWT secret configuration
- [ ] Backup production database before migration
- [ ] Confirm Supabase project has proper RLS enabled

### Deployment Steps
1. **Database Migration**:
   ```bash
   supabase db push --include-all
   # Or manually in Supabase Dashboard SQL Editor
   ```

2. **Application Deployment**:
   ```bash
   npm run build
   vercel --prod  # or your deployment method
   ```

3. **Post-Deployment Validation**:
   ```bash
   # Test production endpoints
   curl https://limpopoconnect.vercel.app/
   curl https://limpopoconnect.vercel.app/auth/login
   
   # Verify role-based access
   # (Manual testing with test accounts)
   ```

### Monitoring  
- Monitor authentication success rates
- Track role-based route access patterns  
- Watch for RLS policy violations in logs
- Monitor business verification approval workflow

---

**This PR establishes a secure, scalable, and user-friendly role-based system that enhances the Limpopo Connect platform with proper access controls, customized user experiences, and comprehensive administrative capabilities.**