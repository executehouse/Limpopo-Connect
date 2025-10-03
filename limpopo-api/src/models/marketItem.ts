import { query } from '../lib/db';

export interface MarketItem {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  stock?: number;
  shipping_info?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export const createMarketItem = async (itemData: Omit<MarketItem, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<MarketItem> => {
  const { seller_id, title, description, price, currency, stock, shipping_info } = itemData;
  const { rows } = await query(
    `INSERT INTO market_items (seller_id, title, description, price, currency, stock, shipping_info)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [seller_id, title, description, price, currency, stock, shipping_info]
  );
  return rows[0];
};

export const findMarketItemById = async (id: string): Promise<MarketItem | undefined> => {
  const { rows } = await query('SELECT * FROM market_items WHERE id = $1 AND deleted_at IS NULL', [id]);
  return rows[0];
};

export const findMarketItems = async (options: { limit?: number; offset?: number } = {}): Promise<MarketItem[]> => {
  const { limit = 10, offset = 0 } = options;
  const { rows } = await query(
    'SELECT * FROM market_items WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return rows;
};

export const updateMarketItem = async (id: string, updates: Partial<MarketItem>): Promise<MarketItem | undefined> => {
    const { title, description, price, currency, stock, shipping_info } = updates;
    const { rows } = await query(
        `UPDATE market_items SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            price = COALESCE($3, price),
            currency = COALESCE($4, currency),
            stock = COALESCE($5, stock),
            shipping_info = COALESCE($6, shipping_info)
        WHERE id = $7 AND deleted_at IS NULL
        RETURNING *`,
        [title, description, price, currency, stock, shipping_info, id]
    );
    return rows[0];
};

export const softDeleteMarketItem = async (id: string): Promise<boolean> => {
    const { rowCount } = await query(
        'UPDATE market_items SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
        [id]
    );
    return (rowCount ?? 0) > 0;
};