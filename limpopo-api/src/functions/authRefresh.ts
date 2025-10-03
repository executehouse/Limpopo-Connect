import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from 'jsonwebtoken';
import { findUserById } from '../models/user';
import { generateTokens } from '../lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export async function authRefresh(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json() as any;
    const { refreshToken } = body;

    if (!refreshToken) {
        return {
            status: 400,
            jsonBody: { error: 'Refresh token is required' }
        };
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; iat: number; exp: number };
        const user = await findUserById(decoded.userId);

        if (!user) {
            return {
                status: 401,
                jsonBody: { error: 'Invalid refresh token' }
            };
        }

        const tokens = generateTokens(user);

        return {
            jsonBody: tokens
        };

    } catch (error) {
        context.log('Error during token refresh:', error);
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