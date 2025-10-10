# Profile API Documentation

This document provides comprehensive information about the Profile API implementation in Limpopo Connect, including database schema, RLS policies, endpoints, and usage examples.

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [RLS Policies](#rls-policies)
- [API Endpoints](#api-endpoints)
- [Storage Configuration](#storage-configuration)
- [Privacy Controls](#privacy-controls)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Security Considerations](#security-considerations)

## Overview

The Profile system allows users to:
- View and edit their personal information
- Upload and manage avatar images
- Control privacy settings for profile visibility
- Access other users' profiles based on privacy settings
- Maintain audit logs for security and analytics

## Database Schema

### Profiles Table

```sql
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE NOT NULL,
    first_name text,
    last_name text,
    bio text,
    phone text,
    avatar_url text,
    role text NOT NULL DEFAULT 'citizen',
    is_public_profile boolean DEFAULT true,
    show_contact boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### Profile Audit Logs Table

```sql
CREATE TABLE public.profile_audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    target_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    action text NOT NULL, -- 'view', 'update', 'avatar_upload', 'avatar_delete'
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);
```

### Column Descriptions

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | uuid | Primary key, references auth.users | NOT NULL, FK |
| `email` | text | User email address | UNIQUE, NOT NULL |
| `first_name` | text | User's first name | Optional |
| `last_name` | text | User's last name | Optional |
| `bio` | text | User biography (max 1000 chars) | Optional |
| `phone` | text | Phone number | Optional, validated format |
| `avatar_url` | text | URL to user's avatar image | Optional, must be Supabase storage URL |
| `role` | text | User role (citizen/business/admin) | NOT NULL, protected |
| `is_public_profile` | boolean | Profile visibility flag | Default true |
| `show_contact` | boolean | Contact info visibility flag | Default false |
| `created_at` | timestamptz | Profile creation timestamp | Auto-generated |
| `updated_at` | timestamptz | Last update timestamp | Auto-updated |

## RLS Policies

### Select Policy: `profiles_select_policy`

```sql
CREATE POLICY profiles_select_policy ON public.profiles
FOR SELECT USING (
    -- Owner can see their own profile (full access)
    auth.uid() = id::uuid
    OR 
    -- Admin can see all profiles (full access)
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR
    -- Public can see limited fields of public profiles
    (is_public_profile = true)
);
```

**Access Rules:**
- **Profile Owner**: Full access to all fields
- **Admin Users**: Full access to all profiles
- **Other Users**: Limited access to public profiles only

### Update Policy: `profiles_update_policy`

```sql
CREATE POLICY profiles_update_policy ON public.profiles
FOR UPDATE USING (
    -- Profile owner can update (with restrictions)
    auth.uid() = id::uuid
    OR 
    -- Admin can update any profile (full access)
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);
```

**Update Restrictions:**
- **Non-Admin Users**: Cannot change `id`, `role`, `created_at`
- **All Users**: `bio` limited to 1000 characters
- **All Users**: `phone` must match valid format
- **All Users**: `avatar_url` must be from Supabase storage

### Insert Policy: `profiles_insert_policy`

```sql
CREATE POLICY profiles_insert_policy ON public.profiles
FOR INSERT WITH CHECK (
    auth.uid() = id::uuid
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);
```

### Delete Policy: `profiles_delete_policy`

```sql
CREATE POLICY profiles_delete_policy ON public.profiles
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);
```

**Note**: Only admin users can delete profiles.

## API Endpoints

### Get Profile

**Endpoint**: `GET /rest/v1/profiles?id=eq.{userId}`

**Headers**:
```
Authorization: Bearer {jwt_token}
apikey: {supabase_anon_key}
Content-Type: application/json
```

**Response** (Own Profile):
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Software developer from Limpopo",
  "phone": "+27123456789",
  "avatar_url": "https://project.supabase.co/storage/v1/object/public/user-uploads/avatars/user-123/avatar.jpg",
  "role": "citizen",
  "is_public_profile": true,
  "show_contact": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T12:30:00Z"
}
```

**Response** (Public Profile, Limited):
```json
{
  "id": "user-456",
  "first_name": "Jane",
  "last_name": "Smith",
  "bio": "Local business owner",
  "avatar_url": "https://project.supabase.co/storage/v1/object/public/user-uploads/avatars/user-456/avatar.jpg",
  "role": "business",
  "is_public_profile": true,
  "show_contact": false,
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Update Profile

**Endpoint**: `PATCH /rest/v1/profiles?id=eq.{userId}`

**Headers**:
```
Authorization: Bearer {jwt_token}
apikey: {supabase_anon_key}
Content-Type: application/json
Prefer: return=representation
```

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Updated bio text",
  "phone": "+27123456789",
  "is_public_profile": true,
  "show_contact": false
}
```

**Response**:
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Updated bio text",
  "phone": "+27123456789",
  "avatar_url": "https://project.supabase.co/storage/v1/object/public/user-uploads/avatars/user-123/avatar.jpg",
  "role": "citizen",
  "is_public_profile": true,
  "show_contact": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T12:35:00Z"
}
```

## Storage Configuration

### Bucket Setup

**Bucket Name**: `user-uploads`

**Folder Structure**:
```
user-uploads/
├── avatars/
│   └── {user-id}/
│       └── avatar-{timestamp}.{ext}
└── documents/
    └── {user-id}/
        └── {category}/
            └── {timestamp}-{filename}.{ext}
```

### Storage Policies

```sql
-- Allow authenticated users to upload to their own folders
CREATE POLICY "Users can upload to own folder" ON storage.objects
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow public read access to all files
CREATE POLICY "Public can view user uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'user-uploads');
```

### File Upload Process

1. **Client-side validation**:
   - File type: `image/jpeg`, `image/png`, `image/webp`
   - File size: Maximum 5MB
   - Image dimensions: Resized to max 1024x1024

2. **Upload to Supabase Storage**:
   ```javascript
   const { data, error } = await supabase.storage
     .from('user-uploads')
     .upload(`avatars/${userId}/avatar-${Date.now()}.jpg`, file, {
       cacheControl: '3600',
       upsert: false
     });
   ```

3. **Update profile with new URL**:
   ```javascript
   const { data: { publicUrl } } = supabase.storage
     .from('user-uploads')
     .getPublicUrl(filePath);
     
   await supabase
     .from('profiles')
     .update({ avatar_url: publicUrl })
     .eq('id', userId);
   ```

## Privacy Controls

### Profile Visibility (`is_public_profile`)

| Setting | Owner View | Other Users View | Admin View |
|---------|------------|------------------|------------|
| `true` | Full profile | Public fields only | Full profile |
| `false` | Full profile | Name and role only | Full profile |

### Contact Visibility (`show_contact`)

| Setting | Owner View | Other Users View | Admin View |
|---------|------------|------------------|------------|
| `true` | All contact info | Email and phone visible | All contact info |
| `false` | All contact info | Email and phone hidden | All contact info |

### Public Fields (Always Visible)

- `id`
- `first_name`
- `last_name`
- `role`
- `avatar_url`
- `bio`
- `is_public_profile`
- `created_at`

### Private Fields (Owner/Admin Only)

- `email` (unless `show_contact` is true)
- `phone` (unless `show_contact` is true)
- `updated_at`

## Error Handling

### Common Error Responses

**Unauthorized Access**:
```json
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy for table \"profiles\""
}
```

**Validation Errors**:
```json
{
  "code": "23514",
  "details": "Failing row contains (...)",
  "hint": null,
  "message": "Bio cannot exceed 1000 characters"
}
```

**Invalid Phone Format**:
```json
{
  "code": "23514",
  "details": "Failing row contains (...)",
  "hint": null,
  "message": "Invalid phone number format"
}
```

**Role Change Attempt**:
```json
{
  "code": "23514",
  "details": "Failing row contains (...)",
  "hint": null,
  "message": "Cannot change role. Contact administrator."
}
```

## Examples

### Frontend Integration

**Using the Profile Hooks**:

```typescript
import { useProfile, useProfileMutations } from '../lib/useProfile';
import { useAuthContext } from '../lib/useAuth';

function ProfilePage() {
  const { user } = useAuthContext();
  const { profile, loading, error } = useProfile(user?.id);
  const { updateProfile, uploadAvatar } = useProfileMutations();

  const handleSave = async (data) => {
    try {
      const updatedProfile = await updateProfile(data);
      console.log('Profile updated:', updatedProfile);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const result = await uploadAvatar(file);
      console.log('Avatar uploaded:', result.url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Profile display and edit components */}
    </div>
  );
}
```

### Direct API Calls

**Get Current User Profile**:
```javascript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

**Get Another User's Profile**:
```javascript
const { data: profile, error } = await supabase
  .from('profiles')
  .select(`
    id,
    first_name,
    last_name,
    bio,
    avatar_url,
    role,
    is_public_profile,
    created_at,
    email:show_contact,
    phone:show_contact
  `)
  .eq('id', userId)
  .single();
```

**Update Profile**:
```javascript
const { data: updatedProfile, error } = await supabase
  .from('profiles')
  .update({
    first_name: 'John',
    last_name: 'Doe',
    bio: 'Updated bio',
    is_public_profile: true,
    show_contact: false
  })
  .eq('id', user.id)
  .select()
  .single();
```

### cURL Examples

**Get Profile (with JWT)**:
```bash
curl -X GET 'https://your-project.supabase.co/rest/v1/profiles?id=eq.user-123' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY"
```

**Update Profile**:
```bash
curl -X PATCH 'https://your-project.supabase.co/rest/v1/profiles?id=eq.user-123' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "first_name": "John",
    "bio": "Updated bio text",
    "is_public_profile": true
  }'
```

## Security Considerations

### Data Protection

1. **RLS Enforcement**: All profile access is controlled by Row-Level Security policies
2. **JWT Validation**: All requests require valid JWT tokens
3. **Field Protection**: Critical fields (role, id) are protected from unauthorized changes
4. **Audit Logging**: All profile operations are logged for security monitoring

### Input Validation

1. **Client-side**: Form validation for user experience
2. **Database-side**: Trigger functions validate data integrity
3. **File Upload**: Size, type, and format validation
4. **Sanitization**: All text inputs are sanitized to prevent XSS

### Privacy Protection

1. **Granular Controls**: Users can control visibility of different data types
2. **Default Privacy**: Conservative defaults protect user privacy
3. **Admin Override**: Admins can access profiles for moderation purposes
4. **Audit Trail**: All access is logged for accountability

### Best Practices

1. **Use parameterized queries** to prevent SQL injection
2. **Validate JWT tokens** on every request
3. **Implement rate limiting** for file uploads
4. **Monitor audit logs** for suspicious activity
5. **Regular security reviews** of RLS policies
6. **Keep dependencies updated** for security patches

---

## Migration Commands

**Apply Profile Schema Migration**:
```bash
psql "$DATABASE_URL" -f supabase/migrations/20251010_profiles_profile_page.sql
```

**Apply RLS Policies**:
```bash
psql "$DATABASE_URL" -f supabase/migrations/20251010_profile_page_rls.sql
```

**Create Storage Bucket**:
```bash
supabase storage create user-uploads --public
```

**Test Profile Operations**:
```bash
./scripts/smoke_profile.sh
```

---

This documentation covers the complete Profile API implementation. For additional details or troubleshooting, refer to the implementation guide and test files.