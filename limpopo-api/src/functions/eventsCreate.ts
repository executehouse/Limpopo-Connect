import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { createEvent } from '../models/event';

interface CreateEventRequest {
    title: string;
    description?: string;
    start_at: string;
    end_at?: string;
    address?: string;
    lat?: number;
    lng?: number;
    capacity?: number;
}

const eventsCreate = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json() as CreateEventRequest;
    const { title, description, start_at, end_at, address, lat, lng, capacity } = body;

    if (!title || !start_at) {
        return { status: 400, jsonBody: { error: 'Missing required fields: title, start_at' } };
    }

    const created_by = request.authedUser!.id;

    try {
        const eventData = {
            title,
            description,
            start_at: new Date(start_at),
            end_at: end_at ? new Date(end_at) : undefined,
            address,
            lat,
            lng,
            capacity,
            created_by,
        };

        const newEvent = await createEvent(eventData);

        return {
            status: 201,
            jsonBody: newEvent
        };
    } catch (error) {
        context.log('Error creating event:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('eventsCreate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'events',
    handler: withAuth(eventsCreate, ['admin', 'business'])
});