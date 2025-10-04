import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from 'jsonwebtoken';
import { findUserById, User } from '../models/user';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

// Key Vault integration for JWT secrets
let jwtSecret: string | null = null;
const getJwtSecret = async (): Promise<string> => {
  if (jwtSecret) return jwtSecret;
  
  // Try Key Vault first (for production)
  const keyVaultUrl = process.env.KEY_VAULT_URL;
  if (keyVaultUrl) {
    try {
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(keyVaultUrl, credential);
      const secret = await client.getSecret('jwt-secret');
      jwtSecret = secret.value!;
      return jwtSecret;
    } catch (error) {
      console.warn('Failed to retrieve JWT secret from Key Vault, falling back to environment variable');
    }
  }
  
  // Fallback to environment variable
  const envSecret = process.env.JWT_SECRET;
  if (!envSecret) {
    throw new Error('JWT_SECRET not found in environment variables or Key Vault');
  }
  jwtSecret = envSecret;
  return jwtSecret;
};

const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';

export const generateTokens = async (user: Pick<User, 'id' | 'role'>) => {
  const secret = await getJwtSecret();
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      role: user.role,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    }, 
    secret, 
    { expiresIn: ACCESS_TOKEN_EXPIRATION, issuer: 'limpopo-connect', audience: 'limpopo-connect-api' }
  );
  const refreshToken = jwt.sign(
    { 
      userId: user.id, 
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    }, 
    secret, 
    { expiresIn: REFRESH_TOKEN_EXPIRATION, issuer: 'limpopo-connect', audience: 'limpopo-connect-api' }
  );
  return { accessToken, refreshToken };
};

export interface AuthenticatedRequest extends HttpRequest {
  // Use a custom property to avoid conflict with the built-in 'user' property
  authedUser?: User;
}

type AuthenticatedHandler = (req: AuthenticatedRequest, context: InvocationContext) => Promise<HttpResponseInit>;

export const withAuth = (handler: AuthenticatedHandler, allowedRoles: string[] = []) => {
  return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { status: 401, jsonBody: { error: 'Unauthorized: No token provided' } };
    }

    const token = authHeader.split(' ')[1];
    try {
      const secret = await getJwtSecret();
      const decoded = jwt.verify(token, secret, {
        issuer: 'limpopo-connect',
        audience: 'limpopo-connect-api'
      }) as { userId: string; role: string; type: string; iat: number, exp: number };
      
      // Ensure it's an access token
      if (decoded.type !== 'access') {
        return { status: 401, jsonBody: { error: 'Unauthorized: Invalid token type' } };
      }

      const user = await findUserById(decoded.userId);

      if (!user) {
        return { status: 401, jsonBody: { error: 'Unauthorized: User not found' } };
      }

      if (!user.is_verified) {
        return { status: 401, jsonBody: { error: 'Unauthorized: Email not verified' } };
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return { status: 403, jsonBody: { error: 'Forbidden: Insufficient permissions' } };
      }

      // Cast the request and attach the user
      const authedReq = request as AuthenticatedRequest;
      authedReq.authedUser = user;

      return handler(authedReq, context);
    } catch (error) {
      context.log('Auth error:', error);
      if (error instanceof jwt.TokenExpiredError) {
        return { status: 401, jsonBody: { error: 'Unauthorized: Token expired' } };
      }
      return { status: 401, jsonBody: { error: 'Unauthorized: Invalid token' } };
    }
  };
};