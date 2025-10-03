import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findUserByEmail, createUser } from '../models/user';
import { generateTokens } from '../lib/auth';

export async function authRegister(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json() as any;
    const { email, password, name } = body;

    if (!email || !password || !name) {
        return {
            status: 400,
            jsonBody: { error: 'Email, password, and name are required' }
        };
    }

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return {
                status: 409,
                jsonBody: { error: 'User with this email already exists' }
            };
        }

        const newUser = await createUser({
            email,
            name,
            password_raw: password,
            role: 'resident' // Default role
        });

        const { accessToken, refreshToken } = generateTokens(newUser);

        const { password_hash, ...userResponse } = newUser;

        return {
            status: 201,
            jsonBody: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        };

    } catch (error) {
        context.log('Error during registration:', error);
        return {
            status: 500,
            jsonBody: { error: 'Internal server error' }
        };
    }
}

app.http('authRegister', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/register',
    handler: authRegister
});