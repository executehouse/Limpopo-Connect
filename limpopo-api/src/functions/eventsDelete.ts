import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { findEventById, softDeleteEvent } from '../models/event';

const eventsDelete = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.params.id;

    if (!id) {
        return { status: 400, jsonBody: { error: 'Event ID is required' } };
    }

    try {
        const event = await findEventById(id);
        if (!event) {
            return { status: 404, jsonBody: { error: 'Event not found' } };
        }

        // Authorization check: only creator or admin can delete
        if (request.authedUser!.role !== 'admin' && event.created_by !== request.authedUser!.id) {
            return { status: 403, jsonBody: { error: 'Forbidden: You do not have permission to delete this event.' } };
        }

        await softDeleteEvent(id);

        return {
            status: 204 // No Content
        };
    } catch (error) {
        context.log('Error deleting event:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('eventsDelete', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'events/{id}',
    handler: withAuth(eventsDelete, ['admin', 'business'])
});