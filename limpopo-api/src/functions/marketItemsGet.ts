import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findMarketItemById } from '../models/marketItem';

export async function marketItemsGet(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.params.id;

    if (!id) {
        return { status: 400, jsonBody: { error: 'Market item ID is required' } };
    }

    try {
        const item = await findMarketItemById(id);
        if (!item) {
            return { status: 404, jsonBody: { error: 'Market item not found' } };
        }
        return {
            jsonBody: item
        };
    } catch (error) {
        context.log('Error getting market item:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
}

app.http('marketItemsGet', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'market/items/{id}',
    handler: marketItemsGet
});