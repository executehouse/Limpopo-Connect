import type { NewsArticle } from './types';
import { cache, CACHE_DURATIONS, fetchWithTimeout, getEnvVar } from './utils';

const CACHE_KEY = 'news-articles';

/**
 * News Service using NewsData.io API
 * Fetches latest news from South Africa and Limpopo
 * Free tier: 200 requests/day
 */
export class NewsService {
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://newsdata.io/api/1';

  constructor() {
    this.apiKey = getEnvVar('VITE_NEWSDATA_API_KEY');
  }

  private checkApiKey(): boolean {
    if (!this.apiKey) {
      console.warn('NewsData API key not configured');
      return false;
    }
    return true;
  }

  async getNews(
    country: string = 'za',
    category?: string,
    query?: string
  ): Promise<NewsArticle[]> {
    if (!this.checkApiKey()) return this.getMockNews();

    const cacheKey = `${CACHE_KEY}-${country}-${category || 'all'}-${query || ''}`;
    const cached = cache.get<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        apikey: this.apiKey!,
        country,
        language: 'en',
      });

      if (category) params.append('category', category);
      if (query) params.append('q', query);

      const url = `${this.baseUrl}/news?${params.toString()}`;
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      const articles: NewsArticle[] = data.results || [];

      cache.set(cacheKey, articles, CACHE_DURATIONS.NEWS);
      return articles;
    } catch (error) {
      console.error('News service error:', error);
      return this.getMockNews();
    }
  }

  async getLimpopoNews(): Promise<NewsArticle[]> {
    return this.getNews('za', undefined, 'Limpopo');
  }

  async getSouthAfricaNews(): Promise<NewsArticle[]> {
    return this.getNews('za');
  }

  async getCommunityNews(): Promise<NewsArticle[]> {
    return this.getNews('za', undefined, 'community OR local');
  }

  private getMockNews(): NewsArticle[] {
    // Fallback mock data when API is not available
    return [
      {
        title: 'Limpopo Community Development Initiative Launched',
        description: 'New community development program aims to support local businesses and create opportunities for residents.',
        link: '#',
        image_url: null,
        pubDate: new Date().toISOString(),
        source_id: 'local-news',
        category: ['community'],
      },
      {
        title: 'Tourism Grows in Limpopo Province',
        description: 'The province sees increased tourism activity with visitors exploring natural attractions and cultural sites.',
        link: '#',
        image_url: null,
        pubDate: new Date(Date.now() - 86400000).toISOString(),
        source_id: 'local-news',
        category: ['tourism'],
      },
      {
        title: 'Local Business Directory Expands',
        description: 'More businesses join the Limpopo Connect platform to reach community members.',
        link: '#',
        image_url: null,
        pubDate: new Date(Date.now() - 172800000).toISOString(),
        source_id: 'local-news',
        category: ['business'],
      },
    ];
  }

  clearCache(): void {
    cache.clear(CACHE_KEY);
  }
}

export const newsService = new NewsService();
