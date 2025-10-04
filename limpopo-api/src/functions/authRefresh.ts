import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from 'jsonwebtoken';
import { findUserById } from '../models/user';
import { generateTokens } from '../lib/auth';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

// Key Vault integration for JWT secrets (same as in auth.ts)
let jwtSecret: string | null = null;
const getJwtSecret = async (): Promise<string> => {
  if (jwtSecret) return jwtSecret;
  
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
  
  const envSecret = process.env.JWT_SECRET;
  if (!envSecret) {
    throw new Error('JWT_SECRET not found in environment variables or Key Vault');
  }
  jwtSecret = envSecret;
  return jwtSecret;
};

export async function authRefresh(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as any;
        const { refreshToken } = body;

        if (!refreshToken) {
            return {
                status: 400,
                jsonBody: { error: 'Refresh token is required' }
            };
        }

        const secret = await getJwtSecret();
        const decoded = jwt.verify(refreshToken, secret, {
            issuer: 'limpopo-connect',
            audience: 'limpopo-connect-api'
        }) as { userId: string; type: string; iat: number; exp: number };
        
        // Ensure it's a refresh token
        if (decoded.type !== 'refresh') {
            return {
                status: 401,
                jsonBody: { error: 'Invalid token type' }
            };
        }

        const user = await findUserById(decoded.userId);

        if (!user) {
            return {
                status: 401,
                jsonBody: { error: 'Invalid refresh token' }
            };
        }

        if (!user.is_verified) {
            return {
                status: 401,
                jsonBody: { error: 'Email not verified' }
            };
        }

        const tokens = await generateTokens(user);

        context.log(`Token refreshed for user: ${user.id}`);

        return {
            status: 200,
            jsonBody: tokens
        };

    } catch (error) {
        context.log('Error during token refresh:', error);
        if (error instanceof jwt.TokenExpiredError) {
            return {
                status: 401,
                jsonBody: { error: 'Refresh token expired' }
            };
        }
        return {
            status: 401,
            jsonBody: { error: 'Invalid refresh token' }
        };
    }
}

app.http('authRefresh', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/refresh',
    handler: authRefresh
});