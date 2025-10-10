-- Update RLS Policies for Role-Based Access Control
-- This migration updates all RLS policies to use JWT role claims instead of using(true)

-- 1. Update profiles RLS policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Profiles select policy - own profile or admin can view all
CREATE POLICY "profiles_select_role_based" ON public.profiles
FOR SELECT USING (
    -- Own profile
    id = auth.uid() OR
    -- Admin can view all profiles
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
    -- Public profiles visible to authenticated users
    (is_public = true AND auth.uid() IS NOT NULL)
);

-- Profiles insert policy - only for authenticated users
CREATE POLICY "profiles_insert_authenticated" ON public.profiles
FOR INSERT WITH CHECK (
    -- Can only insert own profile
    id = auth.uid()
);

-- Profiles update policy - own profile or admin
CREATE POLICY "profiles_update_role_based" ON public.profiles
FOR UPDATE USING (
    -- Own profile
    id = auth.uid() OR
    -- Admin can update any profile
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 2. Update rooms RLS policies
DROP POLICY IF EXISTS "rooms_select_by_membership" ON public.rooms;
DROP POLICY IF EXISTS "rooms_insert_authenticated" ON public.rooms;
DROP POLICY IF EXISTS "rooms_update_owner_or_admin" ON public.rooms;

-- Rooms select policy - member or admin
CREATE POLICY "rooms_select_role_based" ON public.rooms
FOR SELECT USING (
    -- Public rooms visible to all authenticated users
    (type = 'public' AND auth.uid() IS NOT NULL) OR
    -- Room members can view
    EXISTS (
        SELECT 1 FROM room_members 
        WHERE room_members.room_id = rooms.id 
        AND room_members.user_id = auth.uid()
    ) OR
    -- Admin can view all rooms
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Rooms insert policy - authenticated users can create rooms
CREATE POLICY "rooms_insert_role_based" ON public.rooms
FOR INSERT WITH CHECK (
    -- Must be authenticated
    auth.uid() IS NOT NULL AND
    -- Creator becomes owner
    created_by = auth.uid()
);

-- Rooms update policy - owner or admin
CREATE POLICY "rooms_update_role_based" ON public.rooms
FOR UPDATE USING (
    -- Room owner can update
    created_by = auth.uid() OR
    -- Room admins can update
    EXISTS (
        SELECT 1 FROM room_members 
        WHERE room_members.room_id = rooms.id 
        AND room_members.user_id = auth.uid()
        AND room_members.role IN ('owner', 'admin')
    ) OR
    -- Platform admin can update any room
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. Update room_members RLS policies
DROP POLICY IF EXISTS "room_members_select_by_membership" ON public.room_members;
DROP POLICY IF EXISTS "room_members_insert_room_admin" ON public.room_members;
DROP POLICY IF EXISTS "room_members_update_room_admin" ON public.room_members;
DROP POLICY IF EXISTS "room_members_delete_room_admin" ON public.room_members;

-- Room members select policy
CREATE POLICY "room_members_select_role_based" ON public.room_members
FOR SELECT USING (
    -- Can view if you're a member of the room
    EXISTS (
        SELECT 1 FROM room_members rm 
        WHERE rm.room_id = room_members.room_id 
        AND rm.user_id = auth.uid()
    ) OR
    -- Admin can view all memberships
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Room members insert policy
CREATE POLICY "room_members_insert_role_based" ON public.room_members
FOR INSERT WITH CHECK (
    -- Room owners/admins can add members
    EXISTS (
        SELECT 1 FROM room_members rm 
        WHERE rm.room_id = room_members.room_id 
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'admin')
    ) OR
    -- Users can join public rooms
    EXISTS (
        SELECT 1 FROM rooms r 
        WHERE r.id = room_members.room_id 
        AND r.type = 'public'
        AND room_members.user_id = auth.uid()
    ) OR
    -- Platform admin can add anyone
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Room members update policy
CREATE POLICY "room_members_update_role_based" ON public.room_members
FOR UPDATE USING (
    -- Room owners can update any member
    EXISTS (
        SELECT 1 FROM room_members rm 
        WHERE rm.room_id = room_members.room_id 
        AND rm.user_id = auth.uid()
        AND rm.role = 'owner'
    ) OR
    -- Room admins can update non-owner members
    EXISTS (
        SELECT 1 FROM room_members rm 
        WHERE rm.room_id = room_members.room_id 
        AND rm.user_id = auth.uid()
        AND rm.role = 'admin'
        AND room_members.role != 'owner'
    ) OR
    -- Platform admin can update any membership
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Room members delete policy
CREATE POLICY "room_members_delete_role_based" ON public.room_members
FOR DELETE USING (
    -- Users can leave rooms (delete own membership)
    user_id = auth.uid() OR
    -- Room owners can remove any member
    EXISTS (
        SELECT 1 FROM room_members rm 
        WHERE rm.room_id = room_members.room_id 
        AND rm.user_id = auth.uid()
        AND rm.role = 'owner'
    ) OR
    -- Room admins can remove non-owner members
    EXISTS (
        SELECT 1 FROM room_members rm 
        WHERE rm.room_id = room_members.room_id 
        AND rm.user_id = auth.uid()
        AND rm.role = 'admin'
        AND room_members.role != 'owner'
    ) OR
    -- Platform admin can remove any membership
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Update messages RLS policies
DROP POLICY IF EXISTS "messages_select_by_room_membership" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_by_room_membership" ON public.messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_own_or_admin" ON public.messages;

-- Messages select policy
CREATE POLICY "messages_select_role_based" ON public.messages
FOR SELECT USING (
    -- Can view if you're a member of the room
    EXISTS (
        SELECT 1 FROM room_members 
        WHERE room_members.room_id = messages.room_id 
        AND room_members.user_id = auth.uid()
    ) OR
    -- Admin can view all messages
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Messages insert policy
CREATE POLICY "messages_insert_role_based" ON public.messages
FOR INSERT WITH CHECK (
    -- Must be a member of the room to send messages
    EXISTS (
        SELECT 1 FROM room_members 
        WHERE room_members.room_id = messages.room_id 
        AND room_members.user_id = auth.uid()
    ) AND
    -- Message sender must be the authenticated user
    user_id = auth.uid()
);

-- Messages update policy - users can edit their own messages
CREATE POLICY "messages_update_role_based" ON public.messages
FOR UPDATE USING (
    -- Own messages
    user_id = auth.uid() OR
    -- Admin can edit any message
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Messages delete policy
CREATE POLICY "messages_delete_role_based" ON public.messages
FOR DELETE USING (
    -- Own messages
    user_id = auth.uid() OR
    -- Room owners/admins can delete messages in their rooms
    EXISTS (
        SELECT 1 FROM room_members 
        WHERE room_members.room_id = messages.room_id 
        AND room_members.user_id = auth.uid()
        AND room_members.role IN ('owner', 'admin')
    ) OR
    -- Platform admin can delete any message
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. Create audit log policies for transparency
CREATE POLICY "profile_audit_logs_select_role_based" ON public.profile_audit_logs
FOR SELECT USING (
    -- Own audit logs
    user_id = auth.uid() OR
    -- Admin can view all audit logs
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "room_access_audit_select_role_based" ON public.room_access_audit
FOR SELECT USING (
    -- Own access logs
    user_id = auth.uid() OR
    -- Room owners can view room access logs
    EXISTS (
        SELECT 1 FROM room_members 
        WHERE room_members.room_id = room_access_audit.room_id 
        AND room_members.user_id = auth.uid()
        AND room_members.role = 'owner'
    ) OR
    -- Admin can view all access logs
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 6. Add comment for documentation
COMMENT ON POLICY "profiles_select_role_based" ON public.profiles IS 
    'Users can view own profile, public profiles, or admin can view all';
COMMENT ON POLICY "rooms_select_role_based" ON public.rooms IS 
    'Users can view public rooms, rooms they are members of, or admin can view all';
COMMENT ON POLICY "messages_select_role_based" ON public.messages IS 
    'Users can view messages in rooms they are members of, or admin can view all';

-- 7. Create helper function to check role permissions
CREATE OR REPLACE FUNCTION public.check_role_permission(
    required_role user_role,
    user_id_param uuid DEFAULT auth.uid()
)
RETURNS boolean AS $$
BEGIN
    -- Check if user has the required role or higher permissions
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id_param 
        AND (
            role = required_role OR
            (required_role = 'citizen' AND role IN ('business', 'admin')) OR
            (required_role = 'business' AND role = 'admin') OR
            (required_role = 'admin' AND role = 'admin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_role_permission IS 
    'Helper function to check if user has required role or higher permissions';