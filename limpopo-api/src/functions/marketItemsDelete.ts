import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { findMarketItemById, softDeleteMarketItem } from '../models/marketItem';

const marketItemsDelete = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
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

        // Authorization check: only seller or admin can delete
        if (request.authedUser!.role !== 'admin' && item.seller_id !== request.authedUser!.id) {
            return { status: 403, jsonBody: { error: 'Forbidden: You do not have permission to delete this item.' } };
        }

        await softDeleteMarketItem(id);

        return {
            status: 204 // No Content
        };
    } catch (error) {
        context.log('Error deleting market item:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('marketItemsDelete', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'market/items/{id}',
    handler: withAuth(marketItemsDelete, ['admin', 'business', 'resident'])
});