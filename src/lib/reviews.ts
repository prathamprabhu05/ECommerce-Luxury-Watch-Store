import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase/config';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  helpfulBy: string[];
  notHelpfulBy: string[];
  adminResponse?: string;
  adminResponseDate?: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductRating {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Add a new review
export const addReview = async (
  productId: string,
  userId: string,
  userName: string,
  userEmail: string,
  rating: number,
  title: string,
  comment: string,
  verified: boolean = false
): Promise<string | null> => {
  try {
    // Check if user already reviewed this product
    const existingReviews = await getUserProductReview(userId, productId);
    if (existingReviews) {
      throw new Error('You have already reviewed this product');
    }

    const reviewData = {
      productId,
      userId,
      userName,
      userEmail,
      rating,
      title,
      comment,
      verified,
      helpful: 0,
      notHelpful: 0,
      helpfulBy: [],
      notHelpfulBy: [],
      status: 'approved', // Auto-approve for now
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);

    // Update product rating statistics
    await updateProductRating(productId);

    return reviewRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    return null;
  }
};

// Get reviews for a product
export const getProductReviews = async (
  productId: string,
  status: 'approved' | 'pending' | 'rejected' | 'all' = 'approved'
): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    let q;

    if (status === 'all') {
      q = query(
        reviewsRef,
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        reviewsRef,
        where('productId', '==', productId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  } catch (error) {
    console.error('Error getting product reviews:', error);
    return [];
  }
};

// Get user's review for a product
export const getUserProductReview = async (
  userId: string,
  productId: string
): Promise<Review | null> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      where('productId', '==', productId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Review;
  } catch (error) {
    console.error('Error getting user review:', error);
    return null;
  }
};

// Update review helpfulness
export const updateReviewHelpfulness = async (
  reviewId: string,
  userId: string,
  helpful: boolean
): Promise<boolean> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewDoc = await transaction.get(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }

      const data = reviewDoc.data();
      const helpfulBy = data.helpfulBy || [];
      const notHelpfulBy = data.notHelpfulBy || [];

      // Remove from opposite list if present
      const newHelpfulBy = helpful
        ? [...helpfulBy.filter((id: string) => id !== userId), userId]
        : helpfulBy.filter((id: string) => id !== userId);

      const newNotHelpfulBy = !helpful
        ? [...notHelpfulBy.filter((id: string) => id !== userId), userId]
        : notHelpfulBy.filter((id: string) => id !== userId);

      transaction.update(reviewRef, {
        helpfulBy: newHelpfulBy,
        notHelpfulBy: newNotHelpfulBy,
        helpful: newHelpfulBy.length,
        notHelpful: newNotHelpfulBy.length,
        updatedAt: Timestamp.now(),
      });

      return true;
    });
  } catch (error) {
    console.error('Error updating review helpfulness:', error);
    return false;
  }
};

// Add admin response to review
export const addAdminResponse = async (
  reviewId: string,
  adminResponse: string
): Promise<boolean> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      adminResponse,
      adminResponseDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error adding admin response:', error);
    return false;
  }
};

// Update review status (approve/reject)
export const updateReviewStatus = async (
  reviewId: string,
  status: 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);

    if (!reviewDoc.exists()) return false;

    await updateDoc(reviewRef, {
      status,
      updatedAt: Timestamp.now(),
    });

    // Update product rating if approved
    if (status === 'approved') {
      const review = reviewDoc.data();
      await updateProductRating(review.productId);
    }

    return true;
  } catch (error) {
    console.error('Error updating review status:', error);
    return false;
  }
};

// Delete review
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);

    if (!reviewDoc.exists()) return false;

    const productId = reviewDoc.data().productId;
    await deleteDoc(reviewRef);

    // Update product rating statistics
    await updateProductRating(productId);

    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
};

// Update product rating statistics
export const updateProductRating = async (productId: string): Promise<boolean> => {
  try {
    const reviews = await getProductReviews(productId, 'approved');

    const totalReviews = reviews.length;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach((review) => {
      totalRating += review.rating;
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      ratingDistribution,
      updatedAt: Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error updating product rating:', error);
    return false;
  }
};

// Get product rating statistics
export const getProductRating = async (productId: string): Promise<ProductRating | null> => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) return null;

    const data = productDoc.data();
    return {
      productId,
      averageRating: data.averageRating || 0,
      totalReviews: data.totalReviews || 0,
      ratingDistribution: data.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  } catch (error) {
    console.error('Error getting product rating:', error);
    return null;
  }
};

// Get all reviews (for admin)
export const getAllReviews = async (
  status?: 'approved' | 'pending' | 'rejected'
): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    let q;

    if (status) {
      q = query(reviewsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    } else {
      q = query(reviewsRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  } catch (error) {
    console.error('Error getting all reviews:', error);
    return [];
  }
};