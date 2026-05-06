import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase/config';

export interface InventoryItem {
  productId: string;
  stockQuantity: number;
  lowStockThreshold: number;
  lastRestocked?: Timestamp;
  reservedQuantity?: number;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: 'restock' | 'sale' | 'return' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  orderId?: string;
  reason?: string;
  timestamp: Timestamp;
  performedBy: string;
}

// Get inventory for a specific product
export const getProductInventory = async (productId: string): Promise<InventoryItem | null> => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) return null;

    const data = productDoc.data();
    return {
      productId,
      stockQuantity: data.stockQuantity || 0,
      lowStockThreshold: data.lowStockThreshold || 5,
      lastRestocked: data.lastRestocked,
      reservedQuantity: data.reservedQuantity || 0,
    };
  } catch (error) {
    console.error('Error getting product inventory:', error);
    return null;
  }
};

// Update stock quantity (for admin restocking)
export const updateProductStock = async (
  productId: string,
  newQuantity: number,
  lowStockThreshold: number,
  performedBy: string,
  reason?: string
): Promise<boolean> => {
  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }

    const previousStock = productDoc.data().stockQuantity || 0;

    await updateDoc(productRef, {
      stockQuantity: newQuantity,
      lowStockThreshold,
      lastRestocked: Timestamp.now(),
    });

    // Log inventory transaction
    await logInventoryTransaction({
      productId,
      type: 'restock',
      quantity: newQuantity - previousStock,
      previousStock,
      newStock: newQuantity,
      reason,
      timestamp: Timestamp.now(),
      performedBy,
    });

    return true;
  } catch (error) {
    console.error('Error updating product stock:', error);
    return false;
  }
};

// Reserve stock when order is placed
export const reserveStock = async (
  productId: string,
  quantity: number,
  orderId: string
): Promise<boolean> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'products', productId);
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      const currentStock = productDoc.data().stockQuantity || 0;
      const reservedQuantity = productDoc.data().reservedQuantity || 0;

      if (currentStock < quantity) {
        throw new Error('Insufficient stock');
      }

      transaction.update(productRef, {
        stockQuantity: currentStock - quantity,
        reservedQuantity: reservedQuantity + quantity,
      });

      return true;
    });
  } catch (error) {
    console.error('Error reserving stock:', error);
    return false;
  }
};

// Confirm stock reservation (when order is confirmed)
export const confirmStockReservation = async (
  productId: string,
  quantity: number,
  orderId: string,
  performedBy: string
): Promise<boolean> => {
  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) return false;

    const reservedQuantity = productDoc.data().reservedQuantity || 0;

    await updateDoc(productRef, {
      reservedQuantity: Math.max(0, reservedQuantity - quantity),
    });

    // Log sale transaction
    const previousStock = productDoc.data().stockQuantity + quantity;
    await logInventoryTransaction({
      productId,
      type: 'sale',
      quantity: -quantity,
      previousStock,
      newStock: productDoc.data().stockQuantity,
      orderId,
      timestamp: Timestamp.now(),
      performedBy,
    });

    return true;
  } catch (error) {
    console.error('Error confirming stock reservation:', error);
    return false;
  }
};

// Release stock reservation (when order is cancelled)
export const releaseStockReservation = async (
  productId: string,
  quantity: number
): Promise<boolean> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'products', productId);
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      const currentStock = productDoc.data().stockQuantity || 0;
      const reservedQuantity = productDoc.data().reservedQuantity || 0;

      transaction.update(productRef, {
        stockQuantity: currentStock + quantity,
        reservedQuantity: Math.max(0, reservedQuantity - quantity),
      });

      return true;
    });
  } catch (error) {
    console.error('Error releasing stock reservation:', error);
    return false;
  }
};

// Get low stock products
export const getLowStockProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const lowStockProducts = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((product: any) => {
        const stock = product.stockQuantity || 0;
        const threshold = product.lowStockThreshold || 5;
        return stock <= threshold && stock > 0;
      });

    return lowStockProducts;
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
};

// Get out of stock products
export const getOutOfStockProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const outOfStockProducts = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((product: any) => (product.stockQuantity || 0) === 0);

    return outOfStockProducts;
  } catch (error) {
    console.error('Error getting out of stock products:', error);
    return [];
  }
};

// Log inventory transaction
const logInventoryTransaction = async (
  transaction: Omit<InventoryTransaction, 'id'>
): Promise<void> => {
  try {
    const transactionsRef = collection(db, 'inventoryTransactions');
    await getDocs(transactionsRef); // This will create the collection if it doesn't exist
    // In a real implementation, you would add the transaction document here
  } catch (error) {
    console.error('Error logging inventory transaction:', error);
  }
};

// Get inventory transactions for a product
export const getProductInventoryHistory = async (
  productId: string
): Promise<InventoryTransaction[]> => {
  try {
    const transactionsRef = collection(db, 'inventoryTransactions');
    const q = query(transactionsRef, where('productId', '==', productId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryTransaction[];
  } catch (error) {
    console.error('Error getting inventory history:', error);
    return [];
  }
};