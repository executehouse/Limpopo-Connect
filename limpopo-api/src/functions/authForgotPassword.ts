import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findUserByEmail } from '../models/user';
import { validateEmail, sanitizeInput } from '../lib/validation';
import { query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface ForgotPasswordRequest {
    email: string;
}

export async function authForgotPassword(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as ForgotPasswordRequest;
        const { email } = body;

        if (!email) {
            return {
                status: 400,
                jsonBody: { error: 'Email is required' }
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

        // Always return success to prevent user enumeration
        // In a real implementation, send email only if user exists
        if (user) {
            const resetToken = uuidv4();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

            await query(
                'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3, created_at = CURRENT_TIMESTAMP',
                [user.id, resetToken, expiresAt]
            );

            // TODO: Send email with reset link containing the token
            context.log(`Password reset requested for user: ${user.id}`);
        }

        return {
            status: 200,
            jsonBody: { message: 'If an account with that email exists, a password reset link has been sent.' }
        };

    } catch (error) {
        context.log('Error in forgot password:', error);
        return {
            status: 500,
            jsonBody: { error: 'Internal server error' }
        };
    }
}

app.http('authForgotPassword', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/forgot-password',
    handler: authForgotPassword
});