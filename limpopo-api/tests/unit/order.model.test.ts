import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createOrder } from '../../src/models/order';
import pool from '../../src/lib/db';
import { MarketItem } from '../../src/models/marketItem';

// Mock the entire db module
vi.mock('../../src/lib/db', () => ({
  __esModule: true,
  default: {
    connect: vi.fn(),
  },
  query: vi.fn(),
}));

import { PoolClient } from 'pg';

// Define a type for our mock client
type MockPoolClient = Pick<PoolClient, 'query' | 'release'>;

describe('Order Model', () => {
    let mockClient: vi.Mocked<MockPoolClient>;

    beforeEach(() => {
        // Reset mocks before each test
        mockClient = {
            query: vi.fn(),
            release: vi.fn(),
        } as unknown as vi.Mocked<MockPoolClient>;
        (pool.connect as vi.Mock).mockResolvedValue(mockClient);
        vi.clearAllMocks();
    });

    describe('createOrder', () => {
        const buyerId = 'user-123';
        const shippingAddress = { street: '123 Main St', city: 'Testville' };
        const items = [{ itemId: 'item-abc', qty: 1 }, { itemId: 'item-def', qty: 2 }];

        const mockDbItems: Partial<MarketItem>[] = [
            { id: 'item-abc', price: 10.00, stock: 5 },
            { id: 'item-def', price: 25.50, stock: 10 },
        ];

        it('should create an order, order items, and commit the transaction on success', async () => {
            // Arrange
            const mockOrder = { id: 'order-xyz', total: 61.00, /* other fields */ };
            (mockClient.query as vi.Mock)
                .mockResolvedValueOnce({ rows: [] }) // BEGIN
                .mockResolvedValueOnce({ rows: mockDbItems }) // Fetch items
                .mockResolvedValueOnce({ rows: [mockOrder] }) // Create order
                .mockResolvedValue({ rows: [] }); // Create order_items and update stock

            // Act
            const result = await createOrder(buyerId, items, shippingAddress);

            // Assert
            expect(pool.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('SELECT id, price, stock FROM market_items WHERE id = ANY($1::uuid[])', [expect.any(Array)]);
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO orders'), [buyerId, 61.00, shippingAddress]);
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO order_items'), [mockOrder.id, 'item-abc', 1, 10.00]);
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE market_items SET stock'), [1, 'item-abc']);
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockOrder);
        });

        it('should throw an error and rollback if stock is insufficient', async () => {
            // Arrange
            // Deep copy the mock items to avoid polluting state for other tests
            const lowStockItems = JSON.parse(JSON.stringify(mockDbItems));
            lowStockItems[0].stock = 0; // Not enough stock for item-abc
            (mockClient.query as vi.Mock)
                .mockResolvedValueOnce({ rows: [] }) // For BEGIN
                .mockResolvedValueOnce({ rows: lowStockItems }); // For SELECT

            // Act & Assert
            await expect(createOrder(buyerId, items, shippingAddress)).rejects.toThrow('Not enough stock for item item-abc.');
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.query).not.toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalledTimes(1);
        });

        it('should throw an error and rollback if an item is not found', async () => {
            // Arrange
            (mockClient.query as vi.Mock)
                .mockResolvedValueOnce({ rows: [] }) // For BEGIN
                .mockResolvedValueOnce({ rows: [mockDbItems[0]] }); // For SELECT

            // Act & Assert
            await expect(createOrder(buyerId, items, shippingAddress)).rejects.toThrow('Item with ID item-def not found.');
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.query).not.toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalledTimes(1);
        });
    });
});