# External API Integrations - Limpopo Connect

## Overview

Limpopo Connect has been enhanced with 10 external API integrations to provide real-time data, improve user engagement, and deliver dynamic content to the community platform.

---

## 🔗 Integrated APIs

### 1. **IPInfo.io** - Location Detection
- **Purpose**: Auto-detect visitor's location for localized content
- **Tier**: Free (50,000 requests/month)
- **Setup**: Optional API token in `VITE_IPINFO_TOKEN`
- **Fallback**: Defaults to Polokwane, Limpopo coordinates
- **Service**: `/src/services/location.ts`

### 2. **OpenWeatherMap** - Weather Data
- **Purpose**: Display current weather and forecasts
- **Tier**: Free (1,000 requests/day)
- **Setup**: Required `VITE_OPENWEATHERMAP_API_KEY`
- **Component**: `<WeatherWidget />`
- **Service**: `/src/services/weather.ts`

### 3. **NewsData.io** - News Feed
- **Purpose**: Latest Limpopo and South African news
- **Tier**: Free (200 requests/day)
- **Setup**: Required `VITE_NEWSDATA_API_KEY`
- **Component**: `<NewsFeed />`
- **Service**: `/src/services/news.ts`
- **Fallback**: Mock news data when API unavailable

### 4. **REST Countries API** - Country Metadata
- **Purpose**: Display flags, dialing codes, and country info
- **Tier**: Free (no API key required)
- **Service**: `/src/services/country.ts`
- **Cache**: 7 days

### 5. **Unsplash API** - Hero Images
- **Purpose**: Beautiful background images for hero sections
- **Tier**: Free (50 requests/hour)
- **Setup**: Optional `VITE_UNSPLASH_ACCESS_KEY`
- **Component**: `<HeroImageBanner />`
- **Service**: `/src/services/images.ts`

### 6. **Google Maps / Mapbox** - Map Display
- **Purpose**: Show local services and points of interest
- **Tier**: Google Maps embed (free), Mapbox (50k loads/month)
- **Setup**: Optional `VITE_MAPBOX_TOKEN`
- **Component**: `<MapView />`
- **Service**: `/src/services/maps.ts`
- **Fallback**: OpenStreetMap embed (always free)

### 7. **Nager.Date** - Public Holidays
- **Purpose**: Display South African public holidays
- **Tier**: Free (no API key required)
- **Component**: `<HolidayCalendar />`
- **Service**: `/src/services/holidays.ts`

### 8. **ExchangeRate.host** - Currency Converter
- **Purpose**: Currency conversion for local businesses
- **Tier**: Free (no API key required)
- **Component**: `<CurrencyConverter />`
- **Service**: `/src/services/exchangeRate.ts`

### 9. **Formspree** - Contact Forms
- **Purpose**: Handle contact form submissions
- **Tier**: Free (50 submissions/month)
- **Setup**: Required `VITE_FORMSPREE_FORM_ID`
- **Service**: `/src/services/contactForm.ts`
- **Use Case**: Fallback for email functionality

### 10. **Supabase** - Auth + Database
- **Purpose**: User accounts, community posts, cached data
- **Already integrated**: Core platform functionality
- **Existing Config**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 📁 Project Structure

```
src/
├── services/              # API service layer
│   ├── index.ts          # Export all services
│   ├── types.ts          # TypeScript interfaces
│   ├── utils.ts          # Caching & error handling
│   ├── location.ts       # IPInfo.io
│   ├── weather.ts        # OpenWeatherMap
│   ├── news.ts           # NewsData.io
│   ├── country.ts        # REST Countries
│   ├── images.ts         # Unsplash
│   ├── maps.ts           # Google Maps / Mapbox
│   ├── holidays.ts       # Nager.Date
│   ├── exchangeRate.ts   # ExchangeRate.host
│   └── contactForm.ts    # Formspree
│
├── components/           # UI components
│   ├── WeatherWidget.tsx
│   ├── NewsFeed.tsx
│   ├── MapView.tsx
│   ├── HolidayCalendar.tsx
│   ├── CurrencyConverter.tsx
│   └── HeroImageBanner.tsx
│
└── pages/
    ├── Home.tsx          # Enhanced with widgets
    └── VisitorDashboard.tsx  # Enhanced with widgets
```

---

## 🔐 Environment Variables

Add to `.env.local`:

```env
# ============================================
# EXTERNAL API KEYS (OPTIONAL INTEGRATIONS)
# ============================================

# IPInfo.io (optional)
VITE_IPINFO_TOKEN=your-ipinfo-token

# OpenWeatherMap (optional but recommended)
VITE_OPENWEATHERMAP_API_KEY=your-openweathermap-key

# NewsData.io (optional but recommended)
VITE_NEWSDATA_API_KEY=your-newsdata-key

# Unsplash (optional)
VITE_UNSPLASH_ACCESS_KEY=your-unsplash-access-key

# Mapbox (optional)
VITE_MAPBOX_TOKEN=your-mapbox-token

# Formspree (optional)
VITE_FORMSPREE_FORM_ID=your-formspree-form-id
```

### Vercel Deployment

Add these to **Vercel Dashboard → Settings → Environment Variables**:

1. Select **Production, Preview, Development** for all
2. Mark as **Plain Text** (these are client-side keys)
3. **DO NOT** mark as secret (they're meant for frontend)

---

## 🎨 Components Usage

### WeatherWidget

```tsx
import { WeatherWidget } from '@/components/WeatherWidget';

<WeatherWidget />
```

Features:
- Auto-detects user location
- Shows current temperature
- Displays weather icon
- Shows feels-like, humidity, min/max temps
- Caches data for 30 minutes

### NewsFeed

```tsx
import { NewsFeed } from '@/components/NewsFeed';

<NewsFeed 
  maxArticles={5} 
  category="limpopo"  // 'limpopo' | 'south-africa' | 'community'
/>
```

Features:
- Displays latest news articles
- Shows relative time (e.g., "2h ago")
- External links to full articles
- Mock data fallback
- Caches for 15 minutes

### MapView

```tsx
import { MapView } from '@/components/MapView';

<MapView 
  lat={-23.9}
  lng={29.45}
  title="Polokwane"
  height="400px"
  showDirections={true}
/>
```

Features:
- Google Maps embed (free)
- Auto-location detection
- Get directions link
- Responsive iframe

### HolidayCalendar

```tsx
import { HolidayCalendar } from '@/components/HolidayCalendar';

<HolidayCalendar 
  maxHolidays={5}
  showUpcomingOnly={true}
/>
```

Features:
- South African public holidays
- Countdown to next holiday
- National vs regional indicators
- Caches for 24 hours

### CurrencyConverter

```tsx
import { CurrencyConverter } from '@/components/CurrencyConverter';

<CurrencyConverter />
```

Features:
- ZAR, USD, EUR, GBP support
- Real-time exchange rates
- Swap currencies button
- Caches for 1 hour

### HeroImageBanner

```tsx
import { HeroImageBanner } from '@/components/HeroImageBanner';

<HeroImageBanner 
  query="community nature africa"
  height="500px"
  overlay={true}
>
  <h1>Your Content Here</h1>
</HeroImageBanner>
```

Features:
- Beautiful hero images
- Photo attribution
- Gradient overlay
- Custom query support

---

## 🚀 Implementation Highlights

### 1. Caching Strategy

All API services use an in-memory cache to:
- Reduce API calls and avoid rate limits
- Improve performance
- Provide faster page loads

Cache durations:
- Location: 24 hours
- Weather: 30 minutes
- News: 15 minutes
- Holidays: 24 hours
- Exchange rates: 1 hour
- Images: 1 hour
- Countries: 7 days

### 2. Error Handling

Services implement graceful degradation:
- Silent failures (components hide when APIs unavailable)
- Fallback data (mock news, default locations)
- User-friendly error messages
- Console warnings for debugging

### 3. TypeScript Types

All API responses are fully typed:
- `LocationData`
- `WeatherData`
- `NewsArticle`
- `PublicHoliday`
- `ExchangeRate`
- `UnsplashImage`
- etc.

### 4. Performance

- Async/await for all API calls
- 10-second timeout on requests
- AbortController for request cancellation
- Lazy loading of components
- Minimal re-fetching logic

---

## 📊 API Rate Limits

| Service | Free Tier | Daily Limit | Monthly Limit |
|---------|-----------|-------------|---------------|
| IPInfo.io | Yes | ~1,600 | 50,000 |
| OpenWeatherMap | Yes | 1,000 | ~30,000 |
| NewsData.io | Yes | 200 | 6,000 |
| REST Countries | Yes | Unlimited | Unlimited |
| Unsplash | Yes | ~1,200 | ~36,000 |
| Mapbox | Yes | ~1,600 | 50,000 |
| Nager.Date | Yes | Unlimited | Unlimited |
| ExchangeRate | Yes | ~50 | 1,500 |
| Formspree | Yes | ~1.6 | 50 |

**Note**: With caching enabled, actual API usage is significantly lower than these limits.

---

## 🧪 Testing

### Manual Testing

1. **Home Page**:
   - Weather widget displays in "Discover Limpopo" section
   - News feed shows 3 articles
   - Holiday calendar shows upcoming holidays

2. **Visitor Dashboard**:
   - Weather widget displays
   - Currency converter functional
   - Map shows Polokwane location

### Component Testing

```tsx
// Example test (if you have Vitest set up)
import { render, screen } from '@testing-library/react';
import { WeatherWidget } from '@/components/WeatherWidget';

test('renders weather widget', () => {
  render(<WeatherWidget />);
  // Add assertions
});
```

---

## 🐛 Troubleshooting

### No Weather Showing
- Check `VITE_OPENWEATHERMAP_API_KEY` is set
- Verify API key is valid
- Check browser console for errors

### News Not Loading
- Check `VITE_NEWSDATA_API_KEY` is set
- Note: Free tier has 200 requests/day limit
- Fallback mock news should display if API fails

### Map Not Displaying
- Google Maps embed works without API key
- Check iframe is not blocked by CSP
- Verify coordinates are valid

### API Key Not Working
- Environment variables must start with `VITE_`
- Restart dev server after adding env vars
- Check Vercel dashboard for production

---

## 📚 Additional Resources

- [IPInfo.io Docs](https://ipinfo.io/developers)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [NewsData.io Docs](https://newsdata.io/documentation)
- [REST Countries API](https://restcountries.com/)
- [Unsplash API](https://unsplash.com/documentation)
- [Mapbox Docs](https://docs.mapbox.com/)
- [Nager.Date API](https://date.nager.at/Api)
- [ExchangeRate.host](https://exchangerate.host/)
- [Formspree Docs](https://help.formspree.io/)

---

## 🎯 Next Steps

1. **Obtain API Keys**: Sign up for services you want to use
2. **Add to .env.local**: Configure environment variables
3. **Test Locally**: Run `npm run dev` and test widgets
4. **Deploy to Vercel**: Add env vars to Vercel dashboard
5. **Monitor Usage**: Track API usage to stay within limits

---

**Last Updated**: October 12, 2025  
**Status**: ✅ Production Ready
