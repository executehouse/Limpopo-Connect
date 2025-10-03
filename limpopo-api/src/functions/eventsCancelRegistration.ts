import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { cancelEventRegistration } from '../models/eventRegistration';

const eventsCancelRegistration = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const eventId = request.params.id;
    const userId = request.authedUser!.id;

    if (!eventId) {
        return { status: 400, jsonBody: { error: 'Event ID is required' } };
    }

    try {
        const success = await cancelEventRegistration(eventId, userId);

        if (!success) {
            // This could be because the registration never existed. 404 is appropriate.
            return { status: 404, jsonBody: { error: 'Registration not found or already cancelled.' } };
        }

        return {
            status: 204 // No Content
        };
    } catch (error) {
        context.log('Error cancelling registration:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('eventsCancelRegistration', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'events/{id}/register',
    handler: withAuth(eventsCancelRegistration, ['admin', 'business', 'resident'])
});