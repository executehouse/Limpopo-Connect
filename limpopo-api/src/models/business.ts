import { query } from '../lib/db';

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  category_id: number;
  description: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  open_hours: Record<string, unknown> | null;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  version: number;
}

export const createBusiness = async (businessData: Omit<Business, 'id' | 'created_at' | 'updated_at' | 'version' | 'deleted_at' | 'is_verified'>): Promise<Business> => {
  const { owner_id, name, category_id, description, address, lat, lng, phone, website, open_hours } = businessData;
  
  // Validate coordinates
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error('Invalid coordinates: lat must be between -90 and 90, lng must be between -180 and 180');
  }
  
  const { rows } = await query(
    `INSERT INTO businesses (owner_id, name, category_id, description, address, lat, lng, geom, phone, website, open_hours)
     VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($7, $6), 4326), $8, $9, $10)
     RETURNING *`,
    [owner_id, name, category_id, description, address, lat, lng, phone, website, open_hours]
  );
  return rows[0];
};

export const findBusinessById = async (id: string): Promise<Business | undefined> => {
  const { rows } = await query('SELECT * FROM businesses WHERE id = $1 AND deleted_at IS NULL', [id]);
  return rows[0];
};

export const findBusinesses = async (options: { near?: { lat: number, lng: number, radius: number }, category?: string, search?: string, limit?: number, offset?: number } = {}): Promise<Business[]> => {
  const whereClauses = ['deleted_at IS NULL'];
  const params = [];
  let paramIndex = 1;

  if (options.search) {
    whereClauses.push(`name ILIKE $${paramIndex++}`);
    params.push(`%${options.search}%`);
  }

  if (options.category) {
    whereClauses.push(`category_id = (SELECT id FROM business_categories WHERE slug = $${paramIndex++})`);
    params.push(options.category);
  }

  let distanceSelect = '';
  if (options.near) {
    distanceSelect = `ST_Distance(geom, ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326)) as distance,`;
    params.push(options.near.lng, options.near.lat);
    whereClauses.push(`ST_DWithin(geom, ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326), $${paramIndex++})`);
    params.push(options.near.lng, options.near.lat, options.near.radius * 1000); // radius in meters
  }

  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const orderBy = options.near ? 'ORDER BY distance' : 'ORDER BY created_at DESC';
  const limit = `LIMIT $${paramIndex++}`;
  params.push(options.limit || 10);
  const offset = `OFFSET $${paramIndex++}`;
  params.push(options.offset || 0);

  const q = `SELECT id, name, description, address, lat, lng, phone, website, open_hours, is_verified, created_at, ${distanceSelect} FROM businesses ${where} ${orderBy} ${limit} ${offset}`;

  const { rows } = await query(q, params);
  return rows;
};

export const updateBusiness = async (id: string, updates: Partial<Business>): Promise<Business | undefined> => {
    const { name, category_id, description, address, lat, lng, phone, website, open_hours } = updates;
    
    // Validate coordinates if provided
    if ((lat !== undefined && (lat < -90 || lat > 90)) || (lng !== undefined && (lng < -180 || lng > 180))) {
        throw new Error('Invalid coordinates: lat must be between -90 and 90, lng must be between -180 and 180');
    }

    let geomUpdate = '';
    const params = [name, category_id, description, address, lat, lng, phone, website, open_hours, id];
    
    if (lat !== undefined && lng !== undefined) {
        geomUpdate = ', geom = ST_SetSRID(ST_MakePoint($6, $5), 4326)';
    }

    const { rows } = await query(
        `UPDATE businesses SET
            name = COALESCE($1, name),
            category_id = COALESCE($2, category_id),
            description = COALESCE($3, description),
            address = COALESCE($4, address),
            lat = COALESCE($5, lat),
            lng = COALESCE($6, lng)${geomUpdate},
            phone = COALESCE($7, phone),
            website = COALESCE($8, website),
            open_hours = COALESCE($9, open_hours),
            version = version + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10 AND deleted_at IS NULL
        RETURNING *`,
        params
    );
    return rows[0];
};

export const softDeleteBusiness = async (id: string): Promise<boolean> => {
    const { rowCount } = await query(
        'UPDATE businesses SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
        [id]
    );
    return (rowCount ?? 0) > 0;
};