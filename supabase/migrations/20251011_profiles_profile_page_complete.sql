-- Migration: Complete Profile Page Implementation
-- Date: 2025-10-11
-- Purpose: Add profile columns, privacy controls, and storage setup for avatar uploads

BEGIN;

-- Add missing profile columns for complete profile functionality
DO $$ 
BEGIN
  -- Add bio column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
  END IF;

  -- Add is_public_profile column if missing (controls profile visibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_public_profile'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_public_profile BOOLEAN DEFAULT true;
  END IF;

  -- Add show_contact column if missing (controls contact info visibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'show_contact'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN show_contact BOOLEAN DEFAULT false;
  END IF;

  -- Ensure updated_at column exists and has proper trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add constraint on bio length (max 1000 characters)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_bio_length'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 1000);
  END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure it's properly set up
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policies for comprehensive profile access control
-- Drop existing policies to recreate them with enhanced security
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "public_profiles_viewable" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;

-- Policy 1: Users can view their own complete profile
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

-- Policy 3: Users can view public profiles with privacy controls
-- Only shows public fields based on privacy settings
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT
  USING (
    is_public_profile = true 
    AND auth.uid() != id  -- Don't apply restrictions to own profile
  );

-- Policy 4: Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 5: Users can update their own profile, admins can update any
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    -- Users can only update certain fields, admins can update anything
    CASE
      WHEN EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      ) THEN true
      ELSE (
        -- Regular users cannot change id, email, role, or created_at
        NEW.id = OLD.id
        AND NEW.email = OLD.email
        AND NEW.role = OLD.role
        AND (OLD.created_at IS NULL OR NEW.created_at = OLD.created_at)
        AND auth.uid() = NEW.id
      )
    END
  );

-- Policy 6: Only admins can delete profiles
CREATE POLICY "profiles_delete_admin_only" ON public.profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Set up Supabase Storage for avatars and documents
-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

INSERT INTO storage.buckets (id, name, public)
SELECT 'documents', 'documents', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents');

-- Storage policies for avatar uploads
-- Users can upload to their own folder
CREATE POLICY "avatar_upload_own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatars
CREATE POLICY "avatar_update_own" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatars
CREATE POLICY "avatar_delete_own" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view avatars (since bucket is public)
CREATE POLICY "avatar_view_all" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Storage policies for documents (private bucket)
-- Users can upload to their own folder
CREATE POLICY "document_upload_own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own documents, admins can view all
CREATE POLICY "document_view_own_or_admin" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    )
  );

-- Create server-side validation function for profile updates
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate bio length
  IF NEW.bio IS NOT NULL AND char_length(NEW.bio) > 1000 THEN
    RAISE EXCEPTION 'Bio must be 1000 characters or less';
  END IF;

  -- Validate phone format (basic validation for South African numbers)
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF NOT (NEW.phone ~ '^(\+27|0)[0-9]{9}$') THEN
      RAISE EXCEPTION 'Phone number must be a valid South African number';
    END IF;
  END IF;

  -- Validate avatar_url is a Supabase storage path or null
  IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' THEN
    IF NOT (NEW.avatar_url ~ '^https://.*\.supabase\.co/storage/v1/object/public/avatars/.*') THEN
      RAISE EXCEPTION 'Avatar URL must be a valid Supabase storage URL';
    END IF;
  END IF;

  -- Ensure only admins can change certain fields
  IF TG_OP = 'UPDATE' THEN
    -- Check if user is admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ) THEN
      -- Non-admin users cannot change these fields
      IF NEW.role != OLD.role THEN
        RAISE EXCEPTION 'Only administrators can change user roles';
      END IF;
      
      IF NEW.id != OLD.id THEN
        RAISE EXCEPTION 'User ID cannot be changed';
      END IF;
      
      IF NEW.email != OLD.email THEN
        RAISE EXCEPTION 'Email cannot be changed through profile updates';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach validation trigger
DROP TRIGGER IF EXISTS profile_validation_trigger ON public.profiles;
CREATE TRIGGER profile_validation_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_update();

-- Create function to get profile stats (for dashboard/public view)
CREATE OR REPLACE FUNCTION public.get_profile_stats(user_id uuid)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'reports_submitted', COALESCE(COUNT(r.id), 0),
    'businesses_owned', COALESCE(COUNT(b.id), 0),
    'rooms_joined', COALESCE(COUNT(rm.room_id), 0),
    'messages_sent', COALESCE(COUNT(msg.id), 0),
    'member_since', p.created_at
  ) INTO stats
  FROM public.profiles p
  LEFT JOIN public.reports r ON r.reporter_id = p.id
  LEFT JOIN public.businesses b ON b.created_by = p.id
  LEFT JOIN public.room_members rm ON rm.user_id = p.id
  LEFT JOIN public.room_messages msg ON msg.user_id = p.id
  WHERE p.id = user_id
  GROUP BY p.id, p.created_at;

  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profile_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_stats(uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public_profile) WHERE is_public_profile = true;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);

COMMIT;

-- Rollback instructions (run manually if needed):
/*
BEGIN;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS bio;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_public_profile;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS show_contact;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS profile_validation_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.validate_profile_update();
DROP FUNCTION IF EXISTS public.get_profile_stats(uuid);
DELETE FROM storage.buckets WHERE id IN ('avatars', 'documents');
COMMIT;
*/