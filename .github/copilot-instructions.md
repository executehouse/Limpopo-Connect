# GitHub Copilot Instructions - Limpopo Connect

## Project Overview

**Limpopo Connect** is a React + TypeScript + Supabase social networking platform for the Limpopo Province community in South Africa. The application provides social features including user profiles, real-time chat rooms, news feed, business directory, events, marketplace, and tourism information.

**Status**: ✅ Production-ready with all critical security fixes implemented  
**Last Updated**: October 10, 2025

---

## Tech Stack

### Frontend
- **React 19** with TypeScript (strict mode)
- **Vite 7** - Development server with HMR
- **Tailwind CSS** - Utility-first styling with custom Limpopo theme
- **React Router v6** - Client-side routing
- **Lucide React** - Icon library
- **zxcvbn** - Password strength estimation (800KB library)


### Development Tools
- **ESLint 9** with TypeScript rules
- **PostCSS** with Tailwind
- **npm** - Package manager
- **Git** - Version control

---

## Architecture Principles

### 1. Security First
- **NEVER use `using(true)` in RLS policies** - Always use JWT-based authorization
- **Always check `auth.uid()`** for user-specific operations
- **Use EXISTS subqueries** for relationship-based access (e.g., room membership)
- **Implement audit logging** for sensitive operations (profile changes, room access)
- **Validate passwords** both client-side (zxcvbn) and server-side (SQL functions)

### 2. Type Safety
- Use TypeScript strict mode
- Define interfaces for all data models
- Use Supabase generated types where available
- Avoid `any` types - use `unknown` with type guards instead

### 3. Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   └── [feature]/      # Feature-specific components
├── pages/              # Route components
├── lib/                # Utilities, hooks, API clients
│   ├── supabase.ts    # Supabase client setup
│   ├── useAuth.ts     # Authentication hook
│   └── api.ts         # API helper functions
└── assets/             # Static assets
```

### 4. Data Flow
- Use React Context for global state (AuthProvider)
- Use custom hooks for data fetching (useAuth, useRooms)
- Implement optimistic updates where appropriate
- Handle loading and error states consistently

---

## Critical Implementation Details

### Authentication System

**Profile Interface** (src/lib/useAuth.ts):
```typescript
interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;  // ⚠️ Added in latest update
  is_public: boolean;          // ⚠️ Added in latest update
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  updated_at: string;
}
```

**Auth Context Usage**:
```typescript
import { useAuthContext } from '@/lib/AuthProvider';

const { user, profile, isAuthenticated, signOut } = useAuthContext();
```

**Protected Routes**:
- Always check `isAuthenticated` before rendering protected content
- Redirect to `/login` if not authenticated
- Use `Navigate` component for declarative redirects

### Database Security (RLS Policies)

**Profile Access** (20251010_fix_rls_profiles.sql):
```sql
-- ✅ CORRECT: JWT-based authorization
CREATE POLICY profiles_select_own
ON profiles FOR SELECT
USING (auth.uid() = id);

-- ❌ WRONG: Never use this
CREATE POLICY public_profiles_viewable
ON profiles FOR SELECT
USING (true);  -- INSECURE!
```

**Room Access** (20251010_fix_room_access.sql):
```sql
-- ✅ CORRECT: Membership-based access
CREATE POLICY rooms_select_by_membership
ON rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM room_members
    WHERE room_members.room_id = rooms.id
    AND room_members.user_id = auth.uid()
  )
);
```

### Password Validation

**Client-Side** (PasswordStrengthMeter.tsx):
```typescript
import zxcvbn from 'zxcvbn';

const result = zxcvbn(password);
// result.score: 0-4 (weak to strong)
// result.feedback: improvement suggestions
```

**Server-Side** (validate_password_strength function):
- Minimum 8 characters
- Requires: uppercase, lowercase, number, special character
- Blocks common passwords
- Checks password history

**Integration** (Register.tsx):
```typescript
import { PasswordStrengthMeter, usePasswordValidation } from '@/components/PasswordStrengthMeter';

const { isValid, score } = usePasswordValidation(password);
// Only allow registration if isValid === true
```

### Avatar Upload

**Implementation** (Profile.tsx):
```typescript
const uploadAvatar = async (file: File) => {
  // Validation
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be less than 5MB');
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .upload(`avatars/${fileName}`, file);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(`avatars/${fileName}`);

  return publicUrl;
};
```

### Vite Configuration

**Host Binding** (vite.config.ts):
```typescript
export default defineConfig({
  server: {
    host: true,  // ⚠️ REQUIRED: Binds to 0.0.0.0 for cloud IDEs
    port: Number(process.env.PORT) || 5173,
    strictPort: false,  // Allow fallback ports
    proxy: {
      // Proxy configuration for API calls if needed
    }
  }
});
```

---

## Coding Standards

### React Components

**Function Component Template**:
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export default function Component({ title, onAction }: ComponentProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Side effects
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Implementation
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-limpopo-green mb-6">
        {title}
      </h1>
      {/* Content */}
    </div>
  );
}
```

### Error Handling

**Pattern**:
```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) throw error;

  // Use data
} catch (error) {
  console.error('Operation failed:', error);
  setError(error instanceof Error ? error.message : 'An error occurred');
}
```

### Supabase Queries

**Always handle errors**:
```typescript
// ✅ CORRECT
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

if (error) {
  console.error('Error fetching profile:', error);
  throw error;
}

// ❌ WRONG - doesn't check for errors
const { data } = await supabase
  .from('profiles')
  .select('*');
```

---

## Database Schema

### Core Tables

**profiles**:
- `id` (uuid, PK, references auth.users)
- `email` (text, unique)
- `first_name`, `last_name` (text, nullable)
- `phone` (text, nullable)
- `avatar_url` (text, nullable)
- `is_public` (boolean, default false)
- `role` (text, default 'user')
- `created_at`, `updated_at` (timestamptz)

**rooms** (chat rooms):
- `id` (uuid, PK)
- `name` (text)
- `description` (text, nullable)
- `type` (text: 'public', 'private', 'dm')
- `created_by` (uuid, FK to profiles)
- `created_at`, `updated_at` (timestamptz)

**room_members**:
- `id` (uuid, PK)
- `room_id` (uuid, FK to rooms)
- `user_id` (uuid, FK to profiles)
- `role` (text: 'owner', 'admin', 'member')
- `joined_at` (timestamptz)

**messages**:
- `id` (uuid, PK)
- `room_id` (uuid, FK to rooms)
- `user_id` (uuid, FK to profiles)
- `content` (text)
- `created_at` (timestamptz)

### Audit Tables

**profile_audit_logs**:
- Tracks profile view/update operations
- Includes user_id, action, target_profile_id, timestamp

**room_access_audit**:
- Tracks room access attempts
- Includes user_id, room_id, action, timestamp, success

---

## Common Patterns

### Fetching Current User Profile

```typescript
import { useAuthContext } from '@/lib/AuthProvider';

const { user, profile, isAuthenticated } = useAuthContext();

if (!isAuthenticated || !profile) {
  return <Navigate to="/login" />;
}

// Use profile data
console.log(profile.first_name, profile.avatar_url);
```

### Creating a New Room

```typescript
const createRoom = async (name: string, description: string) => {
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({
      name,
      description,
      type: 'public',
      created_by: user.id
    })
    .select()
    .single();

  if (roomError) throw roomError;

  // Auto-add creator as owner
  const { error: memberError } = await supabase
    .from('room_members')
    .insert({
      room_id: room.id,
      user_id: user.id,
      role: 'owner'
    });

  if (memberError) throw memberError;

  return room;
};
```

### Uploading Files to Storage

```typescript
const uploadFile = async (file: File, bucket: string, path: string) => {
  // Validate
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large (max 5MB)');
  }

  // Upload
  const fileName = `${path}/${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) throw error;

  // Get URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
};
```

---

## Testing Guidelines

### SQL Tests

**Location**: `supabase/tests/`

**Pattern**:
```sql
-- Test: Description of what we're testing
BEGIN;
  -- Setup test data
  INSERT INTO profiles (id, email) VALUES ('test-uuid', 'test@example.com');

  -- Execute operation
  SELECT * FROM profiles WHERE id = 'test-uuid';

  -- Verify result
  -- Expected: Should return the profile

  -- Cleanup
  DELETE FROM profiles WHERE id = 'test-uuid';
ROLLBACK;
```

**Run tests**:
```bash
psql $DATABASE_URL -f supabase/tests/test-rls-profiles-fixed.sql
```

### Smoke Test

**Run comprehensive smoke test**:
```bash
./scripts/comprehensive-smoke-test.sh
```

This validates:
- ✅ Prerequisites (Node, npm, files)
- ✅ All 6 security fixes in place
- ✅ Migrations exist
- ✅ Components integrated
- ✅ Build and lint pass

---

## Deployment

### Environment Variables

**Required**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build Commands

```bash
# Development
npm run dev  # Starts on http://0.0.0.0:5173

# Production build
npm run build  # Output: dist/

# Preview production build
npm run preview
```

### Vercel Deployment

1. Connect GitHub repository
2. Set environment variables in Vercel Dashboard
3. Deploy: `vercel --prod`
4. Monitor: Vercel Dashboard → Logs

### Database Migrations

**Apply migrations**:
```bash
supabase db push
```

**Or manually in Supabase Dashboard → SQL Editor**:
1. `20251010_fix_rls_profiles.sql`
2. `20251010_fix_room_access.sql`
3. `20251010_add_password_validation.sql`

---

## Troubleshooting

### Common Issues

**1. "Invalid login credentials"**
```sql
-- Check if user exists
SELECT id, email FROM auth.users WHERE email = 'user@example.com';
```

**2. "Row-level security policy violation"**
```sql
-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check JWT claims
SELECT auth.uid();  -- Should return current user's UUID
```

**3. "Profile not found"**
```sql
-- Check profile record
SELECT * FROM profiles WHERE id = 'user-uuid';

-- Create if missing (should auto-create on registration)
INSERT INTO profiles (id, email)
VALUES ('user-uuid', 'email@example.com');
```

**4. "Can't upload avatar"**
```sql
-- Verify storage bucket
SELECT * FROM storage.buckets WHERE name = 'user-uploads';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'user-uploads';
```

### Debug Mode

**Enable detailed logging**:
```typescript
// In supabase.ts
export const supabase = createClient(url, key, {
  auth: {
    debug: true  // Enable auth debug logs
  }
});
```

---

## Documentation

### Complete Guide Index

Start here: **DOCUMENTATION_INDEX.md**

**For Quick Reference**:
- `QUICK_START.md` - 5-minute setup guide
- `EXECUTIVE_SUMMARY.md` - Project overview

**For Developers**:
- `IMPLEMENTATION_GUIDE.md` - Technical deep dive (700+ lines)
- `PROJECT_SUMMARY.md` - Architecture reference

**For QA**:
- `AUTHENTICATION_TEST_PLAN.md` - 50+ test cases
- `./scripts/comprehensive-smoke-test.sh` - Automated tests

**For DevOps**:
- `VERCEL_DEPLOYMENT.md` - Production deployment
- `SUPABASE_SETUP_GUIDE.md` - Database setup

**For Project Managers**:
- `PR_DELIVERABLES.md` - 6 PR templates
- `IMPLEMENTATION_COMPLETE.md` - Final report

---

## Security Checklist

When adding new features, always verify:

- [ ] RLS policies use `auth.uid()`, never `using(true)`
- [ ] Sensitive operations have audit logging
- [ ] File uploads are validated (type, size)
- [ ] Forms validate input (client + server)
- [ ] Errors don't leak sensitive information
- [ ] API calls handle errors gracefully
- [ ] TypeScript types are properly defined
- [ ] Tests cover new functionality

---

## Code Review Checklist

Before submitting PRs:

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Manual testing completed
- [ ] Documentation updated if needed
- [ ] Database migrations included if schema changed
- [ ] Environment variables documented
- [ ] Rollback procedure documented

---

## Recent Changes (October 2025)

✅ **All 6 Critical Fixes Implemented**:

1. **RLS Profile Exposure** - JWT-based authorization
2. **Unauthorized Room Access** - Membership validation
3. **Password Strength Gap** - Client + server validation
4. **Header Navigation Bug** - Auth-aware rendering
5. **Profile Page Missing** - Full CRUD implementation
6. **Vite Host Binding** - Cloud IDE compatibility

**Key Changes to Note**:
- Profile interface now includes `avatar_url` and `is_public` fields
- PasswordStrengthMeter component uses zxcvbn library
- Header component uses useAuthContext hook
- Vite config has `host: true` for 0.0.0.0 binding
- All using(true) RLS policies removed

---

## Contact & Resources

- **Repository**: https://github.com/Tshikwetamakole/Limpopo-Connect
- **Documentation**: See `DOCUMENTATION_INDEX.md`
- **Issue Template**: Use PR templates in `PR_DELIVERABLES.md`

---

**Last Updated**: October 10, 2025  
**Version**: 1.0 - Production Ready
