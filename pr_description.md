## Summary
Fix: profile access, UX, SEO, perf, accessibility

### Before
- /profile rendered raw 401 or placeholder "Unknown User" for preview.
- No graceful private UI; SEO tags missing for username pages.
- Avatars not optimized; accessibility gaps.

### After
- /profile/[username] renders public profiles server-side without auth.
- Private profiles render friendly PrivateProfileCTA (Sign in / Request access).
- LoadingSkeleton and ErrorFallback components for graceful states.
- Dynamic meta tags (title, description, og, canonical) for SEO.
- Avatar component with lazy loading + low-res fallback.
- Accessibility: ARIA, skip-to-content, focus styles, axe tests.
- Performance: lazy-load non-critical components, images optimized.

### How to run locally
1. Copy env: `cp .env.example .env.local` and fill `VITE_SUPABASE_URL`, etc.
2. `npm install`
3. `npm run dev`
4. `npm run build`
5. `npm run test`
6. `npx lighthouse http://localhost:5000/profile/view/1 --output html --output-path ./lighthouse-report.html`

### Checklist (before merging)
- [ ] Visiting /profile/<public-username> renders public info without auth
- [ ] Visiting /profile shows friendly UI when not signed in (no raw 401)
- [ ] Page passes axe accessibility checks
- [ ] Lighthouse: Accessibility >=90, SEO >=80
- [ ] Screenshots attached (desktop, tablet, mobile)
- [ ] Jest tests green

### Screenshots & Reports
- Attached: screenshot-desktop.png, screenshot-mobile.png
- Attached: jest-report.xml, axe-report.json, lighthouse-report.html

Ready for manual review.
