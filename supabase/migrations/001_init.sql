-- 001_init.sql
-- Base schema for Limpopo Connect

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table linked to auth.users (id = auth.uid())
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  role text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Listings table (public posts / listings)
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  location text,
  metadata jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages (private chat messages)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  body text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON public.listings USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Full text search column and trigger
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS document tsvector;
CREATE FUNCTION public.listings_tsv_trigger() RETURNS trigger AS $$
begin
  new.document := to_tsvector('english', coalesce(new.title,'') || ' ' || coalesce(new.description,''));
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON public.listings;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.listings_tsv_trigger();

CREATE INDEX IF NOT EXISTS idx_listings_document ON public.listings USING GIN(document);
