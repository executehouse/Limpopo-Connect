import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { searchAll } from '../models/search';

interface SearchOptions {
    types?: Array<'business' | 'event' | 'market_item'>;
    near?: { lat: number; lng: number };
    limit: number;
    offset: number;
}

export async function search(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const q = request.query.get('q');
    if (!q) {
        return { status: 400, jsonBody: { error: 'Query parameter "q" is required.' } };
    }

    const typesParam = request.query.get('types');
    const nearParam = request.query.get('near'); // "lat,lng"
    const limit = parseInt(request.query.get('limit') || '20', 10);
    const offset = parseInt(request.query.get('offset') || '0', 10);

    const options: SearchOptions = { limit, offset };

    if (typesParam) {
        options.types = typesParam.split(',') as Array<'business' | 'event' | 'market_item'>;
    }

    if (nearParam) {
        const [lat, lng] = nearParam.split(',').map(parseFloat);
        if (!isNaN(lat) && !isNaN(lng)) {
            options.near = { lat, lng };
        }
    }

    try {
        const results = await searchAll(q, options);
        return {
            jsonBody: results
        };
    } catch (error) {
        context.log('Error during search:', error);
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
}

app.http('search', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'search',
    handler: search
});