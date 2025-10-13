# API Keys Configuration

This document describes how to configure API keys for external services used in Limpopo Connect.

## Required Environment Variables

### Formspree (Contact Form Service)

**Variable:** `VITE_FORMSPREE_FORM_ID`

1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form in your dashboard
3. Copy the form ID from the form URL: `https://formspree.io/f/YOUR_FORM_ID`
4. Add to your environment variables

**Free Tier:** 50 submissions/month

### Mapbox (Interactive Maps)

**Variable:** `VITE_MAPBOX_TOKEN`

1. Sign up at [mapbox.com](https://mapbox.com)
2. Go to Account → Access Tokens
3. Create a new token with these scopes:
   - `styles:tiles` (required for map display)
   - `styles:read` (required for style access)
4. Copy the token (starts with `pk.`)
5. Add to your environment variables

**Free Tier:** 50,000 map loads/month

### Supabase (Database & Auth - Optional for Contact Form)

**Variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Used as fallback for contact form when Formspree is unavailable.

1. Project already configured - check existing `.env.local` or contact admin
2. Contact forms will fall back to saving in `contacts` table if Formspree fails

## Setting Environment Variables

### Local Development

Create `.env.local` in project root:

```bash
# Contact Form Service
VITE_FORMSPREE_FORM_ID=your_formspree_form_id_here

# Interactive Maps
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Database (already configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Vercel Deployment

#### Via Dashboard:
1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add each variable for all environments (Production, Preview, Development)

#### Via CLI:
```bash
vercel env add VITE_FORMSPREE_FORM_ID
vercel env add VITE_MAPBOX_TOKEN
```

## Fallback Behavior

### Contact Form
- **Primary:** Formspree (if `VITE_FORMSPREE_FORM_ID` configured)
- **Fallback 1:** Supabase database (if Supabase keys available)
- **Fallback 2:** User-friendly error message with contact email

### Maps
- **Primary:** Interactive Mapbox maps (if `VITE_MAPBOX_TOKEN` configured)
- **Fallback:** OpenStreetMap iframe embed (always available)

## Rate Limiting & Monitoring

### Formspree
- Free tier: 50 submissions/month
- Rate limiting: Automatic 30-minute cooldown if limits exceeded
- Monitor usage in Formspree dashboard

### Mapbox
- Free tier: 50,000 map loads/month
- Monitor usage in Mapbox dashboard
- Automatic fallback to OpenStreetMap if quota exceeded

## Security Notes

- All variables use `VITE_` prefix (client-side safe)
- Tokens are scoped to specific domains in production
- No server-side secrets exposed
- Consider implementing server-side proxy for enhanced security in production

## Troubleshooting

### Contact Form Issues
1. Check browser console for error messages
2. Verify `VITE_FORMSPREE_FORM_ID` format (no spaces, correct form ID)
3. Check Formspree dashboard for submission logs
4. Test fallback by temporarily removing Formspree ID

### Map Issues
1. Check browser console for Mapbox errors
2. Verify token starts with `pk.` and has correct scopes
3. Check network tab for API call failures
4. Test fallback by temporarily removing Mapbox token

### Environment Variable Issues
1. Restart development server after adding variables
2. Check variable names (case-sensitive)
3. Ensure no trailing spaces in values
4. For Vercel: redeploy after adding variables

## Getting Help

- Formspree: [docs.formspree.io](https://docs.formspree.io)
- Mapbox: [docs.mapbox.com](https://docs.mapbox.com)
- Report issues: Create GitHub issue with error details