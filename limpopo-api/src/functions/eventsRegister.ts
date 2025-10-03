import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { findEventById } from '../models/event';
import { createEventRegistration, findRegistrationsForEvent } from '../models/eventRegistration';

const eventsRegister = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const eventId = request.params.id;
    const userId = request.authedUser!.id;

    if (!eventId) {
        return { status: 400, jsonBody: { error: 'Event ID is required' } };
    }

    try {
        const event = await findEventById(eventId);
        if (!event) {
            return { status: 404, jsonBody: { error: 'Event not found' } };
        }

        if (event.capacity) {
            const registrations = await findRegistrationsForEvent(eventId);
            if (registrations.length >= event.capacity) {
                return { status: 409, jsonBody: { error: 'Event is at full capacity' } };
            }
        }

        const registration = await createEventRegistration(eventId, userId);

        return {
            status: 201,
            jsonBody: registration
        };
    } catch (error) {
        context.log('Error registering for event:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('eventsRegister', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'events/{id}/register',
    handler: withAuth(eventsRegister, ['admin', 'business', 'resident'])
});