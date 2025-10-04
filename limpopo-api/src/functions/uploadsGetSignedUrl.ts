import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions, SASProtocol } from "@azure/storage-blob";
import { validateMimeType } from '../lib/validation';
import { v4 as uuidv4 } from 'uuid';

// These should be loaded from environment variables, preferably from Key Vault
const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const CONTAINER_NAME = 'uploads';

if (!ACCOUNT_NAME || !ACCOUNT_KEY) {
    throw new Error("Azure Storage credentials are not configured.");
}

const sharedKeyCredential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
const blobServiceClient = new BlobServiceClient(
  `https://${ACCOUNT_NAME}.blob.core.windows.net`,
  sharedKeyCredential
);

const uploadsGetSignedUrl = async (request: AuthenticatedRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const body = await request.json() as any;
        const { fileName, contentType, contentLength, businessId, purpose = 'business-photo' } = body;
        const userId = request.authedUser!.id;

        // Validation
        const validationErrors: string[] = [];
        
        if (!fileName) {
            validationErrors.push('fileName is required');
        }
        
        if (!contentType) {
            validationErrors.push('contentType is required');
        } else if (!validateMimeType(contentType)) {
            validationErrors.push('Unsupported file type. Allowed: image/jpeg, image/png, image/webp');
        }
        
        if (!contentLength || contentLength <= 0) {
            validationErrors.push('contentLength is required and must be positive');
        } else if (contentLength > 10 * 1024 * 1024) { // 10MB limit
            validationErrors.push('File too large. Maximum size is 10MB');
        }
        
        const allowedPurposes = ['business-photo', 'profile-photo', 'news-image', 'market-item-photo'];
        if (!allowedPurposes.includes(purpose)) {
            validationErrors.push(`Invalid purpose. Allowed: ${allowedPurposes.join(', ')}`);
        }
        
        if (purpose === 'business-photo' && !businessId) {
            validationErrors.push('businessId is required for business photos');
        }
        
        if (validationErrors.length > 0) {
            return {
                status: 400,
                jsonBody: { error: 'Validation failed', details: validationErrors }
            };
        }

        // Generate unique blob path
        const uploadId = uuidv4();
        const fileExtension = fileName.split('.').pop() || 'jpg';
        const blobName = `${purpose}/${uploadId}.${fileExtension}`;
        
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        const blobClient = containerClient.getBlobClient(blobName);

        const expiresAt = new Date(new Date().valueOf() + 60 * 60 * 1000); // 1 hour
        
        const sasToken = await blobClient.generateSasUrl({
            permissions: BlobSASPermissions.parse("write"),
            startsOn: new Date(),
            expiresOn: expiresAt,
            protocol: SASProtocol.Https,
            contentType: contentType,
        });

        context.log(`Signed URL generated for user ${userId}, upload ID: ${uploadId}`);

        return {
            status: 200,
            jsonBody: {
                uploadUrl: sasToken,
                blobPath: blobName,
                uploadId,
                expiresAt
            }
        };
        
    } catch (error) {
        context.log('Error generating signed URL:', error);
        
        if (error instanceof Error) {
            return {
                status: 400,
                jsonBody: { error: error.message }
            };
        }
        
        return {
            status: 500,
            jsonBody: { error: 'Internal server error' }
        };
    }
};

app.http('uploadsGetSignedUrl', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'uploads/signed-url',
    handler: withAuth(uploadsGetSignedUrl, ['business', 'admin', 'resident'])
});