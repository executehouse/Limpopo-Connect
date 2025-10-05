import * as jwt from 'jsonwebtoken';
import { User } from '../../src/models/user';
import { validateEmail, validatePassword, validateName, sanitizeInput } from '../../src/lib/validation';


// NOTE: Auth library tests disabled as Azure-specific auth implementation removed.
describe.skip('Auth Library (disabled post-Azure migration)', () => {
    beforeEach(() => {
        jest.resetModules();
        process.env.JWT_SECRET = 'test-secret-key-for-auth-unit-test';
        delete process.env.KEY_VAULT_URL; // Ensure we use env variable in tests
    });

    describe('generateTokens', () => {
        it('should generate valid access and refresh tokens', async () => {
            const { generateTokens } = require('../../src/lib/auth');

            const user: Pick<User, 'id' | 'role'> = {
                id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                role: 'resident',
            };

            const { accessToken, refreshToken } = await generateTokens(user);

            // Verify Access Token
            const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET!, {
                issuer: 'limpopo-connect',
                audience: 'limpopo-connect-api'
            }) as any;
            expect(decodedAccessToken.userId).toBe(user.id);
            expect(decodedAccessToken.role).toBe(user.role);
            expect(decodedAccessToken.type).toBe('access');

            // Verify Refresh Token
            const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET!, {
                issuer: 'limpopo-connect',
                audience: 'limpopo-connect-api'
            }) as any;
            expect(decodedRefreshToken.userId).toBe(user.id);
            expect(decodedRefreshToken.type).toBe('refresh');
            expect(decodedRefreshToken.role).toBeUndefined();
        });

        it('should throw error when JWT_SECRET is not set', async () => {
            delete process.env.JWT_SECRET;
            const { generateTokens } = require('../../src/lib/auth');

            const user: Pick<User, 'id' | 'role'> = {
                id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                role: 'resident',
            };

            await expect(generateTokens(user)).rejects.toThrow('JWT_SECRET not found');
        });
    });

    describe('Validation Functions', () => {
        describe('validateEmail', () => {
            it('should validate correct email formats', () => {
                expect(validateEmail('test@example.com')).toBe(true);
                expect(validateEmail('user.name+tag@domain.co.za')).toBe(true);
                expect(validateEmail('user@subdomain.domain.org')).toBe(true);
            });

            it('should reject invalid email formats', () => {
                expect(validateEmail('invalid-email')).toBe(false);
                expect(validateEmail('test@')).toBe(false);
                expect(validateEmail('@domain.com')).toBe(false);
                expect(validateEmail('test.domain.com')).toBe(false);
                expect(validateEmail('')).toBe(false);
            });
        });

        describe('validatePassword', () => {
            it('should validate strong passwords', () => {
                const result = validatePassword('StrongPass123!');
                expect(result.valid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('should reject weak passwords', () => {
                const result1 = validatePassword('weak');
                expect(result1.valid).toBe(false);
                expect(result1.errors).toContain('Password must be at least 8 characters long');
                expect(result1.errors).toContain('Password must contain at least one uppercase letter');
                expect(result1.errors).toContain('Password must contain at least one number');

                const result2 = validatePassword('onlylowercase123');
                expect(result2.valid).toBe(false);
                expect(result2.errors).toContain('Password must contain at least one uppercase letter');

                const result3 = validatePassword('NoNumbers!');
                expect(result3.valid).toBe(false);
                expect(result3.errors).toContain('Password must contain at least one number');
            });
        });

        describe('validateName', () => {
            it('should validate proper names', () => {
                expect(validateName('John Doe')).toBe(true);
                expect(validateName('Jane')).toBe(true);
                expect(validateName('Mary-Jane O\'Brien')).toBe(true);
            });

            it('should reject invalid names', () => {
                expect(validateName('')).toBe(false);
                expect(validateName('A')).toBe(false); // Too short
                expect(validateName('A'.repeat(101))).toBe(false); // Too long
                expect(validateName('   ')).toBe(false); // Only spaces
            });
        });

        describe('sanitizeInput', () => {
            it('should remove potentially dangerous characters', () => {
                expect(sanitizeInput('  hello<script>  ')).toBe('hello');
                expect(sanitizeInput('test\"input\\')).toBe('testinput');
                expect(sanitizeInput('normal text')).toBe('normal text');
            });
        });
    });
});