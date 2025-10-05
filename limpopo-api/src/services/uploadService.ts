import { v4 as uuidv4 } from 'uuid';

// NOTE: Azure Blob implementation removed.
// This module now provides a minimal interface and throws until Supabase Storage
// (or another provider) is implemented. Keeping the shape allows incremental refactors.

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

export const generateSignedUploadUrl = async (request: SignedUploadUrlRequest, _userId: string): Promise<SignedUploadUrlResponse> => {
  // Basic validation retained
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(request.contentType)) {
    throw new Error(`Unsupported content type: ${request.contentType}. Allowed types: ${allowedTypes.join(', ')}`);
  }
  const maxSize = 10 * 1024 * 1024;
  if (request.contentLength > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSize} bytes`);
  }

  // Placeholder (fake URL) until Supabase Storage implementation
  const uploadId = uuidv4();
  const fileExtension = request.contentType.split('/')[1];
  const objectPath = `${request.purpose}/${uploadId}.${fileExtension}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const fakeUploadUrl = `https://example.invalid/upload-url/${objectPath}?placeholder=1`;

  return {
    uploadUrl: fakeUploadUrl,
    blobPath: objectPath,
    uploadId,
    expiresAt
  };
};

export const getPublicBlobUrl = (blobPath: string): string => {
  // Placeholder public URL until new storage backend in place
  return `https://cdn.example.invalid/${blobPath}`;
};