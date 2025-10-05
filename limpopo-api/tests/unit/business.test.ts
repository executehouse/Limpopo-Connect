import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateBusinessName, validateCoordinates, validateUrl, validatePhone, validateMimeType } from '../../src/lib/validation';
import { createBusiness } from '../../src/models/business';

// Mock database
vi.mock('../../src/lib/db', () => ({
  query: vi.fn(),
}));

describe('Business Validation', () => {
  describe('validateBusinessName', () => {
    it('should validate proper business names', () => {
      expect(validateBusinessName('ABC Restaurant')).toBe(true);
      expect(validateBusinessName('Joe\'s Coffee Shop')).toBe(true);
      expect(validateBusinessName('The Crafty Corner Store & More')).toBe(true);
    });

    it('should reject invalid business names', () => {
      expect(validateBusinessName('')).toBe(false);
      expect(validateBusinessName('A')).toBe(false); // Too short
      expect(validateBusinessName('A'.repeat(201))).toBe(false); // Too long
      expect(validateBusinessName('   ')).toBe(false); // Only spaces
    });
  });

  describe('validateCoordinates', () => {
    it('should validate proper coordinates', () => {
      expect(validateCoordinates(-23.9045, 29.4689)).toBe(true); // Polokwane
      expect(validateCoordinates(-24.3499, 30.9707)).toBe(true); // Hoedspruit
      expect(validateCoordinates(0, 0)).toBe(true); // Equator/Prime Meridian
      expect(validateCoordinates(90, 180)).toBe(true); // Extreme valid
      expect(validateCoordinates(-90, -180)).toBe(true); // Extreme valid
    });

    it('should reject invalid coordinates', () => {
      expect(validateCoordinates(91, 0)).toBe(false); // Lat too high
      expect(validateCoordinates(-91, 0)).toBe(false); // Lat too low
      expect(validateCoordinates(0, 181)).toBe(false); // Lng too high
      expect(validateCoordinates(0, -181)).toBe(false); // Lng too low
    });
  });

  describe('validateUrl', () => {
    it('should validate proper URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('https://sub.domain.co.za/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('ftp://invalid-protocol.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate proper phone numbers', () => {
      expect(validatePhone('015-123-4567')).toBe(true);
      expect(validatePhone('+27 15 123 4567')).toBe(true);
      expect(validatePhone('(015) 123-4567')).toBe(true);
      expect(validatePhone('0151234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false); // Too short
      expect(validatePhone('abc-def-ghij')).toBe(false); // No letters
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validateMimeType', () => {
    it('should validate allowed image mime types', () => {
      expect(validateMimeType('image/jpeg')).toBe(true);
      expect(validateMimeType('image/png')).toBe(true);
      expect(validateMimeType('image/webp')).toBe(true);
    });

    it('should reject invalid mime types', () => {
      expect(validateMimeType('image/gif')).toBe(false);
      expect(validateMimeType('text/plain')).toBe(false);
      expect(validateMimeType('application/pdf')).toBe(false);
      expect(validateMimeType('')).toBe(false);
    });

    it('should respect custom allowed types', () => {
      const customTypes = ['image/gif', 'image/svg+xml'];
      expect(validateMimeType('image/gif', customTypes)).toBe(true);
      expect(validateMimeType('image/jpeg', customTypes)).toBe(false);
    });
  });
});

describe('Business Models', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Business Model Functions', () => {
    it('should handle coordinate validation in createBusiness', async () => {
      // This would test the actual model functions
      // For now, just test that invalid coordinates throw errors
      
      const invalidBusinessData = {
        owner_id: 'test-user-id',
        name: 'Test Business',
        category_id: 1,
        description: 'Test description',
        address: '123 Test St',
        lat: 91, // Invalid latitude
        lng: 29.4689,
        phone: '',
        website: '',
        open_hours: null
      };

      await expect(createBusiness(invalidBusinessData)).rejects.toThrow('Invalid coordinates');
    });
  });
});