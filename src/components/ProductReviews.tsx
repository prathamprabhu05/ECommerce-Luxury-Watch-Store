import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import {
  getProductReviews,
  addReview,
  updateReviewHelpfulness,
  getProductRating,
  type Review,
  type ProductRating,
} from '../lib/reviews';
import { toast } from 'sonner@2.0.3';

interface ProductReviewsProps {
  productId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

const ProductReviews = ({ productId, userId, userEmail, userName }: ProductReviewsProps) => {
  const user = userId ? { uid: userId, email: userEmail, displayName: userName } : null;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productRating, setProductRating] = useState<ProductRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const [reviewsData, ratingData] = await Promise.all([
        getProductReviews(productId),
        getProductRating(productId),
      ]);
      setReviews(reviewsData);
      setProductRating(ratingData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (!newReview.title || !newReview.comment) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const reviewId = await addReview(
        productId,
        user.uid,
        user.displayName || 'Anonymous',
        user.email || '',
        newReview.rating,
        newReview.title,
        newReview.comment,
        false
      );

      if (reviewId) {
        toast.success('Review submitted successfully');
        setShowReviewForm(false);
        setNewReview({ rating: 5, title: '', comment: '' });
        loadReviews();
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const handleHelpfulness = async (reviewId: string, helpful: boolean) => {
    if (!user) {
      toast.error('Please login to rate reviews');
      return;
    }

    const success = await updateReviewHelpfulness(reviewId, user.uid, helpful);
    if (success) {
      loadReviews();
    }
  };

  const StarRating = ({ rating, size = 'medium', interactive = false, onChange }: { 
    rating: number; 
    size?: 'small' | 'medium' | 'large';
    interactive?: boolean;
    onChange?: (rating: number) => void;
  }) => {
    const sizeClasses = {
      small: 'w-4 h-4',
      medium: 'w-5 h-5',
      large: 'w-6 h-6',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-[#FDBA3A] fill-[#FDBA3A]' : 'text-white/20'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  const RatingDistribution = () => {
    if (!productRating) return null;

    const maxCount = Math.max(...Object.values(productRating.ratingDistribution));

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = productRating.ratingDistribution[rating as keyof typeof productRating.ratingDistribution] || 0;
          const percentage = productRating.totalReviews > 0 ? (count / productRating.totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-white text-sm">{rating}</span>
                <Star className="w-3 h-3 text-[#FDBA3A] fill-[#FDBA3A]" />
              </div>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FDBA3A] transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-white/60 text-sm w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-[#FDBA3A] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-8">
        <h2 className="text-2xl text-white mb-6">Customer Reviews</h2>

        {productRating && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-6xl text-white mb-2">
                {productRating.averageRating.toFixed(1)}
              </div>
              <StarRating rating={productRating.averageRating} size="large" />
              <p className="text-white/60 mt-2">
                Based on {productRating.totalReviews} {productRating.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div>
              <RatingDistribution />
            </div>
          </div>
        )}

        {/* Write Review Button */}
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-6 py-3 bg-[#FDBA3A] text-[#0A0A0A] rounded-lg hover:bg-[#FDBA3A]/90 transition-all"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}

        {!user && (
          <p className="text-white/60">
            Please <a href="/login" className="text-[#FDBA3A] hover:underline">login</a> to write a review
          </p>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-8"
          >
            <h3 className="text-xl text-white mb-6">Write Your Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-white mb-2">Your Rating</label>
                <StarRating
                  rating={newReview.rating}
                  size="large"
                  interactive
                  onChange={(rating) => setNewReview({ ...newReview, rating })}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-white mb-2">Review Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Summarize your experience"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                  required
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-white mb-2">Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your thoughts about this watch"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A] resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#FDBA3A] text-[#0A0A0A] rounded-lg hover:bg-[#FDBA3A]/90 transition-all"
              >
                Submit Review
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg">
            <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-white">{review.userName}</p>
                    {review.verified && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} size="small" />
                </div>
                <p className="text-white/40 text-sm">
                  {new Date(review.createdAt.toDate()).toLocaleDateString()}
                </p>
              </div>

              {/* Review Content */}
              <h4 className="text-white mb-2">{review.title}</h4>
              <p className="text-white/80 mb-4">{review.comment}</p>

              {/* Admin Response */}
              {review.adminResponse && (
                <div className="mt-4 pl-4 border-l-2 border-[#FDBA3A]">
                  <p className="text-[#FDBA3A] text-sm mb-1">Response from MyWatches</p>
                  <p className="text-white/80 text-sm">{review.adminResponse}</p>
                </div>
              )}

              {/* Helpfulness */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <span className="text-white/60 text-sm">Was this helpful?</span>
                <button
                  onClick={() => handleHelpfulness(review.id, true)}
                  className={`flex items-center gap-1 px-3 py-1 rounded transition-all ${
                    user && review.helpfulBy?.includes(user.uid)
                      ? 'bg-[#FDBA3A]/20 text-[#FDBA3A]'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{review.helpful || 0}</span>
                </button>
                <button
                  onClick={() => handleHelpfulness(review.id, false)}
                  className={`flex items-center gap-1 px-3 py-1 rounded transition-all ${
                    user && review.notHelpfulBy?.includes(user.uid)
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-sm">{review.notHelpful || 0}</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
