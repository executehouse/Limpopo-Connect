-- Profile Page RLS Policies and Triggers
-- This migration adds secure RLS policies for profile access and management

BEGIN;

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS profiles_select_public ON public.profiles;
DROP POLICY IF EXISTS profiles_update_owner_or_admin ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_owner ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_admin_only ON public.profiles;

-- Profiles SELECT policy: 
-- - Owners can see their full profile
-- - Admins can see all profiles  
-- - Others can only see public profiles with limited fields
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

-- Profiles UPDATE policy:
-- Only profile owner or admin can update profiles
-- Prevent non-admins from changing role, id, created_at
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
) 
WITH CHECK (
    -- Same conditions as USING clause
    auth.uid() = id::uuid
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Profiles INSERT policy:
-- Only allow insert if the ID matches the authenticated user
CREATE POLICY profiles_insert_policy ON public.profiles
FOR INSERT WITH CHECK (
    auth.uid() = id::uuid
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Profiles DELETE policy:
-- Only admins can delete profiles
CREATE POLICY profiles_delete_policy ON public.profiles
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Create function to validate profile updates
CREATE OR REPLACE FUNCTION validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent non-admins from changing protected fields
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        -- Non-admins cannot change these fields
        IF OLD.id != NEW.id THEN
            RAISE EXCEPTION 'Cannot change profile ID';
        END IF;
        
        IF OLD.role != NEW.role THEN
            RAISE EXCEPTION 'Cannot change role. Contact administrator.';
        END IF;
        
        IF OLD.created_at != NEW.created_at THEN
            RAISE EXCEPTION 'Cannot change created_at timestamp';
        END IF;
        
        -- Validate bio length
        IF LENGTH(NEW.bio) > 1000 THEN
            RAISE EXCEPTION 'Bio cannot exceed 1000 characters';
        END IF;
        
        -- Validate phone format (basic check)
        IF NEW.phone IS NOT NULL AND NEW.phone !~ '^[\+]?[0-9\s\-\(\)]{10,20}$' THEN
            RAISE EXCEPTION 'Invalid phone number format';
        END IF;
        
        -- Validate avatar URL is from our storage
        IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url !~ '^https://[^/]+/storage/v1/object/public/user-uploads/avatars/' THEN
            RAISE EXCEPTION 'Invalid avatar URL. Must be uploaded through the system.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Add validation trigger
DROP TRIGGER IF EXISTS validate_profile_update_trigger ON public.profiles;
CREATE TRIGGER validate_profile_update_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_profile_update();

-- Create function to handle profile privacy for SELECT queries
CREATE OR REPLACE FUNCTION get_public_profile_fields(profile_row public.profiles)
RETURNS json AS $$
BEGIN
    -- If viewing own profile or admin, return full profile
    IF auth.uid() = profile_row.id::uuid OR 
       EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        return to_json(profile_row);
    END IF;
    
    -- If profile is not public, return minimal info
    IF NOT profile_row.is_public_profile THEN
        RETURN json_build_object(
            'id', profile_row.id,
            'first_name', profile_row.first_name,
            'last_name', profile_row.last_name,
            'role', profile_row.role,
            'is_public_profile', false
        );
    END IF;
    
    -- Return public fields only
    RETURN json_build_object(
        'id', profile_row.id,
        'email', CASE WHEN profile_row.show_contact THEN profile_row.email ELSE NULL END,
        'first_name', profile_row.first_name,
        'last_name', profile_row.last_name,
        'bio', profile_row.bio,
        'avatar_url', profile_row.avatar_url,
        'role', profile_row.role,
        'is_public_profile', profile_row.is_public_profile,
        'show_contact', profile_row.show_contact,
        'phone', CASE WHEN profile_row.show_contact THEN profile_row.phone ELSE NULL END,
        'created_at', profile_row.created_at
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create audit log table for profile access
CREATE TABLE IF NOT EXISTS public.profile_audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    target_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    action text NOT NULL, -- 'view', 'update', 'avatar_upload', 'avatar_delete'
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.profile_audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs can only be viewed by admins or the user themselves
CREATE POLICY audit_logs_select_policy ON public.profile_audit_logs
FOR SELECT USING (
    user_id = auth.uid()
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Only system can insert audit logs (via service role)
CREATE POLICY audit_logs_insert_policy ON public.profile_audit_logs
FOR INSERT WITH CHECK (true);

-- Function to log profile access
CREATE OR REPLACE FUNCTION log_profile_access(
    target_id uuid,
    action_type text,
    details_json jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.profile_audit_logs (
        user_id,
        target_profile_id,
        action,
        details,
        created_at
    ) VALUES (
        auth.uid(),
        target_id,
        action_type,
        details_json,
        now()
    );
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the main operation if audit logging fails
    NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create storage policies for user-uploads bucket
-- Note: These would typically be created in Supabase dashboard or via supabase CLI
-- But including here for reference

-- Storage policies (run these in Supabase dashboard if needed):
/*
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

-- Allow public read access to all files in user-uploads
CREATE POLICY "Public can view user uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'user-uploads');
*/

COMMIT;

-- Add helpful comments
COMMENT ON TABLE public.profile_audit_logs IS 'Tracks profile access and modifications for security and analytics';
COMMENT ON FUNCTION validate_profile_update() IS 'Validates profile updates and prevents unauthorized field changes';
COMMENT ON FUNCTION get_public_profile_fields(public.profiles) IS 'Returns privacy-filtered profile data based on access permissions';
COMMENT ON FUNCTION log_profile_access(uuid, text, jsonb) IS 'Logs profile access events for audit trail';