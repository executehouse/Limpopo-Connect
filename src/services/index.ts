// Export all API services
export { locationService, LocationService } from './location';
export { weatherService, WeatherService } from './weather';
export { newsService, NewsService } from './news';
export { countryService, CountryService } from './country';
export { imageService, ImageService } from './images';
export { holidayService, HolidayService } from './holidays';
export { exchangeRateService, ExchangeRateService } from './exchangeRate';
export { contactFormService, ContactFormService, submitContact } from './contactForm';
export { mapService, MapService, getMapboxToken, getMapboxStyleUrl, getDirectionsUrl, getOpenStreetMapEmbedUrl } from './maps';

// Export types
export type {
  LocationData,
  WeatherData,
  WeatherForecast,
  NewsArticle,
  CountryData,
  UnsplashImage,
  PublicHoliday,
  ExchangeRate,
  CachedData,
  ApiError,
  ContactFormData,
  ContactSubmissionResponse,
  FormspreeResponse,
  MapboxStyleConfig,
  MapViewConfig,
} from './types';

export type { MapMarker } from './maps';

// Export utilities
export { cache, CACHE_DURATIONS, ApiServiceError } from './utils';
