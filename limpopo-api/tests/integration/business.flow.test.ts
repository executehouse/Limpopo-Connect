// Mock dependencies
jest.mock('../../src/lib/db', () => ({
  query: jest.fn(),
}));

jest.mock('../../src/models/business', () => ({
  createBusiness: jest.fn(),
  findBusinessById: jest.fn(),
  findBusinesses: jest.fn(),
  updateBusiness: jest.fn(),
  softDeleteBusiness: jest.fn(),
}));

jest.mock('../../src/models/businessCategory', () => ({
  findCategoryById: jest.fn(),
  findAllCategories: jest.fn(),
}));

jest.mock('../../src/models/businessPhoto', () => ({
  findBusinessPhotos: jest.fn(),
}));


const mockBusiness = require('../../src/models/business');
const mockBusinessCategory = require('../../src/models/businessCategory');
const mockBusinessPhoto = require('../../src/models/businessPhoto');

// NOTE: Azure Functions based integration tests disabled after migration to Supabase / Express
describe.skip('Business API Integration (disabled post-Azure migration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key-for-integration-test';
    delete process.env.KEY_VAULT_URL;
  });

  describe('POST /api/businesses (Create Business)', () => {
    it('should create a new business successfully', async () => {
      // Mock valid category
      mockBusinessCategory.findCategoryById.mockResolvedValue({
        id: 1,
        name: 'Restaurant',
        slug: 'restaurant'
      });

      const mockCreatedBusiness = {
        id: 'business-uuid',
        owner_id: 'user-uuid',
        name: 'Test Restaurant',
        category_id: 1,
        description: 'Great food',
        address: '123 Main St, Polokwane',
        lat: -23.9045,
        lng: 29.4689,
        phone: '015-123-4567',
        website: 'https://testrestaurant.co.za',
        open_hours: { monday: '09:00-17:00' },
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
        version: 1
      };
      
      mockBusiness.createBusiness.mockResolvedValue(mockCreatedBusiness);

      const { businessesCreate } = await import('../../src/functions/businessesCreate');
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'Test Restaurant',
          category_id: 1,
          description: 'Great food',
          address: '123 Main St, Polokwane',
          lat: -23.9045,
          lng: 29.4689,
          phone: '015-123-4567',
          website: 'https://testrestaurant.co.za',
          open_hours: { monday: '09:00-17:00' }
        }),
        authedUser: {
          id: 'user-uuid',
          role: 'business'
        },
        headers: { get: jest.fn() },
        url: '/api/businesses'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await businessesCreate(mockRequest as any, mockContext as any);

      expect(result.status).toBe(201);
      expect(result.jsonBody.name).toBe('Test Restaurant');
      expect(mockBusiness.createBusiness).toHaveBeenCalled();
    });

    it('should return validation errors for invalid data', async () => {
      const businessesCreateModule = await import('../../src/functions/businessesCreate');
      const businessesCreate = businessesCreateModule.businessesCreate;
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          name: 'A', // Too short
          category_id: 999, // Invalid category
          address: '',
          lat: 91, // Invalid coordinate
          lng: 29.4689
        }),
        authedUser: {
          id: 'user-uuid',
          role: 'business'
        },
        headers: { get: jest.fn() },
        url: '/api/businesses'
      };
      const mockContext = {
        log: jest.fn()
      };

      // Mock category not found
      mockBusinessCategory.findCategoryById.mockResolvedValue(null);

      const result = await businessesCreate(mockRequest as any, mockContext as any);

      expect(result.status).toBe(400);
      expect(result.jsonBody.error).toBe('Validation failed');
      expect(result.jsonBody.details).toContain('Business name must be between 2 and 200 characters');
      expect(result.jsonBody.details).toContain('Invalid category ID');
      expect(result.jsonBody.details).toContain('Address is required');
      expect(result.jsonBody.details).toContain('Invalid coordinates');
    });
  });

  describe('GET /api/businesses (List Businesses)', () => {
    it('should list businesses with pagination', async () => {
      const mockBusinesses = [
        {
          id: 'business-1',
          name: 'Restaurant 1',
          address: '123 Main St',
          lat: -23.9045,
          lng: 29.4689,
          distance: 0.5
        },
        {
          id: 'business-2',
          name: 'Restaurant 2',
          address: '456 Oak Ave',
          lat: -23.9050,
          lng: 29.4700,
          distance: 1.2
        }
      ];
      
      mockBusiness.findBusinesses.mockResolvedValue(mockBusinesses);

      const { businessesList } = await import('../../src/functions/businessesList');
      const mockRequest = {
        query: {
          get: jest.fn((key: string) => {
            const params: any = {
              near: '-23.9045,29.4689,5',
              limit: '10',
              offset: '0'
            };
            return params[key];
          })
        },
        headers: { get: jest.fn() },
        url: '/api/businesses?near=-23.9045,29.4689,5'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await businessesList(mockRequest as any, mockContext as any);

      expect(result.status).toBe(200);
      expect(result.jsonBody.businesses).toHaveLength(2);
      expect(result.jsonBody.pagination.limit).toBe(10);
      expect(mockBusiness.findBusinesses).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        near: { lat: -23.9045, lng: 29.4689, radius: 5 }
      });
    });

    it('should handle invalid near parameter', async () => {
      const businessesListModule = await import('../../src/functions/businessesList');
      const businessesList = businessesListModule.businessesList;
      const mockRequest = {
        query: {
          get: jest.fn((key: string) => {
            if (key === 'near') return 'invalid-coordinates';
            return null;
          })
        },
        headers: { get: jest.fn() },
        url: '/api/businesses?near=invalid-coordinates'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await businessesList(mockRequest as any, mockContext as any);

      expect(result.status).toBe(400);
      expect(result.jsonBody.error).toContain('Invalid format for near parameter');
    });
  });

  describe('GET /api/businesses/:id (Get Business)', () => {
    it('should get business details with photos', async () => {
      const mockBusinessDetails = {
        id: 'business-uuid',
        name: 'Test Restaurant',
        description: 'Great food',
        address: '123 Main St',
        lat: -23.9045,
        lng: 29.4689,
        phone: '015-123-4567',
        website: 'https://testrestaurant.co.za',
        is_verified: true
      };
      
      const mockPhotos = [
        {
          id: 'photo-1',
          business_id: 'business-uuid',
          blob_path: 'business-photo/photo1.jpg',
          width: 800,
          height: 600
        }
      ];
      
      mockBusiness.findBusinessById.mockResolvedValue(mockBusinessDetails);
      mockBusinessPhoto.findBusinessPhotos.mockResolvedValue(mockPhotos);

      const { businessesGet } = await import('../../src/functions/businessesGet');
      const mockRequest = {
        params: { id: 'business-uuid' },
        headers: { get: jest.fn() },
        url: '/api/businesses/business-uuid'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await businessesGet(mockRequest as any, mockContext as any);

      expect(result.status).toBe(200);
      expect(result.jsonBody.name).toBe('Test Restaurant');
      expect(result.jsonBody.photos).toHaveLength(1);
      expect(mockBusiness.findBusinessById).toHaveBeenCalledWith('business-uuid');
      expect(mockBusinessPhoto.findBusinessPhotos).toHaveBeenCalledWith('business-uuid');
    });

    it('should return 404 for non-existent business', async () => {
      mockBusiness.findBusinessById.mockResolvedValue(null);

      const businessesGetModule = await import('../../src/functions/businessesGet');
      const businessesGet = businessesGetModule.businessesGet;
      const mockRequest = {
        params: { id: 'non-existent' },
        headers: { get: jest.fn() },
        url: '/api/businesses/non-existent'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await businessesGet(mockRequest as any, mockContext as any);

      expect(result.status).toBe(404);
      expect(result.jsonBody.error).toBe('Business not found');
    });
  });
});