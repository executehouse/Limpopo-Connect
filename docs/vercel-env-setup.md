# 🚀 Vercel Environment Variables Setup

## For Production Deployment

After setting up your Supabase project, you need to configure the same environment variables in Vercel for production deployment.

### Steps:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your Limpopo Connect project

2. **Navigate to Environment Variables**
   - Go to: Settings → Environment Variables

3. **Add Required Variables**

   | Variable Name | Value | Environments |
   |---------------|-------|-------------|
   | `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Production, Preview, Development |

   **Important**: Select ALL environments (Production, Preview, Development) for both variables.

4. **Get Values from Supabase**
   - Go to: https://app.supabase.com/project/_/settings/api
   - Copy: Project URL → `VITE_SUPABASE_URL`
   - Copy: anon public key → `VITE_SUPABASE_ANON_KEY`

5. **Redeploy**
   - After adding variables, trigger a new deployment
   - Either push new code or manually redeploy in Vercel dashboard

### Verification:

After deployment, visit your live site and:
- Check `/health` endpoint for environment status
- Try registering a new user account
- Verify profile creation works

### Troubleshooting:

- If variables don't take effect: Trigger a fresh deployment
- If auth doesn't work: Check Supabase Dashboard → Authentication → Settings
- If RLS errors: Run the database setup SQL in Supabase SQL Editor

---

**Security Notes**:
- ✅ `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are safe to expose publicly
- ✅ Row Level Security (RLS) policies control data access
- ❌ Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code