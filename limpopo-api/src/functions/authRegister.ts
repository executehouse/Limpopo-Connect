import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findUserByEmail, createUser } from '../models/user';
import { generateTokens } from '../lib/auth';
import { validateEmail, validatePassword, validateName, sanitizeInput } from '../lib/validation';

export async function authRegister(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as any;
        const { email, password, name, role } = body;

        // Validation
        const validationErrors: string[] = [];
        
        if (!email) {
            validationErrors.push('Email is required');
        } else if (!validateEmail(email)) {
            validationErrors.push('Invalid email format');
        }
        
        if (!password) {
            validationErrors.push('Password is required');
        } else {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                validationErrors.push(...passwordValidation.errors);
            }
        }
        
        if (!name) {
            validationErrors.push('Name is required');
        } else if (!validateName(name)) {
            validationErrors.push('Name must be between 2 and 100 characters');
        }
        
        if (validationErrors.length > 0) {
            return {
                status: 400,
                jsonBody: { error: 'Validation failed', details: validationErrors }
            };
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase());
        const sanitizedName = sanitizeInput(name);
        const userRole = role && ['resident', 'business', 'visitor'].includes(role) ? role : 'resident';

        const existingUser = await findUserByEmail(sanitizedEmail);
        if (existingUser) {
            return {
                status: 409,
                jsonBody: { error: 'User with this email already exists' }
            };
        }

        const newUser = await createUser({
            email: sanitizedEmail,
            name: sanitizedName,
            password_raw: password,
            role: userRole
        });

        const { accessToken, refreshToken } = await generateTokens(newUser);

        const { password_hash, ...userResponse } = newUser;

        context.log(`User registered successfully: ${newUser.id}`);

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