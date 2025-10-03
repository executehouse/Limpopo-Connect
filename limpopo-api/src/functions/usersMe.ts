import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';

export const usersMeHandler = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    // The user object is attached by the withAuth middleware
    const { authedUser } = request;

    return {
        status: 200,
        jsonBody: authedUser
    };
};

// Wrap the handler with the authentication middleware
app.http('usersMe', {
    methods: ['GET'],
    authLevel: 'anonymous', // Auth is handled by the middleware
    route: 'users/me',
    handler: withAuth(usersMeHandler)
});