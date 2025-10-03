import { query } from '../lib/db';

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: 'confirmed' | 'cancelled';
  created_at: Date;
}

export const createEventRegistration = async (eventId: string, userId: string): Promise<EventRegistration> => {
  const { rows } = await query(
    `INSERT INTO event_registrations (event_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (event_id, user_id) DO UPDATE SET status = 'confirmed'
     RETURNING *`,
    [eventId, userId]
  );
  return rows[0];
};

export const findRegistration = async (eventId: string, userId: string): Promise<EventRegistration | undefined> => {
  const { rows } = await query(
    'SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2',
    [eventId, userId]
  );
  return rows[0];
};

export const findRegistrationsForEvent = async (eventId: string): Promise<EventRegistration[]> => {
    const { rows } = await query(
      'SELECT * FROM event_registrations WHERE event_id = $1 AND status = \'confirmed\'',
      [eventId]
    );
    return rows;
};


export const cancelEventRegistration = async (eventId: string, userId: string): Promise<boolean> => {
  const { rowCount } = await query(
    `UPDATE event_registrations SET status = 'cancelled' WHERE event_id = $1 AND user_id = $2`,
    [eventId, userId]
  );
  return (rowCount ?? 0) > 0;
};