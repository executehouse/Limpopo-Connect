# Schema Map (Local)

Generated: 2025-10-10 (Updated with Role System)

## Custom Types

**user_role ENUM**:
- `'visitor'` - Unregistered/guest users (level 0)
- `'citizen'` - Registered community members (level 1) 
- `'business'` - Verified business users (level 2)
- `'admin'` - Platform administrators (level 3)

Role hierarchy: visitor < citizen < business < admin

## Core Tables and Relations

**Authentication & Profiles**:
- `auth.users` (Supabase managed)
- `public.profiles` [id PK -> auth.users.id]
  - Added: `role user_role DEFAULT 'citizen'`
  - Added: `is_public boolean DEFAULT false`
  - Added: `avatar_url text`

**Role Management**:
- `public.business_verifications` [id PK, user_id -> auth.users.id UNIQUE]
  - Handles citizen → business role upgrade workflow
  - Status: 'pending' | 'approved' | 'rejected'
  - Reviewer tracking and notes
- `public.role_audit_logs` [id PK, user_id -> auth.users.id]
  - Complete audit trail for all role changes
  - Tracks old_role, new_role, changed_by, IP, user_agent
  - Immutable log for compliance

**Chat & Communication**:
- `public.rooms` [id PK]
- `public.room_members` [room_id -> rooms.id, user_id -> auth.users.id, PK(room_id,user_id)]
- `public.message_threads` [id PK, room_id -> rooms.id, created_by -> auth.users.id]
- `public.room_messages` [id PK, thread_id -> message_threads.id, room_id -> rooms.id, user_id -> auth.users.id]
- `public.room_messages_audit` [id serial PK, message_id -> room_messages.id]
- `public.summary_jobs` [id serial PK, thread_id -> message_threads.id]
- `public.thread_summaries` [id uuid PK, thread_id UNIQUE -> message_threads.id]

**Business & Community**:
- `public.businesses` [id uuid PK, created_by -> auth.users.id]
- `public.reports` [id uuid PK, reporter_id -> auth.users.id]

## Indexes

**Performance Indexes**:
- `room_members(room_id,user_id)`, `room_members(user_id)`
- `message_threads(room_id)`, `message_threads(room_id,last_activity_at)`
- `room_messages(thread_id,created_at)`, `room_messages(room_id,created_at)`, `room_messages(user_id)`
- `room_messages_audit(message_id)`
- `summary_jobs(status,next_run_at)`

**Role System Indexes**:
- `profiles(role)` - Fast role-based queries
- `profiles(is_public)` WHERE is_public = true - Public profile discovery
- `business_verifications(status, created_at DESC)` - Admin workflow
- `business_verifications(reviewer_id)` - Review tracking
- `role_audit_logs(user_id, created_at DESC)` - User role history
- `role_audit_logs(changed_by)` - Admin audit trail

## Enhanced RLS Policies

**Profile Access (Role-Aware)**:
- `profiles_select_own_or_admin`: Users see own profile + public profiles + admin sees all
- `profiles_update_own_or_admin`: Users update own + admin updates any
- JWT-based authorization using `auth.uid()` and `get_current_user_role()`

**Business Directory (Role-Based)**:
- `businesses_role_enhanced_access`: Verified businesses public + business role networking + admin access
- `businesses_manage_own_or_admin`: Own listings + admin management

**Room Access (Membership + Role)**:
- `rooms_admin_full_access`: Admin can access all rooms
- `rooms_business_enhanced`: Business users enhanced room management
- Room membership validation with role hierarchy

**Audit & Verification**:
- `business_verifications_comprehensive_access`: Own requests + admin view all
- `business_verifications_admin_manage`: Only admins can approve/reject
- `role_audit_logs_admin_read`: Own role changes + admin sees all

## JWT Claims Configuration

**Authenticator Role Settings**:
```sql
ALTER ROLE authenticator SET jwt_claims.role = 'role';
ALTER ROLE authenticator SET jwt_claims.user_id = 'user_id';
```

**Claims Structure**:
```json
{
  "role": "citizen",
  "user_id": "uuid",
  "sub": "uuid", 
  "email": "user@example.com",
  "aud": "authenticated",
  "exp": 1234567890
}
```

## Key Functions

**Role Management**:
- `get_current_user_role()` → user_role - JWT + profile lookup
- `get_my_role()` → text - RPC endpoint for frontend
- `has_role(required_role)` → boolean - Hierarchy check
- `refresh_jwt_claims(user_id)` → jsonb - Sync role to JWT

**Business Verification**:
- `approve_business_verification(verification_id, notes)` → boolean
- `reject_business_verification(verification_id, notes)` → boolean
- `sync_all_roles_to_jwt()` → table - Admin batch sync

**Validation & Debugging**:
- `validate_role_sync()` → table - Check JWT vs profile consistency
- `get_jwt_claims()` → jsonb - Debug current token claims

## Triggers

**Automatic Profile Creation**:
- `handle_new_user()` - Creates profile with role on auth.users insert
- Supports role metadata: `{ "role": "citizen" }`

**Role Synchronization**:
- `sync_role_to_jwt()` - Updates auth.users app_metadata when profile role changes
- `log_role_change()` - Creates audit log entry for all role changes

**Timestamp Management**:
- `tg_set_updated_at()` - Auto-updates timestamps on profile changes

Realtime topics:
- room:{room_id}:messages — triggered on insert/update/delete of room_messages via tg_broadcast_room_message.
