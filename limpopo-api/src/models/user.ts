import argon2 from 'argon2';
import { requireSupabase, requireSupabaseAdmin } from '../lib/supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  password_hash?: string;
  profile_photo_id?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as User | undefined;
};

export const findUserById = async (id: string): Promise<User | undefined> => {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, is_verified, created_at, updated_at')
    .eq('id', id)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as User | undefined;
};

export const createUser = async (userData: Pick<User, 'email' | 'name' | 'role'> & { password_raw: string }): Promise<User> => {
  const supabase = requireSupabaseAdmin(); // use service role for inserts if RLS enabled
  const password_hash = await argon2.hash(userData.password_raw, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1
  });
  const { data, error } = await supabase
    .from('users')
    .insert({ email: userData.email, name: userData.name, password_hash, role: userData.role })
    .select('id, email, name, role, is_verified, created_at, updated_at')
    .single();
  if (error) throw error;
  return data as unknown as User;
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};

export const updateUserVerificationStatus = async (userId: string, isVerified: boolean): Promise<User | undefined> => {
  const supabase = requireSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .update({ is_verified: isVerified })
    .eq('id', userId)
    .select('id, email, name, role, is_verified, created_at, updated_at')
    .maybeSingle();
  if (error) throw error;
  return data as unknown as User | undefined;
};