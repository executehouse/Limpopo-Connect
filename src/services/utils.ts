import type { CachedData, ApiError } from './types';

// Cache duration in milliseconds
export const CACHE_DURATIONS = {
  LOCATION: 24 * 60 * 60 * 1000, // 24 hours
  WEATHER: 30 * 60 * 1000, // 30 minutes
  NEWS: 15 * 60 * 1000, // 15 minutes
  HOLIDAYS: 24 * 60 * 60 * 1000, // 24 hours
  EXCHANGE_RATES: 60 * 60 * 1000, // 1 hour
  IMAGES: 60 * 60 * 1000, // 1 hour
  COUNTRY: 7 * 24 * 60 * 60 * 1000, // 7 days
};

class CacheManager {
  private cache: Map<string, CachedData<unknown>>;

  constructor() {
    this.cache = new Map();
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  set<T>(key: string, data: T, duration: number): void {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    };
    this.cache.set(key, cached as CachedData<unknown>);
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

export const cache = new CacheManager();

export class ApiServiceError extends Error implements ApiError {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiServiceError';
    this.code = code;
    this.status = status;
  }
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiServiceError('Request timeout', 'TIMEOUT', 408);
    }
    throw error;
  }
}

export function handleApiError(error: unknown, serviceName: string): never {
  console.error(`${serviceName} Error:`, error);

  if (error instanceof ApiServiceError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new ApiServiceError(
      `${serviceName} failed: ${error.message}`,
      'UNKNOWN_ERROR'
    );
  }

  throw new ApiServiceError(
    `${serviceName} failed with unknown error`,
    'UNKNOWN_ERROR'
  );
}

export function getEnvVar(key: string): string | undefined {
  return import.meta.env[key];
}

export function requireEnvVar(key: string, serviceName: string): string {
  const value = getEnvVar(key);
  if (!value) {
    throw new ApiServiceError(
      `${serviceName} requires ${key} environment variable`,
      'MISSING_API_KEY'
    );
  }
  return value;
}
