import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getMapboxToken, 
  getMapboxStyleUrl, 
  getMapboxStaticUrl,
  getMapboxStaticUrlWithMarker,
  getDirectionsUrl,
  getOpenStreetMapEmbedUrl,
  calculateDistance,
  isValidCoordinates,
  DEFAULT_MAP_CONFIG
} from '../maps';

// Mock environment variables
const mockEnvVars = {
  VITE_MAPBOX_TOKEN: 'pk.test.mapbox.token'
};

vi.mock('../utils', () => ({
  getEnvVar: (key: string) => mockEnvVars[key as keyof typeof mockEnvVars]
}));

describe('Maps Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMapboxToken', () => {
    it('returns token when available', () => {
      const token = getMapboxToken();
      expect(token).toBe('pk.test.mapbox.token');
    });

    it('returns null and warns when token is not available', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock missing token
      vi.doMock('../utils', () => ({
        getEnvVar: () => undefined
      }));

      // Re-import to get mocked version
      const { getMapboxToken: getMapboxTokenMocked } = await import('../maps');
      const token = getMapboxTokenMocked();

      expect(token).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Mapbox token not configured - falling back to OpenStreetMap'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getMapboxStyleUrl', () => {
    it('returns default style URL when token is available', () => {
      const styleUrl = getMapboxStyleUrl();
      expect(styleUrl).toBe('mapbox://styles/mapbox/streets-v11');
    });

    it('accepts custom token parameter', () => {
      const customToken = 'pk.custom.token';
      const styleUrl = getMapboxStyleUrl(customToken);
      expect(styleUrl).toBe('mapbox://styles/mapbox/streets-v11');
    });

    it('returns null when no token is available', () => {
      vi.doMock('../utils', () => ({
        getEnvVar: () => undefined
      }));

      const styleUrl = getMapboxStyleUrl();
      expect(styleUrl).toBeNull();
    });
  });

  describe('getMapboxStaticUrl', () => {
    const lat = -23.9;
    const lng = 29.45;

    it('generates correct static map URL with default parameters', () => {
      const url = getMapboxStaticUrl(lat, lng);
      
      expect(url).toBe(
        `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},12/600x400?access_token=pk.test.mapbox.token`
      );
    });

    it('generates URL with custom parameters', () => {
      const url = getMapboxStaticUrl(lat, lng, 15, 800, 600);
      
      expect(url).toBe(
        `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},15/800x600?access_token=pk.test.mapbox.token`
      );
    });

    it('returns null when token is not available', () => {
      const url = getMapboxStaticUrl(lat, lng, 12, 600, 400, '');
      expect(url).toBeNull();
    });
  });

  describe('getMapboxStaticUrlWithMarker', () => {
    const lat = -23.9;
    const lng = 29.45;

    it('generates correct static map URL with marker', () => {
      const url = getMapboxStaticUrlWithMarker(lat, lng);
      
      expect(url).toBe(
        `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},12/600x400?access_token=pk.test.mapbox.token`
      );
    });

    it('generates URL with custom marker color', () => {
      const url = getMapboxStaticUrlWithMarker(lat, lng, 12, 600, 400, '00ff00');
      
      expect(url).toBe(
        `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+00ff00(${lng},${lat})/${lng},${lat},12/600x400?access_token=pk.test.mapbox.token`
      );
    });

    it('returns null when token is not available', () => {
      const url = getMapboxStaticUrlWithMarker(lat, lng, 12, 600, 400, 'ff0000', '');
      expect(url).toBeNull();
    });
  });

  describe('getDirectionsUrl', () => {
    it('generates correct Google Maps directions URL', () => {
      const lat = -23.9;
      const lng = 29.45;
      const url = getDirectionsUrl(lat, lng);
      
      expect(url).toBe(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    });
  });

  describe('getOpenStreetMapEmbedUrl', () => {
    it('generates correct OSM embed URL', () => {
      const lat = -23.9;
      const lng = 29.45;
      const zoom = 12;
      const url = getOpenStreetMapEmbedUrl(lat, lng, zoom);
      
      // Should contain the coordinates and marker
      expect(url).toContain('openstreetmap.org/export/embed.html');
      expect(url).toContain(`marker=${lat},${lng}`);
      expect(url).toContain('bbox=');
    });

    it('calculates proper bounding box for different zoom levels', () => {
      const lat = -23.9;
      const lng = 29.45;
      
      const url1 = getOpenStreetMapEmbedUrl(lat, lng, 10); // Zoomed out
      const url2 = getOpenStreetMapEmbedUrl(lat, lng, 15); // Zoomed in
      
      expect(url1).toContain('bbox=');
      expect(url2).toContain('bbox=');
      
      // More zoomed in should have smaller bounding box (smaller numbers)
      // This is a basic test - actual implementation would need more precise testing
      expect(url1).not.toBe(url2);
    });
  });

  describe('calculateDistance', () => {
    it('calculates distance between two points correctly', () => {
      // Distance between Polokwane and Johannesburg (approximately 300km)
      const polokwaneLat = -23.9;
      const polokwaneLng = 29.45;
      const johannesburgLat = -26.2;
      const johannesburgLng = 28.0;
      
      const distance = calculateDistance(
        polokwaneLat, 
        polokwaneLng, 
        johannesburgLat, 
        johannesburgLng
      );
      
      // Should be approximately 300km (allow some margin for calculation differences)
      expect(distance).toBeGreaterThan(250);
      expect(distance).toBeLessThan(350);
    });

    it('returns 0 for same coordinates', () => {
      const lat = -23.9;
      const lng = 29.45;
      
      const distance = calculateDistance(lat, lng, lat, lng);
      expect(distance).toBe(0);
    });

    it('handles coordinate edge cases', () => {
      // Test with coordinates at different hemispheres
      const distance = calculateDistance(0, 0, 0, 180);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('isValidCoordinates', () => {
    it('validates correct coordinates', () => {
      expect(isValidCoordinates(-23.9, 29.45)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
    });

    it('rejects invalid coordinates', () => {
      expect(isValidCoordinates(91, 0)).toBe(false); // Latitude too high
      expect(isValidCoordinates(-91, 0)).toBe(false); // Latitude too low
      expect(isValidCoordinates(0, 181)).toBe(false); // Longitude too high
      expect(isValidCoordinates(0, -181)).toBe(false); // Longitude too low
      expect(isValidCoordinates(NaN, 0)).toBe(false); // NaN latitude
      expect(isValidCoordinates(0, NaN)).toBe(false); // NaN longitude
      expect(isValidCoordinates('23.9' as any, 29.45)).toBe(false); // String instead of number
    });
  });

  describe('DEFAULT_MAP_CONFIG', () => {
    it('has correct default configuration for Limpopo', () => {
      expect(DEFAULT_MAP_CONFIG).toEqual({
        center: [29.45, -23.9], // [lng, lat] for Polokwane
        zoom: 10,
        pitch: 0,
        bearing: 0
      });
    });

    it('uses valid coordinates for center', () => {
      const [lng, lat] = DEFAULT_MAP_CONFIG.center;
      expect(isValidCoordinates(lat, lng)).toBe(true);
    });
  });

  describe('Legacy MapService class', () => {
    it('maintains backwards compatibility', async () => {
      const { MapService } = await import('../maps');
      const mapService = new MapService();
      
      // Test that legacy methods still work
      const staticUrl = mapService.getMapboxStaticUrl(-23.9, 29.45);
      expect(staticUrl).toContain('mapbox.com');
      
      const directionsUrl = mapService.getDirectionsUrl(-23.9, 29.45);
      expect(directionsUrl).toContain('google.com/maps/dir');
      
      const distance = mapService.calculateDistance(-23.9, 29.45, -26.2, 28.0);
      expect(distance).toBeGreaterThan(0);
    });
  });
});