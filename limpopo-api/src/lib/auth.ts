import * as jwt from 'jsonwebtoken';
import { findUserById, User } from '../models/user';
import { Request, Response, NextFunction } from 'express';

// Simple, env-based secret management (Azure Key Vault removed)
let cachedJwtSecret: string | null = null;
const getJwtSecret = (): string => {
  if (cachedJwtSecret) return cachedJwtSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not set');
  }
  cachedJwtSecret = secret;
  return secret;
};

const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';

export const generateTokens = (user: Pick<User, 'id' | 'role'>) => {
  const secret = getJwtSecret();
  const baseClaims = { iat: Math.floor(Date.now() / 1000), issuer: 'limpopo-connect', audience: 'limpopo-connect-api' } as const;
  const accessToken = jwt.sign({ userId: user.id, role: user.role, type: 'access', ...baseClaims }, secret, { expiresIn: ACCESS_TOKEN_EXPIRATION });
  const refreshToken = jwt.sign({ userId: user.id, type: 'refresh', ...baseClaims }, secret, { expiresIn: REFRESH_TOKEN_EXPIRATION });
  return { accessToken, refreshToken };
};

export interface AuthenticatedRequest extends Request {
  authedUser?: User;
}

// Express middleware replacement for former Azure withAuth wrapper
export const withAuth = (allowedRoles: string[] = []) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const secret = getJwtSecret();
      const decoded = jwt.verify(token, secret, { issuer: 'limpopo-connect', audience: 'limpopo-connect-api' }) as any;
      if (decoded.type !== 'access') {
        return res.status(401).json({ error: 'Unauthorized: Invalid token type' });
      }
      const user = await findUserById(decoded.userId);
      if (!user) return res.status(401).json({ error: 'Unauthorized: User not found' });
      if (!user.is_verified) return res.status(401).json({ error: 'Unauthorized: Email not verified' });
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
      req.authedUser = user;
      return next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Unauthorized: Token expired' });
      }
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
};