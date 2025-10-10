-- Role-Based Experience & Journey Integration
-- Migration to properly implement role ENUM and JWT claims mapping

-- 1. Create user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('visitor', 'citizen', 'business', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to profiles with proper enum constraint
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'citizen';

-- 3. Update existing profiles to have proper role type
UPDATE public.profiles 
SET role = CASE 
    WHEN role IS NULL OR role = '' THEN 'citizen'::user_role
    WHEN role = 'user' THEN 'citizen'::user_role
    WHEN role = 'moderator' THEN 'admin'::user_role
    ELSE role::user_role
END
WHERE role IS NULL OR role NOT IN ('visitor', 'citizen', 'business', 'admin');

-- 4. Create business_verification table for business role verification
CREATE TABLE IF NOT EXISTS public.business_verification (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name text NOT NULL,
    registration_number text,
    contact_email text NOT NULL,
    contact_phone text,
    address text,
    description text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    verified_by uuid REFERENCES public.profiles(id),
    verified_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- 5. Create role_audit_logs for role changes tracking
CREATE TABLE IF NOT EXISTS public.role_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    old_role user_role,
    new_role user_role NOT NULL,
    changed_by uuid REFERENCES public.profiles(id),
    reason text,
    created_at timestamptz DEFAULT now()
);

-- 6. Create function to ensure role is in JWT claims
CREATE OR REPLACE FUNCTION public.handle_auth_user_role()
RETURNS trigger AS $$
BEGIN
    -- Ensure profile exists with proper role
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'citizen'::user_role)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to handle new user creation
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_role();

-- 8. Function to update user role with audit logging
CREATE OR REPLACE FUNCTION public.update_user_role(
    target_user_id uuid,
    new_user_role user_role,
    changed_by_id uuid DEFAULT auth.uid(),
    change_reason text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    old_user_role user_role;
    current_user_role user_role;
BEGIN
    -- Check if current user can change roles (must be admin)
    SELECT role INTO current_user_role 
    FROM public.profiles 
    WHERE id = changed_by_id;
    
    IF current_user_role != 'admin' AND changed_by_id != target_user_id THEN
        RAISE EXCEPTION 'Insufficient permissions to change user role';
    END IF;
    
    -- Get current role
    SELECT role INTO old_user_role 
    FROM public.profiles 
    WHERE id = target_user_id;
    
    -- Update the role
    UPDATE public.profiles 
    SET role = new_user_role, updated_at = now()
    WHERE id = target_user_id;
    
    -- Log the change
    INSERT INTO public.role_audit_logs (user_id, old_role, new_role, changed_by, reason)
    VALUES (target_user_id, old_user_role, new_user_role, changed_by_id, change_reason);
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant necessary permissions
GRANT SELECT ON public.business_verification TO authenticated;
GRANT INSERT, UPDATE ON public.business_verification TO authenticated;
GRANT SELECT ON public.role_audit_logs TO authenticated;

-- 10. Enable RLS on new tables
ALTER TABLE public.business_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_verification
CREATE POLICY "business_verification_select_own_or_admin" ON public.business_verification
FOR SELECT USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "business_verification_insert_own" ON public.business_verification
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "business_verification_update_own_or_admin" ON public.business_verification
FOR UPDATE USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- RLS Policies for role_audit_logs
CREATE POLICY "role_audit_logs_select_own_or_admin" ON public.role_audit_logs
FOR SELECT USING (
    user_id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_verification_user_id ON public.business_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_business_verification_status ON public.business_verification(status);
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_user_id ON public.role_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

COMMENT ON TABLE public.business_verification IS 'Business verification records for business role approval';
COMMENT ON TABLE public.role_audit_logs IS 'Audit trail for user role changes';
COMMENT ON FUNCTION public.update_user_role IS 'Securely update user role with audit logging';