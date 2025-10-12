-- Migration: Fix RLS Profile Exposure
-- Date: 2025-10-10
-- Issue: Profile table had using (true) policy exposing all user data
-- Solution: Implement JWT-based authorization with proper visibility controls

-- Drop existing insecure policy
-- Remove insecure USING(true) policy if it exists
DROP POLICY IF EXISTS public_profiles_viewable ON public.profiles;

-- Create new secure policies for profiles

-- Policy 1: Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Admin users can view all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Policy 3: Users can view public profiles (opt-in visibility)
-- First, add a privacy column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
END $$;

CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT
  USING (is_public = true);

-- Existing insert and update policies remain secure (already using auth.uid())
-- They are already properly implemented in the init schema

-- Add avatar_url column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Create audit log table for profile changes
CREATE TABLE IF NOT EXISTS public.profile_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  old_data JSONB,
  new_data JSONB,
  actor_uid UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profile_audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs: users can view their own, admins can view all
CREATE POLICY "audit_select_own" ON public.profile_audit_logs
  FOR SELECT
  USING (
    actor_uid = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Audit trigger function for profiles
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
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.profile_audit_logs(profile_id, action, old_data, new_data, actor_uid)
    VALUES (NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.profile_audit_logs(profile_id, action, old_data, actor_uid)
    VALUES (OLD.id, 'delete', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
END;
$$;

-- Attach audit trigger to profiles table
DROP TRIGGER IF EXISTS trg_profile_audit ON public.profiles;
CREATE TRIGGER trg_profile_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_audit();

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_profile_audit_profile_id ON public.profile_audit_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_audit_actor ON public.profile_audit_logs(actor_uid);

-- Rollback SQL (to be run manually if needed):
-- DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
-- DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
-- DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
-- CREATE POLICY public_profiles_viewable ON public.profiles FOR SELECT USING (true);
-- DROP TRIGGER IF EXISTS trg_profile_audit ON public.profiles;
-- DROP FUNCTION IF EXISTS public.log_profile_audit();
-- DROP TABLE IF EXISTS public.profile_audit_logs;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_public;
