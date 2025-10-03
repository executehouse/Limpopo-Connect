import { query } from '../lib/db';

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_at: Date;
  end_at?: Date;
  address?: string;
  lat?: number;
  lng?: number;
  created_by: string;
  capacity?: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'status'>): Promise<Event> => {
  const { title, description, start_at, end_at, address, lat, lng, created_by, capacity } = eventData;
  const geom = (lat && lng) ? `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)` : null;
  const { rows } = await query(
    `INSERT INTO events (title, description, start_at, end_at, address, lat, lng, geom, created_by, capacity)
     VALUES ($1, $2, $3, $4, $5, $6, $7, ${geom}, $8, $9)
     RETURNING *`,
    [title, description, start_at, end_at, address, lat, lng, created_by, capacity]
  );
  return rows[0];
};

export const findEventById = async (id: string): Promise<Event | undefined> => {
  const { rows } = await query('SELECT * FROM events WHERE id = $1 AND deleted_at IS NULL', [id]);
  return rows[0];
};

export const findEvents = async (options: { limit?: number; offset?: number } = {}): Promise<Event[]> => {
  const { limit = 10, offset = 0 } = options;
  const { rows } = await query(
    'SELECT * FROM events WHERE deleted_at IS NULL ORDER BY start_at ASC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return rows;
};

export const updateEvent = async (id: string, updates: Partial<Event>): Promise<Event | undefined> => {
  const { title, description, start_at, end_at, address, lat, lng, capacity, status } = updates;
  const geom = (lat && lng) ? `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)` : null;

  const { rows } = await query(
      `UPDATE events SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          start_at = COALESCE($3, start_at),
          end_at = COALESCE($4, end_at),
          address = COALESCE($5, address),
          lat = COALESCE($6, lat),
          lng = COALESCE($7, lng),
          geom = COALESCE(${geom}, geom),
          capacity = COALESCE($8, capacity),
          status = COALESCE($9, status)
      WHERE id = $10 AND deleted_at IS NULL
      RETURNING *`,
      [title, description, start_at, end_at, address, lat, lng, capacity, status, id]
  );
  return rows[0];
};

export const softDeleteEvent = async (id: string): Promise<boolean> => {
  const { rowCount } = await query(
      'UPDATE events SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id]
  );
  return (rowCount ?? 0) > 0;
};