// Type definitions for external API responses

export interface LocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string; // "lat,lng"
  timezone: string;
}

export interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  description: string;
  icon: string;
  city: string;
}

export interface WeatherForecast {
  date: string;
  temp: number;
  description: string;
  icon: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  link: string;
  image_url: string | null;
  pubDate: string;
  source_id: string;
  category: string[];
}

export interface CountryData {
  name: {
    common: string;
    official: string;
  };
  flags: {
    png: string;
    svg: string;
  };
  idd: {
    root: string;
    suffixes: string[];
  };
  region: string;
  capital: string[];
}

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
  };
  alt_description: string;
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}

export interface ExchangeRate {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
