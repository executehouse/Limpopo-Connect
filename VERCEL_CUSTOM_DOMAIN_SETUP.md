# Vercel Deployment Guide for limpopoconnect.site

## Quick Deployment Checklist

✅ **Project is Ready for Deployment**
- Hero image working correctly (verified in dev & build)
- Build completes successfully (`npm run build`)
- Production build outputs to `dist/` directory
- All assets properly bundled with hashed filenames
- Base path configured for custom domain (`/`)

---

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option B: Deploy via GitHub Integration

1. Go to https://vercel.com/new
2. Import your GitHub repository: `Tshikwetamakole/Limpopo-Connect`
3. Vercel will auto-detect Vite configuration
4. Verify build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click "Deploy"

---

## Step 2: Configure Custom Domain (limpopoconnect.site)

### Add Custom Domain in Vercel

1. Go to your project in Vercel Dashboard
2. Click on **Settings** → **Domains**
3. Add custom domain: `limpopoconnect.site`
4. Add www subdomain: `www.limpopoconnect.site` (optional)
5. Vercel will provide DNS configuration instructions

### DNS Configuration (at your domain registrar)

You'll need to add these DNS records at your domain registrar (where you purchased limpopoconnect.site):

#### For Root Domain (limpopoconnect.site):

**Option 1: A Records** (Recommended)
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option 2: CNAME (if supported)**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

#### For WWW Subdomain (www.limpopoconnect.site):

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Verify DNS Propagation

```bash
# Check DNS propagation (may take 5-60 minutes)
nslookup limpopoconnect.site
dig limpopoconnect.site

# Check HTTPS certificate status in Vercel Dashboard
```

---

## Step 3: Environment Variables (if using Supabase)

If your app uses Supabase, add these environment variables in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add the following:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

**Get these from**: Supabase Dashboard → Project Settings → API

---

## Step 4: Verify Deployment

### Test Checklist

- [ ] Visit https://limpopoconnect.site
- [ ] Hero image appears correctly on homepage
- [ ] Navigation works (all routes load)
- [ ] Assets load correctly (CSS, JS, images)
- [ ] No console errors in browser DevTools
- [ ] HTTPS is enabled and certificate is valid
- [ ] Site loads fast (check Lighthouse score)

### Performance Optimization

```bash
# Run Lighthouse audit
npx lighthouse https://limpopoconnect.site --view

# Expected scores:
# Performance: 90+
# Accessibility: 90+
# Best Practices: 90+
# SEO: 90+
```

---

## Step 5: Post-Deployment Configuration

### Redirect www to root (or vice versa)

In Vercel Dashboard:
1. Go to **Settings** → **Domains**
2. Set `limpopoconnect.site` as primary domain
3. `www.limpopoconnect.site` will auto-redirect

### Enable Analytics (Optional)

1. Go to **Analytics** tab in Vercel Dashboard
2. Enable Vercel Analytics for real-time insights
3. Or integrate Google Analytics via environment variables

### Set up Monitoring

1. Enable **Log Drains** for error tracking
2. Configure **Notifications** for deployment status
3. Set up **Uptime Monitoring** via external service (e.g., UptimeRobot)

---

## Troubleshooting

### Hero Image Not Showing in Production

**This shouldn't happen based on our testing, but if it does:**

1. Check browser console for 404 errors
2. Verify image exists in deployed `assets/` folder:
   ```
   https://limpopoconnect.site/assets/hero-bg-[hash].jpg
   ```
3. Check Network tab to see if image request succeeds
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Domain Not Resolving

1. Check DNS propagation: https://dnschecker.org/#A/limpopoconnect.site
2. Verify DNS records at your registrar match Vercel's requirements
3. Wait up to 48 hours for full DNS propagation (usually 5-60 minutes)
4. Contact domain registrar support if issues persist

### Build Failures

1. Check build logs in Vercel Dashboard
2. Verify `package.json` scripts are correct
3. Ensure all dependencies are listed in `package.json`
4. Test build locally: `npm run build`
5. Check Node.js version compatibility (18.x or later)

### 404 Errors on Page Refresh

This is already handled by `vercel.json` with the rewrite rule:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

If still occurring, verify `vercel.json` is in the root directory.

---

## Continuous Deployment

Once set up, every push to your GitHub repository will automatically:

1. Trigger a new build on Vercel
2. Run tests and build checks
3. Deploy to preview URL (for non-main branches)
4. Deploy to production URL (for main branch)

### Git Workflow

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically builds and deploys
# Check deployment status at: https://vercel.com/dashboard
```

---

## Custom Domain Checklist

Before launching to public:

- [ ] DNS records configured correctly
- [ ] HTTPS certificate issued and valid
- [ ] All pages load correctly
- [ ] Hero image displays properly
- [ ] Forms and authentication work
- [ ] Mobile responsive design verified
- [ ] SEO meta tags in place
- [ ] Analytics tracking configured
- [ ] Error monitoring set up
- [ ] Backup/rollback plan ready

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev/
- **DNS Help**: https://vercel.com/docs/custom-domains
- **Project Repository**: https://github.com/Tshikwetamakole/Limpopo-Connect

---

## Summary

Your project is **production-ready** and configured for deployment to **limpopoconnect.site** via Vercel:

✅ Hero image working correctly  
✅ Build process optimized  
✅ Vercel configuration in place  
✅ Ready for custom domain setup  

**Next Action**: Deploy to Vercel and configure DNS for limpopoconnect.site

---

*Last Updated: 2025-10-11*  
*Deployment Target: limpopoconnect.site*  
*Framework: Vite + React + TypeScript*
