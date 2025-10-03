import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findBusinessById } from '../models/business';

export async function businessesGet(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.params.id;

    if (!id) {
        return { status: 400, jsonBody: { error: 'Business ID is required' } };
    }

    try {
        const business = await findBusinessById(id);
        if (!business) {
            return { status: 404, jsonBody: { error: 'Business not found' } };
        }
        return {
            jsonBody: business
        };
    } catch (error) {
        context.log('Error getting business:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
}

app.http('businessesGet', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'businesses/{id}',
    handler: businessesGet
});