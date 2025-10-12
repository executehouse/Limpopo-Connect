import type { ExchangeRate } from './types';
import { cache, CACHE_DURATIONS, fetchWithTimeout, handleApiError } from './utils';

const CACHE_KEY = 'exchange-rates';

/**
 * Exchange Rate Service using ExchangeRate.host API
 * Provides currency conversion rates
 * No API key required - completely free
 */
export class ExchangeRateService {
  private readonly baseUrl = 'https://api.exchangerate.host';

  async getRates(base: string = 'ZAR'): Promise<ExchangeRate | null> {
    const cacheKey = `${CACHE_KEY}-${base}`;
    const cached = cache.get<ExchangeRate>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/latest?base=${base}`;
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`Exchange Rate API error: ${response.status}`);
      }

      const data = await response.json() as ExchangeRate;
      cache.set(cacheKey, data, CACHE_DURATIONS.EXCHANGE_RATES);
      return data;
    } catch (error) {
      return handleApiError(error, 'Exchange Rate Service');
    }
  }

  async convert(amount: number, from: string, to: string): Promise<number | null> {
    try {
      const rates = await this.getRates(from);
      if (!rates || !rates.rates[to]) {
        return null;
      }

      return amount * rates.rates[to];
    } catch (error) {
      console.error('Currency conversion error:', error);
      return null;
    }
  }

  async getZARRates(): Promise<ExchangeRate | null> {
    return this.getRates('ZAR');
  }

  async convertFromZAR(amount: number, toCurrency: string): Promise<number | null> {
    return this.convert(amount, 'ZAR', toCurrency);
  }

  async convertToZAR(amount: number, fromCurrency: string): Promise<number | null> {
    return this.convert(amount, fromCurrency, 'ZAR');
  }

  clearCache(): void {
    cache.clear(CACHE_KEY);
  }
}

export const exchangeRateService = new ExchangeRateService();
