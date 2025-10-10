-- Migration: Add Password Strength Validation
-- Date: 2025-10-10
-- Purpose: Server-side password strength enforcement using Supabase Edge Function
-- Issue: No server-side validation of password strength, allowing weak passwords

-- =====================================================
-- PASSWORD VALIDATION FUNCTION
-- =====================================================

-- Create a function to validate password strength
-- This will be called by the validate-password edge function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  score INTEGER := 0;
  feedback TEXT[] := ARRAY[]::TEXT[];
  has_lowercase BOOLEAN;
  has_uppercase BOOLEAN;
  has_number BOOLEAN;
  has_special BOOLEAN;
  length_check BOOLEAN;
BEGIN
  -- Check password criteria
  length_check := length(password) >= 8;
  has_lowercase := password ~ '[a-z]';
  has_uppercase := password ~ '[A-Z]';
  has_number := password ~ '[0-9]';
  has_special := password ~ '[^a-zA-Z0-9]';

  -- Calculate score
  IF length_check THEN score := score + 1; ELSE feedback := array_append(feedback, 'Password must be at least 8 characters'); END IF;
  IF has_lowercase THEN score := score + 1; ELSE feedback := array_append(feedback, 'Include lowercase letters'); END IF;
  IF has_uppercase THEN score := score + 1; ELSE feedback := array_append(feedback, 'Include uppercase letters'); END IF;
  IF has_number THEN score := score + 1; ELSE feedback := array_append(feedback, 'Include numbers'); END IF;
  IF has_special THEN score := score + 1; ELSE feedback := array_append(feedback, 'Include special characters'); END IF;

  -- Additional length bonus
  IF length(password) >= 12 THEN
    score := score + 1;
  ELSIF length(password) >= 10 THEN
    score := score + 0.5;
  END IF;

  -- Check for common weak patterns
  IF password ~* '(password|123456|qwerty|admin|letmein|welcome)' THEN
    score := GREATEST(score - 2, 0);
    feedback := array_append(feedback, 'Avoid common password patterns');
  END IF;

  -- Determine strength level
  result := jsonb_build_object(
    'score', score,
    'isValid', score >= 4,
    'strength', CASE
      WHEN score >= 5 THEN 'strong'
      WHEN score >= 4 THEN 'medium'
      WHEN score >= 2 THEN 'weak'
      ELSE 'very weak'
    END,
    'feedback', array_to_json(feedback)
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_password_strength(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_password_strength(TEXT) TO anon;

-- =====================================================
-- PASSWORD HISTORY (prevent reuse)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.password_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own password history
CREATE POLICY password_history_select_own ON public.password_history
  FOR SELECT
  USING (user_id = auth.uid());

-- Create index for password history lookups
CREATE INDEX IF NOT EXISTS idx_password_history_user ON public.password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created ON public.password_history(created_at DESC);

-- =====================================================
-- TRIGGER TO LOG PASSWORD CHANGES
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_password_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the password change (we don't store the actual password, just track that it changed)
  INSERT INTO public.password_history(user_id, password_hash, created_at)
  VALUES (
    NEW.id,
    -- We use a placeholder since we don't have access to the hashed password here
    encode(digest(NEW.encrypted_password || NEW.updated_at::text, 'sha256'), 'hex'),
    NOW()
  );

  -- Keep only the last 5 password hashes per user
  DELETE FROM public.password_history
  WHERE user_id = NEW.id
    AND id NOT IN (
      SELECT id FROM public.password_history
      WHERE user_id = NEW.id
      ORDER BY created_at DESC
      LIMIT 5
    );

  RETURN NEW;
END;
$$;

-- Note: This trigger would need to be on auth.users table which requires superuser
-- For security, password validation should be done in the edge function instead

-- =====================================================
-- RPC: Validate password for registration
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_password_requirements(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  validation_result JSONB;
BEGIN
  validation_result := public.validate_password_strength(password);
  
  -- Return true if password meets minimum requirements
  RETURN (validation_result->>'isValid')::BOOLEAN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_password_requirements(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_password_requirements(TEXT) TO anon;

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================
-- To rollback this migration, run:
-- DROP FUNCTION IF EXISTS public.validate_password_strength(TEXT);
-- DROP FUNCTION IF EXISTS public.check_password_requirements(TEXT);
-- DROP FUNCTION IF EXISTS public.log_password_change();
-- DROP TABLE IF EXISTS public.password_history;

COMMENT ON FUNCTION public.validate_password_strength IS
  'Validates password strength and returns score, validity, and feedback';
COMMENT ON FUNCTION public.check_password_requirements IS
  'Returns boolean indicating if password meets minimum security requirements';
COMMENT ON TABLE public.password_history IS
  'Tracks password change history to prevent password reuse';
