# 🚀 Supabase Setup Guide for Non-Technical Users

## What is Supabase?
Supabase is like a "backend-as-a-service" that handles user accounts, authentication, and database for your app. Think of it as the engine that powers user login/registration for Limpopo Connect.

## Step 1: Create a Supabase Account

1. **Go to**: https://supabase.com
2. **Click**: "Start your project" 
3. **Sign up** with your email or GitHub account

## Step 2: Create Your Project

1. **Click**: "New project"
2. **Choose**: Your organization (usually your username)
3. **Fill in**:
   - Name: `Limpopo Connect`
   - Database Password: Choose a strong password (save this!)
   - Region: Choose closest to South Africa (probably `Southeast Asia` or `Europe West`)
4. **Click**: "Create new project"
5. **Wait**: About 2-3 minutes for setup to complete

## Step 3: Get Your Credentials

1. **Go to**: Settings (left sidebar) > API
2. **Copy these two values**:
   
   **Project URL** - looks like:
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   
   **anon public key** - looks like:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
   ```

## Step 4: Set Up Your Environment File

1. **In your project folder**, create a new file called `.env.local`
2. **Copy this template** and replace the values:

```env
VITE_SUPABASE_URL=https://your-actual-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Example with real values**:
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcWVmZ2lwbGRzd2NsYXR2ZGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk5NDMyNjQsImV4cCI6MjAwNTUxOTI2NH0.abc123...
```

## Step 5: Set Up Authentication Tables (Important!)

1. **Go to**: SQL Editor (left sidebar) in Supabase dashboard
2. **Click**: "New query"
3. **Copy and paste** this code:

```sql
-- Drop old trigger, function, and table if they exist, to ensure a clean setup.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles;

-- Create a table for public profiles
-- This table will store user data that is safe to be publicly accessible.
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen'::text
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
-- See https://supabase.com/docs/guides/auth/managing-user-data for more details.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'role'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. **Click**: "Run" button (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

## Step 6: Test Your Setup

After setting up the environment file, restart your development server and the Supabase warning should disappear!

## Troubleshooting

### ❌ "Invalid project URL"
- Make sure your URL starts with `https://`
- No trailing slash at the end
- Check you copied the full URL

### ❌ "Invalid API key"
- Make sure you copied the **anon public** key, not the service role key
- The anon key is safe to expose in frontend code
- Check for extra spaces or characters

### ❌ "Connection failed"
- Check your internet connection
- Make sure your Supabase project is active (green dot in dashboard)
- Try refreshing the API keys in Supabase dashboard

## 🎉 Success!
Once configured, your Limpopo Connect app will have:
- ✅ User registration
- ✅ User login/logout  
- ✅ Password reset
- ✅ Secure user profiles
- ✅ Real user authentication (no more test/mock data!)

## Need Help?
If you run into issues:
1. Double-check you copied the URL and key exactly
2. Make sure `.env.local` file is in the root folder (same level as package.json)
3. Restart your development server after creating `.env.local`
4. Check the browser console for specific error messages