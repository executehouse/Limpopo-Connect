import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { createBusiness, Business } from '../models/business';

const businessesCreate = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    const body = await request.json() as any;
    const { name, category_id, description, address, lat, lng, phone, website, open_hours } = body;

    if (!name || !category_id || !address || !lat || !lng) {
        return { status: 400, jsonBody: { error: 'Missing required fields: name, category_id, address, lat, lng' } };
    }

    const owner_id = request.authedUser!.id;

    try {
        const businessData: Omit<Business, 'id' | 'created_at' | 'updated_at' | 'version' | 'deleted_at' | 'is_verified'> = {
            owner_id,
            name,
            category_id,
            description,
            address,
            lat,
            lng,
            phone,
            website,
            open_hours,
        };

        // The 'as any' is a temporary workaround for the Omit type.
        const newBusiness = await createBusiness(businessData as any);

        return {
            status: 201,
            jsonBody: newBusiness
        };
    } catch (error) {
        context.log('Error creating business:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
};

app.http('businessesCreate', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'businesses',
    handler: withAuth(businessesCreate, ['business', 'admin'])
});