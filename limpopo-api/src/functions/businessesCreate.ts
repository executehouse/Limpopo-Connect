import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { createBusiness } from '../models/business';
import { findCategoryById } from '../models/businessCategory';
import { validateBusinessName, validateCoordinates, validateUrl, validatePhone, sanitizeInput } from '../lib/validation';

interface CreateBusinessRequest {
    name: string;
    category_id: number;
    description?: string;
    address: string;
    lat: number;
    lng: number;
    phone?: string;
    website?: string;
    open_hours?: Record<string, unknown> | null;
}

export const businessesCreate = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as CreateBusinessRequest;
        const { name, category_id, description, address, lat, lng, phone, website, open_hours } = body;

        // Validation
        const validationErrors: string[] = [];
        
        if (!name) {
            validationErrors.push('Business name is required');
        } else if (!validateBusinessName(name)) {
            validationErrors.push('Business name must be between 2 and 200 characters');
        }
        
        if (!category_id) {
            validationErrors.push('Category is required');
        } else {
            const category = await findCategoryById(category_id);
            if (!category) {
                validationErrors.push('Invalid category ID');
            }
        }
        
        if (!address) {
            validationErrors.push('Address is required');
        }
        
        if (lat === undefined || lng === undefined) {
            validationErrors.push('Latitude and longitude are required');
        } else if (!validateCoordinates(lat, lng)) {
            validationErrors.push('Invalid coordinates');
        }
        
        if (phone && !validatePhone(phone)) {
            validationErrors.push('Invalid phone number format');
        }
        
        if (website && !validateUrl(website)) {
            validationErrors.push('Invalid website URL');
        }
        
        if (validationErrors.length > 0) {
            return {
                status: 400,
                jsonBody: { error: 'Validation failed', details: validationErrors }
            };
        }

        const owner_id = request.authedUser!.id;

        const businessData = {
            owner_id,
            name: sanitizeInput(name),
            category_id,
            description: description ? sanitizeInput(description) : '',
            address: sanitizeInput(address),
            lat,
            lng,
            phone: phone ? sanitizeInput(phone) : '',
            website: website ? sanitizeInput(website) : '',
            open_hours: open_hours || null,
        };

        const newBusiness = await createBusiness(businessData);

        context.log(`Business created successfully: ${newBusiness.id}`);

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