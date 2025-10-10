-- supabase/migrations/20251010_configure_jwt_claims.sql
-- Purpose: Configure Supabase JWT to include role claims for role-based access control
-- Date: October 10, 2025

-- Configure authenticator role to include role in JWT claims
-- This makes the role available via current_setting('request.jwt.claims', true)
ALTER ROLE authenticator SET jwt_claims.role = 'role';

-- Also set the user_id claim for convenience
ALTER ROLE authenticator SET jwt_claims.user_id = 'user_id';

-- Function to validate and refresh JWT claims
CREATE OR REPLACE FUNCTION public.refresh_jwt_claims(user_id uuid DEFAULT auth.uid())
RETURNS jsonb AS $$
DECLARE
    user_profile public.profiles%ROWTYPE;
    updated_metadata jsonb;
BEGIN
    -- Must be authenticated
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated' USING ERRCODE = '28000';
    END IF;
    
    -- Get current profile data
    SELECT * INTO user_profile 
    FROM public.profiles 
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found' USING ERRCODE = '28000';
    END IF;
    
    -- Build updated metadata with current role info
    updated_metadata := jsonb_build_object(
        'role', user_profile.role::text,
        'user_id', user_profile.id::text,
        'email', user_profile.email,
        'first_name', user_profile.first_name,
        'last_name', user_profile.last_name,
        'is_public', user_profile.is_public,
        'updated_at', extract(epoch from now())
    );
    
    -- Update the user's app metadata to ensure JWT claims are current
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || updated_metadata
    WHERE id = user_id;
    
    RETURN updated_metadata;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get JWT claims for debugging
CREATE OR REPLACE FUNCTION public.get_jwt_claims()
RETURNS jsonb AS $$
DECLARE
    claims jsonb;
BEGIN
    BEGIN
        claims := current_setting('request.jwt.claims', true)::jsonb;
    EXCEPTION WHEN OTHERS THEN
        claims := '{}'::jsonb;
    END;
    
    RETURN claims;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to validate role in JWT matches database
CREATE OR REPLACE FUNCTION public.validate_role_sync()
RETURNS TABLE(
    user_id uuid,
    profile_role text,
    jwt_role text,
    in_sync boolean,
    last_updated timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.role::text as profile_role,
        COALESCE((u.raw_app_meta_data->>'role'), 'null') as jwt_role,
        (p.role::text = COALESCE((u.raw_app_meta_data->>'role'), 'citizen')) as in_sync,
        p.updated_at as last_updated
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Administrative function to sync all user roles to JWT
CREATE OR REPLACE FUNCTION public.sync_all_roles_to_jwt()
RETURNS TABLE(
    user_id uuid,
    role text,
    synced boolean
) AS $$
DECLARE
    profile_record public.profiles%ROWTYPE;
    sync_count integer := 0;
BEGIN
    -- Must be admin to run this
    IF get_current_user_role() != 'admin' THEN
        RAISE EXCEPTION 'Only admins can sync all roles' USING ERRCODE = '42501';
    END IF;
    
    -- Loop through all profiles and sync to JWT
    FOR profile_record IN 
        SELECT * FROM public.profiles 
        ORDER BY updated_at DESC
    LOOP
        BEGIN
            UPDATE auth.users 
            SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
                jsonb_build_object(
                    'role', profile_record.role::text,
                    'user_id', profile_record.id::text,
                    'sync_updated_at', extract(epoch from now())
                )
            WHERE id = profile_record.id;
            
            sync_count := sync_count + 1;
            
            RETURN QUERY SELECT 
                profile_record.id as user_id,
                profile_record.role::text as role,
                true as synced;
                
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                profile_record.id as user_id,
                profile_record.role::text as role,
                false as synced;
        END;
    END LOOP;
    
    -- Log the sync operation
    RAISE NOTICE 'Synced % user roles to JWT', sync_count;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for easy role monitoring
CREATE OR REPLACE VIEW public.user_roles_summary AS
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.is_public,
    COALESCE((u.raw_app_meta_data->>'role'), 'not_set') as jwt_role,
    (p.role::text = COALESCE((u.raw_app_meta_data->>'role'), 'citizen')) as role_sync_status,
    p.created_at,
    p.updated_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.updated_at DESC;

-- Grant permissions
GRANT SELECT ON public.user_roles_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_jwt_claims() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_jwt_claims(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_role_sync() TO authenticated;

-- Admin-only functions
GRANT EXECUTE ON FUNCTION public.sync_all_roles_to_jwt() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.refresh_jwt_claims(uuid) IS 'Refresh JWT claims for a user to ensure role synchronization';
COMMENT ON FUNCTION public.get_jwt_claims() IS 'Get current JWT claims for debugging (shows what is in the token)';
COMMENT ON FUNCTION public.validate_role_sync() IS 'Check if user roles in profiles match JWT app_metadata';
COMMENT ON FUNCTION public.sync_all_roles_to_jwt() IS 'Admin function to sync all user roles to JWT claims';
COMMENT ON VIEW public.user_roles_summary IS 'Summary view of user roles and JWT sync status';

SELECT 'JWT claims configuration completed' as status;