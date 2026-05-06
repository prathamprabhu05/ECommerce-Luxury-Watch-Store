import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ShoppingCart, Heart, Truck, Shield, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import ProductCard from '../ProductCard';

interface ProductDetailPageProps {
  product: any;
  relatedProducts: any[];
  onAddToCart: (id: number) => void;
  onBuyNow: (id: number) => void;
  onNavigate: (page: string, productId?: number) => void;
  onToggleWishlist: (id: number) => void;
  wishlist: any[];
}

export default function ProductDetailPage({
  product,
  relatedProducts,
  onAddToCart,
  onBuyNow,
  onNavigate,
  onToggleWishlist,
  wishlist,
}: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const images = [product.image, product.image, product.image];

  const features = [
    { icon: Truck, text: 'Free shipping on orders over $500' },
    { icon: Shield, text: '2-year warranty included' },
    { icon: Clock, text: 'Delivery within 5-7 business days' },
  ];

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('products')}
          className="mb-8 text-gray-600 hover:text-black transition-colors inline-flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden"
            >
              <ImageWithFallback
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-black" />
              </button>
              <button
                onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-black" />
              </button>
            </motion.div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-[#FDBA3A]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ImageWithFallback src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <p className="text-[#FDBA3A] uppercase tracking-wider text-sm mb-2">{product.brand}</p>
                <h1 className="text-4xl text-black mb-4 font-serif">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-[#FDBA3A] text-[#FDBA3A]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-5xl text-black">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">
                Experience timeless elegance with this premium {product.brand} timepiece. Crafted with
                precision and attention to detail, this watch combines classic design with modern
                functionality.
              </p>

              {/* Features */}
              <div className="space-y-3 py-6 border-y border-gray-200">
                {features.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-gray-600">
                    <Icon className="w-5 h-5 text-[#FDBA3A]" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Specifications */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-black mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Case Material</p>
                    <p className="text-black">Stainless Steel</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Movement</p>
                    <p className="text-black">Automatic</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Water Resistance</p>
                    <p className="text-black">100m</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Case Diameter</p>
                    <p className="text-black">42mm</p>
                  </div>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-black">Quantity:</span>
                  <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-black"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-black">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-black"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => onAddToCart(product.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </motion.button>
                  <motion.button
                    onClick={() => onToggleWishlist(product.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Heart
                      className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-black'}`}
                    />
                  </motion.button>
                </div>

                <motion.button
                  onClick={() => onBuyNow(product.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-xl hover:shadow-lg hover:shadow-[#FDBA3A]/30 transition-all flex items-center justify-center"
                >
                  <span>Buy Now</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        <section>
          <h2 className="text-3xl text-black mb-8 font-serif">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                {...relatedProduct}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onViewDetails={(id) => onNavigate('product-detail', id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
