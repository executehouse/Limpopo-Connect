import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findBusinesses } from '../models/business';

export async function businessesList(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const near = request.query.get('near'); // "lat,lng,radius"
    const category = request.query.get('category');
    const search = request.query.get('search');
    const limit = parseInt(request.query.get('limit') || '10', 10);
    const offset = parseInt(request.query.get('offset') || '0', 10);

    const options: any = { limit, offset };

    if (near) {
        const [lat, lng, radius] = near.split(',').map(parseFloat);
        if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
            options.near = { lat, lng, radius };
        }
    }

    if (category) {
        options.category = category;
    }

    if (search) {
        options.search = search;
    }

    try {
        const businesses = await findBusinesses(options);
        return {
            jsonBody: businesses
        };
    } catch (error) {
        context.log('Error listing businesses:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
}

app.http('businessesList', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'businesses',
    handler: businessesList
});