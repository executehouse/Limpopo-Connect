import { authRegister } from '../../src/functions/authRegister';
import { authLogin } from '../../src/functions/authLogin';
import { usersMeHandler } from '../../src/functions/usersMe';
import { withAuth } from '../../src/lib/auth';
import { findUserByEmail, createUser, findUserById, User } from '../../src/models/user';
import { HttpRequest, InvocationContext } from '@azure/functions';
import * as argon2 from 'argon2';

// Mock the user model and argon2
jest.mock('../../src/models/user');
jest.mock('argon2');
const mockFindUserByEmail = findUserByEmail as jest.Mock;
const mockCreateUser = createUser as jest.Mock;
const mockFindUserById = findUserById as jest.Mock;

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-for-integration';

// A helper to create mock request and context objects
const createMockContext = () => ({
    log: jest.fn(),
    error: jest.fn(),
} as unknown as InvocationContext);

const createMockRequest = (body: any = {}, headers: any = {}, params: any = {}) => ({
    json: () => Promise.resolve(body),
    headers: {
        get: (key: string) => headers[key.toLowerCase()],
    },
    params,
} as unknown as HttpRequest);


describe('Auth Flow Integration Test', () => {
    let createdUser: User;

    beforeEach(() => {
        jest.clearAllMocks();
        const passwordHash = '$argon2i$v=19$m=4096,t=3,p=1$placeholder$placeholder';
        createdUser = {
            id: 'user-integ-test-123',
            email: 'test@example.com',
            name: 'Integ Test User',
            role: 'resident',
            password_hash: passwordHash,
            is_verified: true,
            created_at: new Date(),
            updated_at: new Date(),
        };
    });

    it('should allow a user to register, login, and access a protected route', async () => {
        const registerBody = { name: 'Integ Test User', email: 'test@example.com', password: 'password123' };
        const loginBody = { email: 'test@example.com', password: 'password123' };

        // --- 1. Registration ---
        mockFindUserByEmail.mockResolvedValueOnce(undefined); // No existing user
        mockCreateUser.mockResolvedValueOnce(createdUser);

        const registerReq = createMockRequest(registerBody);
        const registerContext = createMockContext();
        const registerRes = await authRegister(registerReq, registerContext);

        expect(registerRes.status).toBe(201);
        const registerJson: any = registerRes.jsonBody;
        expect(registerJson.user.email).toBe(registerBody.email);
        expect(registerJson.accessToken).toBeDefined();

        const accessToken = registerJson.accessToken;

        // --- 2. Login ---
        // Need to re-mock because the actual function is called again
        mockFindUserByEmail.mockResolvedValue(createdUser);
        // Mock argon2 verify
        (argon2.verify as jest.Mock).mockResolvedValue(true);

        const loginReq = createMockRequest(loginBody);
        const loginContext = createMockContext();
        const loginRes = await authLogin(loginReq, loginContext);

        expect(loginRes.status).toBe(200);
        const loginJson: any = loginRes.jsonBody;
        expect(loginJson.user.email).toBe(loginBody.email);
        expect(loginJson.accessToken).toBeDefined();

        // --- 3. Access Protected Route (/users/me) ---
        mockFindUserById.mockResolvedValue(createdUser);
        const meReq = createMockRequest({}, { authorization: `Bearer ${accessToken}` });
        const meContext = createMockContext();

        // We need to call the wrapped handler to test the middleware
        const meHandler = withAuth(async (req, ctx) => usersMeHandler(req as any, ctx));
        const meRes = await meHandler(meReq, meContext);

        expect(meRes.status).toBe(200);
        const meJson: any = meRes.jsonBody;
        expect(meJson.id).toBe(createdUser.id);
        expect(meJson.email).toBe(createdUser.email);
    });
});