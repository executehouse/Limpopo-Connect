import type { PublicHoliday } from './types';
import { cache, CACHE_DURATIONS, fetchWithTimeout, handleApiError } from './utils';

const CACHE_KEY = 'public-holidays';

/**
 * Holiday Service using Nager.Date API
 * Fetches public holidays for South Africa
 * No API key required - completely free
 */
export class HolidayService {
  private readonly baseUrl = 'https://date.nager.at/api/v3';

  async getHolidays(year: number, countryCode: string = 'ZA'): Promise<PublicHoliday[]> {
    const cacheKey = `${CACHE_KEY}-${year}-${countryCode}`;
    const cached = cache.get<PublicHoliday[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/PublicHolidays/${year}/${countryCode}`;
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`Holiday API error: ${response.status}`);
      }

      const holidays = await response.json() as PublicHoliday[];
      cache.set(cacheKey, holidays, CACHE_DURATIONS.HOLIDAYS);
      return holidays;
    } catch (error) {
      return handleApiError(error, 'Holiday Service');
    }
  }

  async getCurrentYearHolidays(): Promise<PublicHoliday[]> {
    const year = new Date().getFullYear();
    return this.getHolidays(year);
  }

  async getUpcomingHolidays(): Promise<PublicHoliday[]> {
    const holidays = await this.getCurrentYearHolidays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate >= today;
    });
  }

  async getNextHoliday(): Promise<PublicHoliday | null> {
    const upcoming = await this.getUpcomingHolidays();
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  async isHolidayToday(): Promise<boolean> {
    const holidays = await this.getCurrentYearHolidays();
    const today = new Date().toISOString().split('T')[0];

    return holidays.some((holiday) => holiday.date === today);
  }

  clearCache(): void {
    cache.clear(CACHE_KEY);
  }
}

export const holidayService = new HolidayService();
