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
-- Enable Row Level Security on auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'user' CHECK (user_type IN ('user', 'business', 'admin'))
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
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