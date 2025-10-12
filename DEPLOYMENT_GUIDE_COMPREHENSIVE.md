# Deployment Guide - Limpopo Connect

## Quick Deployment Checklist

For rapid deployment to production:

- [ ] **1. Database Setup** (5 min)
  - [ ] Apply migration: `supabase/migrations/20251012_rls_indexes_and_vault.sql`
  - [ ] Verify RLS policies enabled
  - [ ] Check indexes created

- [ ] **2. Environment Variables** (3 min)
  - [ ] Set `VITE_SUPABASE_URL` in Vercel
  - [ ] Set `VITE_SUPABASE_ANON_KEY` in Vercel
  - [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel (mark as Secret)
  - [ ] Set `VITE_BASE=/` in Vercel

- [ ] **3. Vercel Build Settings** (2 min)
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Framework: Vite
  - [ ] Node Version: 18.x

- [ ] **4. Deploy & Verify** (5 min)
  - [ ] Push to main branch or run `vercel --prod`
  - [ ] Visit `/health` endpoint
  - [ ] Test signup/login
  - [ ] Check browser console for errors

Total time: ~15 minutes

---

## Detailed Deployment Instructions

### Prerequisites

- Supabase account and project (https://app.supabase.com)
- Vercel account (https://vercel.com)
- Node.js 18.x or later
- npm or yarn

### Step 1: Database Setup

**Apply the comprehensive RLS migration**:

```bash
# Option A: Using Supabase CLI (recommended)
supabase db push

# Option B: Using SQL Editor
# 1. Open https://app.supabase.com/project/sscsjwaogomktxqhvgxw/editor
# 2. Copy content from supabase/migrations/20251012_rls_indexes_and_vault.sql
# 3. Paste and run in SQL editor
```

**What this migration does**:
- Enables RLS on all sensitive tables
- Creates JWT-based policies (using `auth.uid()`)
- Adds performance indexes
- Secures vault.secrets
- Configures storage policies (avatars, documents)
- Enables realtime for room_messages
- Creates audit logging infrastructure

**Verify migration**:
```sql
-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('profiles', 'room_messages');

-- Should return: rowsecurity = true for all tables

-- Check indexes created
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Should return: idx_profiles_id, idx_profiles_email, idx_profiles_role
```

### Step 2: Configure Environment Variables

**Get Supabase Credentials**:

1. Go to: https://app.supabase.com/project/sscsjwaogomktxqhvgxw/settings/api
2. Copy **Project URL** → This is `VITE_SUPABASE_URL`
3. Copy **anon public** key → This is `VITE_SUPABASE_ANON_KEY`
4. Copy **service_role** key → This is `SUPABASE_SERVICE_ROLE_KEY`

**Set in Vercel Dashboard**:

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:

| Variable Name | Value | Environment | Secret? |
|---------------|-------|-------------|---------|
| `VITE_SUPABASE_URL` | `https://sscsjwaogomktxqhvgxw.supabase.co` | Production, Preview, Development | No |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development | No |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development | **Yes** |
| `VITE_BASE` | `/` | Production, Preview, Development | No |

**Local Development** (`.env.local`):

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and add your credentials
VITE_SUPABASE_URL=https://sscsjwaogomktxqhvgxw.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_BASE=/
```

**⚠️ Security Warning**:
- NEVER commit `.env.local` (it's in `.gitignore`)
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Mark service role key as **SECRET** in Vercel

### Step 3: Configure Vercel Build Settings

**Navigate to**: Vercel Dashboard → Your Project → Settings → General

**Framework Preset**: Vite

**Build & Development Settings**:
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

**Node.js Version**: 18.x (or later)

### Step 4: Deploy to Vercel

**Option A: Automatic Deployment (Recommended)**

1. Connect repository to Vercel (if not already connected)
2. Push to main branch:
   ```bash
   git push origin main
   ```
3. Vercel automatically builds and deploys
4. Watch deployment progress in Vercel Dashboard

**Option B: Manual Deployment**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Step 5: Verify Deployment

**1. Check Build Logs**
- Open Vercel Dashboard → Deployments → Latest Deployment
- Review build logs for errors
- Look for "Build completed successfully"

**2. Test Health Endpoint**
```bash
# Visit in browser
open https://limpopoconnect.site/health

# Or use curl
curl https://limpopoconnect.site/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "vite": { "status": "ok", "message": "React production build loaded successfully" },
    "supabase": { "status": "ok", "message": "Supabase connection successful" },
    "env": { "status": "ok", "message": "Environment variables loaded" },
    "routing": { "status": "ok", "message": "Current path: /health" }
  }
}
```

**3. Test Main Application**
- Visit https://limpopoconnect.site
- Page should load (NOT blank)
- Open browser console (F12)
- Check for JavaScript errors (should be none)

**4. Test Authentication Flow**
- Click "Sign Up" or "Register"
- Create test account
- Verify profile creation
- Test login/logout

**5. Test Database Access**
- Visit profile page
- Try uploading avatar (tests storage policies)
- Create/view room messages (tests RLS policies)

---

## Troubleshooting Common Issues

### Issue 1: Blank Preview Page

**Symptoms**: Preview URL loads but shows white/blank page

**Diagnosis**:
```bash
# 1. Check health endpoint
curl https://your-preview.vercel.app/health

# 2. Run diagnostics
./scripts/collect-console-errors.sh https://your-preview.vercel.app

# 3. Check browser console
# Open DevTools (F12) → Console tab → Look for errors
```

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Assets 404 (not found) | Set `VITE_BASE=/` in Vercel env vars |
| Environment variables not set | Add all VITE_* variables in Vercel dashboard |
| Wrong output directory | Set Output Directory to `dist` in build settings |
| JavaScript errors | Check console for specific error messages |
| SPA routing not configured | Verify `vercel.json` is committed and has rewrites |

### Issue 2: RLS Policy Violations

**Symptoms**: Queries return "permission denied" or empty results

**Diagnosis**:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check user authentication
SELECT auth.uid(); -- Should return your user UUID

-- Check policies for table
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| User not authenticated | Ensure login successful, check JWT token |
| Policy conditions not met | Review policy USING/WITH CHECK clauses |
| Wrong user ID in policy | Verify `auth.uid()` matches profile.id |
| RLS not enabled | Run migration to enable RLS |

### Issue 3: Storage Upload Fails

**Symptoms**: Avatar/file upload returns error

**Diagnosis**:
```sql
-- Check if buckets exist
SELECT * FROM storage.buckets WHERE id IN ('avatars', 'documents');

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- Test folder path extraction
SELECT storage.foldername('avatars/user-123/photo.jpg');
-- Should return: ['user-123']
```

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Bucket doesn't exist | Create bucket in Supabase Dashboard → Storage |
| Policy path mismatch | Ensure upload path: `bucket/{user_id}/filename` |
| File too large | Check bucket size limits (default 50MB) |
| Wrong permissions | Verify policy allows INSERT for authenticated user |

### Issue 4: Environment Variables Not Loading

**Symptoms**: App shows "Configuration error: Supabase URL not configured"

**Diagnosis**:
```bash
# Local development
cat .env.local | grep VITE_

# Production (check Vercel dashboard)
# Vercel Dashboard → Settings → Environment Variables
```

**Common Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Variables not prefixed with VITE_ | Rename to `VITE_SUPABASE_URL`, etc. |
| Variables not set in Vercel | Add in Vercel dashboard for all environments |
| .env.local not created | Copy from `.env.example` and fill in values |
| Vercel cache issue | Redeploy with "Clear cache" option |

---

## Monitoring & Maintenance

### Health Checks

Set up monitoring for the `/health` endpoint:

```bash
# Add to cron job or monitoring service
*/5 * * * * curl -f https://limpopoconnect.site/health || alert "Health check failed"
```

### Database Monitoring

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries (> 1 second)
SELECT query, calls, mean_exec_time, max_exec_time 
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Log Monitoring

**Vercel Logs**:
```bash
# Install Vercel CLI
npm install -g vercel

# View real-time logs
vercel logs --follow
```

**Supabase Logs**:
- Dashboard → Logs → Postgres Logs
- Dashboard → Logs → API Logs

### Performance Optimization

**Index Usage**:
```sql
-- Check if indexes are being used
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  idx_scan as index_scans
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- Low idx_scan means index might not be used
```

**Cache Hit Ratio**:
```sql
-- Should be > 99%
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) * 100 as cache_hit_ratio
FROM pg_statio_user_tables;
```

---

## Rollback Procedure

If deployment fails or causes issues:

**1. Rollback Vercel Deployment**
```bash
# Via CLI
vercel rollback

# Or in Vercel Dashboard
# Deployments → Previous Deployment → Promote to Production
```

**2. Rollback Database Migration** (if needed)

```sql
-- Drop policies created by migration
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
-- ... (drop all policies created)

-- Drop indexes
DROP INDEX IF EXISTS idx_profiles_id;
DROP INDEX IF EXISTS idx_profiles_email;
-- ... (drop all indexes created)

-- Disable RLS (only if necessary)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ... (for each table)
```

**3. Restore Previous Environment Variables**
- Vercel Dashboard → Settings → Environment Variables
- Update to previous values
- Redeploy

**4. Monitor and Verify**
- Check `/health` endpoint
- Test authentication
- Review error logs

---

## Support & Resources

### Documentation Links
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Vercel Documentation](https://vercel.com/docs)
- [React Router Documentation](https://reactrouter.com/)

### Diagnostic Scripts
- `./scripts/check-deploy.sh` - Local deployment verification
- `./scripts/collect-console-errors.sh` - Error collection
- `./scripts/supabase-smoke-tests.sh` - API endpoint testing

### Project Documentation
- `VERCEL_CUSTOM_DOMAIN_SETUP.md` - Custom domain configuration
- `SUPABASE_SETUP_GUIDE.md` - Database setup
- `PR_BODY_DEPLOYMENT_FIXES.md` - This PR's changes
- `.env.example` - Environment variable reference

### Getting Help

**Issue Templates**:
1. Blank preview → Use `collect-console-errors.sh` output
2. RLS errors → Include SQL query and policy name
3. Storage errors → Include bucket name and file path
4. Build errors → Include full build log from Vercel

**Useful Commands**:
```bash
# Check current git branch
git branch

# View recent deployments
vercel ls

# View build logs
npm run build 2>&1 | tee build.log

# Test preview locally
npm run preview

# Check Supabase connection
curl "$VITE_SUPABASE_URL/rest/v1/" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"
```

---

## Security Best Practices

### Before Deployment
- [ ] Review all environment variables (no hardcoded secrets)
- [ ] Verify RLS policies enabled on all tables
- [ ] Check that service role key marked as SECRET in Vercel
- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Review storage policies (public/private buckets)
- [ ] Test authentication flow thoroughly

### After Deployment
- [ ] Monitor `/health` endpoint
- [ ] Check error logs for security issues
- [ ] Review audit logs for suspicious activity
- [ ] Update passwords/keys if compromised
- [ ] Set up alerts for failed authentication attempts

### Ongoing Maintenance
- [ ] Rotate service role key quarterly
- [ ] Review and update RLS policies as schema evolves
- [ ] Monitor database for unusual query patterns
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Backup database regularly (Supabase auto-backups daily)

---

**Last Updated**: 2025-10-12  
**Migration Version**: 20251012_rls_indexes_and_vault  
**Node Version**: 18.x  
**Framework**: Vite 7.x + React 19.x
