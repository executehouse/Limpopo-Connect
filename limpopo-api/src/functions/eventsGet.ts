import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findEventById } from '../models/event';

export async function eventsGet(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        return {
            jsonBody: event
        };
    } catch (error) {
        context.log('Error getting event:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
}

app.http('eventsGet', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'events/{id}',
    handler: eventsGet
});