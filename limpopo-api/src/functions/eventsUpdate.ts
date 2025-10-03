import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { findEventById, updateEvent } from '../models/event';

const eventsUpdate = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.params.id;
    const updates = await request.json() as any;

    if (!id) {
        return { status: 400, jsonBody: { error: 'Event ID is required' } };
    }

    try {
        const event = await findEventById(id);
        if (!event) {
            return { status: 404, jsonBody: { error: 'Event not found' } };
        }

        // Authorization check: only creator or admin can update
        if (request.authedUser!.role !== 'admin' && event.created_by !== request.authedUser!.id) {
            return { status: 403, jsonBody: { error: 'Forbidden: You do not have permission to update this event.' } };
        }

        const updatedEvent = await updateEvent(id, updates);

        return {
            jsonBody: updatedEvent
        };
    } catch (error) {
        context.log('Error updating event:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('eventsUpdate', {
    methods: ['PATCH', 'PUT'],
    authLevel: 'anonymous',
    route: 'events/{id}',
    handler: withAuth(eventsUpdate, ['admin', 'business'])
});