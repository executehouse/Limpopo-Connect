import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { findBusinessById, updateBusiness } from '../models/business';

const businessesUpdate = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.params.id;
    const updates = await request.json() as any;

    if (!id) {
        return { status: 400, jsonBody: { error: 'Business ID is required' } };
    }

    try {
        const business = await findBusinessById(id);
        if (!business) {
            return { status: 404, jsonBody: { error: 'Business not found' } };
        }

        // Authorization check: only owner or admin can update
        if (request.authedUser!.role !== 'admin' && business.owner_id !== request.authedUser!.id) {
            return { status: 403, jsonBody: { error: 'Forbidden: You do not have permission to update this business.' } };
        }

        const updatedBusiness = await updateBusiness(id, updates);

        return {
            jsonBody: updatedBusiness
        };
    } catch (error) {
        context.log('Error updating business:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('businessesUpdate', {
    methods: ['PATCH', 'PUT'],
    authLevel: 'anonymous',
    route: 'businesses/{id}',
    handler: withAuth(businessesUpdate, ['business', 'admin'])
});