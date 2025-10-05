import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findUserById } from '../models/user';
import { validatePassword } from '../lib/validation';
import { query } from '../lib/db';
import argon2 from 'argon2';

interface ResetPasswordRequest {
    token: string;
    password: string;
}

export async function authResetPassword(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as ResetPasswordRequest;
        const { token, password } = body;

        if (!token || !password) {
            return {
                status: 400,
                jsonBody: { error: 'Token and new password are required' }
            };
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return {
                status: 400,
                jsonBody: { error: 'Password validation failed', details: passwordValidation.errors }
            };
        }

        // Find and validate the reset token
        const { rows } = await query(
            'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
            [token]
        );

        if (rows.length === 0) {
            return {
                status: 400,
                jsonBody: { error: 'Invalid or expired reset token' }
            };
        }

        const { user_id } = rows[0];
        const user = await findUserById(user_id);

        if (!user) {
            return {
                status: 400,
                jsonBody: { error: 'User not found' }
            };
        }

        // Hash the new password
        const password_hash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });

        // Update user's password and clear reset token
        await query('BEGIN');
        try {
            await query(
                'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [password_hash, user_id]
            );
            
            await query(
                'DELETE FROM password_reset_tokens WHERE user_id = $1',
                [user_id]
            );
            
            await query('COMMIT');
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }

        context.log(`Password reset completed for user: ${user_id}`);

        return {
            status: 200,
            jsonBody: { message: 'Password has been reset successfully' }
        };

    } catch (error) {
        context.log('Error in reset password:', error);
        return {
            status: 500,
            jsonBody: { error: 'Internal server error' }
        };
    }
}

app.http('authResetPassword', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/reset-password',
    handler: authResetPassword
});