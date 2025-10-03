import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findMarketItems } from '../models/marketItem';

export async function marketItemsList(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const limit = parseInt(request.query.get('limit') || '10', 10);
    const offset = parseInt(request.query.get('offset') || '0', 10);

    try {
        const items = await findMarketItems({ limit, offset });
        return {
            jsonBody: items
        };
    } catch (error) {
        context.log('Error listing market items:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
}

app.http('marketItemsList', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'market/items',
    handler: marketItemsList
});