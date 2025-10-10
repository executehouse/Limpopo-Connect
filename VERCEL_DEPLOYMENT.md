# Vercel Deployment Guide for Limpopo Connect

This guide provides complete instructions for deploying Limpopo Connect to Vercel with Supabase integration.

## Prerequisites

- GitHub account with your project repository
- Vercel account (free tier works)
- Supabase account for production database

## Step 1: Set Up Production Supabase

### 1.1 Create Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: limpopo-connect-prod
   - Database Password: (create a strong password)
   - Region: (choose closest to your users)
4. Wait for project to be provisioned (~2 minutes)

### 1.2 Apply Database Migrations
1. In your Supabase dashboard, go to SQL Editor
2. Copy the entire content from `supabase/migrations/20251010_init_core_schema.sql`
3. Paste into SQL Editor and click "Run"
4. Verify tables are created in Table Editor

### 1.3 Get API Credentials
1. Go to Project Settings > API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 2: Deploy to Vercel

### 2.1 Import Project
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect it as a Vite project

### 2.2 Configure Build Settings
Vercel should auto-detect these settings, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Add Environment Variables
In the "Environment Variables" section, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

**Important**: 
- Select all environments (Production, Preview, Development)
- Use the same Supabase project for all environments or create separate projects for staging

### 2.4 Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

## Step 3: Configure Authentication

### 3.1 Update Supabase Auth Settings
1. In Supabase Dashboard > Authentication > URL Configuration
2. Add your Vercel domain to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: 
     - `https://your-app.vercel.app/reset-password`
     - `https://your-app.vercel.app/**` (for all auth callbacks)

### 3.2 Email Templates (Optional)
1. Go to Authentication > Email Templates
2. Customize email templates with your app branding
3. Update redirect URLs to use your Vercel domain

## Step 4: Verify Deployment

### 4.1 Test Authentication Flow
1. Visit your deployed app
2. Click "Register" and create a test account
3. Check email for confirmation (if enabled)
4. Try logging in
5. Test password reset flow
6. Visit Profile page and update profile

### 4.2 Test Database Connection
1. Check browser console for errors
2. Verify profile data loads correctly
3. Test creating/updating data if applicable

## Environment Variables Reference

### Required Variables
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Local vs Production
- **Local Development**: Uses `VITE_SUPABASE_URL` from `.env.local`
- **Production**: Uses environment variables from Vercel dashboard
- Both use the same Supabase schema defined in migrations

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility (18.x or later)
- Review build logs for specific errors

### Authentication Not Working
- Verify environment variables are set correctly
- Check Supabase redirect URLs include your Vercel domain
- Ensure email confirmation is disabled for testing (or check spam folder)

### Database Connection Issues
- Verify Supabase project is active (not paused)
- Check that RLS policies are applied correctly
- Verify API keys are correct (no extra spaces)

### Runtime Errors
- Check browser console for detailed errors
- Verify Supabase tables exist and have correct schema
- Test API endpoints with valid authentication

## Security Checklist

- ✅ Never commit `.env` files to version control
- ✅ Use environment variables for all sensitive data
- ✅ Enable RLS (Row Level Security) on all Supabase tables
- ✅ Use HTTPS for all production traffic (Vercel provides this automatically)
- ✅ Regularly update dependencies for security patches
- ✅ Enable email confirmation for production (Supabase Auth settings)
- ✅ Set up proper CORS policies if using external APIs

## Production Best Practices

1. **Database Backups**: Enable daily backups in Supabase (paid plans)
2. **Monitoring**: Set up Vercel Analytics and Supabase logs
3. **Error Tracking**: Consider adding Sentry or similar service
4. **Performance**: Enable Vercel Edge Network for global CDN
5. **Custom Domain**: Add your custom domain in Vercel project settings

## Continuous Deployment

Vercel automatically deploys when you push to your GitHub repository:
- **Main branch** → Production deployment
- **Other branches** → Preview deployments

To disable auto-deployment:
1. Go to Project Settings > Git
2. Configure deployment branches

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)