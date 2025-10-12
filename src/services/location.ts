import type { LocationData } from './types';
import { cache, CACHE_DURATIONS, fetchWithTimeout, getEnvVar } from './utils';

const CACHE_KEY = 'user-location';

/**
 * Location Service using IPInfo.io
 * Detects user's location based on IP address
 * Free tier: 50,000 requests/month
 */
export class LocationService {
  private readonly apiToken: string | undefined;
  private readonly baseUrl = 'https://ipinfo.io';

  constructor() {
    this.apiToken = getEnvVar('VITE_IPINFO_TOKEN');
  }

  async getLocation(): Promise<LocationData | null> {
    // Check cache first
    const cached = cache.get<LocationData>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    try {
      // If no API token, use free endpoint (limited features)
      const url = this.apiToken
        ? `${this.baseUrl}/json?token=${this.apiToken}`
        : `${this.baseUrl}/json`;

      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        console.warn('Location detection failed, using fallback');
        return this.getFallbackLocation();
      }

      const data = await response.json() as LocationData;

      // Cache the result
      cache.set(CACHE_KEY, data, CACHE_DURATIONS.LOCATION);

      return data;
    } catch (error) {
      console.warn('Location service error:', error);
      return this.getFallbackLocation();
    }
  }

  private getFallbackLocation(): LocationData {
    // Fallback to Limpopo Province coordinates
    return {
      ip: 'unknown',
      city: 'Polokwane',
      region: 'Limpopo',
      country: 'ZA',
      loc: '-23.9,29.45', // Polokwane coordinates
      timezone: 'Africa/Johannesburg',
    };
  }

  async getCoordinates(): Promise<{ lat: number; lng: number }> {
    const location = await this.getLocation();
    if (!location) {
      return { lat: -23.9, lng: 29.45 }; // Polokwane default
    }

    const [lat, lng] = location.loc.split(',').map(Number);
    return { lat, lng };
  }

  clearCache(): void {
    cache.clear(CACHE_KEY);
  }
}

export const locationService = new LocationService();
