import { query } from '../lib/db';
import argon2 from 'argon2';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  password_hash?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
  return rows[0];
};

export const findUserById = async (id: string): Promise<User | undefined> => {
  const { rows } = await query('SELECT id, email, name, role, is_verified, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
  return rows[0];
};

export const createUser = async (userData: Pick<User, 'email' | 'name' | 'role'> & { password_raw: string }): Promise<User> => {
  const password_hash = await argon2.hash(userData.password_raw);
  const { rows } = await query(
    'INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, is_verified, created_at, updated_at',
    [userData.email, userData.name, password_hash, userData.role]
  );
  return rows[0];
};