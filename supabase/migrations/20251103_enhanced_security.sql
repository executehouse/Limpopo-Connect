-- Enhanced RLS Policies for Limpopo Connect

-- Profiles table policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by anyone"
ON profiles FOR SELECT
USING (is_public = true);

-- Business verifications table policies
ALTER TABLE business_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification requests"
ON business_verifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests"
ON business_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification requests"
ON business_verifications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests"
ON business_verifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update verification status"
ON business_verifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Messages table policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their rooms"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM room_members
    WHERE room_members.room_id = messages.room_id
    AND room_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their rooms"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM room_members
    WHERE room_members.room_id = room_id
    AND room_members.user_id = auth.uid()
  )
);

-- Room members table policies
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room members in their rooms"
ON room_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM room_members AS rm
    WHERE rm.room_id = room_members.room_id
    AND rm.user_id = auth.uid()
  )
);

CREATE POLICY "Room owners can manage members"
ON room_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM room_members
    WHERE room_members.room_id = room_id
    AND room_members.user_id = auth.uid()
    AND room_members.role = 'owner'
  )
);

-- Create audit logging function
CREATE OR REPLACE FUNCTION log_profile_audit()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profile_audit_logs (
    user_id,
    action,
    old_data,
    new_data,
    ip_address
  ) VALUES (
    auth.uid(),
    TG_OP,
    OLD,
    NEW,
    current_setting('request.headers')::json->>'x-forwarded-for'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile changes
CREATE TRIGGER profile_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_audit();

-- Create function to validate password strength
CREATE OR REPLACE FUNCTION validate_password_strength(password text)
RETURNS boolean AS $$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters long';
  END IF;

  -- Check for uppercase
  IF NOT password ~ '[A-Z]' THEN
    RAISE EXCEPTION 'Password must contain at least one uppercase letter';
  END IF;

  -- Check for lowercase
  IF NOT password ~ '[a-z]' THEN
    RAISE EXCEPTION 'Password must contain at least one lowercase letter';
  END IF;

  -- Check for numbers
  IF NOT password ~ '[0-9]' THEN
    RAISE EXCEPTION 'Password must contain at least one number';
  END IF;

  -- Check for special characters
  IF NOT password ~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RAISE EXCEPTION 'Password must contain at least one special character';
  END IF;

  -- Check against common passwords (add more as needed)
  IF password = ANY(ARRAY['Password123!', 'Admin123!', 'Welcome123!']) THEN
    RAISE EXCEPTION 'Password is too common';
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;