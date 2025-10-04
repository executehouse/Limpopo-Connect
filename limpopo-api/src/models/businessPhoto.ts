import { query } from '../lib/db';

export interface BusinessPhoto {
  id: string;
  business_id: string;
  upload_id: string;
  width?: number;
  height?: number;
  thumbnail_paths?: string[];
  created_at: Date;
}

export const createBusinessPhoto = async (photoData: Omit<BusinessPhoto, 'id' | 'created_at'>): Promise<BusinessPhoto> => {
  const { business_id, upload_id, width, height } = photoData;
  const { rows } = await query(
    'INSERT INTO business_photos (business_id, upload_id, width, height) VALUES ($1, $2, $3, $4) RETURNING *',
    [business_id, upload_id, width, height]
  );
  return rows[0];
};

export const updateBusinessPhotoThumbnails = async (photoId: string, thumbnailPaths: string[]): Promise<BusinessPhoto | undefined> => {
  const { rows } = await query(
    'UPDATE business_photos SET thumbnail_paths = $1 WHERE id = $2 RETURNING *',
    [JSON.stringify(thumbnailPaths), photoId]
  );
  return rows[0];
};

export const findBusinessPhotos = async (businessId: string): Promise<BusinessPhoto[]> => {
  const { rows } = await query(
    `SELECT bp.*, u.blob_path, u.mime_type, u.size 
     FROM business_photos bp 
     JOIN uploads u ON bp.upload_id = u.id 
     WHERE bp.business_id = $1 
     ORDER BY bp.created_at DESC`,
    [businessId]
  );
  return rows;
};

export const deleteBusinessPhoto = async (photoId: string, businessId: string): Promise<boolean> => {
  const { rowCount } = await query(
    'DELETE FROM business_photos WHERE id = $1 AND business_id = $2',
    [photoId, businessId]
  );
  return (rowCount ?? 0) > 0;
};