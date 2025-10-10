-- migrations/20251011_signup_hook_and_rpc.sql
BEGIN;

-- 1) Ensure enum type exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM ('visitor','citizen','business','admin');
  END IF;
END$$;

-- 2) Ensure profiles.role column exists (id must match auth.uid)
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'citizen';

UPDATE public.profiles SET role = 'citizen' WHERE role IS NULL;

-- 3) Add a safe RPC for debugging role claim
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('jwt.claims.role', true);
$$;

-- 4) Example secure policy for profiles select (owner or admin)
-- Remove any using(true) policies in production and replace with this pattern.
DROP POLICY IF EXISTS "profiles_select_owner_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_owner_or_admin" ON public.profiles
  FOR SELECT
  USING (
    id::text = current_setting('jwt.claims.sub', true)
    OR current_setting('jwt.claims.role', true) = 'admin'
  );

COMMIT;