import { app, input, InvocationContext } from "@azure/functions";
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

const processImageUpload = async (blob: unknown, context: InvocationContext): Promise<void> => {
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

    const pathParts = blobPath.split('/');
    if (pathParts.length < 2) {
        context.log('Invalid blob path format. Expected "userId/fileName". Got:', blobPath);
        return;
    }
    const [userId, ...fileNameParts] = pathParts;
    const blobName = fileNameParts.join('/');


    try {
        // --- 1. Generate Thumbnail ---
        const thumbnailBuffer = await sharp(blob)
            .resize(200, 200, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toBuffer();

        const thumbnailContainerClient = blobServiceClient.getContainerClient(thumbnailContainerName);
        const thumbnailBlobClient = thumbnailContainerClient.getBlockBlobClient(blobName);
        await thumbnailBlobClient.uploadData(thumbnailBuffer, {
            blobHTTPHeaders: { blobContentType: 'image/jpeg' }
        });
        context.log('Thumbnail created and uploaded to:', `thumbnails/${blobName}`);

        // --- 2. Save metadata to 'uploads' table ---
        const originalBlobClient = blobServiceClient.getContainerClient(containerName).getBlobClient(blobPath);
        const properties = await originalBlobClient.getProperties();

        await query(
            `INSERT INTO uploads (blob_path, mime_type, size, uploaded_by)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (blob_path) DO NOTHING`, // Avoid duplicates if triggered multiple times
            [blobPath, properties.contentType, properties.contentLength, userId]
        );
        context.log('Upload metadata saved to database for:', blobPath);

    } catch (error) {
        context.error('Error processing image upload:', error);
        // Depending on the error, you might want to move the blob to a poison queue
    }
};

app.storageBlob('processImageUpload', {
    path: `${containerName}/{name}`,
    connection: 'AzureWebJobsStorage',
    handler: processImageUpload
});