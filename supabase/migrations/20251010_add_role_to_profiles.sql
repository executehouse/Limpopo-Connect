-- supabase/migrations/20251010_add_role_to_profiles.sql
-- Purpose: Add comprehensive role-based authentication system with JWT claim mapping
-- Date: October 10, 2025

-- Create user_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('visitor', 'citizen', 'business', 'admin');
    END IF;
END $$;

-- Update profiles table to use ENUM and add missing columns
DO $$
BEGIN
    -- Convert existing role column to ENUM type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role' AND data_type = 'text'
    ) THEN
        ALTER TABLE public.profiles 
          ALTER COLUMN role TYPE user_role USING role::user_role;
    END IF;

    -- Set default if not already set
    ALTER TABLE public.profiles 
      ALTER COLUMN role SET DEFAULT 'citizen'::user_role;

    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_public boolean DEFAULT false;
    END IF;

    -- Add avatar_url column if it doesn't exist  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
END $$;

-- Update existing profiles with null roles to 'citizen'
UPDATE public.profiles SET role = 'citizen'::user_role WHERE role IS NULL;

-- Enable JWT role claim mapping through authenticator role configuration
-- This ensures role is included in JWT tokens
ALTER ROLE authenticator SET jwt_claims.role = 'role';

-- Update the handle_new_user function for comprehensive role management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_role_value text;
    user_metadata jsonb;
BEGIN
    -- Get user metadata
    user_metadata := COALESCE(new.raw_user_meta_data, '{}'::jsonb);
    
    -- Extract role from metadata, default to 'citizen' if not specified
    user_role_value := COALESCE(user_metadata->>'role', 'citizen');
    
    -- Validate role value
    IF user_role_value NOT IN ('visitor', 'citizen', 'business', 'admin') THEN
        user_role_value := 'citizen';
    END IF;

    -- Insert or update profile with proper role and metadata
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        phone, 
        role, 
        is_public,
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        new.id,
        new.email,
        user_metadata->>'first_name',
        user_metadata->>'last_name',
        user_metadata->>'phone',
        user_role_value::user_role,
        COALESCE((user_metadata->>'is_public')::boolean, false),
        user_metadata->>'avatar_url',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        role = EXCLUDED.role,
        is_public = EXCLUDED.is_public,
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = now();

    -- Update user app_metadata to include role for JWT claims
    -- This ensures the role is available in JWT tokens
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'role', user_role_value,
            'user_id', new.id::text
        )
    WHERE id = new.id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to sync role changes to JWT claims
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS trigger AS $$
BEGIN
    -- Update user app_metadata when role changes in profiles
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        UPDATE auth.users 
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'role', NEW.role::text,
                'user_id', NEW.id::text,
                'updated_at', extract(epoch from now())
            )
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger to sync role changes to JWT claims
DROP TRIGGER IF EXISTS trg_sync_role_to_jwt ON public.profiles;
CREATE TRIGGER trg_sync_role_to_jwt
    AFTER UPDATE ON public.profiles
    FOR EACH ROW 
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION public.sync_role_to_jwt();

-- Function to get current user's role from JWT claims
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
DECLARE
    jwt_role text;
    profile_role user_role;
BEGIN
    -- Try to get role from JWT claims first
    BEGIN
        jwt_role := current_setting('request.jwt.claims', true)::jsonb->>'role';
    EXCEPTION WHEN OTHERS THEN
        jwt_role := NULL;
    END;
    
    -- If JWT role is available and valid, return it
    IF jwt_role IS NOT NULL AND jwt_role IN ('visitor', 'citizen', 'business', 'admin') THEN
        RETURN jwt_role::user_role;
    END IF;
    
    -- Fallback to profile table lookup
    IF auth.uid() IS NOT NULL THEN
        SELECT role INTO profile_role 
        FROM public.profiles 
        WHERE id = auth.uid();
        
        RETURN COALESCE(profile_role, 'visitor'::user_role);
    END IF;
    
    -- Default fallback
    RETURN 'visitor'::user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RPC function to get current user's role (for testing and frontend)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
BEGIN
    RETURN get_current_user_role()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user has specific role or higher
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS boolean AS $$
DECLARE
    user_role_level integer;
    required_role_level integer;
BEGIN
    -- Define role hierarchy levels
    user_role_level := CASE get_current_user_role()
        WHEN 'visitor' THEN 0
        WHEN 'citizen' THEN 1  
        WHEN 'business' THEN 2
        WHEN 'admin' THEN 3
        ELSE 0
    END;
    
    required_role_level := CASE required_role
        WHEN 'visitor' THEN 0
        WHEN 'citizen' THEN 1
        WHEN 'business' THEN 2  
        WHEN 'admin' THEN 3
        ELSE 0
    END;
    
    RETURN user_role_level >= required_role_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create comprehensive RLS policies using role-based access
-- Update profiles policies to include admin access
DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin ON public.profiles
    FOR SELECT USING (
        -- Users can see their own profile
        id = auth.uid()
        OR
        -- Admins can see all profiles
        get_current_user_role() = 'admin'
        OR  
        -- Public profiles are visible to authenticated users
        (is_public = true AND auth.uid() IS NOT NULL)
    );

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT WITH CHECK (
        -- Users can only insert their own profile
        id = auth.uid()
    );

DROP POLICY IF EXISTS profiles_update_own_or_admin ON public.profiles;  
CREATE POLICY profiles_update_own_or_admin ON public.profiles
    FOR UPDATE USING (
        -- Users can update their own profile
        id = auth.uid()
        OR
        -- Admins can update any profile
        get_current_user_role() = 'admin'
    );

-- Example business-specific RLS policy
DROP POLICY IF EXISTS businesses_manage_own ON public.businesses;
CREATE POLICY businesses_manage_own ON public.businesses
    FOR ALL USING (
        -- Business owners and admins can manage
        created_by = auth.uid()
        OR get_current_user_role() = 'admin'
        OR (
            -- Business role users can view all businesses
            tg_op = 'SELECT' AND has_role('business')
        )
    );

-- Create role change audit table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.role_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_role user_role,
    new_role user_role NOT NULL,
    changed_by uuid REFERENCES auth.users(id),
    reason text,
    ip_address text,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for role audit logs (admin only read, system write)
DROP POLICY IF EXISTS role_audit_logs_admin_read ON public.role_audit_logs;
CREATE POLICY role_audit_logs_admin_read ON public.role_audit_logs
    FOR SELECT USING (get_current_user_role() = 'admin');

-- Function to log role changes with audit trail
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger AS $$
DECLARE
    request_headers jsonb;
    client_ip text;
    user_agent text;
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        -- Extract request metadata for audit
        BEGIN
            request_headers := current_setting('request.headers', true)::jsonb;
            client_ip := request_headers->>'x-real-ip';
            user_agent := request_headers->>'user-agent';
        EXCEPTION WHEN OTHERS THEN
            client_ip := NULL;
            user_agent := NULL;
        END;
        
        -- Log the role change
        INSERT INTO public.role_audit_logs (
            user_id, 
            old_role, 
            new_role, 
            changed_by,
            ip_address,
            user_agent,
            reason
        )
        VALUES (
            NEW.id, 
            OLD.role, 
            NEW.role, 
            auth.uid(),
            client_ip,
            user_agent,
            CASE 
                WHEN auth.uid() = NEW.id THEN 'Self-updated'
                WHEN get_current_user_role() = 'admin' THEN 'Admin updated'
                ELSE 'System updated'
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger for role change logging
DROP TRIGGER IF EXISTS trg_log_role_changes ON public.profiles;
CREATE TRIGGER trg_log_role_changes
    AFTER UPDATE ON public.profiles
    FOR EACH ROW 
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION public.log_role_change();

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_user_created ON public.role_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_changed_by ON public.role_audit_logs(changed_by);

-- Add helpful comments
COMMENT ON TYPE user_role IS 'User role hierarchy: visitor < citizen < business < admin';
COMMENT ON FUNCTION public.get_current_user_role() IS 'Get current authenticated user role from JWT claims or profile';
COMMENT ON FUNCTION public.get_my_role() IS 'RPC endpoint to get current user role for frontend';
COMMENT ON FUNCTION public.has_role(user_role) IS 'Check if current user has specified role or higher in hierarchy';
COMMENT ON TABLE public.role_audit_logs IS 'Audit trail for all user role changes with metadata';

-- Grant necessary permissions
GRANT USAGE ON TYPE user_role TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(user_role) TO authenticated;

-- Migration completed successfully
SELECT 'Role-based authentication system migration completed' as status;