import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { v4 as uuidv4 } from 'uuid';

// Azure Storage configuration
let blobServiceClient: BlobServiceClient | null = null;

const getBlobServiceClient = (): BlobServiceClient => {
  if (blobServiceClient) return blobServiceClient;
  
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) {
    throw new Error('AZURE_STORAGE_ACCOUNT_NAME environment variable is required');
  }
  
  // Try to use managed identity first, fall back to account key
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  if (accountKey) {
    const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  } else {
    // Use managed identity
    const credential = new DefaultAzureCredential();
    blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    );
  }
  
  return blobServiceClient;
};

export interface SignedUploadUrlRequest {
  fileName: string;
  contentType: string;
  contentLength: number;
  businessId?: string;
  purpose: 'business-photo' | 'profile-photo' | 'news-image' | 'market-item-photo';
}

export interface SignedUploadUrlResponse {
  uploadUrl: string;
  blobPath: string;
  uploadId: string;
  expiresAt: Date;
}

export const generateSignedUploadUrl = async (request: SignedUploadUrlRequest, userId: string): Promise<SignedUploadUrlResponse> => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(request.contentType)) {
    throw new Error(`Unsupported content type: ${request.contentType}. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (request.contentLength > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSize} bytes`);
  }
  
  const uploadId = uuidv4();
  const fileExtension = request.contentType.split('/')[1];
  const containerName = 'uploads';
  const blobName = `${request.purpose}/${uploadId}.${fileExtension}`;
  
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  
  // Generate SAS URL with write permissions
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse('w'), // write permission
    expiresOn: expiresAt,
  };
  
  let sasToken: string;
  
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  if (accountKey) {
    // Generate SAS with account key
    const sharedKeyCredential = new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT_NAME!,
      accountKey
    );
    sasToken = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential
    ).toString();
  } else {
    // For managed identity, you would need to use a different approach
    // This is a simplified version - in production you might use Azure Functions bindings
    throw new Error('SAS generation with managed identity requires additional setup');
  }
  
  const uploadUrl = `${blobClient.url}?${sasToken}`;
  
  return {
    uploadUrl,
    blobPath: blobName,
    uploadId,
    expiresAt
  };
};

export const getPublicBlobUrl = (blobPath: string): string => {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  return `https://${accountName}.blob.core.windows.net/uploads/${blobPath}`;
};