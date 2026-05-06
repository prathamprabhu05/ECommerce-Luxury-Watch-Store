import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number; // Number of items in stock
  badge?: string;
  onAddToCart: (id: number) => void;
  onBuyNow: (id: number) => void;
  onViewDetails: (id: number) => void;
  onToggleWishlist?: (id: number) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({
  id,
  name,
  brand,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  stock,
  badge,
  onAddToCart,
  onBuyNow,
  onViewDetails,
  onToggleWishlist,
  isWishlisted = false,
}: ProductCardProps) {

  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 left-4 z-10 bg-[#FDBA3A] text-black px-3 py-1 rounded-full text-xs uppercase tracking-wider">
          {badge}
        </div>
      )}

      {/* Wishlist Button */}
      <motion.button
        onClick={() => onToggleWishlist?.(id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
          }`}
        />
      </motion.button>

      {/* Image - Fixed Height */}
      <div
        className="relative h-72 bg-gray-100 overflow-hidden cursor-pointer flex-shrink-0"
        onClick={() => onViewDetails(id)}
      >
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white px-6 py-2 bg-red-500 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content - Fixed Structure with Flex */}
      <div className="p-6 flex flex-col flex-1">
        {/* Brand & Title - Fixed Height */}
        <div className="mb-3 h-[72px] flex flex-col">
          <p className="text-[#FDBA3A] text-xs uppercase tracking-wider mb-1 flex-shrink-0">{brand}</p>
          <h3
            className="text-lg text-black line-clamp-2 cursor-pointer hover:text-[#FDBA3A] transition-colors flex-1"
            onClick={() => onViewDetails(id)}
          >
            {name}
          </h3>
        </div>

        {/* Rating - Fixed Height */}
        <div className="flex items-center gap-2 mb-4 h-5">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating) ? 'fill-[#FDBA3A] text-[#FDBA3A]' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviews})</span>
        </div>

        {/* Stock Status */}
        <div className="mb-3 h-6">
          {isOutOfStock ? (
            <span className="text-sm text-red-600 font-medium">❌ Out of Stock</span>
          ) : stock === 1 ? (
            <span className="text-sm text-orange-600 font-medium">⚠️ Only One Left in Stock</span>
          ) : isLowStock ? (
            <span className="text-sm text-orange-600 font-medium">⚠️ Only {stock} Left in Stock</span>
          ) : (
            <span className="text-sm text-green-600 font-medium">✓ {stock} In Stock</span>
          )}
        </div>

        {/* Price - Fixed Height */}
        <div className="mb-4 h-[52px] flex flex-col justify-center">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-black">₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {originalPrice && (
            <span className="text-xs text-green-600">
              Save ₹{(originalPrice - price).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1" />

        {/* Actions - Fixed at Bottom */}
        <div className="flex gap-2 mt-auto">
          <motion.button
            onClick={() => onAddToCart(id)}
            disabled={isOutOfStock}
            whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
            whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
            className="flex-1 bg-black text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm h-12"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </motion.button>
          <motion.button
            onClick={() => onBuyNow(id)}
            disabled={isOutOfStock}
            whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
            whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
            className="flex-1 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-[#FDBA3A]/30 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm h-12"
          >
            <span>Buy Now</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}