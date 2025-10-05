import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';

export const usersMeHandler = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // The user object is attached by the withAuth middleware
        const { authedUser } = request;

        if (!authedUser) {
            return {
                status: 401,
                jsonBody: { error: 'Authentication required' }
            };
        }

        // Remove sensitive fields before returning
        const { password_hash: _password_hash, ...userResponse } = authedUser;

        return {
            status: 200,
            jsonBody: userResponse
        };
    } catch (error) {
        context.log('Error in usersMe:', error);
        return {
            status: 500,
            jsonBody: { error: 'Internal server error' }
        };
    }
};

// Wrap the handler with the authentication middleware
app.http('usersMe', {
    methods: ['GET'],
    authLevel: 'anonymous', // Auth is handled by the middleware
    route: 'users/me',
    handler: withAuth(usersMeHandler)
});