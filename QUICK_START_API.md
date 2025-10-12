# Quick Start Guide - API Integration Setup

## 🚀 Getting Started (5 Minutes)

This guide will help you quickly set up the external API integrations for Limpopo Connect.

---

## Prerequisites

- Node.js 18+
- npm or yarn
- Existing `.env.local` file (or copy from `.env.example`)

---

## Step 1: Sign Up for API Keys (Optional)

Most APIs work without keys (with fallbacks), but for full functionality:

### Free & Recommended:

1. **OpenWeatherMap** (Weather data)
   - Sign up: https://openweathermap.org/api
   - Free tier: 1,000 calls/day
   - Get: API Key
   - **Recommended for best experience**

2. **NewsData.io** (News feed)
   - Sign up: https://newsdata.io/register
   - Free tier: 200 calls/day
   - Get: API Key
   - **Recommended for real news**

### Optional (Nice to Have):

3. **IPInfo.io** (Location detection)
   - Sign up: https://ipinfo.io/signup
   - Free tier: 50,000 calls/month
   - Works without key (limited features)

4. **Unsplash** (Hero images)
   - Sign up: https://unsplash.com/developers
   - Free tier: 50 calls/hour
   - Optional for better images

5. **Mapbox** (Enhanced maps)
   - Sign up: https://account.mapbox.com/
   - Free tier: 50,000 loads/month
   - Optional (uses Google Maps by default)

6. **Formspree** (Contact forms)
   - Sign up: https://formspree.io/
   - Free tier: 50 submissions/month
   - Only if you need contact forms

### Already Free (No Sign-Up):

- ✅ REST Countries API (country info)
- ✅ Nager.Date API (public holidays)
- ✅ ExchangeRate.host (currency conversion)
- ✅ Google Maps Embed (basic maps)

---

## Step 2: Configure Environment Variables

### Local Development

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your API keys to `.env.local`:
   ```env
   # Optional but recommended
   VITE_OPENWEATHERMAP_API_KEY=your-key-here
   VITE_NEWSDATA_API_KEY=your-key-here
   
   # Optional
   VITE_IPINFO_TOKEN=your-token-here
   VITE_UNSPLASH_ACCESS_KEY=your-key-here
   VITE_MAPBOX_TOKEN=your-token-here
   VITE_FORMSPREE_FORM_ID=your-form-id
   ```

3. **Important**: Never commit `.env.local` to git!

### Vercel Production

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

2. Add each variable:
   - Name: `VITE_OPENWEATHERMAP_API_KEY`
   - Value: `your-key-here`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. Click **Save**

4. Redeploy your app for changes to take effect

---

## Step 3: Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Step 4: Verify Integration

### Check Home Page
- Navigate to: http://localhost:5000
- Scroll to "Discover Limpopo" section
- You should see:
  - ✅ **News Feed** (shows mock data if no API key)
  - ✅ **Weather Widget** (if OpenWeatherMap key configured)
  - ✅ **Holiday Calendar** (always works)

### Check Visitor Dashboard
- Navigate to: http://localhost:5000/dashboard/visitor
- You should see:
  - ✅ **Currency Converter** (always works)
  - ✅ **Map View** (always works with Google Maps)

---

## Troubleshooting

### Issue: No Weather Showing
**Solution**: Add `VITE_OPENWEATHERMAP_API_KEY` to `.env.local` and restart dev server

### Issue: Only Mock News
**Solution**: Add `VITE_NEWSDATA_API_KEY` to `.env.local` and restart dev server

### Issue: Components Not Showing
**Solution**: Check browser console for errors. Most APIs fail silently.

### Issue: Map Not Loading
**Solution**: Check if iframe is blocked by browser. Google Maps embed should work without API key.

### Issue: Changes Not Reflecting
**Solution**: 
```bash
# Stop dev server (Ctrl+C)
# Restart
npm run dev
```

---

## Component Usage Examples

### Weather Widget
```tsx
import { WeatherWidget } from '@/components/WeatherWidget';

<WeatherWidget />
```

### News Feed
```tsx
import { NewsFeed } from '@/components/NewsFeed';

<NewsFeed maxArticles={5} category="limpopo" />
```

### Currency Converter
```tsx
import { CurrencyConverter } from '@/components/CurrencyConverter';

<CurrencyConverter />
```

### Map View
```tsx
import { MapView } from '@/components/MapView';

<MapView 
  lat={-23.9} 
  lng={29.45} 
  title="Polokwane"
  height="400px"
/>
```

### Holiday Calendar
```tsx
import { HolidayCalendar } from '@/components/HolidayCalendar';

<HolidayCalendar maxHolidays={5} showUpcomingOnly={true} />
```

---

## Rate Limits Summary

| Service | Free Tier | Recommended Usage |
|---------|-----------|-------------------|
| OpenWeatherMap | 1,000/day | Weather widget on dashboards |
| NewsData.io | 200/day | News feed on home page |
| IPInfo.io | 50,000/month | Location detection |
| Unsplash | 50/hour | Hero images |
| Mapbox | 50,000/month | Interactive maps |
| Others | Unlimited | Always available |

With caching enabled, actual usage is **much lower** than these limits!

---

## Next Steps

1. ✅ Get API keys from recommended services
2. ✅ Add keys to `.env.local`
3. ✅ Run `npm run dev` to test
4. ✅ Add keys to Vercel for production
5. ✅ Deploy and verify on production site

---

## Support

- Full documentation: [API_INTEGRATIONS.md](./API_INTEGRATIONS.md)
- Project summary: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- Issues: https://github.com/Tshikwetamakole/Limpopo-Connect/issues

---

**Last Updated**: October 12, 2025  
**Time to Complete**: ~5 minutes (with API keys already obtained)
