import * as jwt from 'jsonwebtoken';
import { User } from '../../src/models/user';

describe('Auth Library', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe('generateTokens', () => {
        it('should generate valid access and refresh tokens', () => {
            // Set the env var before requiring the module that uses it
            process.env.JWT_SECRET = 'test-secret-key-for-auth-unit-test';
            const { generateTokens } = require('../../src/lib/auth');

            const user: Pick<User, 'id' | 'role'> = {
                id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                role: 'resident',
            };

            const { accessToken, refreshToken } = generateTokens(user);

            // Verify Access Token
            const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET!) as any;
            expect(decodedAccessToken.userId).toBe(user.id);
            expect(decodedAccessToken.role).toBe(user.role);

            // Verify Refresh Token
            const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
            expect(decodedRefreshToken.userId).toBe(user.id);
            expect(decodedRefreshToken.role).toBeUndefined();
        });
    });
});