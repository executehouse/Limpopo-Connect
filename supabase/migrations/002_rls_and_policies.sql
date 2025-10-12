-- 002_rls_and_policies.sql
-- Enable RLS and create example policies

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "profiles_owner_only"
  ON public.profiles
  FOR ALL
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

-- Allow public select on certain safe fields for profiles (optional)
CREATE POLICY IF NOT EXISTS "profiles_public_select"
  ON public.profiles
  FOR SELECT
  USING ( true );

-- Listings: public read, owner modify
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "listings_public_read"
  ON public.listings
  FOR SELECT
  USING ( true );

CREATE POLICY IF NOT EXISTS "listings_owner_modify"
  ON public.listings
  FOR ALL
  USING ( auth.uid() = owner_id )
  WITH CHECK ( auth.uid() = owner_id );

-- Messages: only participants can access (example assumes a room membership table exists)
-- For now, restrict messages to sender only (adjust if you add rooms/memberships)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "messages_sender_only"
  ON public.messages
  FOR ALL
  USING ( auth.uid() = sender_id )
  WITH CHECK ( auth.uid() = sender_id );
