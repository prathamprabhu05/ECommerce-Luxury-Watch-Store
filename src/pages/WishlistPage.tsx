import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { getUserWishlist, removeFromWishlist, type WishlistProduct } from '../lib/wishlist';
import { toast } from 'sonner@2.0.3';
import { User } from '../lib/types';

interface WishlistPageProps {
  user: User | null;
  onNavigate: (page: string, productId?: number) => void;
}

const WishlistPage = ({ user, onNavigate }: WishlistPageProps) => {
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const items = await getUserWishlist(user.uid);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const success = await removeFromWishlist(user.uid, productId);
      if (success) {
        setWishlistItems(wishlistItems.filter((item) => item.productId !== productId));
        toast.success('Removed from wishlist');
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (productId: string) => {
    // Navigate to product detail page
    onNavigate('product-detail', parseInt(productId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#FDBA3A] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <Heart className="w-12 h-12 text-[#FDBA3A]" fill="#FDBA3A" />
            <h1 className="text-5xl text-white">My Wishlist</h1>
          </div>
          <p className="text-xl text-white/60">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </motion.div>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Heart className="w-24 h-24 text-white/20 mx-auto mb-6" />
            <h2 className="text-3xl text-white mb-4">Your wishlist is empty</h2>
            <p className="text-white/60 mb-8">
              Start adding watches you love to your wishlist
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="px-8 py-4 bg-[#FDBA3A] text-[#0A0A0A] rounded-lg hover:bg-[#FDBA3A]/90 transition-all"
            >
              Browse Watches
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-white/5">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-500 text-white rounded-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <p className="text-[#FDBA3A] text-sm mb-2">{item.productBrand}</p>
                    <h3
                      className="text-xl text-white mb-4 cursor-pointer hover:text-[#FDBA3A] transition-colors"
                      onClick={() => onNavigate('product-detail', parseInt(item.productId))}
                    >
                      {item.productName}
                    </h3>
                    <p className="text-2xl text-white mb-6">{formatCurrency(item.productPrice)}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {item.inStock ? (
                        <button
                          onClick={() => handleAddToCart(item.productId)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#FDBA3A] text-[#0A0A0A] rounded-lg hover:bg-[#FDBA3A]/90 transition-all"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          View Product
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white/40 rounded-lg cursor-not-allowed"
                        >
                          <Package className="w-5 h-5" />
                          Out of Stock
                        </button>
                      )}
                    </div>

                    {/* Added Date */}
                    <p className="text-white/40 text-sm mt-4 text-center">
                      Added {new Date(item.addedAt.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
