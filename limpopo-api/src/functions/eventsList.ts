import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findEvents } from '../models/event';

export async function eventsList(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const limit = parseInt(request.query.get('limit') || '10', 10);
    const offset = parseInt(request.query.get('offset') || '0', 10);

    try {
        const events = await findEvents({ limit, offset });
        return {
            jsonBody: events
        };
    } catch (error) {
        context.log('Error listing events:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
}

app.http('eventsList', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'events',
    handler: eventsList
});