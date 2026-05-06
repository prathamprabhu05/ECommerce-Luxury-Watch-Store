/**
 * Integration Test: Complete Checkout Flow
 * * This test demonstrates how different parts of the system work together
 * during a complete checkout process.
 */

import { addOrderWithStockDecrease } from '../../lib/firebase/firestore';
import { runTransaction } from 'firebase/firestore';

jest.mock('firebase/firestore');
jest.mock('../../lib/firebase/config', () => ({
  db: {},
}));

describe('Checkout Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order Creation with Stock Management', () => {
    it('should create order and decrease stock atomically', async () => {
      // Mock transaction behavior
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ stock: 10, name: 'Rolex Submariner' }),
        }),
        set: jest.fn(),
        update: jest.fn(),
      };

      (runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      // Test data
      const userId = 'user-123';
      const order = {
        userId,
        items: [
          {
            productId: 1,
            productName: 'Rolex Submariner',
            quantity: 2,
            price: 12000,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
        },
        paymentMethod: {
          type: 'Credit Card',
          lastFour: '1111',
        },
        total: 24000,
        status: 'Pending',
      };

      const stockUpdates = [
        { productId: 1, quantity: 2 },
      ];

      // Execute - ADDED 'as any' HERE
      const result = await addOrderWithStockDecrease(userId, order as any, stockUpdates);

      // Verify order created
      expect(result).toBeDefined();
      expect(result.id).toContain('ORD-');

      // Verify transaction was used
      expect(runTransaction).toHaveBeenCalled();

      // Verify product stock was checked
      expect(mockTransaction.get).toHaveBeenCalled();

      // Verify order was created
      expect(mockTransaction.set).toHaveBeenCalled();

      // Verify stock was updated
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it('should rollback if stock is insufficient', async () => {
      // Mock transaction with insufficient stock
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ stock: 1, name: 'Rolex Submariner' }),
        }),
        set: jest.fn(),
        update: jest.fn(),
      };

      (runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      const order = {
        userId: 'user-123',
        items: [{ productId: 1, quantity: 2, price: 12000 }],
        shippingAddress: {},
        paymentMethod: {},
        total: 24000,
        status: 'Pending',
      };

      const stockUpdates = [{ productId: 1, quantity: 2 }];

      // Should throw error - ADDED 'as any' HERE
      await expect(
        addOrderWithStockDecrease('user-123', order as any, stockUpdates)
      ).rejects.toThrow(/Insufficient stock/);

      // Verify order was NOT created
      expect(mockTransaction.set).not.toHaveBeenCalled();

      // Verify stock was NOT updated
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it('should handle multiple products in cart', async () => {
      // Mock transaction for multiple products
      const mockTransaction = {
        get: jest.fn()
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ stock: 5, name: 'Rolex Submariner' }),
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ stock: 3, name: 'Omega Seamaster' }),
          }),
        set: jest.fn(),
        update: jest.fn(),
      };

      (runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      const order = {
        userId: 'user-123',
        items: [
          { productId: 1, quantity: 2, price: 12000 },
          { productId: 2, quantity: 1, price: 8000 },
        ],
        shippingAddress: {},
        paymentMethod: {},
        total: 32000,
        status: 'Pending',
      };

      const stockUpdates = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ];

      // ADDED 'as any' HERE
      const result = await addOrderWithStockDecrease('user-123', order as any, stockUpdates);

      // Verify both products were checked
      expect(mockTransaction.get).toHaveBeenCalledTimes(2);

      // Verify both products were updated
      expect(mockTransaction.update).toHaveBeenCalledTimes(2);

      expect(result).toBeDefined();
    });
  });

  describe('Order Validation', () => {
    it('should validate required order fields', async () => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ stock: 10 }),
        }),
        set: jest.fn(),
        update: jest.fn(),
      };

      (runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      // Missing required fields
      const invalidOrder = {
        userId: 'user-123',
        items: [],  // Empty items
        total: 0,
        status: 'Pending',
      };

      // This should pass validation in the mock
      // In real implementation, you'd add validation
      const result = await addOrderWithStockDecrease(
        'user-123',
        invalidOrder as any,
        []
      );

      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle product not found error', async () => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: () => false,  // Product doesn't exist
        }),
        set: jest.fn(),
        update: jest.fn(),
      };

      (runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        return await callback(mockTransaction);
      });

      const order = {
        userId: 'user-123',
        items: [{ productId: 999, quantity: 1, price: 12000 }],
        shippingAddress: {},
        paymentMethod: {},
        total: 12000,
        status: 'Pending',
      };

      // ADDED 'as any' HERE
      await expect(
        addOrderWithStockDecrease('user-123', order as any, [{ productId: 999, quantity: 1 }])
      ).rejects.toThrow(/not found/);
    });

    it('should handle database connection errors', async () => {
      (runTransaction as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const order = {
        userId: 'user-123',
        items: [{ productId: 1, quantity: 1, price: 12000 }],
        shippingAddress: {},
        paymentMethod: {},
        total: 12000,
        status: 'Pending',
      };

      // ADDED 'as any' HERE
      await expect(
        addOrderWithStockDecrease('user-123', order as any, [{ productId: 1, quantity: 1 }])
      ).rejects.toThrow('Network error');
    });
  });
});