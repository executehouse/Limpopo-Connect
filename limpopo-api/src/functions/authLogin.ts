import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findUserByEmail, verifyPassword } from '../models/user';
import { generateTokens } from '../lib/auth';
import { validateEmail, sanitizeInput } from '../lib/validation';

export async function authLogin(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as any;
        const { email, password } = body;

        if (!email || !password) {
            return {
                status: 400,
                jsonBody: { error: 'Email and password are required' }
            };
        }

        if (!validateEmail(email)) {
            return {
                status: 400,
                jsonBody: { error: 'Invalid email format' }
            };
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase());
        const user = await findUserByEmail(sanitizedEmail);

        if (!user || !user.password_hash) {
            // Use consistent timing to prevent user enumeration attacks
            await new Promise(resolve => setTimeout(resolve, 100));
            return {
                status: 401,
                jsonBody: { error: 'Invalid credentials' }
            };
        }

        const isPasswordValid = await verifyPassword(password, user.password_hash);

        if (!isPasswordValid) {
            return {
                status: 401,
                jsonBody: { error: 'Invalid credentials' }
            };
        }

        const { accessToken, refreshToken } = await generateTokens(user);

        const { password_hash, ...userResponse } = user;

        context.log(`User logged in successfully: ${user.id}`);

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