import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { createMarketItem } from '../models/marketItem';

const marketItemsCreate = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json() as any;
    const { title, description, price, currency = 'ZAR', stock, shipping_info } = body;

    if (!title || price === undefined) {
        return { status: 400, jsonBody: { error: 'Missing required fields: title, price' } };
    }

    const seller_id = request.authedUser!.id;

    try {
        const itemData = {
            seller_id,
            title,
            description,
            price,
            currency,
            stock,
            shipping_info
        };

        const newItem = await createMarketItem(itemData);

        return {
            status: 201,
            jsonBody: newItem
        };
    } catch (error) {
        context.log('Error creating market item:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('marketItemsCreate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'market/items',
    handler: withAuth(marketItemsCreate, ['admin', 'business', 'resident'])
});