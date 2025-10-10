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
7. [Role Mapping & JWT Sync](#7-role-mapping--jwt-sync)
8. [Personalized Dashboard Routing](#8-personalized-dashboard-routing)
9. [Testing & Verification](#9-testing--verification)

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
**Error**: Users needed a complete profile system with view/edit capabilities, avatar uploads, and privacy controls.

**Exact Error Behavior**:
- No comprehensive profile viewing functionality
- Missing profile edit interface with validation
- No avatar upload system with proper storage management
- Missing privacy controls for profile visibility
- No role-based access controls for profile data
- Lack of proper RLS policies for secure profile access

**Root Cause**:
The profile system was incomplete and lacked the necessary components for a production-ready implementation with proper security and user experience.

### Solution

**Complete Profile System Implementation**:

#### 1. Database Schema Enhancement

**Migration File**: `supabase/migrations/20251010_profiles_profile_page.sql`

**Schema Changes**:
```sql
-- Add profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS is_public_profile boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_contact boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Secure RLS Policies

**Migration File**: `supabase/migrations/20251010_profile_page_rls.sql`

**Key Policies**:
```sql
-- Profile SELECT: owner, admin, or public profile
CREATE POLICY profiles_select_policy ON public.profiles
FOR SELECT USING (
    auth.uid() = id::uuid OR                    -- Owner
    EXISTS (                                    -- Admin
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    ) OR
    (is_public_profile = true)                  -- Public profile
);

-- Profile UPDATE: owner or admin only
CREATE POLICY profiles_update_policy ON public.profiles
FOR UPDATE USING (
    auth.uid() = id::uuid OR 
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Validation trigger prevents unauthorized changes
CREATE OR REPLACE FUNCTION validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        -- Non-admins cannot change protected fields
        IF OLD.role != NEW.role THEN
            RAISE EXCEPTION 'Cannot change role. Contact administrator.';
        END IF;
        
        IF LENGTH(NEW.bio) > 1000 THEN
            RAISE EXCEPTION 'Bio cannot exceed 1000 characters';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;
```

#### 3. Frontend Architecture

**Profile Interface Update** (`src/lib/useAuth.ts`):
```typescript
interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'visitor' | 'citizen' | 'business' | 'admin';
  is_public_profile: boolean;
  show_contact: boolean;
  created_at: string;
  updated_at: string;
}
```

**Profile Hooks** (`src/lib/useProfile.ts`):
```typescript
export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const targetId = userId || user?.id;
      if (!targetId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, refetch: fetchProfile };
}

export function useProfileMutations() {
  const updateProfile = async (updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const uploadAvatar = async (file: File) => {
    const processedFile = await validateAndResizeImage(file);
    const result = await uploadAvatar(user!.id, processedFile);
    
    await updateProfile({ avatar_url: result.url });
    return result;
  };

  return { updateProfile, uploadAvatar, deleteAvatar, loading, error };
}
```

#### 4. Profile Components

**ProfileView Component** (`src/components/ProfileView.tsx`):
- Displays profile information based on privacy settings
- Shows different views for owner vs. other users vs. admins
- Handles loading states and error conditions
- Includes role badges and privacy indicators

**ProfileEdit Component** (`src/components/ProfileEdit.tsx`):
- Form validation with real-time feedback
- Avatar upload with progress indication
- Privacy controls with clear explanations
- Optimistic UI updates
- Error handling and retry mechanisms

**Main Profile Page** (`src/pages/Profile.tsx`):
- Route handling for `/profile`, `/profile/me`, `/profile/me/edit`, `/profile/:userId`
- Mode switching between view and edit
- Authentication checks and role-based access
- Breadcrumb navigation

#### 5. Storage System

**Storage Utilities** (`src/lib/storage.ts`):
```typescript
// Image validation and resizing
export async function validateAndResizeImage(
  file: File,
  options: FileUploadOptions = {}
): Promise<File> {
  // Validate file type and size
  // Resize using canvas if needed
  // Return optimized file
}

// Avatar upload with proper path structure
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<UploadResult> {
  const processedFile = await validateAndResizeImage(file);
  const filePath = `avatars/${userId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, processedFile, { upsert: false });
    
  if (error) throw error;
  return { url: publicUrl, path: data.path, size: processedFile.size };
}
```

#### 6. Security Features

**Audit Logging**:
```sql
CREATE TABLE public.profile_audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    target_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    action text NOT NULL,
    details jsonb,
    created_at timestamptz DEFAULT now()
);
```

**Privacy Controls**:
- `is_public_profile`: Controls overall profile visibility
- `show_contact`: Controls email/phone visibility
- Role-based field filtering in queries
- Audit logging for profile access

#### 7. Testing Implementation

**Unit Tests** (`src/tests/`):
- `ProfileView.test.tsx`: Component rendering and privacy controls
- `ProfileEdit.test.tsx`: Form validation and submission
- `useProfile.test.tsx`: Hook functionality and error handling

**Integration Tests**:
- Avatar upload flow with storage validation
- RLS policy enforcement with different user roles
- Privacy setting changes and their effects

**Smoke Test** (`scripts/smoke_profile.sh`):
```bash
#!/bin/bash
# Comprehensive profile system validation
# - Component existence and compilation
# - Database schema validation
# - RLS policy verification
# - Storage configuration check
# - Security validation
```

#### 8. Routes Integration

**App.tsx Updates**:
```tsx
// Profile routes with authentication
<Route path="profile" element={
  <RequireRole roles={['citizen', 'business', 'admin']}>
    <Profile />
  </RequireRole>
} />
<Route path="profile/me" element={
  <RequireRole roles={['citizen', 'business', 'admin']}>
    <Profile />
  </RequireRole>
} />
<Route path="profile/me/edit" element={
  <RequireRole roles={['citizen', 'business', 'admin']}>
    <Profile />
  </RequireRole>
} />
<Route path="profile/:userId" element={
  <RequireRole roles={['citizen', 'business', 'admin']}>
    <Profile />
  </RequireRole>
} />
```

### Files Created/Modified

**New Files**:
- `src/components/ProfileView.tsx` - Profile display component
- `src/components/ProfileEdit.tsx` - Profile editing form
- `src/lib/useProfile.ts` - Profile management hooks
- `src/lib/storage.ts` - File upload utilities
- `src/tests/ProfileView.test.tsx` - Component tests
- `src/tests/ProfileEdit.test.tsx` - Form tests
- `src/tests/useProfile.test.tsx` - Hook tests
- `supabase/migrations/20251010_profiles_profile_page.sql` - Schema migration
- `supabase/migrations/20251010_profile_page_rls.sql` - RLS policies
- `scripts/smoke_profile.sh` - Smoke test script
- `PROFILE_API.md` - Complete API documentation

**Modified Files**:
- `src/pages/Profile.tsx` - Complete rewrite with routing logic
- `src/lib/useAuth.ts` - Updated Profile interface
- `src/App.tsx` - Added profile routes

### Features Delivered

**Profile Viewing**:
- ✅ Display all profile information with proper privacy controls
- ✅ Role-based access (owner sees all, others see public only)
- ✅ Admin controls for profile management
- ✅ Loading states and error handling

**Profile Editing**:
- ✅ Form validation with real-time feedback
- ✅ Avatar upload with image processing
- ✅ Privacy settings with clear explanations
- ✅ Optimistic UI updates
- ✅ Comprehensive error handling

**Security & Privacy**:
- ✅ Secure RLS policies for data access
- ✅ Input validation and sanitization
- ✅ Audit logging for profile operations
- ✅ File upload validation and security

**Storage Management**:
- ✅ Image validation and resizing
- ✅ Proper file organization in Supabase Storage
- ✅ Public URL management
- ✅ File cleanup and deletion

**Testing & Documentation**:
- ✅ Comprehensive unit and integration tests
- ✅ Smoke test for complete system validation
- ✅ API documentation with examples
- ✅ Implementation guide updates

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

## 7. Role Mapping & JWT Sync

### Problem Statement
**Need**: Implement comprehensive role-based access control (RBAC) system that assigns roles to users, propagates them to JWT claims, and enables secure, personalized user experiences.

**Requirements**:
- Support 4 user roles: visitor, citizen, business, admin
- Role persistence in database with audit trail
- JWT claim synchronization for frontend access
- Role-based routing and permissions
- Business verification workflow
- Admin management capabilities

### Solution

**Migration Files**:
- `supabase/migrations/20251010_add_role_to_profiles.sql`
- `supabase/migrations/20251010_configure_jwt_claims.sql`  
- `supabase/migrations/20251010_enhanced_rls_policies.sql`

**Frontend Files**:
- `src/lib/useAuth.ts` - Enhanced with role management
- `src/lib/AuthProvider.tsx` - Role-aware context
- `src/config/roles.json` - Role configuration
- `src/tests/auth.role.test.ts` - Role system tests

### Database Schema Changes

**1. Role Enum Type**:
```sql
CREATE TYPE user_role AS ENUM ('visitor', 'citizen', 'business', 'admin');
```

**2. Profile Table Updates**:
```sql
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'citizen'::user_role,
  ADD COLUMN is_public boolean DEFAULT false,
  ADD COLUMN avatar_url text;
```

**3. JWT Claims Configuration**:
```sql
ALTER ROLE authenticator SET jwt_claims.role = 'role';
ALTER ROLE authenticator SET jwt_claims.user_id = 'user_id';
```

**4. Business Verification Table**:
```sql
CREATE TABLE public.business_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  business_name text NOT NULL,
  business_registration_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

**5. Role Audit Logging**:
```sql
CREATE TABLE public.role_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_role user_role,
  new_role user_role NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  reason text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
```

### Key Functions Implemented

**1. Role Detection**:
```sql
CREATE FUNCTION get_current_user_role() RETURNS user_role AS $$
BEGIN
  -- Try JWT claims first, fallback to profile lookup
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'role',
    (SELECT role FROM profiles WHERE id = auth.uid()),
    'visitor'
  )::user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

**2. Role Hierarchy Check**:
```sql
CREATE FUNCTION has_role(required_role user_role) RETURNS boolean AS $$
DECLARE
  user_level integer;
  required_level integer;
BEGIN
  -- visitor=0, citizen=1, business=2, admin=3
  user_level := CASE get_current_user_role()
    WHEN 'visitor' THEN 0 WHEN 'citizen' THEN 1 
    WHEN 'business' THEN 2 WHEN 'admin' THEN 3 ELSE 0 END;
  required_level := CASE required_role
    WHEN 'visitor' THEN 0 WHEN 'citizen' THEN 1
    WHEN 'business' THEN 2 WHEN 'admin' THEN 3 ELSE 0 END;
  RETURN user_level >= required_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

**3. Business Verification Workflow**:
```sql
CREATE FUNCTION approve_business_verification(
  verification_id uuid,
  reviewer_notes text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  verification_user_id uuid;
BEGIN
  -- Must be admin
  IF get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Only admins can approve business verifications';
  END IF;
  
  -- Update verification and user role
  SELECT user_id INTO verification_user_id
  FROM business_verifications WHERE id = verification_id;
  
  UPDATE business_verifications SET status = 'approved', reviewer_id = auth.uid()
  WHERE id = verification_id;
  
  UPDATE profiles SET role = 'business'::user_role WHERE id = verification_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Enhanced RLS Policies

**1. Role-Aware Profile Access**:
```sql
CREATE POLICY profiles_select_own_or_admin ON profiles
  FOR SELECT USING (
    id = auth.uid() OR                           -- Own profile
    get_current_user_role() = 'admin' OR        -- Admin access
    (is_public = true AND auth.uid() IS NOT NULL) -- Public profiles
  );
```

**2. Business Directory Access**:
```sql
CREATE POLICY businesses_role_enhanced_access ON businesses
  FOR SELECT USING (
    verified = true OR                          -- Verified businesses
    created_by = auth.uid() OR                  -- Own listings
    has_role('business') OR                     -- Business networking
    get_current_user_role() = 'admin'          -- Admin access
  );
```

**3. Admin-Only Management**:
```sql
CREATE POLICY role_audit_logs_admin_read ON role_audit_logs
  FOR SELECT USING (
    get_current_user_role() = 'admin' OR        -- Admin full access
    user_id = auth.uid()                        -- Own role changes
  );
```

### Frontend Integration

**1. Enhanced useAuth Hook**:
```typescript
export function useAuth() {
  // ... existing code ...
  
  const hasRoleOrHigher = (requiredRole: UserRole, userRole?: UserRole) => {
    const roleHierarchy = { visitor: 0, citizen: 1, business: 2, admin: 3 }
    const currentRole = userRole || profile?.role || 'visitor'
    return roleHierarchy[currentRole] >= roleHierarchy[requiredRole]
  }
  
  const requestBusinessVerification = async (verificationData) => {
    const { data, error } = await supabase
      .from('business_verifications')
      .insert({ user_id: authState.user.id, ...verificationData })
    if (error) throw error
    return data
  }
  
  return {
    // ... existing returns ...
    hasRoleOrHigher,
    requestBusinessVerification,
    refreshJWTClaims,
    verifyRoleSync
  }
}
```

**2. Role Configuration (roles.json)**:
```json
{
  "visitor": {
    "label": "Visitor",
    "defaultLanding": "/explore",
    "routes": ["/explore", "/business-directory"],
    "permissions": { "canViewPublicContent": true }
  },
  "citizen": {
    "label": "Citizen", 
    "defaultLanding": "/home",
    "routes": ["/home", "/connections", "/chat-demo"],
    "permissions": { "canCreateContent": true, "canJoinRooms": true }
  },
  "business": {
    "label": "Business",
    "defaultLanding": "/business-dashboard", 
    "routes": ["/business-dashboard", "/listings"],
    "permissions": { "canManageListings": true, "requiresVerification": true }
  },
  "admin": {
    "label": "Administrator",
    "defaultLanding": "/admin",
    "routes": ["/admin", "/admin/users"],
    "permissions": { "canManageUsers": true, "canAccessAdminPanel": true }
  }
}
```

**3. Role-Based Routing Example**:
```typescript
import { useAuthContext } from '@/lib/AuthProvider'

function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode, 
  requiredRole: UserRole 
}) {
  const { hasRoleOrHigher, role } = useAuthContext()
  
  if (!hasRoleOrHigher(requiredRole, role)) {
    return <Navigate to="/unauthorized" />
  }
  
  return <>{children}</>
}
```

### Testing & Validation

**1. Database Tests** (`supabase/tests/test-role-system.sql`):
```sql
-- Test role functions
SELECT get_current_user_role() as current_role;
SELECT has_role('citizen'::user_role) as has_citizen_access;
SELECT * FROM validate_role_sync() WHERE user_id = 'test-user';
```

**2. Frontend Tests** (`src/tests/auth.role.test.ts`):
```typescript
describe('Role-based Authentication', () => {
  it('should correctly validate permissions based on role', () => {
    expect(hasPermission('canCreateContent', 'citizen')).toBe(true)
    expect(hasPermission('canManageUsers', 'citizen')).toBe(false)
    expect(hasPermission('canManageUsers', 'admin')).toBe(true)
  })
  
  it('should validate role hierarchy', () => {
    expect(hasRoleOrHigher('visitor', 'admin')).toBe(true)
    expect(hasRoleOrHigher('admin', 'citizen')).toBe(false)
  })
})
```

**3. Smoke Test Script** (`scripts/role-system-smoke-test.sh`):
```bash
#!/bin/bash
# Comprehensive validation of role system deployment
./scripts/role-system-smoke-test.sh
```

### Business Verification Workflow

**1. Citizen Requests Business Status**:
```typescript
const verificationData = {
  business_name: "Limpopo Tech Solutions",
  business_registration_number: "2023/123456/07",
  business_address: "123 Main St, Polokwane",
  business_email: "info@limpopotech.co.za",
  business_phone: "+27123456789"
}

await requestBusinessVerification(verificationData)
```

**2. Admin Reviews and Approves**:
```sql
-- Admin dashboard query
SELECT * FROM business_verifications WHERE status = 'pending';

-- Approve verification
SELECT approve_business_verification(
  'verification-uuid', 
  'Business registration verified'
);
```

**3. Automatic Role Upgrade**:
- User role updated to 'business' in profiles table
- JWT claims refreshed with new role
- User gains access to business dashboard and features
- Audit log entry created

### Deployment Steps

**1. Apply Migrations**:
```bash
supabase db push --file supabase/migrations/20251010_add_role_to_profiles.sql
supabase db push --file supabase/migrations/20251010_configure_jwt_claims.sql  
supabase db push --file supabase/migrations/20251010_enhanced_rls_policies.sql
```

**2. Verify Schema**:
```sql
-- Check enum exists
SELECT * FROM pg_type WHERE typname = 'user_role';

-- Check JWT claims config  
SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt_claims%';

-- Verify functions exist
SELECT proname FROM pg_proc WHERE proname IN (
  'get_current_user_role', 'has_role', 'approve_business_verification'
);
```

**3. Test Role Assignment**:
```bash
# Run smoke test
./scripts/role-system-smoke-test.sh

# Run SQL tests
psql $DATABASE_URL -f supabase/tests/test-role-system.sql

# Run frontend tests  
npm test src/tests/auth.role.test.ts
```

### Role System Benefits

✅ **Security**: JWT-based authorization with audit trails  
✅ **Scalability**: Hierarchical role system supports growth  
✅ **User Experience**: Role-aware dashboards and features  
✅ **Business Logic**: Verification workflow for business users  
✅ **Administrative Control**: Admin tools for user management  
✅ **Compliance**: Complete audit trail for role changes

---

## 8. Personalized Dashboard Routing

### Problem Statement
**Challenge**: Users needed role-specific dashboard experiences and secure route protection based on their permissions.

**Requirements**:
- Standardized dashboard routes (`/dashboard/{role}`)
- Dynamic redirect after login based on user role
- Role-based access control with proper error handling
- Seamless user experience with minimal friction

### Solution Architecture

**Dashboard Route Structure**:
```
/dashboard/visitor   → VisitorDashboard (public access)
/dashboard/citizen   → CitizenDashboard (citizen+)
/dashboard/business  → BusinessDashboard (business+)
/dashboard/admin     → AdminDashboard (admin only)
```

**Component Architecture**:
- `ProtectedRoute`: Basic authentication guard
- `RoleGuard`: Advanced role-based access control
- Role-specific dashboard components
- Enhanced AuthProvider with role helpers

### Implementation Details

**1. Dashboard Components**

**VisitorDashboard** (`src/pages/VisitorDashboard.tsx`):
```typescript
const VisitorDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-limpopo-green to-limpopo-blue">
      {/* Welcome content for visitors */}
      {/* Call-to-action for registration */}
      {/* Public features showcase */}
    </div>
  );
};
```

**Existing Dashboard Components**:
- `CitizenDashboard`: Community features, reports, discussions
- `BusinessDashboard`: Listings management, analytics, leads
- `AdminDashboard`: User management, content moderation, system admin

**2. Route Protection Components**

**ProtectedRoute** (`src/components/ProtectedRoute.tsx`):
```typescript
export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
```

**RoleGuard** (`src/components/RoleGuard.tsx`):
```typescript
export default function RoleGuard({ 
  children, 
  allowedRoles, 
  requireAuth = true,
  showAccessDenied = true 
}: RoleGuardProps) {
  const { role, isAuthenticated, loading } = useAuthContext();
  
  // Authentication check
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  // Role authorization check
  const userRole = isAuthenticated ? role : 'visitor';
  const hasAccess = allowedRoles.includes(userRole);
  
  if (!hasAccess && showAccessDenied) {
    return <AccessDenied userRole={userRole} requiredRoles={allowedRoles} />;
  }
  
  return <>{children}</>;
}
```

**3. Enhanced Authentication System**

**Role Helper Functions** (`src/lib/useAuth.ts`):
```typescript
// Role helper functions
const isVisitor = () => (profile?.role || 'visitor') === 'visitor';
const isCitizen = () => profile?.role === 'citizen';
const isBusiness = () => profile?.role === 'business';
const isAdmin = () => profile?.role === 'admin';

const hasRoleOrHigher = (requiredRole: UserRole) => {
  const roleHierarchy = { visitor: 0, citizen: 1, business: 2, admin: 3 };
  return roleHierarchy[profile?.role || 'visitor'] >= roleHierarchy[requiredRole];
};

const getRolePriority = (role?: UserRole) => {
  const roleHierarchy = { visitor: 0, citizen: 1, business: 2, admin: 3 };
  return roleHierarchy[role || 'visitor'];
};
```

**4. Dynamic Login Redirection**

**Updated Login Component** (`src/pages/auth/Login.tsx`):
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation logic ...
  
  try {
    await signIn(trimmedEmail, password);
    
    // Dynamic role-based redirect
    setTimeout(() => {
      if (from && from !== '/auth/login') {
        navigate(from, { replace: true });
      } else {
        const landingPage = getDefaultLandingPage();
        navigate(landingPage || '/', { replace: true });
      }
    }, 100);
    
  } catch (err) {
    setError(err.message);
  }
};
```

**5. Route Configuration**

**App.tsx Routes**:
```typescript
{/* Standardized dashboard routes */}
<Route 
  path="/dashboard/visitor" 
  element={<VisitorDashboard />}
/>

<Route 
  path="/dashboard/citizen" 
  element={
    <RequireRole roles={['citizen', 'business', 'admin']}>
      <CitizenDashboard />
    </RequireRole>
  } 
/>

<Route 
  path="/dashboard/business" 
  element={
    <RequireRole roles={['business', 'admin']}>
      <BusinessDashboard />
    </RequireRole>
  } 
/>

<Route 
  path="/dashboard/admin" 
  element={
    <RequireRole roles={['admin']}>
      <AdminDashboard />
    </RequireRole>
  } 
/>
```

**6. Role Configuration Updates**

**Updated roles.json**:
```json
{
  "visitor": {
    "defaultLanding": "/dashboard/visitor",
    "permissions": { "canViewPublicContent": true }
  },
  "citizen": {
    "defaultLanding": "/dashboard/citizen",
    "permissions": { "canCreateContent": true, "canJoinRooms": true }
  },
  "business": {
    "defaultLanding": "/dashboard/business", 
    "permissions": { "canManageListings": true, "canViewAnalytics": true }
  },
  "admin": {
    "defaultLanding": "/dashboard/admin",
    "permissions": { "canManageUsers": true, "canAccessAdminPanel": true }
  }
}
```

### Testing Implementation

**Comprehensive Test Suite** (`src/tests/dashboard.routing.test.tsx`):

```typescript
describe('Dashboard Routing Tests', () => {
  describe('ProtectedRoute Component', () => {
    it('should render children when user is authenticated', () => {
      // Test authenticated access
    });
    
    it('should redirect to login when user is not authenticated', () => {
      // Test unauthenticated redirect
    });
  });
  
  describe('RoleGuard Component', () => {
    it('should render children when user has required role', () => {
      // Test authorized access
    });
    
    it('should show access denied when user lacks required role', () => {
      // Test unauthorized access
    });
  });
  
  describe('Role Helper Functions', () => {
    it('should correctly identify user roles', () => {
      // Test role identification functions
    });
  });
});
```

### Security Considerations

**Access Control Matrix**:
```
Dashboard Access Control:
┌─────────────┬─────────┬─────────┬──────────┬───────┐
│   Route     │ Visitor │ Citizen │ Business │ Admin │
├─────────────┼─────────┼─────────┼──────────┼───────┤
│ /dashboard/ │    ✅    │    ✅    │    ✅     │   ✅   │
│   visitor   │         │         │          │       │
├─────────────┼─────────┼─────────┼──────────┼───────┤
│ /dashboard/ │    ❌    │    ✅    │    ✅     │   ✅   │
│   citizen   │         │         │          │       │
├─────────────┼─────────┼─────────┼──────────┼───────┤
│ /dashboard/ │    ❌    │    ❌    │    ✅     │   ✅   │
│  business   │         │         │          │       │
├─────────────┼─────────┼─────────┼──────────┼───────┤
│ /dashboard/ │    ❌    │    ❌    │    ❌     │   ✅   │
│   admin     │         │         │          │       │
└─────────────┴─────────┴─────────┴──────────┴───────┘
```

**Security Features**:
- JWT-based role verification
- Client-side route protection with server-side validation
- Graceful error handling for unauthorized access
- Audit logging for access attempts
- Role hierarchy respect (higher roles inherit lower permissions)

### User Experience Flow

**Login Flow**:
1. User enters credentials
2. Authentication succeeds
3. System determines user role from JWT/profile
4. Dynamic redirect to role-specific dashboard
5. Dashboard renders with role-appropriate content

**Access Denied Flow**:
1. User attempts to access restricted route
2. RoleGuard checks permissions
3. Access denied page shows clear message
4. Options provided: Go back, Home, Contact support
5. Business users can see upgrade path

### Troubleshooting

**Common Issues**:

**Issue**: Login redirects to wrong dashboard
**Solution**: Check role configuration in `roles.json` and JWT claims

**Issue**: Access denied for valid user
**Solution**: Verify RLS policies and role synchronization

**Issue**: Infinite redirect loops
**Solution**: Check default landing pages and authentication states

**Issue**: Dashboard not rendering
**Solution**: Verify component imports and route protection setup

### Results Achieved

✅ **Standardized Routes**: All four dashboard routes implemented (`/dashboard/*`)  
✅ **Role-Based Access**: Proper authorization with graceful error handling  
✅ **Dynamic Redirection**: Smart login flow based on user roles  
✅ **Enhanced UX**: Role-specific content and navigation  
✅ **Security**: Multi-layer protection with audit capabilities  
✅ **Maintainability**: Clean component architecture and comprehensive tests  

---

## 9. Testing & Verification

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

## 7. Signup Hook & JWT Role Claim Mapping

### Problem Statement
**Error**: New users weren't automatically getting profile rows with roles, causing RLS and frontend role logic to fail.

**Exact Error Behavior**:
- Users could register but profiles table remained empty
- Role claims were missing from JWT tokens
- RLS policies failed due to null/missing role data
- Frontend role-based UI logic broke

### Solution

**Migration File**: `supabase/migrations/20251011_signup_hook_and_rpc.sql`

**Changes Implemented**:

1. **User Role Enum**: 
```sql
CREATE TYPE user_role AS ENUM ('visitor','citizen','business','admin');
```

2. **Profile Role Column**:
```sql
ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'citizen';
```

3. **Debug RPC Function**:
```sql
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT current_setting('jwt.claims.role', true);
$$ LANGUAGE sql STABLE;
```

4. **Secure RLS Policy Example**:
```sql
CREATE POLICY "profiles_select_owner_or_admin" ON public.profiles
  FOR SELECT USING (
    id::text = current_setting('jwt.claims.sub', true)
    OR current_setting('jwt.claims.role', true) = 'admin'
  );
```

**Edge Function**: `supabase/functions/onAuthSignup/index.ts`

Automatically creates profile rows when users sign up:
```typescript
const { error } = await supabase
  .from('profiles')
  .upsert({
    id: userId,
    email,
    full_name,
    role: 'citizen', // Default role - server-side only
    created_at: new Date().toISOString()
  }, { onConflict: 'id' });
```

### Deployment Steps

1. **Apply SQL Migration**:
```bash
psql "$DATABASE_URL" -f supabase/migrations/20251011_signup_hook_and_rpc.sql
# or
supabase db push
```

2. **Deploy Edge Function**:
```bash
supabase functions deploy onAuthSignup --no-verify-jwt
```

3. **Configure Auth Webhook**:
- Go to Supabase Dashboard → Authentication → Settings → Webhooks
- Add webhook URL: `https://[project-ref].functions.supabase.co/onAuthSignup`
- Select event: `user.created`

4. **Set Environment Variables**:
```bash
# For edge function
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### Testing

**Smoke Test Script**: `scripts/smoke_signup_and_role.sh`

```bash
export SUPABASE_URL="https://xyz.supabase.co"
export SUPABASE_ANON_KEY="public-anon-key"
export TEST_USER_EMAIL="smoke+$(date +%s)@example.com"
./scripts/smoke_signup_and_role.sh
```

**Expected Results**:
- New user signup creates profile row with `role='citizen'`
- `get_my_role()` RPC returns role claim from JWT
- RLS policies work correctly with role-based access

### Security Notes

⚠️ **CRITICAL**: 
- NEVER commit `SUPABASE_SERVICE_ROLE_KEY` to repository
- Edge function defaults all new users to `role='citizen'`
- Only server/admin actions can set elevated roles (`business`, `admin`)
- Validate webhook payloads in production (HMAC verification)

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

### Issue: Signup hook not triggering
**Solution**: Check webhook configuration and edge function logs:
```bash
supabase functions logs onAuthSignup
```

### Issue: Role claims missing from JWT
**Solution**: Verify `get_my_role()` returns expected value and check auth settings

---

## 9. Signup Hook & JWT Role Claim Mapping

### Problem Statement
**Error**: New users weren't automatically getting profile rows with roles, causing RLS and frontend role logic to fail.

**Exact Error Behavior**:
- Users could register but profiles table remained empty
- Role claims were missing from JWT tokens
- RLS policies failed due to null/missing role data
- Frontend role-based UI logic broke

### Solution

**Migration File**: `supabase/migrations/20251011_signup_hook_and_rpc.sql`

**Changes Implemented**:

1. **User Role Enum**: 
```sql
CREATE TYPE user_role AS ENUM ('visitor','citizen','business','admin');
```

2. **Profile Role Column**:
```sql
ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'citizen';
```

3. **Debug RPC Function**:
```sql
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT current_setting('jwt.claims.role', true);
$$ LANGUAGE sql STABLE;
```

4. **Secure RLS Policy Example**:
```sql
CREATE POLICY "profiles_select_owner_or_admin" ON public.profiles
  FOR SELECT USING (
    id::text = current_setting('jwt.claims.sub', true)
    OR current_setting('jwt.claims.role', true) = 'admin'
  );
```

**Edge Function**: `supabase/functions/onAuthSignup/index.ts`

Automatically creates profile rows when users sign up:
```typescript
const { error } = await supabase
  .from('profiles')
  .upsert({
    id: userId,
    email,
    full_name,
    role: 'citizen', // Default role - server-side only
    created_at: new Date().toISOString()
  }, { onConflict: 'id' });
```

### Deployment Steps

1. **Apply SQL Migration**:
```bash
psql "$DATABASE_URL" -f supabase/migrations/20251011_signup_hook_and_rpc.sql
# or
supabase db push
```

2. **Deploy Edge Function**:
```bash
supabase functions deploy onAuthSignup --no-verify-jwt
```

3. **Configure Auth Webhook**:
- Go to Supabase Dashboard → Authentication → Settings → Webhooks
- Add webhook URL: `https://[project-ref].functions.supabase.co/onAuthSignup`
- Select event: `user.created`

4. **Set Environment Variables**:
```bash
# For edge function
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### Testing

**Smoke Test Script**: `scripts/smoke_signup_and_role.sh`

```bash
export SUPABASE_URL="https://xyz.supabase.co"
export SUPABASE_ANON_KEY="public-anon-key" 
export TEST_USER_EMAIL="smoke+$(date +%s)@example.com"
./scripts/smoke_signup_and_role.sh
```

**Expected Results**:
- New user signup creates profile row with `role='citizen'`
- `get_my_role()` RPC returns role claim from JWT
- RLS policies work correctly with role-based access

### Security Notes

⚠️ **CRITICAL**: 
- NEVER commit `SUPABASE_SERVICE_ROLE_KEY` to repository
- Edge function defaults all new users to `role='citizen'`
- Only server/admin actions can set elevated roles (`business`, `admin`)
- Validate webhook payloads in production (HMAC verification)

### Troubleshooting Signup Issues

**Issue**: Signup hook not triggering
**Solution**: Check webhook configuration and edge function logs:
```bash
supabase functions logs onAuthSignup
```

**Issue**: Profile not created
**Solution**: Verify edge function has correct permissions and service role key

**Issue**: Role claims missing from JWT
**Solution**: Check JWT claims configuration and `get_my_role()` RPC

---

**Document Version**: 1.0  
**Last Updated**: October 11, 2025  
**Maintainer**: Limpopo Connect Development Team
