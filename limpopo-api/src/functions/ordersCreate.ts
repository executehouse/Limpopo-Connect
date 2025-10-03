import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { createOrder } from '../models/order';

const ordersCreate = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json() as any;
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return { status: 400, jsonBody: { error: 'An array of items is required.' } };
    }

    const buyerId = request.authedUser!.id;

    try {
        const newOrder = await createOrder(buyerId, items, shippingAddress);
        return {
            status: 201,
            jsonBody: newOrder
        };
    } catch (e) {
        const error = e as Error;
        context.log('Error creating order:', error);
        // Check for specific error messages from the model
        if (error.message.includes('Not enough stock') || error.message.includes('not found')) {
            return { status: 400, jsonBody: { error: error.message } };
        }
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('ordersCreate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'orders',
    handler: withAuth(ordersCreate, ['admin', 'business', 'resident'])
});