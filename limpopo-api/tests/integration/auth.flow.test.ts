import request from 'supertest';

// Mock the database module
jest.mock('../../src/lib/db', () => ({
  query: jest.fn(),
}));

// Mock the user model
jest.mock('../../src/models/user', () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  findUserById: jest.fn(),
  verifyPassword: jest.fn(),
}));

// Mock Key Vault modules
jest.mock('@azure/identity');
jest.mock('@azure/keyvault-secrets');

const mockQuery = require('../../src/lib/db').query;
const mockUserModel = require('../../src/models/user');

describe('Auth Flow Integration', () => {
  let app: any;

  beforeAll(async () => {
    // Import the Azure Functions app after mocking dependencies
    const { app: azureApp } = await import('@azure/functions');
    app = azureApp;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key-for-integration-test';
    delete process.env.KEY_VAULT_URL; // Use env variable for tests
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock no existing user
      mockUserModel.findUserByEmail.mockResolvedValue(null);
      
      // Mock successful user creation
      const mockUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: 'test@example.com',
        name: 'Test User',
        role: 'resident',
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockUserModel.createUser.mockResolvedValue(mockUser);

      const registerData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        name: 'Test User'
      };

      // Since we can't easily test the actual HTTP endpoints without a running server,
      // we'll test the function handlers directly
      const { authRegister } = await import('../../src/functions/authRegister');
      const mockRequest = {
        json: jest.fn().mockResolvedValue(registerData),
        headers: { get: jest.fn() },
        url: '/api/auth/register'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await authRegister(mockRequest as any, mockContext as any);

      expect(result.status).toBe(201);
      expect(result.jsonBody.user.email).toBe('test@example.com');
      expect(result.jsonBody.accessToken).toBeDefined();
      expect(result.jsonBody.refreshToken).toBeDefined();
    });

    it('should return validation errors for invalid input', async () => {
      const { authRegister } = await import('../../src/functions/authRegister');
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: 'invalid-email',
          password: 'weak',
          name: 'A'
        }),
        headers: { get: jest.fn() },
        url: '/api/auth/register'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await authRegister(mockRequest as any, mockContext as any);

      expect(result.status).toBe(400);
      expect(result.jsonBody.error).toBe('Validation failed');
      expect(result.jsonBody.details).toContain('Invalid email format');
      expect(result.jsonBody.details).toContain('Password must be at least 8 characters long');
    });

    it('should return error for duplicate email', async () => {
      // Mock existing user
      mockUserModel.findUserByEmail.mockResolvedValue({
        id: 'existing-user-id',
        email: 'test@example.com'
      });

      const { authRegister } = await import('../../src/functions/authRegister');
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: 'test@example.com',
          password: 'StrongPass123!',
          name: 'Test User'
        }),
        headers: { get: jest.fn() },
        url: '/api/auth/register'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await authRegister(mockRequest as any, mockContext as any);

      expect(result.status).toBe(409);
      expect(result.jsonBody.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: 'test@example.com',
        name: 'Test User',
        role: 'resident',
        is_verified: true,
        password_hash: '$argon2i$v=19$m=4096,t=3,p=1$test-hash',
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      mockUserModel.findUserByEmail.mockResolvedValue(mockUser);
      mockUserModel.verifyPassword.mockResolvedValue(true);

      const { authLogin } = await import('../../src/functions/authLogin');
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: 'test@example.com',
          password: 'StrongPass123!'
        }),
        headers: { get: jest.fn() },
        url: '/api/auth/login'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await authLogin(mockRequest as any, mockContext as any);

      expect(result.status).toBe(200);
      expect(result.jsonBody.user.email).toBe('test@example.com');
      expect(result.jsonBody.accessToken).toBeDefined();
      expect(result.jsonBody.refreshToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      mockUserModel.findUserByEmail.mockResolvedValue(null);

      const { authLogin } = await import('../../src/functions/authLogin');
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        }),
        headers: { get: jest.fn() },
        url: '/api/auth/login'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await authLogin(mockRequest as any, mockContext as any);

      expect(result.status).toBe(401);
      expect(result.jsonBody.error).toContain('Invalid credentials');
    });

    it('should reject invalid email format', async () => {
      const { authLogin } = await import('../../src/functions/authLogin');
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: 'invalid-email',
          password: 'password'
        }),
        headers: { get: jest.fn() },
        url: '/api/auth/login'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await authLogin(mockRequest as any, mockContext as any);

      expect(result.status).toBe(400);
      expect(result.jsonBody.error).toContain('Invalid email format');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const mockUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: 'test@example.com',
        name: 'Test User',
        role: 'resident',
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      mockUserModel.findUserById.mockResolvedValue(mockUser);

      // Generate a valid refresh token for testing
      const jwt = require('jsonwebtoken');
      const refreshToken = jwt.sign(
        { 
          userId: mockUser.id, 
          type: 'refresh',
          iat: Math.floor(Date.now() / 1000)
        }, 
        process.env.JWT_SECRET!,
        { 
          expiresIn: '7d', 
          issuer: 'limpopo-connect', 
          audience: 'limpopo-connect-api' 
        }
      );

      const { authRefresh } = await import('../../src/functions/authRefresh');
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ refreshToken }),
        headers: { get: jest.fn() },
        url: '/api/auth/refresh'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await authRefresh(mockRequest as any, mockContext as any);

      expect(result.status).toBe(200);
      expect(result.jsonBody.accessToken).toBeDefined();
      expect(result.jsonBody.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const { authRefresh } = await import('../../src/functions/authRefresh');
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ refreshToken: 'invalid-token' }),
        headers: { get: jest.fn() },
        url: '/api/auth/refresh'
      };
      const mockContext = {
        log: jest.fn()
      };

      const result = await authRefresh(mockRequest as any, mockContext as any);

      expect(result.status).toBe(401);
      expect(result.jsonBody.error).toContain('Invalid refresh token');
    });
  });
});