import type { CountryData } from './types';
import { cache, CACHE_DURATIONS, fetchWithTimeout, handleApiError } from './utils';

const CACHE_KEY = 'country-data';

/**
 * Country Service using REST Countries API
 * Fetches country information including flags and dialing codes
 * No API key required - completely free
 */
export class CountryService {
  private readonly baseUrl = 'https://restcountries.com/v3.1';

  async getCountryByCode(code: string): Promise<CountryData | null> {
    const cacheKey = `${CACHE_KEY}-${code}`;
    const cached = cache.get<CountryData>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/alpha/${code}`;
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`Country API error: ${response.status}`);
      }

      const data = await response.json();
      const countryData: CountryData = data[0];

      cache.set(cacheKey, countryData, CACHE_DURATIONS.COUNTRY);
      return countryData;
    } catch (error) {
      return handleApiError(error, 'Country Service');
    }
  }

  async getSouthAfricaInfo(): Promise<CountryData | null> {
    return this.getCountryByCode('ZA');
  }

  async getCountryFlag(code: string): Promise<string | null> {
    const country = await this.getCountryByCode(code);
    return country?.flags.svg || null;
  }

  async getDialingCode(code: string): Promise<string | null> {
    const country = await this.getCountryByCode(code);
    if (!country) return null;

    const root = country.idd.root || '';
    const suffix = country.idd.suffixes?.[0] || '';
    return root + suffix;
  }

  clearCache(): void {
    cache.clear(CACHE_KEY);
  }
}

export const countryService = new CountryService();
