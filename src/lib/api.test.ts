import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the API module
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Error Handling', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle HTML responses gracefully instead of JSON parsing error', async () => {
    // Mock a response that returns HTML (simulating a failed proxy or catch-all route)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'text/html' }),
      text: async () => '<!DOCTYPE html><html><head></head><body>Error</body></html>',
    });

    // Import the API module dynamically after mocking
    const { businessAPI } = await import('./api');

    // Attempt to fetch businesses
    await expect(businessAPI.getAll()).rejects.toThrow(
      'API endpoint unavailable. Received HTML instead of JSON. Please ensure the backend server is running.'
    );
  });

  it('should handle non-OK HTML responses with clear error message', async () => {
    // Mock a failed response that returns HTML
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'text/html' }),
      text: async () => '<html><head><title>404 Not Found</title></head><body>Not Found</body></html>',
    });

    // Import the API module dynamically after mocking
    const { businessAPI } = await import('./api');

    // Attempt to fetch businesses
    await expect(businessAPI.getAll()).rejects.toThrow(
      'API endpoint unavailable. Please ensure the backend server is running.'
    );
  });

  it('should parse JSON responses correctly when content-type is application/json', async () => {
    const mockBusinesses = [
      {
        id: '1',
        name: 'Test Business',
        description: 'Test Description',
        category: 'Test Category',
        address: 'Test Address',
        verified: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockBusinesses,
    });

    // Import the API module dynamically after mocking
    const { businessAPI } = await import('./api');

    // Fetch businesses
    const result = await businessAPI.getAll();
    expect(result).toEqual(mockBusinesses);
  });

  it('should handle JSON error responses correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Invalid request parameters' }),
    });

    // Import the API module dynamically after mocking
    const { businessAPI } = await import('./api');

    // Attempt to fetch businesses
    await expect(businessAPI.getAll()).rejects.toThrow('Invalid request parameters');
  });
});
