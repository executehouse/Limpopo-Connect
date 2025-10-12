import type { WeatherData, WeatherForecast } from './types';
import { cache, CACHE_DURATIONS, fetchWithTimeout, handleApiError, getEnvVar } from './utils';

const CACHE_KEY_CURRENT = 'weather-current';
const CACHE_KEY_FORECAST = 'weather-forecast';

/**
 * Weather Service using OpenWeatherMap API
 * Provides current weather and 5-day forecast
 * Free tier: 1,000 requests/day
 */
export class WeatherService {
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.apiKey = getEnvVar('VITE_OPENWEATHERMAP_API_KEY');
  }

  private checkApiKey(): boolean {
    if (!this.apiKey) {
      console.warn('OpenWeatherMap API key not configured');
      return false;
    }
    return true;
  }

  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
    if (!this.checkApiKey()) return null;

    const cacheKey = `${CACHE_KEY_CURRENT}-${lat}-${lng}`;
    const cached = cache.get<WeatherData>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      const weatherData: WeatherData = {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name,
      };

      cache.set(cacheKey, weatherData, CACHE_DURATIONS.WEATHER);
      return weatherData;
    } catch (error) {
      return handleApiError(error, 'Weather Service');
    }
  }

  async getForecast(lat: number, lng: number): Promise<WeatherForecast[] | null> {
    if (!this.checkApiKey()) return null;

    const cacheKey = `${CACHE_KEY_FORECAST}-${lat}-${lng}`;
    const cached = cache.get<WeatherForecast[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`;
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();

      // Get one forecast per day (noon)
      const forecast: WeatherForecast[] = data.list
        .filter((_: unknown, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((item: {
          dt_txt: string;
          main: { temp: number };
          weather: Array<{ description: string; icon: string }>;
        }) => ({
          date: item.dt_txt.split(' ')[0],
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        }));

      cache.set(cacheKey, forecast, CACHE_DURATIONS.WEATHER);
      return forecast;
    } catch (error) {
      return handleApiError(error, 'Forecast Service');
    }
  }

  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  clearCache(): void {
    cache.clear(CACHE_KEY_CURRENT);
    cache.clear(CACHE_KEY_FORECAST);
  }
}

export const weatherService = new WeatherService();
