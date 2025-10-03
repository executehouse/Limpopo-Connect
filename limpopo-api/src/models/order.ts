import pool, { query } from '../lib/db';
import { MarketItem } from './marketItem';

export interface Order {
  id: string;
  buyer_id: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  shipping_address?: any;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  qty: number;
  unit_price: number;
}

export const createOrder = async (
  buyerId: string,
  items: { itemId: string; qty: number }[],
  shippingAddress?: any
): Promise<Order> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch item prices and calculate total
    const itemIds = items.map(i => i.itemId);
    const itemResults = await client.query('SELECT id, price, stock FROM market_items WHERE id = ANY($1::uuid[])', [itemIds]);

    const dbItemsMap = new Map<string, Pick<MarketItem, 'id' | 'price' | 'stock'>>();
    for (const dbItem of itemResults.rows) {
        dbItemsMap.set(dbItem.id, dbItem);
    }

    let total = 0;
    for (const item of items) {
      const dbItem = dbItemsMap.get(item.itemId);
      if (!dbItem) {
        throw new Error(`Item with ID ${item.itemId} not found.`);
      }
      // Use != null to check for both null and undefined
      if (dbItem.stock != null && dbItem.stock < item.qty) {
        throw new Error(`Not enough stock for item ${dbItem.id}.`);
      }
      total += Number(dbItem.price) * item.qty;
    }

    // 2. Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (buyer_id, total, status, shipping_address)
       VALUES ($1, $2, 'pending', $3)
       RETURNING *`,
      [buyerId, total, shippingAddress]
    );
    const newOrder = orderResult.rows[0] as Order;

    // 3. Create order items and update stock
    for (const item of items) {
        const dbItem = dbItemsMap.get(item.itemId)!; // Safe to use '!' because we checked above
        await client.query(
            `INSERT INTO order_items (order_id, item_id, qty, unit_price)
             VALUES ($1, $2, $3, $4)`,
            [newOrder.id, item.itemId, item.qty, dbItem.price]
        );
        // Decrement stock only if it's not null
        if (dbItem.stock != null) {
            await client.query(
                'UPDATE market_items SET stock = stock - $1 WHERE id = $2',
                [item.qty, item.itemId]
            );
        }
    }

    await client.query('COMMIT');
    return newOrder;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const findOrderById = async (id: string): Promise<Order | undefined> => {
    const { rows } = await query('SELECT * FROM orders WHERE id = $1', [id]);
    return rows[0];
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order | undefined> => {
    const { rows } = await query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
    );
    return rows[0];
}