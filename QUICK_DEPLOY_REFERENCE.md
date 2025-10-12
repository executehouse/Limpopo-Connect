# Quick Deployment Reference Card
## Limpopo Connect - Production Deployment

**Last Updated**: 2025-10-12  
**Branch**: `copilot/fix-security-and-deployment-issues`  
**Status**: ✅ Ready for Production

---

## 🚀 Quick Deploy (15 minutes)

### 1️⃣ Database (5 min)

```bash
# Apply migration
supabase db push

# Or in SQL Editor:
# Copy/paste: supabase/migrations/20251012_rls_indexes_and_vault.sql
```

**Verify**:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- All tables should show rowsecurity = true
```

---

### 2️⃣ Vercel Env Vars (3 min)

**Dashboard**: Vercel → Settings → Environment Variables → Add

| Variable | Get From | Secret? |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → API | No |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → API | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → API | **YES** |
| `VITE_BASE` | Type `/` manually | No |

**Scope**: Production + Preview + Development (all three!)

---

### 3️⃣ Deploy (2 min)

```bash
# Push to main
git push origin main

# Or manual
vercel --prod
```

---

### 4️⃣ Verify (5 min)

```bash
# 1. Health check
curl https://limpopoconnect.site/health

# 2. Open in browser
open https://limpopoconnect.site

# 3. Test signup
# Click "Register" → Create account

# 4. Check console (F12)
# Should have no red errors
```

✅ **Done!**

---

## 📞 Emergency Contacts

| Issue | Solution | Command |
|-------|----------|---------|
| Blank page | Check `/health` | `curl .../health` |
| Assets 404 | Set `VITE_BASE=/` | In Vercel dashboard |
| RLS errors | Check auth | `SELECT auth.uid();` |
| Build fails | Check logs | `vercel logs` |

---

## 🔑 Quick Commands

```bash
# Local test
npm run build && npm run preview

# Check deployment
./scripts/check-deploy.sh

# Collect errors
./scripts/collect-console-errors.sh https://limpopoconnect.site

# View logs
vercel logs --follow

# Rollback
vercel rollback
```

---

## 📍 Important URLs

- **Production**: https://limpopoconnect.site
- **Health**: https://limpopoconnect.site/health
- **Supabase Dashboard**: https://app.supabase.com/project/sscsjwaogomktxqhvgxw
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/Tshikwetamakole/Limpopo-Connect

---

## 🔒 Security Quick Check

- [ ] Service role key marked as SECRET in Vercel ✓
- [ ] No `using(true)` in RLS policies ✓
- [ ] `.env.local` not committed ✓
- [ ] Vault secrets protected ✓
- [ ] Storage policies configured ✓

---

## 🏗️ Build Settings (Vercel)

```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x
```

---

## 📋 Files Changed in This PR

**Critical**:
- `supabase/migrations/20251012_rls_indexes_and_vault.sql` - Database security
- `vercel.json` - SPA routing fix
- `.env.example` - Configuration guide

**Diagnostic**:
- `src/pages/Health.tsx` - Health check endpoint
- `scripts/check-deploy.sh` - Deployment test
- `scripts/collect-console-errors.sh` - Error collection

**Documentation**:
- `PR_BODY_DEPLOYMENT_FIXES.md` - Full PR details
- `DEPLOYMENT_GUIDE_COMPREHENSIVE.md` - Step-by-step guide
- `SECURITY_AUDIT_REPORT.md` - Security audit results

---

## 🆘 Troubleshooting One-Liners

**Problem**: Blank preview  
**Fix**: `Check /health endpoint → If blank, check VITE_BASE env var`

**Problem**: 404 on assets  
**Fix**: `Set VITE_BASE=/ in Vercel → Redeploy`

**Problem**: Permission denied  
**Fix**: `Check auth.uid() in SQL → Verify user logged in`

**Problem**: Build fails  
**Fix**: `npm ci && npm run build → Check error message`

**Problem**: Storage upload fails  
**Fix**: `Verify bucket exists → Check storage policies`

---

## 📊 Success Criteria

✅ Preview URL loads (not blank)  
✅ `/health` shows "healthy"  
✅ Signup works  
✅ Login works  
✅ Profile page accessible  
✅ No console errors  
✅ Assets load (check Network tab)  
✅ RLS policies enforced  

---

## 📚 Full Documentation

For detailed information, see:
- `DEPLOYMENT_GUIDE_COMPREHENSIVE.md` - Complete deployment guide
- `PR_BODY_DEPLOYMENT_FIXES.md` - PR documentation
- `SECURITY_AUDIT_REPORT.md` - Security audit

---

**Need Help?**
1. Check `/health` endpoint first
2. Run `./scripts/collect-console-errors.sh`
3. Review browser console (F12)
4. Check Vercel deployment logs
5. Verify environment variables set

---

**Time to Deploy**: ~15 minutes  
**Difficulty**: 🟢 Easy (following checklist)  
**Risk**: 🟢 Low (non-destructive changes)  
**Impact**: 🟢 High (fixes blank preview + security)

✅ **Ready to Deploy!**
