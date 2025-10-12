-- ============================================
-- LIMPOPO CONNECT - SUPABASE DATABASE SETUP
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- 1. CREATE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public_profile BOOLEAN DEFAULT true,
  show_contact BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('visitor', 'citizen', 'business', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;

-- Create secure RLS policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (is_public_profile = true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. CREATE AUTO-PROFILE FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'citizen');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGER FOR AUTO-PROFILE CREATION
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. CREATE STORAGE BUCKET FOR AVATARS
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 6. STORAGE POLICIES FOR AVATARS
-- ============================================
DROP POLICY IF EXISTS "avatars_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_view_all" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_view_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 7. UTILITY FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION public.get_profile_stats(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'reports_submitted', 0,
    'businesses_owned', 0,
    'rooms_joined', 0,
    'messages_sent', 0,
    'member_since', EXTRACT(EPOCH FROM created_at)
  )
  INTO result
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify setup worked:

-- Check if profiles table exists
SELECT 'profiles table created' AS status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles');

-- Check if RLS is enabled
SELECT 'RLS enabled on profiles' AS status
WHERE EXISTS (
  SELECT 1 FROM pg_tables 
  WHERE tablename = 'profiles' 
  AND rowsecurity = true
);

-- Check if storage bucket exists
SELECT 'avatars bucket created' AS status
WHERE EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

-- Show all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

NOTIFY pgsql, 'Limpopo Connect database setup completed successfully!';