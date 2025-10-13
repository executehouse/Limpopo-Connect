# Add Formspree Contact Form + Interactive Mapbox Integration

This PR implements the remaining two integrations for Limpopo Connect: Formspree contact form service and interactive Mapbox maps with OpenStreetMap fallbacks.

## 🚀 What's Added

### 1. Enhanced Contact Form Service (`src/services/contactForm.ts`)
- **Primary**: Formspree API integration with proper error handling
- **Fallback 1**: Supabase database storage when Formspree unavailable
- **Fallback 2**: User-friendly error message for complete service failures
- **Rate Limiting**: 30-minute cooldown on 429 responses with localStorage tracking
- **Timeout**: 10-second timeout with graceful degradation

### 2. Accessible ContactForm Component (`src/components/ContactForm.tsx`)
- **Accessibility**: ARIA attributes, proper labels, keyboard navigation
- **Touch-Friendly**: Large input fields optimized for Samsung tablets
- **Validation**: Real-time client-side validation with user feedback
- **Anti-Spam**: Honeypot field for bot detection
- **Progress States**: Loading, success, error with clear messaging
- **Analytics**: Optional Supabase logging for form submissions

### 3. Interactive MapView with Fallbacks (`src/components/MapView.tsx` + `src/components/MapboxMap.tsx`)
- **Primary**: Interactive Mapbox GL JS with react-map-gl
- **Fallback**: OpenStreetMap iframe embed (always available)
- **Performance**: Lazy loading with React.Suspense
- **Accessibility**: Touch-friendly zoom controls, proper ARIA attributes
- **Features**: Marker placement, directions link, fullscreen controls

### 4. Enhanced Maps Service (`src/services/maps.ts`)
- **Token Management**: Robust Mapbox token validation
- **URL Generation**: Static map URLs with markers
- **Coordinate Validation**: Boundary checking for lat/lng
- **Distance Calculation**: Haversine formula for coordinate distance
- **Fallback URLs**: OpenStreetMap and Google Maps directions

## 📦 Dependencies Added

```json
{
  "react-map-gl": "^7.1.7",
  "mapbox-gl": "^3.0.1", 
  "@types/mapbox-gl": "^3.1.0",
  "msw": "^2.0.0"
}
```

## 🔧 Environment Variables

### Required for Full Functionality
```bash
# Contact Form (Primary)
VITE_FORMSPREE_FORM_ID=your_form_id

# Interactive Maps (Primary)  
VITE_MAPBOX_TOKEN=pk.your_mapbox_token

# Database (Fallback - usually pre-configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Graceful Degradation
- **No Formspree**: Falls back to Supabase `contacts` table
- **No Mapbox**: Falls back to OpenStreetMap iframe
- **No Supabase**: Shows user-friendly error with contact email
- **No APIs**: Components still render with helpful messages

## 🧪 Testing

### Unit Tests Added
- `src/services/__tests__/contactForm.test.ts` - 15+ test cases with MSW
- `src/services/__tests__/maps.test.ts` - 10+ test cases for all functions  
- `src/components/__tests__/ContactForm.test.tsx` - 12+ component tests

### Test Coverage
- ✅ Success flows (Formspree + Mapbox)
- ✅ Fallback flows (Supabase + OSM)
- ✅ Error handling and validation
- ✅ Rate limiting and cooldowns
- ✅ Accessibility and user interactions

### Run Tests
```bash
npm run test src/services/__tests__
npm run test src/components/__tests__/ContactForm.test.tsx
```

## 📖 Documentation

### Added Files
- `docs/api-keys.md` - Comprehensive setup guide
- `.env.local.example` - Environment variable template

### Key Documentation
- How to obtain Formspree form IDs and Mapbox tokens
- Vercel environment variable configuration
- Fallback behavior explanations
- Troubleshooting common issues
- Rate limiting and usage monitoring

## 🎯 Manual Testing Steps

### Contact Form
1. **Success Flow**:
   - Fill valid form → Submit → See success message
   - Check Formspree dashboard for submission
   
2. **Validation**:
   - Submit empty form → See validation errors
   - Enter invalid email → See email validation error
   
3. **Fallback**:
   - Remove `VITE_FORMSPREE_FORM_ID` → Submit → Should save to Supabase
   - Remove Supabase vars → Submit → Should show fallback message

### Interactive Maps
1. **Mapbox Flow**:
   - Set `VITE_MAPBOX_TOKEN` → Load page → See interactive map
   - Test zoom, pan, fullscreen controls
   
2. **Fallback**:
   - Remove token → Reload → Should show OpenStreetMap iframe
   - Test directions link functionality

### Accessibility
- Test keyboard navigation (Tab, Enter, Esc)
- Test with screen reader (form labels, map descriptions)
- Test on mobile/tablet (touch targets, zoom controls)

## 🔄 Migration Notes

### For Existing Users
- All changes are backwards compatible
- Existing MapView usage continues to work
- ContactFormService class maintains legacy API
- No breaking changes to existing functionality

### New Usage Patterns
```tsx
// Contact Form
import { ContactForm } from '@/components/ContactForm';

<ContactForm 
  formId="custom-form"
  onSuccess={(result) => console.log('Sent!', result)}
  onError={(error) => console.error('Failed:', error)}
/>

// Interactive Map
import { MapView } from '@/components/MapView';

<MapView 
  lat={-23.9} 
  lng={29.45} 
  title="Polokwane Office"
  showDirections={true}
  interactive={true}
/>
```

## 🚨 Breaking Changes

**None** - All changes are additive and backwards compatible.

## 🔍 Code Quality

### TypeScript
- ✅ Strict type checking passes
- ✅ All new types exported from `src/services/types.ts`
- ✅ Proper error handling with typed responses

### ESLint  
- ✅ All new code follows project linting rules
- ✅ Accessibility linting for form components
- ✅ React hooks linting compliance

### Performance
- ✅ Lazy loading for heavy Mapbox library
- ✅ Efficient re-renders with useCallback
- ✅ Proper cleanup of event listeners and timers

## 📊 Bundle Impact

### Added to Bundle
- `react-map-gl`: ~15KB gzipped (lazy loaded)
- `mapbox-gl`: ~200KB gzipped (lazy loaded) 
- Contact form components: ~8KB gzipped

### Mitigations
- Mapbox only loads when token available and interactive maps requested
- MSW only in devDependencies for testing
- Tree shaking eliminates unused functions

## ✅ Checklist

- [x] Contact form with Formspree integration
- [x] Supabase fallback for contact form
- [x] Interactive Mapbox maps with react-map-gl  
- [x] OpenStreetMap fallback for maps
- [x] Comprehensive unit tests (25+ test cases)
- [x] TypeScript types and strict checking
- [x] Accessibility compliance (ARIA, keyboard nav)
- [x] Touch-friendly mobile/tablet support
- [x] Environment variable documentation
- [x] Error handling and user feedback
- [x] Rate limiting and cooldown logic
- [x] Performance optimization (lazy loading)
- [x] Backwards compatibility maintained

## 🔮 Future Enhancements

### Serverless Proxy (Optional)
- Move API keys to server-side for enhanced security
- Implement in Vercel Edge Functions or similar
- Add request signing and rate limiting server-side

### Advanced Map Features
- Clustering for multiple markers
- Custom marker styling
- Geolocation integration
- Offline map caching

### Form Enhancements  
- File upload support
- Multi-step forms
- Real-time validation API
- CAPTCHA integration

---

**Ready for Review** ✨

This implementation follows all existing project conventions, includes comprehensive testing, maintains backwards compatibility, and provides graceful fallbacks for a production-ready user experience.