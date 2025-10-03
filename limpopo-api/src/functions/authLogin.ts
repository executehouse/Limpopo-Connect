import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as argon2 from 'argon2';
import { findUserByEmail } from '../models/user';
import { generateTokens } from '../lib/auth';

export async function authLogin(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json() as any;
    const { email, password } = body;

    if (!email || !password) {
        return {
            status: 400,
            jsonBody: { error: 'Email and password are required' }
        };
    }

    try {
        const user = await findUserByEmail(email);

        if (!user || !user.password_hash) {
            return {
                status: 401,
                jsonBody: { error: 'Invalid credentials' }
            };
        }

        const isPasswordValid = await argon2.verify(user.password_hash, password);

        if (!isPasswordValid) {
            return {
                status: 401,
                jsonBody: { error: 'Invalid credentials' }
            };
        }

        const { accessToken, refreshToken } = generateTokens(user);

        const { password_hash, ...userResponse } = user;

        return {
            status: 200,
            jsonBody: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        };

    } catch (error) {
        context.log('Error during login:', error);
        return {
            status: 500,
            jsonBody: { error: 'Internal server error' }
        };
    }
}

app.http('authLogin', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/login',
    handler: authLogin
});