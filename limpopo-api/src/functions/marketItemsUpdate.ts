import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { findMarketItemById, updateMarketItem } from '../models/marketItem';

const marketItemsUpdate = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.params.id;
    const updates = await request.json() as any;

    if (!id) {
        return { status: 400, jsonBody: { error: 'Market item ID is required' } };
    }

    try {
        const item = await findMarketItemById(id);
        if (!item) {
            return { status: 404, jsonBody: { error: 'Market item not found' } };
        }

        // Authorization check: only seller or admin can update
        if (request.authedUser!.role !== 'admin' && item.seller_id !== request.authedUser!.id) {
            return { status: 403, jsonBody: { error: 'Forbidden: You do not have permission to update this item.' } };
        }

        const updatedItem = await updateMarketItem(id, updates);

        return {
            jsonBody: updatedItem
        };
    } catch (error) {
        context.log('Error updating market item:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('marketItemsUpdate', {
    methods: ['PATCH', 'PUT'],
    authLevel: 'anonymous',
    route: 'market/items/{id}',
    handler: withAuth(marketItemsUpdate, ['admin', 'business', 'resident'])
});