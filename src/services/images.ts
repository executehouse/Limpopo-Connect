import type { UnsplashImage } from './types';
import { cache, CACHE_DURATIONS, fetchWithTimeout, handleApiError, getEnvVar } from './utils';

const CACHE_KEY = 'unsplash-images';

/**
 * Image Service using Unsplash API
 * Fetches beautiful images for hero sections and backgrounds
 * Free tier: 50 requests/hour
 */
export class ImageService {
  private readonly accessKey: string | undefined;
  private readonly baseUrl = 'https://api.unsplash.com';

  constructor() {
    this.accessKey = getEnvVar('VITE_UNSPLASH_ACCESS_KEY');
  }

  private checkApiKey(): boolean {
    if (!this.accessKey) {
      console.warn('Unsplash API key not configured');
      return false;
    }
    return true;
  }

  async getRandomImage(query: string = 'community nature'): Promise<UnsplashImage | null> {
    if (!this.checkApiKey()) return null;

    const cacheKey = `${CACHE_KEY}-${query}`;
    const cached = cache.get<UnsplashImage>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        query,
        orientation: 'landscape',
      });

      const url = `${this.baseUrl}/photos/random?${params.toString()}`;
      const response = await fetchWithTimeout(url, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const image = await response.json() as UnsplashImage;
      cache.set(cacheKey, image, CACHE_DURATIONS.IMAGES);
      return image;
    } catch (error) {
      return handleApiError(error, 'Image Service');
    }
  }

  async getCommunityImage(): Promise<UnsplashImage | null> {
    return this.getRandomImage('community people africa');
  }

  async getNatureImage(): Promise<UnsplashImage | null> {
    return this.getRandomImage('nature landscape africa');
  }

  async getTourismImage(): Promise<UnsplashImage | null> {
    return this.getRandomImage('south africa tourism wildlife');
  }

  clearCache(): void {
    cache.clear(CACHE_KEY);
  }
}

export const imageService = new ImageService();
