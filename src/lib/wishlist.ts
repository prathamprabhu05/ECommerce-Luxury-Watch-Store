import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase/config';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: Timestamp;
}

export interface WishlistProduct extends WishlistItem {
  productName: string;
  productPrice: number;
  productImage: string;
  productBrand: string;
  inStock: boolean;
}

// Get user's wishlist
export const getUserWishlist = async (userId: string): Promise<WishlistProduct[]> => {
  try {
    const wishlistRef = collection(db, 'wishlists');
    const q = query(wishlistRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const wishlistItems = await Promise.all(
      snapshot.docs.map(async (wishlistDoc) => {
        const wishlistData = wishlistDoc.data();
        const productDoc = await getDoc(doc(db, 'products', wishlistData.productId));

        if (!productDoc.exists()) {
          // Product no longer exists, remove from wishlist
          await deleteDoc(wishlistDoc.ref);
          return null;
        }

        const productData = productDoc.data();
        return {
          id: wishlistDoc.id,
          userId: wishlistData.userId,
          productId: wishlistData.productId,
          addedAt: wishlistData.addedAt,
          productName: productData.name,
          productPrice: productData.price,
          productImage: productData.images?.[0] || '',
          productBrand: productData.brand,
          inStock: (productData.stockQuantity || 0) > 0,
        };
      })
    );

    return wishlistItems.filter((item) => item !== null) as WishlistProduct[];
  } catch (error) {
    console.error('Error getting user wishlist:', error);
    return [];
  }
};

// Add product to wishlist
export const addToWishlist = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    // Check if product exists
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }

    // Check if already in wishlist
    const isInWishlist = await isProductInWishlist(userId, productId);
    if (isInWishlist) {
      throw new Error('Product already in wishlist');
    }

    const wishlistRef = doc(collection(db, 'wishlists'));
    await setDoc(wishlistRef, {
      userId,
      productId,
      addedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const wishlistRef = collection(db, 'wishlists');
    const q = query(
      wishlistRef,
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return false;
    }

    await deleteDoc(snapshot.docs[0].ref);
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};

// Toggle product in wishlist
export const toggleWishlist = async (
  userId: string,
  productId: string
): Promise<'added' | 'removed' | null> => {
  try {
    const isInWishlist = await isProductInWishlist(userId, productId);

    if (isInWishlist) {
      const success = await removeFromWishlist(userId, productId);
      return success ? 'removed' : null;
    } else {
      const success = await addToWishlist(userId, productId);
      return success ? 'added' : null;
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return null;
  }
};

// Check if product is in wishlist
export const isProductInWishlist = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const wishlistRef = collection(db, 'wishlists');
    const q = query(
      wishlistRef,
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const snapshot = await getDocs(q);

    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

// Get wishlist count
export const getWishlistCount = async (userId: string): Promise<number> => {
  try {
    const wishlistRef = collection(db, 'wishlists');
    const q = query(wishlistRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    return snapshot.size;
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return 0;
  }
};

// Clear entire wishlist
export const clearWishlist = async (userId: string): Promise<boolean> => {
  try {
    const wishlistRef = collection(db, 'wishlists');
    const q = query(wishlistRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return true;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return false;
  }
};

// Move wishlist item to cart (helper function)
export const moveWishlistToCart = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    // This would integrate with your cart system
    // For now, just remove from wishlist
    return await removeFromWishlist(userId, productId);
  } catch (error) {
    console.error('Error moving wishlist to cart:', error);
    return false;
  }
};