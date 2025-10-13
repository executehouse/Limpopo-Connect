# Deployment Troubleshooting Guide for limpopoconnect.site

## Current Status: Partial Deployment ⚠️

**Last Updated**: October 13, 2025

---

## Executive Summary

The Limpopo Connect application is **partially deployed** to `limpopoconnect.site`:

✅ **Working Components**:
- www subdomain (`www.limpopoconnect.site`) - Fully functional
- Build process - Successfully compiles
- Vercel integration - Configured correctly
- HTTPS/SSL - Properly configured

⚠️ **Issues Identified**:
1. Root domain DNS configuration pointing to incorrect IP
2. TypeScript configuration could cause build failures in CI (now fixed)

---

## Issue #1: Root Domain DNS Configuration ⚠️

### Problem
The root domain `limpopoconnect.site` is resolving to `216.198.79.1` instead of Vercel's recommended IP.

### Current DNS Configuration
```bash
# What we have:
limpopoconnect.site → 216.198.79.1 (IP address)

# What Vercel recommends:
limpopoconnect.site → 76.76.21.21 (Vercel A record)
```

### Impact
- Root domain redirects to www subdomain (307 redirect)
- Works but not optimal for SEO
- Potential issues with SSL certificate provisioning
- May cause intermittent connectivity issues

### Solution

**Option 1: Update A Record (Recommended)**

At your domain registrar (where you purchased limpopoconnect.site):

1. Log in to your domain registrar's DNS management panel
2. Find the A record for `@` or root domain
3. Update the value from `216.198.79.1` to `76.76.21.21`
4. Save changes and wait for DNS propagation (5-60 minutes)

**Option 2: Use CNAME for Root (if supported)**

Some registrars support CNAME flattening:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Option 3: Keep Current Setup (www as primary)**

If you prefer `www.limpopoconnect.site` as the primary domain:

1. Set www as the primary domain in Vercel Dashboard
2. Configure redirect from root → www (already working)
3. Update marketing materials to use www subdomain

### Verification Commands

```bash
# Check current DNS
nslookup limpopoconnect.site

# Expected output after fix:
# Name:    limpopoconnect.site
# Address: 76.76.21.21

# Check DNS propagation globally
curl -s https://dns.google/resolve?name=limpopoconnect.site&type=A
```

---

## Issue #2: TypeScript Configuration (FIXED) ✅

### Problem (Resolved)
The `tsconfig.node.json` file was missing type definitions for Node.js, which could cause build failures in Vercel's CI environment.

### What Was Changed
Updated `tsconfig.node.json`:

```json
// Before:
"types": []

// After:
"types": ["node", "vite/client", "vitest"]
```

### Impact
- Ensures TypeScript can properly compile `vite.config.ts`
- Prevents "Cannot find name 'process'" errors
- Improves IDE type checking and autocomplete

### Verification
```bash
# Clean build test
rm -rf dist && npm run build

# Should complete without TypeScript errors
```

**Status**: ✅ Fixed and verified

---

## DNS Configuration Best Practices

### Recommended DNS Setup

For optimal performance and SEO:

```
# Root domain (choose one option):
Type: A
Name: @
Value: 76.76.21.21

# WWW subdomain:
Type: CNAME  
Name: www
Value: cname.vercel-dns.com

# Email records (if using email):
Type: MX
Name: @
Value: [Your email provider's MX records]
```

### Vercel Dashboard Configuration

1. Go to: https://vercel.com/dashboard
2. Select your project: `Limpopo-Connect`
3. Navigate to: **Settings** → **Domains**
4. Add both domains:
   - `limpopoconnect.site` (set as primary)
   - `www.limpopoconnect.site`
5. Verify both show "Valid Configuration" status

### DNS Propagation Timeline

- **Initial Update**: 5-15 minutes
- **Full Propagation**: Up to 48 hours
- **Typical Completion**: 1-2 hours

### Testing DNS Changes

```bash
# Method 1: Using nslookup
nslookup limpopoconnect.site
nslookup www.limpopoconnect.site

# Method 2: Using dig
dig limpopoconnect.site +short
dig www.limpopoconnect.site +short

# Method 3: Check multiple DNS servers
dig @8.8.8.8 limpopoconnect.site +short  # Google DNS
dig @1.1.1.1 limpopoconnect.site +short  # Cloudflare DNS

# Method 4: Online tools
# https://dnschecker.org/#A/limpopoconnect.site
# https://www.whatsmydns.net/#A/limpopoconnect.site
```

---

## Build & Deployment Verification

### Pre-Deployment Checklist

Run these commands before deploying:

```bash
# 1. Install dependencies
npm install

# 2. Run linter
npm run lint

# 3. Type check
npm run typecheck

# 4. Build for production
npm run build

# 5. Preview production build locally
npm run preview
```

All commands should complete without errors.

### Vercel Build Settings

Ensure these settings in Vercel Dashboard:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 18.x or 20.x |

### Environment Variables

Required for production (in Vercel Dashboard):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Optional API keys (for enhanced features):

```env
VITE_IPINFO_TOKEN=your-token
VITE_OPENWEATHERMAP_API_KEY=your-key
VITE_NEWSDATA_API_KEY=your-key
VITE_UNSPLASH_ACCESS_KEY=your-key
VITE_MAPBOX_TOKEN=your-token
VITE_FORMSPREE_FORM_ID=your-form-id
```

---

## Common Deployment Issues

### Issue: Build Fails on Vercel

**Symptoms**: Build succeeds locally but fails on Vercel

**Possible Causes**:
1. Missing environment variables
2. TypeScript configuration issues
3. Dependency version mismatches
4. Node.js version incompatibility

**Solutions**:
```bash
# Check build with exact Vercel commands
npm ci  # Clean install
npm run build

# Check Node.js version
node --version  # Should be 18.x or 20.x

# Review build logs in Vercel Dashboard
```

### Issue: Domain Not Resolving

**Symptoms**: `ERR_NAME_NOT_RESOLVED` or DNS errors

**Solutions**:
1. Verify DNS records at registrar
2. Check DNS propagation: https://dnschecker.org
3. Clear DNS cache locally:
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### Issue: HTTPS Not Working

**Symptoms**: SSL certificate errors or mixed content warnings

**Solutions**:
1. Wait for Vercel to provision SSL (5-10 minutes after DNS is correct)
2. Check certificate status in Vercel Dashboard
3. Verify DNS points to correct Vercel servers
4. Force HTTPS renewal in Vercel Dashboard

### Issue: 404 Errors on Page Refresh

**Symptoms**: Direct navigation works, but page refresh shows 404

**Status**: ✅ Already fixed via `vercel.json` rewrites

**Verification**: The `vercel.json` file contains:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

### Issue: Assets Not Loading

**Symptoms**: CSS, JS, or images return 404 errors

**Solutions**:
1. Verify `base` path in `vite.config.ts` is set to `/`
2. Check build output in `dist/` directory
3. Verify `outputDirectory` in `vercel.json` is `dist`
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## Step-by-Step Deployment Guide

### For First-Time Deployment

1. **Prepare Repository**
   ```bash
   git pull origin main
   npm install
   npm run build  # Verify build works
   ```

2. **Deploy to Vercel**
   ```bash
   # Option A: Using Vercel CLI
   npm install -g vercel
   vercel login
   vercel --prod

   # Option B: Using GitHub Integration
   # Visit: https://vercel.com/new
   # Import: Tshikwetamakole/Limpopo-Connect
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all required variables (see above)
   - Select "Production, Preview, Development" for each

4. **Add Custom Domain**
   - Go to Settings → Domains
   - Add: `limpopoconnect.site`
   - Add: `www.limpopoconnect.site`
   - Follow Vercel's DNS instructions

5. **Update DNS Records**
   - Log in to domain registrar
   - Update A record for root domain to `76.76.21.21`
   - Keep CNAME for www pointing to `cname.vercel-dns.com`
   - Save and wait for propagation

6. **Verify Deployment**
   ```bash
   # Check both domains
   curl -I https://limpopoconnect.site
   curl -I https://www.limpopoconnect.site
   
   # Both should return 200 OK
   ```

### For Redeployment After Changes

```bash
# 1. Make changes and commit
git add .
git commit -m "Your changes"
git push origin main

# 2. Vercel auto-deploys on push (if GitHub integration enabled)
# Or manually trigger:
vercel --prod
```

---

## Monitoring & Maintenance

### Health Checks

Run these periodically:

```bash
# 1. Check DNS resolution
nslookup limpopoconnect.site
nslookup www.limpopoconnect.site

# 2. Check HTTP response
curl -I https://limpopoconnect.site
curl -I https://www.limpopoconnect.site

# 3. Check SSL certificate
curl -vI https://limpopoconnect.site 2>&1 | grep -A 5 "SSL certificate"

# 4. Check page load time
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://limpopoconnect.site
```

### Performance Monitoring

1. **Vercel Analytics** (if enabled)
   - Dashboard → Analytics
   - Monitor: Page views, load times, errors

2. **Lighthouse Audit**
   ```bash
   npx lighthouse https://limpopoconnect.site --view
   ```

3. **Manual Testing**
   - Test all pages and navigation
   - Verify authentication flow
   - Check mobile responsiveness
   - Test in different browsers

---

## Quick Reference

### Important URLs

- **Production Site**: https://limpopoconnect.site
- **WWW Subdomain**: https://www.limpopoconnect.site
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/Tshikwetamakole/Limpopo-Connect
- **DNS Checker**: https://dnschecker.org/#A/limpopoconnect.site

### Vercel CLI Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# List deployments
vercel ls

# View project info
vercel inspect
```

### Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev/
- **DNS Help**: https://vercel.com/docs/custom-domains
- **Project Documentation**: See `DOCUMENTATION_INDEX.md`

---

## Action Items

### Immediate Actions (High Priority)

- [ ] **Update DNS A Record** to `76.76.21.21` at domain registrar
- [ ] **Verify in Vercel Dashboard** that both domains show "Valid Configuration"
- [ ] **Test deployment** after DNS propagation (wait 15-60 minutes)
- [ ] **Run performance audit** using Lighthouse
- [ ] **Update documentation** with actual deployment URL

### Optional Improvements (Low Priority)

- [ ] Enable Vercel Analytics for monitoring
- [ ] Set up custom error pages (404, 500)
- [ ] Configure additional security headers
- [ ] Set up staging environment for testing
- [ ] Add performance monitoring
- [ ] Configure CDN caching rules

---

## Summary

**Current Status**: The application is deployed and accessible via `www.limpopoconnect.site` ✅

**Main Issue**: Root domain DNS needs to point to correct Vercel IP (`76.76.21.21`) ⚠️

**Fix Required**: Update A record at domain registrar (5-minute task, 15-60 minute DNS propagation)

**Build Issue**: TypeScript configuration fixed ✅

**Next Step**: Update DNS A record and verify deployment after propagation

---

*For additional help, refer to:*
- `VERCEL_CUSTOM_DOMAIN_SETUP.md` - Detailed domain setup guide
- `VERCEL_DEPLOYMENT.md` - General Vercel deployment guide
- `DOCUMENTATION_INDEX.md` - Complete documentation index
