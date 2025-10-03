import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from 'jsonwebtoken';
import { findUserById, User } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';

export const generateTokens = (user: Pick<User, 'id' | 'role'>) => {
  const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
  return { accessToken, refreshToken };
};

export interface AuthenticatedRequest extends HttpRequest {
  // Use a custom property to avoid conflict with the built-in 'user' property
  authedUser?: User;
}

type AuthenticatedHandler = (req: AuthenticatedRequest, context: InvocationContext) => Promise<HttpResponseInit>;

export const withAuth = (handler: AuthenticatedHandler, allowedRoles: string[] = []) => {
  // This wrapper must have the signature of a standard HttpHandler
  return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { status: 401, jsonBody: { error: 'Unauthorized: No token provided' } };
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; iat: number, exp: number };
      const user = await findUserById(decoded.userId);

      if (!user) {
        return { status: 401, jsonBody: { error: 'Unauthorized: User not found' } };
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return { status: 403, jsonBody: { error: 'Forbidden: Insufficient permissions' } };
      }

      // Cast the request and attach the user
      const authedReq = request as AuthenticatedRequest;
      authedReq.authedUser = user;

      return handler(authedReq, context);
    } catch (error) {
      return { status: 401, jsonBody: { error: 'Unauthorized: Invalid token' } };
    }
  };
};