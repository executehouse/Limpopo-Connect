import { query } from '../lib/db';

export interface BusinessCategory {
  id: number;
  name: string;
  slug: string;
}

export const findAllCategories = async (): Promise<BusinessCategory[]> => {
  const { rows } = await query('SELECT * FROM business_categories ORDER BY name');
  return rows;
};

export const findCategoryById = async (id: number): Promise<BusinessCategory | undefined> => {
  const { rows } = await query('SELECT * FROM business_categories WHERE id = $1', [id]);
  return rows[0];
};

export const findCategoryBySlug = async (slug: string): Promise<BusinessCategory | undefined> => {
  const { rows } = await query('SELECT * FROM business_categories WHERE slug = $1', [slug]);
  return rows[0];
};