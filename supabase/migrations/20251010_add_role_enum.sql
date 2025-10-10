-- supabase/migrations/20251010_add_role_enum.sql
-- Purpose: Add role ENUM and ensure JWT claim mapping for role-based access control
-- Date: October 10, 2025

-- Create user_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('visitor', 'citizen', 'business', 'admin');
    END IF;
END $$;

-- Update profiles table to use ENUM and add is_public column if not exists
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE user_role USING role::user_role,
  ALTER COLUMN role SET DEFAULT 'citizen'::user_role;

-- Add is_public column if it doesn't exist (for privacy control)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_public boolean DEFAULT false;
    END IF;
END $$;

-- Update the handle_new_user function to properly handle role assignment and JWT claims
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_role_value text;
BEGIN
    -- Extract role from metadata, default to 'citizen' if not specified
    user_role_value := COALESCE(new.raw_user_meta_data->>'role', 'citizen');
    
    -- Validate role value
    IF user_role_value NOT IN ('visitor', 'citizen', 'business', 'admin') THEN
        user_role_value := 'citizen';
    END IF;

    -- Insert profile with proper role
    INSERT INTO public.profiles (id, email, first_name, last_name, phone, role, is_public)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'phone',
        user_role_value::user_role,
        COALESCE((new.raw_user_meta_data->>'is_public')::boolean, false)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        role = EXCLUDED.role,
        is_public = EXCLUDED.is_public,
        updated_at = now();

    -- Update user metadata to include role in app_metadata for JWT claims
    -- This will be picked up by Supabase Auth and included in JWT tokens
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', user_role_value)
    WHERE id = new.id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update JWT claims when role changes
CREATE OR REPLACE FUNCTION public.update_user_role_claims()
RETURNS trigger AS $$
BEGIN
    -- Update user metadata when role changes in profiles
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        UPDATE auth.users 
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object('role', NEW.role::text)
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
    EXECUTE FUNCTION public.update_user_role_claims();

-- Function to get current user's role from JWT claims
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::jsonb->>'role',
        'visitor'
    )::user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create business verification table for business role approval workflow
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

-- RLS policies for business verifications
CREATE POLICY business_verifications_select_own ON public.business_verifications
    FOR SELECT USING (user_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY business_verifications_insert_own ON public.business_verifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY business_verifications_update_own_or_admin ON public.business_verifications
    FOR UPDATE USING (
        user_id = auth.uid() 
        OR get_current_user_role() = 'admin'
    );

-- Create audit log for role changes
CREATE TABLE IF NOT EXISTS public.role_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_role user_role,
    new_role user_role NOT NULL,
    changed_by uuid REFERENCES auth.users(id),
    reason text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for role audit logs (admin only)
CREATE POLICY role_audit_logs_admin_only ON public.role_audit_logs
    FOR ALL USING (get_current_user_role() = 'admin');

-- Function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO public.role_audit_logs (user_id, old_role, new_role, changed_by)
        VALUES (NEW.id, OLD.role, NEW.role, auth.uid());
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

-- Add updated_at trigger for business_verifications
DROP TRIGGER IF EXISTS trg_business_verifications_updated_at ON public.business_verifications;
CREATE TRIGGER trg_business_verifications_updated_at 
    BEFORE UPDATE ON public.business_verifications
    FOR EACH ROW 
    EXECUTE FUNCTION public.tg_set_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_business_verifications_status ON public.business_verifications(status);
CREATE INDEX IF NOT EXISTS idx_business_verifications_user ON public.business_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_user ON public.role_audit_logs(user_id);

COMMENT ON TABLE public.business_verifications IS 'Business verification requests for users wanting business role';
COMMENT ON TABLE public.role_audit_logs IS 'Audit trail for role changes';
COMMENT ON FUNCTION public.get_current_user_role() IS 'Get current user role from JWT claims';