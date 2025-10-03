import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { findBusinessById, softDeleteBusiness } from '../models/business';

const businessesDelete = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
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

        // Authorization check: only owner or admin can delete
        if (request.authedUser!.role !== 'admin' && business.owner_id !== request.authedUser!.id) {
            return { status: 403, jsonBody: { error: 'Forbidden: You do not have permission to delete this business.' } };
        }

        await softDeleteBusiness(id);

        return {
            status: 204 // No Content
        };
    } catch (error) {
        context.log('Error deleting business:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('businessesDelete', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'businesses/{id}',
    handler: withAuth(businessesDelete, ['business', 'admin'])
});