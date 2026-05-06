import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc, 
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  orderBy,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from './config';
import { Address, PaymentCard, Order, Product } from '../types';
import { encryptData, decryptData } from '../crypto';

// ============================================
// ADDRESS OPERATIONS
// ============================================

export const addAddress = async (userId: string, address: Omit<Address, 'id' | 'createdAt'>) => {
  try {
    const addressId = `addr_${Date.now()}`;
    const addressDoc = {
      ...address,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'addresses', addressId), addressDoc);
    
    return {
      id: addressId,
      ...address,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

export const getAddresses = async (userId: string): Promise<Address[]> => {
  try {
    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      console.warn('getAddresses called with invalid userId:', userId);
      return [];
    }
    
    const q = query(collection(db, 'addresses'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const addresses: Address[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      addresses.push({
        id: doc.id,
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : new Date().toISOString(),
      });
    });
    
    // Sort by creation date (newest first)
    return addresses.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error getting addresses:', error);
    throw error;
  }
};

export const updateAddress = async (
  userId: string, 
  addressId: string, 
  updates: Partial<Omit<Address, 'id' | 'createdAt'>>
) => {
  try {
    const addressRef = doc(db, 'addresses', addressId);
    
    // Verify ownership
    const addressDoc = await getDoc(addressRef);
    if (!addressDoc.exists() || addressDoc.data().userId !== userId) {
      throw new Error('Address not found or unauthorized');
    }

    await updateDoc(addressRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

export const deleteAddress = async (userId: string, addressId: string) => {
  try {
    const addressRef = doc(db, 'addresses', addressId);
    
    // Verify ownership
    const addressDoc = await getDoc(addressRef);
    if (!addressDoc.exists() || addressDoc.data().userId !== userId) {
      throw new Error('Address not found or unauthorized');
    }

    await deleteDoc(addressRef);
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

// ============================================
// PAYMENT CARD OPERATIONS (ENCRYPTED)
// ============================================

export const addPaymentCard = async (
  userId: string, 
  card: Omit<PaymentCard, 'id' | 'createdAt'>
) => {
  try {
    // Debug logging
    console.log('addPaymentCard called with userId:', userId);
    console.log('userId type:', typeof userId);
    console.log('userId value:', JSON.stringify(userId));
    
    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      console.error('addPaymentCard called with invalid userId:', userId);
      throw new Error('Invalid user ID. Please ensure you are logged in.');
    }

    const cardId = `card_${Date.now()}`;
    
    console.log('Attempting to encrypt card data...');
    
    // Encrypt sensitive data
    const encryptedCardNumber = card.cardNumber 
      ? await encryptData(card.cardNumber, userId)
      : null;
    
    const encryptedCVV = card.cvv 
      ? await encryptData(card.cvv, userId)
      : null;

    console.log('Encryption successful, creating card document...');

    const cardDoc = {
      userId,
      type: card.type,
      lastFour: card.lastFour,
      cardHolder: card.cardHolder,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      encryptedCardNumber,
      encryptedCVV,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('Saving card to Firestore with cardId:', cardId);

    await setDoc(doc(db, 'payment_cards', cardId), cardDoc);
    
    console.log('Card saved successfully!');
    
    return {
      id: cardId,
      type: card.type,
      lastFour: card.lastFour,
      cardHolder: card.cardHolder,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardNumber: card.cardNumber,
      cvv: card.cvv,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error adding payment card:', error);
    console.error('Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      code: (error as any).code,
      stack: (error as any).stack,
    });
    throw error;
  }
};

export const getPaymentCards = async (userId: string): Promise<PaymentCard[]> => {
  try {
    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      console.warn('getPaymentCards called with invalid userId:', userId);
      return [];
    }
    
    const q = query(collection(db, 'payment_cards'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const cards: PaymentCard[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      
      // Decrypt sensitive data
      let cardNumber: string | undefined;
      let cvv: string | undefined;
      
      try {
        if (data.encryptedCardNumber) {
          cardNumber = await decryptData(data.encryptedCardNumber, userId);
        }
        if (data.encryptedCVV) {
          cvv = await decryptData(data.encryptedCVV, userId);
        }
      } catch (decryptError) {
        console.error('Error decrypting card data:', decryptError);
        // Continue without decrypted data
      }
      
      cards.push({
        id: docSnapshot.id,
        type: data.type,
        lastFour: data.lastFour,
        cardHolder: data.cardHolder,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cardNumber,
        cvv,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : new Date().toISOString(),
      });
    }
    
    // Sort by creation date (newest first)
    return cards.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error getting payment cards:', error);
    throw error;
  }
};

export const updatePaymentCard = async (
  userId: string,
  cardId: string,
  updates: Partial<Omit<PaymentCard, 'id' | 'createdAt'>>
) => {
  try {
    const cardRef = doc(db, 'payment_cards', cardId);
    
    // Verify ownership
    const cardDoc = await getDoc(cardRef);
    if (!cardDoc.exists() || cardDoc.data().userId !== userId) {
      throw new Error('Card not found or unauthorized');
    }

    // Prepare update object
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Add non-sensitive fields
    if (updates.type) updateData.type = updates.type;
    if (updates.cardHolder) updateData.cardHolder = updates.cardHolder;
    if (updates.expiryMonth) updateData.expiryMonth = updates.expiryMonth;
    if (updates.expiryYear) updateData.expiryYear = updates.expiryYear;
    if (updates.lastFour) updateData.lastFour = updates.lastFour;

    // Encrypt and add sensitive fields
    if (updates.cardNumber) {
      updateData.encryptedCardNumber = await encryptData(updates.cardNumber, userId);
    }
    if (updates.cvv) {
      updateData.encryptedCVV = await encryptData(updates.cvv, userId);
    }

    await updateDoc(cardRef, updateData);
  } catch (error) {
    console.error('Error updating payment card:', error);
    throw error;
  }
};

export const deletePaymentCard = async (userId: string, cardId: string) => {
  try {
    const cardRef = doc(db, 'payment_cards', cardId);
    
    // Verify ownership
    const cardDoc = await getDoc(cardRef);
    if (!cardDoc.exists() || cardDoc.data().userId !== userId) {
      throw new Error('Card not found or unauthorized');
    }

    await deleteDoc(cardRef);
  } catch (error) {
    console.error('Error deleting payment card:', error);
    throw error;
  }
};

// ============================================
// ORDER OPERATIONS
// ============================================

/**
 * Add order and decrease stock in a single atomic transaction
 * This ensures that if stock update fails, the order won't be created
 */
export const addOrderWithStockDecrease = async (
  userId: string, 
  order: Omit<Order, 'id' | 'createdAt'>,
  stockUpdates: { productId: number; quantity: number }[]
) => {
  try {
    const orderId = `ORD-${Date.now()}`;
    
    // Helper function to remove undefined values from nested objects
    const cleanObject = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return null;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => cleanObject(item)).filter(item => item !== undefined);
      }
      
      if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
          const value = obj[key];
          if (value !== undefined) {
            cleaned[key] = cleanObject(value);
          }
        }
        return cleaned;
      }
      
      return obj;
    };
    
    // Clean the order data to remove any undefined values
    const cleanedOrder = cleanObject(order);
    
    console.log('Creating order with cleaned data:', JSON.stringify(cleanedOrder, null, 2));
    
    // Use a transaction to ensure atomicity
    const result = await runTransaction(db, async (transaction) => {
      // First, validate and read all product documents
      const productRefs = stockUpdates.map(item => doc(db, 'products', item.productId.toString()));
      const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
      
      // Validate stock availability for all products
      for (let i = 0; i < stockUpdates.length; i++) {
        const productDoc = productDocs[i];
        const item = stockUpdates[i];
        
        if (!productDoc.exists()) {
          throw new Error(`Product ${item.productId} not found`);
        }
        
        const currentStock = productDoc.data().stock || 0;
        
        if (currentStock < item.quantity) {
          const productName = productDoc.data().name;
          throw new Error(`Insufficient stock for ${productName}. Available: ${currentStock}, Requested: ${item.quantity}`);
        }
      }
      
      // If all validations pass, create the order
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = {
        ...cleanedOrder,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      transaction.set(orderRef, orderDoc);
      
      // Update stock for all products
      for (let i = 0; i < stockUpdates.length; i++) {
        const productRef = productRefs[i];
        const productDoc = productDocs[i];
        const item = stockUpdates[i];
        
        const currentStock = productDoc.data().stock;
        
        transaction.update(productRef, {
          stock: currentStock - item.quantity,
          updatedAt: serverTimestamp(),
        });
      }
      
      return orderId;
    });
    
    return {
      id: result,
      ...cleanedOrder,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error adding order with stock decrease:', error);
    throw error;
  }
};

export const addOrder = async (userId: string, order: Omit<Order, 'id' | 'createdAt'>) => {
  try {
    const orderId = `ORD-${Date.now()}`;
    const orderDoc = {
      ...order,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'orders', orderId), orderDoc);
    
    return {
      id: orderId,
      ...order,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  try {
    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      console.warn('getOrders called with invalid userId:', userId);
      return [];
    }
    
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        userId: data.userId,
        items: data.items,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        total: data.total,
        status: data.status,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : new Date().toISOString(),
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const getOrder = async (userId: string, orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists() || orderDoc.data().userId !== userId) {
      return null;
    }
    
    const data = orderDoc.data();
    return {
      id: orderDoc.id,
      userId: data.userId,
      items: data.items,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      total: data.total,
      status: data.status,
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (userId: string, orderId: string, status: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    // Verify ownership
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists() || orderDoc.data().userId !== userId) {
      throw new Error('Order not found or unauthorized');
    }

    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        userId: data.userId,
        items: data.items,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        total: data.total,
        status: data.status,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : new Date().toISOString(),
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

/**
 * Update order status (Admin only - no ownership check)
 */
export const adminUpdateOrderStatus = async (orderId: string, status: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }

    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order status (admin):', error);
    throw error;
  }
};

// ============================================
// PRODUCT STOCK MANAGEMENT
// ============================================

/**
 * Get a single product from Firestore
 */
export const getProduct = async (productId: number): Promise<Product | null> => {
  try {
    const productRef = doc(db, 'products', productId.toString());
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      return null;
    }
    
    const data = productDoc.data();
    return {
      id: data.id,
      name: data.name,
      brand: data.brand,
      price: data.price,
      originalPrice: data.originalPrice,
      image: data.image,
      description: data.description,
      badge: data.badge,
      rating: data.rating,
      reviews: data.reviews,
      stock: data.stock || 0,
      specs: data.specs,
    };
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

/**
 * Get all products from Firestore
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    const products: Product[] = [];
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: data.id,
        name: data.name,
        brand: data.brand,
        price: data.price,
        originalPrice: data.originalPrice,
        image: data.image,
        description: data.description,
        badge: data.badge,
        rating: data.rating,
        reviews: data.reviews,
        stock: data.stock || 0,
        specs: data.specs,
      });
    });
    
    // Sort by id
    return products.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error('Error getting all products:', error);
    throw error;
  }
};

/**
 * Add or update a product in Firestore
 */
export const saveProduct = async (product: Product): Promise<void> => {
  try {
    const productRef = doc(db, 'products', product.id.toString());
    await setDoc(productRef, {
      ...product,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
};

/**
 * Decrease product stock when an order is placed
 * Uses Firestore transaction to ensure atomicity
 */
export const decreaseProductStock = async (productId: number, quantity: number): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId.toString());
    
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists()) {
        throw new Error(`Product ${productId} not found`);
      }
      
      const currentStock = productDoc.data().stock || 0;
      
      if (currentStock < quantity) {
        throw new Error(`Insufficient stock for product ${productId}. Available: ${currentStock}, Requested: ${quantity}`);
      }
      
      // Decrease stock
      transaction.update(productRef, {
        stock: currentStock - quantity,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error('Error decreasing product stock:', error);
    throw error;
  }
};

/**
 * Decrease stock for multiple products (for cart checkout)
 */
export const decreaseMultipleProductsStock = async (items: { productId: number; quantity: number }[]): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      // First, read all product documents
      const productRefs = items.map(item => doc(db, 'products', item.productId.toString()));
      const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));
      
      // Validate stock availability for all products
      for (let i = 0; i < items.length; i++) {
        const productDoc = productDocs[i];
        const item = items[i];
        
        if (!productDoc.exists()) {
          throw new Error(`Product ${item.productId} not found`);
        }
        
        const currentStock = productDoc.data().stock || 0;
        
        if (currentStock < item.quantity) {
          const productName = productDoc.data().name;
          throw new Error(`Insufficient stock for ${productName}. Available: ${currentStock}, Requested: ${item.quantity}`);
        }
      }
      
      // If all validations pass, update stock for all products
      for (let i = 0; i < items.length; i++) {
        const productRef = productRefs[i];
        const productDoc = productDocs[i];
        const item = items[i];
        
        const currentStock = productDoc.data().stock;
        
        transaction.update(productRef, {
          stock: currentStock - item.quantity,
          updatedAt: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    console.error('Error decreasing multiple products stock:', error);
    throw error;
  }
};

/**
 * Update product stock manually (for admin purposes)
 */
export const updateProductStock = async (productId: number, newStock: number): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId.toString());
    
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      throw new Error(`Product ${productId} not found`);
    }
    
    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

// ============================================
// ADMIN PRODUCT MANAGEMENT
// ============================================

/**
 * Add a new product (Admin only)
 */
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    // Get all products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    let maxId = 0;
    let productExists = false;
    
    // Check for duplicates and find max ID
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Find highest ID
      if (data.id > maxId) {
        maxId = data.id;
      }
      
      // Check if product with same name and brand already exists
      if (data.name.toLowerCase().trim() === product.name.toLowerCase().trim() &&
          data.brand.toLowerCase().trim() === product.brand.toLowerCase().trim()) {
        productExists = true;
      }
    });
    
    // Prevent duplicate products
    if (productExists) {
      throw new Error(`Product "${product.name}" by ${product.brand} already exists. Please use a different name or update the existing product.`);
    }
    
    const newId = maxId + 1;
    const newProduct = {
      ...product,
      id: newId,
    };
    
    const productRef = doc(db, 'products', newId.toString());
    await setDoc(productRef, {
      ...newProduct,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return newProduct;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

/**
 * Update an existing product (Admin only)
 */
export const updateProduct = async (productId: number, updates: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId.toString());
    
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      throw new Error(`Product ${productId} not found`);
    }
    
    // Remove id from updates to prevent changing it
    const { id, ...updateData } = updates as any;
    
    await updateDoc(productRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product (Admin only)
 */
export const deleteProduct = async (productId: number): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId.toString());
    
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      throw new Error(`Product ${productId} not found`);
    }
    
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};