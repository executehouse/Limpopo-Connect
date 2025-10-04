import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { findBusinesses } from '../models/business';
import { findAllCategories } from '../models/businessCategory';

export async function businessesList(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const near = request.query.get('near'); // "lat,lng,radius"
        const category = request.query.get('category');
        const search = request.query.get('search');
        const limit = Math.min(parseInt(request.query.get('limit') || '20', 10), 100);
        const offset = parseInt(request.query.get('offset') || '0', 10);

        const options: any = { limit, offset };

        if (near) {
            const [lat, lng, radius] = near.split(',').map(parseFloat);
            if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
                if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && radius > 0) {
                    options.near = { lat, lng, radius };
                } else {
                    return {
                        status: 400,
                        jsonBody: { error: 'Invalid coordinates or radius in near parameter' }
                    };
                }
            } else {
                return {
                    status: 400,
                    jsonBody: { error: 'Invalid format for near parameter. Expected: lat,lng,radius' }
                };
            }
        }

        if (category) {
            options.category = category;
        }

        if (search) {
            options.search = search;
        }

        const businesses = await findBusinesses(options);
        
        return {
            status: 200,
            jsonBody: {
                businesses,
                pagination: {
                    limit,
                    offset,
                    count: businesses.length
                }
            }
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