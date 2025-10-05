import { app, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from '@azure/storage-blob';
import sharp from 'sharp';
import { query } from '../lib/db';

const connection = process.env.AzureWebJobsStorage;
const containerName = 'uploads';
const thumbnailContainerName = 'thumbnails';

if (!connection) {
    throw new Error("AzureWebJobsStorage connection string is not defined.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connection);

export const processImageUpload = async (blob: unknown, context: InvocationContext): Promise<void> => {
    if (!blob || !(blob instanceof Buffer)) {
        context.error('Blob input was not a Buffer.');
        return;
    }
    context.log(`Blob trigger function processed blob with size ${blob.length} bytes`);

    const blobPath = context.triggerMetadata?.name as string;
    if (!blobPath) {
        context.error('Blob path not found in trigger metadata.');
        return;
    }

    context.log(`Processing image upload: ${blobPath}`);

    try {
        // Parse blob path - expected format: purpose/uploadId.extension
        const pathParts = blobPath.split('/');
        if (pathParts.length < 2) {
            context.log('Invalid blob path format. Expected "purpose/uploadId.extension". Got:', blobPath);
            return;
        }
        
        const purpose = pathParts[0];
        const fileName = pathParts[pathParts.length - 1];
        const uploadId = fileName.split('.')[0];
        
        // Get original blob properties
        const originalBlobClient = blobServiceClient.getContainerClient(containerName).getBlobClient(blobPath);
        const properties = await originalBlobClient.getProperties();
        
        // Get image metadata using sharp
        const metadata = await sharp(blob).metadata();
        const { width, height, format, size } = metadata;
        
        context.log(`Image metadata - Width: ${width}, Height: ${height}, Format: ${format}, Size: ${size}`);

        // Generate multiple thumbnail sizes
        const thumbnailSizes = [
            { suffix: '_thumb_150', width: 150, height: 150 },
            { suffix: '_thumb_300', width: 300, height: 300 },
            { suffix: '_medium_800', width: 800, height: 600 }
        ];
        
        const thumbnailContainerClient = blobServiceClient.getContainerClient(thumbnailContainerName);
        const thumbnailPaths: string[] = [];
        
        for (const thumbSize of thumbnailSizes) {
            try {
                const thumbnailBuffer = await sharp(blob)
                    .resize(thumbSize.width, thumbSize.height, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .jpeg({ quality: 85 })
                    .toBuffer();
                
                const thumbnailName = fileName.replace(/\.[^.]+$/, `${thumbSize.suffix}.jpg`);
                const thumbnailPath = `${purpose}/${thumbnailName}`;
                const thumbnailBlobClient = thumbnailContainerClient.getBlockBlobClient(thumbnailPath);
                
                await thumbnailBlobClient.uploadData(thumbnailBuffer, {
                    blobHTTPHeaders: { blobContentType: 'image/jpeg' }
                });
                
                thumbnailPaths.push(thumbnailPath);
                context.log(`Generated thumbnail: ${thumbnailPath}`);
            } catch (thumbError) {
                context.error(`Error generating thumbnail ${thumbSize.suffix}:`, thumbError);
            }
        }

        // Determine content type
        let contentType = properties.contentType || 'application/octet-stream';
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                contentType = 'image/jpeg';
                break;
            case 'png':
                contentType = 'image/png';
                break;
            case 'webp':
                contentType = 'image/webp';
                break;
        }

        // TODO: In a complete implementation, you would:
        // 1. Look up the upload record by uploadId to get the user_id
        // 2. Create the upload record in the uploads table
        // 3. If it's a business photo, create the business_photos record
        
        // For now, we'll create a placeholder upload record
        // This would need to be enhanced with proper user tracking
        try {
            await query(
                `INSERT INTO uploads (id, blob_path, mime_type, size, uploaded_by)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO UPDATE SET
                 blob_path = EXCLUDED.blob_path,
                 mime_type = EXCLUDED.mime_type,
                 size = EXCLUDED.size`,
                [uploadId, blobPath, contentType, properties.contentLength || size, uploadId] // Using uploadId as placeholder user
            );
            
            context.log(`Upload metadata saved to database for: ${blobPath}`);
        } catch (dbError) {
            context.log('Database error (this is expected in current implementation):', dbError);
        }
        
        context.log(`Successfully processed upload ${uploadId} for purpose ${purpose}`);
        context.log(`Generated ${thumbnailPaths.length} thumbnails`);

    } catch (error) {
        context.error('Error processing image upload:', error);
        // In production, you might want to move failed blobs to a poison queue
    }
};

app.storageBlob('processImageUpload', {
    path: `${containerName}/{name}`,
    connection: 'AzureWebJobsStorage',
    handler: processImageUpload
});