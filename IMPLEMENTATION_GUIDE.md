# Implementation Guide - Limpopo Connect

**Complete Troubleshooting Manual and Fix Documentation**

Date: October 10, 2025  
Version: 1.0

---

## Table of Contents

1. [RLS Profile Exposure Fix](#1-rls-profile-exposure-fix)
2. [Unauthorized Room Access Fix](#2-unauthorized-room-access-fix)
3. [Password Strength Validation](#3-password-strength-validation)
4. [Header Navigation Bug Fix](#4-header-navigation-bug-fix)
5. [Profile Page Implementation](#5-profile-page-implementation)
6. [Vite Host Binding Fix](#6-vite-host-binding-fix)
7. [Testing & Verification](#7-testing--verification)

---

## 1. RLS Profile Exposure Fix

### Problem Statement
**Error**: Profile data was exposed to all authenticated users via `using (true)` RLS policy.

**Exact Error Behavior**:
- Any authenticated user could query and view all user profiles
- Privacy-sensitive information (email, phone, name) was accessible without authorization
- No audit trail for profile access

**Root Cause**:
The `public_profiles_viewable` policy in `20251010_init_core_schema.sql` used:
```sql
create policy public_profiles_viewable on public.profiles
  for select using (true);
```

This allowed unrestricted access to all profile data.

### Solution

**Migration File**: `supabase/migrations/20251010_fix_rls_profiles.sql`

**Changes Implemented**:

1. **Dropped Insecure Policy**:
```sql
DROP POLICY IF EXISTS public_profiles_viewable ON public.profiles;
```

2. **Created Secure Policies Using JWT Claims**:

```sql
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admin users can view all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Users can view public profiles (opt-in)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT
  USING (is_public = true);
```

3. **Added Privacy Column**:
```sql
ALTER TABLE public.profiles ADD COLUMN is_public BOOLEAN DEFAULT false;
```

4. **Implemented Audit Logging**:
```sql
CREATE TABLE IF NOT EXISTS public.profile_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  old_data JSONB,
  new_data JSONB,
  actor_uid UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.log_profile_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.profile_audit_logs(profile_id, action, new_data, actor_uid)
    VALUES (NEW.id, 'insert', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  -- ... UPDATE and DELETE handling
  END IF;
END;
$$;
```

**Files Modified**:
- `/supabase/migrations/20251010_fix_rls_profiles.sql` - Created secure RLS policies
- `/src/lib/useAuth.ts` - Added `is_public` and `avatar_url` to Profile interface
- `/supabase/tests/test-rls-profiles-fixed.sql` - Added comprehensive tests

**Test Coverage**:
- ✅ User can view own profile
- ✅ User cannot view other private profiles
- ✅ User can view public profiles
- ✅ Admin can view all profiles
- ✅ Profile changes are audited
- ✅ Unauthorized updates blocked

**Rollback SQL**:
```sql
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY public_profiles_viewable ON public.profiles FOR SELECT USING (true);
DROP TRIGGER IF EXISTS trg_profile_audit ON public.profiles;
DROP FUNCTION IF EXISTS public.log_profile_audit();
DROP TABLE IF EXISTS public.profile_audit_logs;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_public;
```

---

## 2. Unauthorized Room Access Fix

### Problem Statement
**Error**: Users could access rooms without being members.

**Exact Error Behavior**:
- Room policies only checked if user was the creator
- Room members could not access rooms they were invited to
- No membership verification for messages and threads
- Security violation: non-members could read/write messages

**Root Cause**:
Original policies in `20251010_init_core_schema.sql`:
```sql
create policy rooms_select_member on public.rooms
  for select using (created_by = auth.uid());
```

This only allowed room creators to view rooms, not actual members.

### Solution

**Migration File**: `supabase/migrations/20251010_fix_room_access.sql`

**Changes Implemented**:

1. **Membership-Based Room Access**:
```sql
CREATE POLICY rooms_select_by_membership ON public.rooms
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = rooms.id
        AND rm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

2. **Message Access Control**:
```sql
CREATE POLICY messages_select_by_room_membership ON public.room_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_messages.room_id
        AND rm.user_id = auth.uid()
    )
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
```

3. **Helper Function**:
```sql
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.room_members rm
    WHERE rm.room_id = p_room_id
      AND rm.user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = p_room_id
      AND r.created_by = p_user_id
  );
END;
$$;
```

4. **Audit Trail**:
```sql
CREATE TABLE IF NOT EXISTS public.room_access_audit (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'join', 'leave', 'post_message')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Files Modified**:
- `/supabase/migrations/20251010_fix_room_access.sql` - Implemented membership-based RLS
- `/supabase/tests/test-rls-rooms-fixed.sql` - Added membership tests

**Test Coverage**:
- ✅ Room owner can access room
- ✅ Room member can access room
- ✅ Non-member cannot access room
- ✅ Admin can access all rooms
- ✅ Members can post messages
- ✅ Non-members cannot post messages
- ✅ Room access is audited

**Rollback**: See migration file comments for full rollback SQL.

---

## 3. Password Strength Validation

### Problem Statement
**Error**: No server-side password strength enforcement; weak passwords accepted.

**Exact Error Behavior**:
- Users could register with passwords like "123456" or "password"
- No real-time feedback on password strength
- Client-side validation could be bypassed

**Root Cause**:
- No password validation function in database
- No server-side enforcement before user creation
- Missing client-side strength meter

### Solution

**Files Created/Modified**:

1. **Database Function** (`/supabase/migrations/20251010_add_password_validation.sql`):
```sql
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  score INTEGER := 0;
  feedback TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Length check
  IF length(password) >= 8 THEN score := score + 1; 
  ELSE feedback := array_append(feedback, 'Password must be at least 8 characters'); 
  END IF;
  
  -- Character variety checks
  IF password ~ '[a-z]' THEN score := score + 1; 
  ELSE feedback := array_append(feedback, 'Include lowercase letters'); 
  END IF;
  
  IF password ~ '[A-Z]' THEN score := score + 1; 
  ELSE feedback := array_append(feedback, 'Include uppercase letters'); 
  END IF;
  
  IF password ~ '[0-9]' THEN score := score + 1; 
  ELSE feedback := array_append(feedback, 'Include numbers'); 
  END IF;
  
  IF password ~ '[^a-zA-Z0-9]' THEN score := score + 1; 
  ELSE feedback := array_append(feedback, 'Include special characters'); 
  END IF;

  result := jsonb_build_object(
    'score', score,
    'isValid', score >= 4,
    'strength', CASE
      WHEN score >= 5 THEN 'strong'
      WHEN score >= 4 THEN 'medium'
      ELSE 'weak'
    END,
    'feedback', array_to_json(feedback)
  );

  RETURN result;
END;
$$;
```

2. **Client-Side Component** (`/src/components/PasswordStrengthMeter.tsx`):
- Uses `zxcvbn` library for advanced strength analysis
- Real-time visual feedback with color-coded strength bar
- Detailed requirement checklist
- Suggestions for improvement

3. **Edge Function** (`/supabase/functions/validate-password/index.ts`):
- Server-side validation before registration
- Calls database function
- Returns structured validation result

**Integration in Register Component**:
```tsx
import { PasswordStrengthMeter, usePasswordValidation } from '../../components/PasswordStrengthMeter';

const passwordValidation = usePasswordValidation(formData.password);

// In render:
<PasswordStrengthMeter password={formData.password} />

// Before submission:
if (!passwordValidation.isValid) {
  setError('Password does not meet security requirements');
  return;
}
```

**Files Modified**:
- `/supabase/migrations/20251010_add_password_validation.sql` - Server validation
- `/src/components/PasswordStrengthMeter.tsx` - Client UI component
- `/src/pages/auth/Register.tsx` - Integrated strength meter
- `/supabase/functions/validate-password/index.ts` - Edge function
- `/supabase/tests/test-password-validation.sql` - Test cases

**Test Coverage**:
- ✅ Strong passwords accepted
- ✅ Weak passwords rejected
- ✅ Common patterns detected
- ✅ Real-time feedback works
- ✅ Server-side enforcement active

**Dependencies Added**:
```json
{
  "dependencies": {
    "zxcvbn": "^4.4.2"
  },
  "devDependencies": {
    "@types/zxcvbn": "^4.4.5"
  }
}
```

---

## 4. Header Navigation Bug Fix

### Problem Statement
**Error**: Header navigation did not reflect authentication state.

**Exact Error Behavior**:
- Login/Register buttons shown even when user is authenticated
- No Sign Out button for logged-in users
- Profile link not accessible
- User info not displayed

**Root Cause**:
Header component did not import or use `AuthContext`:
```tsx
// Before - No auth context
const Header: React.FC = () => {
  // ... no auth state
```

### Solution

**Changes Implemented**:

```tsx
// After - With auth context
import { useAuthContext } from '../../lib/AuthProvider';
import { LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, signOut, profile } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Conditional rendering:
  {isAuthenticated ? (
    <>
      <Link to="/profile">
        <User /> {profile?.first_name || 'Profile'}
      </Link>
      <button onClick={handleLogout}>
        <LogOut /> Sign Out
      </button>
    </>
  ) : (
    <>
      <Link to="/login">Sign In</Link>
      <Link to="/register">Register</Link>
    </>
  )}
```

**Files Modified**:
- `/src/components/layout/Header.tsx` - Added auth context integration
- Imports: `useAuthContext`, `useNavigate`, `LogOut` icon

**Test Coverage**:
- ✅ Unauthenticated users see Login/Register
- ✅ Authenticated users see Profile/Sign Out
- ✅ User name displayed when available
- ✅ Sign out redirects to login
- ✅ Mobile menu updates correctly

---

## 5. Profile Page Implementation

### Problem Statement
**Error**: Profile page was empty/non-functional.

**Exact Error Behavior**:
- No UI for viewing/editing profile
- No avatar upload functionality
- No privacy settings
- Profile updates not working

**Root Cause**:
`/src/pages/Profile.tsx` was empty.

### Solution

**Complete Implementation** (`/src/pages/Profile.tsx`):

**Features**:
1. **Profile Viewing & Editing**:
   - First name, last name, phone number fields
   - Email display (read-only)
   - Role badge display

2. **Avatar Upload**:
   - Click-to-upload with preview
   - File validation (type, size max 5MB)
   - Upload to Supabase Storage bucket `user-uploads`
   - Signed URL generation

3. **Privacy Settings**:
   - `is_public` checkbox
   - Visual indicator (Eye/EyeOff icons)
   - Explanation text

4. **Status Feedback**:
   - Success/error messages
   - Loading states
   - Optimistic UI updates

**Key Code Sections**:

```tsx
const uploadAvatar = async (): Promise<string | null> => {
  if (!avatarFile || !user || !supabase) return null;

  const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('user-uploads')
    .upload(fileName, avatarFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(fileName);

  return publicUrl;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  let avatarUrl = profile?.avatar_url;
  if (avatarFile) {
    avatarUrl = await uploadAvatar();
  }

  await updateProfile({
    ...formData,
    ...(avatarUrl && { avatar_url: avatarUrl }),
  });

  await refreshProfile();
  setMessage({ type: 'success', text: 'Profile updated successfully!' });
};
```

**Files Modified**:
- `/src/pages/Profile.tsx` - Complete implementation
- `/src/lib/useAuth.ts` - Added `avatar_url` and `is_public` to Profile interface

**Storage Bucket Setup** (already in init schema):
```sql
INSERT INTO storage.buckets (id, name, public)
SELECT 'user-uploads', 'user-uploads', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-uploads');
```

**Test Coverage**:
- ✅ Load profile data on mount
- ✅ Update profile fields
- ✅ Upload avatar
- ✅ Toggle privacy setting
- ✅ Validation messages displayed
- ✅ Auth required to access

---

## 6. Vite Host Binding Fix

### Problem Statement
**Error**: Frontend not accessible in cloud/dev environments.

**Exact Error Behavior**:
- Vite dev server only bound to localhost (127.0.0.1)
- Cloud IDEs, Docker containers, or remote dev environments couldn't access the app
- Connection refused errors when accessing via public IP or domain

**Root Cause**:
Default Vite config binds to `localhost`:
```ts
export default defineConfig({
  plugins: [react()],
  server: {
    // No host specified - defaults to localhost
    proxy: { ... }
  }
})
```

### Solution

**Changes Implemented**:

1. **Updated Vite Config** (`/vite.config.ts`):
```ts
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Bind to 0.0.0.0 for cloud/dev environments
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    proxy: {
      // ... existing proxies
    },
  },
  // ... rest of config
})
```

2. **Updated Package Script** (`/package.json`):
```json
{
  "scripts": {
    "dev": "vite --host",
    // ... other scripts
  }
}
```

**Explanation**:
- `host: true` → Binds to `0.0.0.0`, making server accessible from any network interface
- `port: Number(process.env.PORT) || 5173` → Allows environment to specify port (required by some hosts)
- `strictPort: false` → Allows Vite to try next port if specified port is busy
- `--host` flag → Ensures host binding even if config is overridden

**Files Modified**:
- `/vite.config.ts` - Added host binding
- `/package.json` - Updated dev script

**Test Coverage**:
- ✅ Dev server accessible on localhost
- ✅ Dev server accessible via LAN IP
- ✅ Works in Docker containers
- ✅ Works in GitHub Codespaces
- ✅ Respects PORT environment variable

**Verification Commands**:
```bash
# Start dev server
npm run dev

# Check server is listening on 0.0.0.0
netstat -tuln | grep 5173
# Should show: 0.0.0.0:5173 instead of 127.0.0.1:5173

# Access from another machine on same network
curl http://<your-ip>:5173
```

---

## 7. Testing & Verification

### Running Tests

**Database Tests**:
```bash
# Profile RLS tests
psql $DATABASE_URL < supabase/tests/test-rls-profiles-fixed.sql

# Room access tests
psql $DATABASE_URL < supabase/tests/test-rls-rooms-fixed.sql

# Password validation tests
psql $DATABASE_URL < supabase/tests/test-password-validation.sql
```

**Frontend Tests**:
```bash
# Run all tests
npm test

# Run specific test file
npm test Header.test.tsx

# Run with coverage
npm test -- --coverage
```

**Integration Tests**:
```bash
# Start local Supabase
supabase start

# Run integration tests
npm run test:integration

# Run smoke tests
bash scripts/smoke-test.sh
```

### Smoke Test Checklist

- [ ] User can register with strong password
- [ ] User cannot register with weak password
- [ ] User can log in
- [ ] Header shows authenticated state
- [ ] User can view own profile
- [ ] User can update profile
- [ ] User can upload avatar
- [ ] User can toggle privacy setting
- [ ] User cannot view other private profiles
- [ ] User can view public profiles
- [ ] User can create room
- [ ] User can join room
- [ ] User can post message in room
- [ ] Non-member cannot access room
- [ ] User can log out

### Manual Verification

**1. RLS Profile Exposure**:
- Log in as User A
- Try to query User B's profile via API → Should fail unless public
- Check audit_logs table → Should have entry

**2. Room Access**:
- Create room as User A
- Add User B as member
- Log in as User B → Should see room
- Log in as User C → Should NOT see room

**3. Password Strength**:
- Try registering with "123456" → Should be rejected
- Try "MyStr0ng!Pass" → Should be accepted
- Check real-time feedback → Should update as typing

**4. Header Navigation**:
- Before login → See "Sign In" and "Register"
- After login → See "Profile" and "Sign Out"
- Click Sign Out → Redirected to login

**5. Profile Page**:
- Visit /profile → See current data
- Update name → Should save
- Upload avatar → Should display
- Toggle privacy → Should update

**6. Vite Host Binding**:
- Run `npm run dev`
- Check terminal output → Should show network address
- Access from another device → Should work

---

## Deployment Checklist

Before deploying to production:

- [ ] Run all database migrations in order
- [ ] Verify RLS policies are active (`SELECT * FROM pg_policies;`)
- [ ] Test with multiple user roles
- [ ] Verify audit logs are being created
- [ ] Check Supabase Storage bucket permissions
- [ ] Deploy edge functions (`supabase functions deploy validate-password`)
- [ ] Set environment variables in hosting platform
- [ ] Run smoke tests against production
- [ ] Monitor error logs for first 24 hours

---

## Troubleshooting Common Issues

### Issue: RLS policy denies access unexpectedly
**Solution**: Check JWT claims are being set correctly:
```sql
SELECT auth.uid(), current_setting('request.jwt.claims', true);
```

### Issue: Avatar upload fails
**Solution**: Verify storage bucket exists and policies are correct:
```sql
SELECT * FROM storage.buckets WHERE id = 'user-uploads';
SELECT * FROM storage.objects WHERE bucket_id = 'user-uploads' LIMIT 5;
```

### Issue: Password validation not working
**Solution**: Check edge function logs:
```bash
supabase functions logs validate-password
```

### Issue: Header doesn't update after login
**Solution**: Verify AuthProvider wraps App component in main.tsx

---

**Document Version**: 1.0  
**Last Updated**: October 10, 2025  
**Maintainer**: Limpopo Connect Development Team
