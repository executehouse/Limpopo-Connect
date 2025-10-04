import { query } from '../lib/db';

export interface Upload {
  id: string;
  blob_path: string;
  mime_type: string;
  size: number;
  uploaded_by: string;
  created_at: Date;
}

export const createUpload = async (uploadData: Omit<Upload, 'id' | 'created_at'>): Promise<Upload> => {
  const { blob_path, mime_type, size, uploaded_by } = uploadData;
  const { rows } = await query(
    'INSERT INTO uploads (blob_path, mime_type, size, uploaded_by) VALUES ($1, $2, $3, $4) RETURNING *',
    [blob_path, mime_type, size, uploaded_by]
  );
  return rows[0];
};

export const findUploadById = async (id: string): Promise<Upload | undefined> => {
  const { rows } = await query('SELECT * FROM uploads WHERE id = $1', [id]);
  return rows[0];
};

export const findUploadsByUser = async (userId: string, limit = 50, offset = 0): Promise<Upload[]> => {
  const { rows } = await query(
    'SELECT * FROM uploads WHERE uploaded_by = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return rows;
};

export const deleteUpload = async (id: string): Promise<boolean> => {
  const { rowCount } = await query('DELETE FROM uploads WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
};