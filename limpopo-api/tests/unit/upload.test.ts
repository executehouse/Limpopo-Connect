// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-12345')
}));

// Mock Azure Storage
const mockGetContainerClient = jest.fn(() => ({
  getBlobClient: jest.fn(() => ({
    generateSasUrl: jest.fn(() => 'https://mock-sas-url.com'),
    url: 'https://mock-blob-url.com/blob',
    getProperties: jest.fn(() => Promise.resolve({
      contentType: 'image/jpeg',
      contentLength: 102400
    }))
  })),
  getBlockBlobClient: jest.fn(() => ({
    uploadData: jest.fn(() => Promise.resolve())
  }))
}));

const MockBlobServiceClient: any = jest.fn().mockImplementation(() => ({
  getContainerClient: mockGetContainerClient
}));

MockBlobServiceClient.fromConnectionString = jest.fn(() => new MockBlobServiceClient());

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: MockBlobServiceClient,
  StorageSharedKeyCredential: jest.fn(),
  BlobSASPermissions: {
    parse: jest.fn(() => 'mock-permissions')
  },
  SASProtocol: {
    Https: 'https'
  }
}));

// Mock Sharp for image processing
jest.mock('sharp', () => {
  const mockSharp: any = {
    metadata: jest.fn(() => Promise.resolve({
      width: 800,
      height: 600,
      format: 'jpeg',
      size: 102400
    })),
    resize: jest.fn(function(this: any) { return mockSharp; }),
    jpeg: jest.fn(function(this: any) { return mockSharp; }),
    toBuffer: jest.fn(() => Promise.resolve(Buffer.from('mock-image-data')))
  };
  
  return jest.fn(() => mockSharp);
});

// Mock database
jest.mock('../../src/lib/db', () => ({
  query: jest.fn(),
}));

describe('Upload Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AZURE_STORAGE_ACCOUNT_NAME = 'testaccount';
    process.env.AZURE_STORAGE_ACCOUNT_KEY = 'testkey';
    process.env.AzureWebJobsStorage = 'DefaultEndpointsProtocol=https;AccountName=testaccount;AccountKey=testkey;EndpointSuffix=core.windows.net';
  });

  describe('Signed URL Generation', () => {
    it('should generate signed URL for valid image upload request', async () => {
      const { uploadsGetSignedUrl } = await import('../../src/functions/uploadsGetSignedUrl');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          fileName: 'test-image.jpg',
          contentType: 'image/jpeg',
          contentLength: 1024000, // 1MB
          businessId: 'business-uuid',
          purpose: 'business-photo'
        }),
        authedUser: {
          id: 'user-uuid',
          role: 'business'
        },
        headers: { get: jest.fn() },
        url: '/api/uploads/signed-url'
      };
      
      const mockContext = {
        log: jest.fn()
      };

      const result = await uploadsGetSignedUrl(mockRequest as any, mockContext as any);

      expect(result.status).toBe(200);
      expect(result.jsonBody.uploadUrl).toBe('https://mock-sas-url.com');
      expect(result.jsonBody.uploadId).toBeDefined();
      expect(result.jsonBody.expiresAt).toBeDefined();
      expect(result.jsonBody.blobPath).toMatch(/business-photo\/.*\.jpg/);
    });

    it('should reject invalid file types', async () => {
      const { uploadsGetSignedUrl } = await import('../../src/functions/uploadsGetSignedUrl');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          fileName: 'test-file.pdf',
          contentType: 'application/pdf',
          contentLength: 1024000,
          businessId: 'business-uuid',
          purpose: 'business-photo'
        }),
        authedUser: {
          id: 'user-uuid',
          role: 'business'
        },
        headers: { get: jest.fn() },
        url: '/api/uploads/signed-url'
      };
      
      const mockContext = {
        log: jest.fn()
      };

      const result = await uploadsGetSignedUrl(mockRequest as any, mockContext as any);

      expect(result.status).toBe(400);
      expect(result.jsonBody.error).toBe('Validation failed');
      expect(result.jsonBody.details.some((msg: string) => msg.includes('Unsupported file type'))).toBe(true);
    });

    it('should reject files that are too large', async () => {
      const { uploadsGetSignedUrl } = await import('../../src/functions/uploadsGetSignedUrl');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          fileName: 'huge-image.jpg',
          contentType: 'image/jpeg',
          contentLength: 11 * 1024 * 1024, // 11MB
          businessId: 'business-uuid',
          purpose: 'business-photo'
        }),
        authedUser: {
          id: 'user-uuid',
          role: 'business'
        },
        headers: { get: jest.fn() },
        url: '/api/uploads/signed-url'
      };
      
      const mockContext = {
        log: jest.fn()
      };

      const result = await uploadsGetSignedUrl(mockRequest as any, mockContext as any);

      expect(result.status).toBe(400);
      expect(result.jsonBody.error).toBe('Validation failed');
      expect(result.jsonBody.details.some((msg: string) => msg.includes('File too large'))).toBe(true);
    });

    it('should require businessId for business photos', async () => {
      const { uploadsGetSignedUrl } = await import('../../src/functions/uploadsGetSignedUrl');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          fileName: 'test-image.jpg',
          contentType: 'image/jpeg',
          contentLength: 1024000,
          purpose: 'business-photo'
          // Missing businessId
        }),
        authedUser: {
          id: 'user-uuid',
          role: 'business'
        },
        headers: { get: jest.fn() },
        url: '/api/uploads/signed-url'
      };
      
      const mockContext = {
        log: jest.fn()
      };

      const result = await uploadsGetSignedUrl(mockRequest as any, mockContext as any);

      expect(result.status).toBe(400);
      expect(result.jsonBody.error).toBe('Validation failed');
      expect(result.jsonBody.details).toContain('businessId is required for business photos');
    });
  });

  describe('Image Processing', () => {
    it('should process uploaded image and generate thumbnails', async () => {
      const { processImageUpload } = await import('../../src/functions/processImageUpload');
      
      const mockBlob = Buffer.from('mock-image-data');
      const mockContext = {
        log: jest.fn(),
        error: jest.fn(),
        triggerMetadata: {
          name: 'business-photo/test-upload-id.jpg'
        }
      };

      await processImageUpload(mockBlob, mockContext as any);

      expect(mockContext.log).toHaveBeenCalledWith('Processing image upload: business-photo/test-upload-id.jpg');
      expect(mockContext.log).toHaveBeenCalledWith(expect.stringContaining('Image metadata'));
      expect(mockContext.log).toHaveBeenCalledWith(expect.stringContaining('Generated thumbnail'));
    });

    it('should handle invalid blob input', async () => {
      const { processImageUpload } = await import('../../src/functions/processImageUpload');
      
      const mockContext = {
        log: jest.fn(),
        error: jest.fn(),
        triggerMetadata: {
          name: 'test-blob.jpg'
        }
      };

      await processImageUpload(null, mockContext as any);

      expect(mockContext.error).toHaveBeenCalledWith('Blob input was not a Buffer.');
    });

    it('should handle invalid blob path format', async () => {
      const { processImageUpload } = await import('../../src/functions/processImageUpload');
      
      const mockBlob = Buffer.from('mock-image-data');
      const mockContext = {
        log: jest.fn(),
        error: jest.fn(),
        triggerMetadata: {
          name: 'invalid-path' // Missing purpose/uploadId format
        }
      };

      await processImageUpload(mockBlob, mockContext as any);

      expect(mockContext.log).toHaveBeenCalledWith(
        'Invalid blob path format. Expected "purpose/uploadId.extension". Got:',
        'invalid-path'
      );
    });
  });
});