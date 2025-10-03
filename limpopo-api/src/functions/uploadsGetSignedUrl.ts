import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions, SASProtocol } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';

const a = process.env.AZURE_STORAGE_ACCOUNT_NAME
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

    const body = await request.json() as any;
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
        return { status: 400, jsonBody: { error: 'fileName and contentType are required.' } };
    }

    const blobName = `${request.authedUser!.id}/${uuidv4()}-${fileName}`;
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient(blobName);

    const sasToken = await blobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse("write"),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 300 * 1000), // 5 minutes
        protocol: SASProtocol.Https,
        contentType: contentType,
    });

    return {
        jsonBody: {
            uploadUrl: sasToken,
            blobPath: blobName
        }
    };
};

app.http('uploadsGetSignedUrl', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'uploads/get-signed-url',
    handler: withAuth(uploadsGetSignedUrl, ['business', 'admin', 'resident'])
});