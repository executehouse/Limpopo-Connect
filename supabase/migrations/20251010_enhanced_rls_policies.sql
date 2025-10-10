-- supabase/migrations/20251010_enhanced_rls_policies.sql
-- Purpose: Enhanced RLS policies for role-based access control across all tables
-- Date: October 10, 2025

-- Update existing profiles policies to be more comprehensive
-- (The main profile policies are already created in add_role_to_profiles.sql, 
--  this adds supplementary policies for specific use cases)

-- Enhanced room policies with role-based access
DROP POLICY IF EXISTS rooms_admin_full_access ON public.rooms;
CREATE POLICY rooms_admin_full_access ON public.rooms
    FOR ALL USING (get_current_user_role() = 'admin');

-- Business users can create and manage rooms for their business purposes  
DROP POLICY IF EXISTS rooms_business_enhanced ON public.rooms;
CREATE POLICY rooms_business_enhanced ON public.rooms
    FOR ALL USING (
        -- Business users can create/manage rooms
        (created_by = auth.uid() AND has_role('business'))
        OR
        -- Members can view/participate in rooms they belong to
        EXISTS (
            SELECT 1 FROM public.room_members rm 
            WHERE rm.room_id = rooms.id AND rm.user_id = auth.uid()
        )
        OR
        -- Admins have full access (covered by admin policy above)
        get_current_user_role() = 'admin'
    );

-- Enhanced room members policies
DROP POLICY IF EXISTS room_members_admin_manage ON public.room_members;
CREATE POLICY room_members_admin_manage ON public.room_members
    FOR ALL USING (
        -- Admins can manage all memberships
        get_current_user_role() = 'admin'
        OR
        -- Room creators can manage memberships
        EXISTS (
            SELECT 1 FROM public.rooms r 
            WHERE r.id = room_id AND r.created_by = auth.uid()
        )
        OR
        -- Users can view memberships of rooms they're in and manage their own
        (user_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.room_members rm 
            WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid()
        ))
    );

-- Enhanced messages policies with role consideration
DROP POLICY IF EXISTS messages_role_based_access ON public.room_messages;
CREATE POLICY messages_role_based_access ON public.room_messages
    FOR SELECT USING (
        -- Message author can always see their messages
        user_id = auth.uid()
        OR
        -- Room members can see messages in their rooms
        EXISTS (
            SELECT 1 FROM public.room_members rm 
            WHERE rm.room_id = room_messages.room_id AND rm.user_id = auth.uid()
        )
        OR
        -- Admins can see all messages for moderation
        get_current_user_role() = 'admin'
    );

-- Enhanced business directory policies
DROP POLICY IF EXISTS businesses_role_enhanced_access ON public.businesses;
CREATE POLICY businesses_role_enhanced_access ON public.businesses
    FOR SELECT USING (
        -- Everyone can view verified businesses
        verified = true
        OR
        -- Business owners can see their own listings (verified or not)
        created_by = auth.uid()
        OR
        -- Business role users can see all businesses for networking
        has_role('business')
        OR
        -- Admins can see all businesses
        get_current_user_role() = 'admin'
    );

DROP POLICY IF EXISTS businesses_manage_own_or_admin ON public.businesses;
CREATE POLICY businesses_manage_own_or_admin ON public.businesses
    FOR ALL USING (
        -- Business owners can manage their own listings
        created_by = auth.uid()
        OR
        -- Admins can manage all businesses
        get_current_user_role() = 'admin'
    )
    WITH CHECK (
        -- Only business role users can create new businesses
        (TG_OP = 'INSERT' AND has_role('business') AND created_by = auth.uid())
        OR
        -- Updates/deletes follow the USING clause
        (TG_OP IN ('UPDATE', 'DELETE'))
    );

-- Create comprehensive reports table policies  
DROP POLICY IF EXISTS reports_submit_authenticated ON public.reports;
CREATE POLICY reports_submit_authenticated ON public.reports
    FOR INSERT WITH CHECK (
        -- Any authenticated user can submit reports
        reporter_id = auth.uid()
        AND auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS reports_view_own_or_admin ON public.reports;
CREATE POLICY reports_view_own_or_admin ON public.reports
    FOR SELECT USING (
        -- Users can see their own reports
        reporter_id = auth.uid()
        OR
        -- Admins can see all reports for moderation
        get_current_user_role() = 'admin'
    );

DROP POLICY IF EXISTS reports_admin_manage ON public.reports;
CREATE POLICY reports_admin_manage ON public.reports
    FOR UPDATE USING (get_current_user_role() = 'admin');

-- Storage policies with role-based access
DROP POLICY IF EXISTS storage_avatars_public_read ON storage.objects;
CREATE POLICY storage_avatars_public_read ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-uploads'
        AND (
            -- Avatar images in avatars folder are publicly readable
            (split_part(name, '/', 2) = 'avatars')
            OR
            -- Users can always read their own files
            (split_part(name, '/', 1) = auth.uid()::text)
            OR
            -- Admins can read any user upload
            get_current_user_role() = 'admin'
        )
    );

DROP POLICY IF EXISTS storage_business_docs_restricted ON storage.objects;
CREATE POLICY storage_business_docs_restricted ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-uploads'
        AND split_part(name, '/', 2) = 'business-docs'
        AND (
            -- Business owners can read their docs
            split_part(name, '/', 1) = auth.uid()::text
            OR
            -- Admins can read business verification docs
            get_current_user_role() = 'admin'
        )
    );

-- Create audit policies for role changes
DROP POLICY IF EXISTS role_audit_comprehensive_access ON public.role_audit_logs;
CREATE POLICY role_audit_comprehensive_access ON public.role_audit_logs
    FOR SELECT USING (
        -- Admins can see all role audit logs
        get_current_user_role() = 'admin'
        OR
        -- Users can see changes to their own role
        user_id = auth.uid()
    );

-- Business verification policies
CREATE TABLE IF NOT EXISTS public.business_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name text NOT NULL,
    business_registration_number text,
    business_address text,
    business_phone text,
    business_email text,
    verification_documents text[], -- Array of file URLs
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id uuid REFERENCES auth.users(id),
    reviewer_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.business_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_verifications_comprehensive_access ON public.business_verifications;
CREATE POLICY business_verifications_comprehensive_access ON public.business_verifications
    FOR SELECT USING (
        -- Users can see their own verification requests
        user_id = auth.uid()
        OR
        -- Admins can see all verification requests
        get_current_user_role() = 'admin'
    );

DROP POLICY IF EXISTS business_verifications_submit_citizen ON public.business_verifications;
CREATE POLICY business_verifications_submit_citizen ON public.business_verifications
    FOR INSERT WITH CHECK (
        -- Only citizens can request business verification
        user_id = auth.uid()
        AND has_role('citizen')
    );

DROP POLICY IF EXISTS business_verifications_admin_manage ON public.business_verifications;
CREATE POLICY business_verifications_admin_manage ON public.business_verifications
    FOR UPDATE USING (
        get_current_user_role() = 'admin'
    );

-- Function to handle business verification approval
CREATE OR REPLACE FUNCTION public.approve_business_verification(
    verification_id uuid,
    reviewer_notes text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    verification_user_id uuid;
    verification_exists boolean;
BEGIN
    -- Must be admin to approve
    IF get_current_user_role() != 'admin' THEN
        RAISE EXCEPTION 'Only admins can approve business verifications' USING ERRCODE = '42501';
    END IF;
    
    -- Get the verification and check it exists
    SELECT user_id INTO verification_user_id
    FROM public.business_verifications
    WHERE id = verification_id AND status = 'pending';
    
    verification_exists := FOUND;
    
    IF NOT verification_exists THEN
        RAISE EXCEPTION 'Verification request not found or already processed';
    END IF;
    
    -- Update verification status
    UPDATE public.business_verifications
    SET 
        status = 'approved',
        reviewer_id = auth.uid(),
        reviewer_notes = approve_business_verification.reviewer_notes,
        updated_at = now()
    WHERE id = verification_id;
    
    -- Update user role to business
    UPDATE public.profiles
    SET 
        role = 'business'::user_role,
        updated_at = now()
    WHERE id = verification_user_id;
    
    -- The trigger will automatically sync the role to JWT
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject business verification
CREATE OR REPLACE FUNCTION public.reject_business_verification(
    verification_id uuid,
    reviewer_notes text
)
RETURNS boolean AS $$
BEGIN
    -- Must be admin to reject
    IF get_current_user_role() != 'admin' THEN
        RAISE EXCEPTION 'Only admins can reject business verifications' USING ERRCODE = '42501';
    END IF;
    
    -- Update verification status
    UPDATE public.business_verifications
    SET 
        status = 'rejected',
        reviewer_id = auth.uid(),
        reviewer_notes = reject_business_verification.reviewer_notes,
        updated_at = now()
    WHERE id = verification_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Verification request not found or already processed';
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_verifications_status_created ON public.business_verifications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_verifications_reviewer ON public.business_verifications(reviewer_id);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.approve_business_verification(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_business_verification(uuid, text) TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.approve_business_verification(uuid, text) IS 'Admin function to approve business verification and upgrade user role';
COMMENT ON FUNCTION public.reject_business_verification(uuid, text) IS 'Admin function to reject business verification with notes';
COMMENT ON TABLE public.business_verifications IS 'Business role verification requests with admin approval workflow';

SELECT 'Enhanced RLS policies created successfully' as status;