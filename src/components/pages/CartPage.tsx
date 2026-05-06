import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onNavigate: (page: string) => void;
}

export default function CartPage({ cart, onUpdateQuantity, onRemoveItem, onNavigate }: CartPageProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + tax + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl text-black mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any watches to your cart yet.
          </p>
          <motion.button
            onClick={() => onNavigate('products')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-full hover:shadow-lg hover:shadow-[#FDBA3A]/30 transition-all inline-flex items-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl text-black mb-12 font-serif"
        >
          Shopping Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[#FDBA3A] text-xs uppercase tracking-wider mb-1">
                          {item.brand}
                        </p>
                        <h3 className="text-lg text-black">{item.name}</h3>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                        <motion.button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-black" />
                        </motion.button>
                        <span className="w-8 text-center text-black">{item.quantity}</span>
                        <motion.button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-black" />
                        </motion.button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl text-black">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{item.price.toLocaleString('en-IN')} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm sticky top-32"
            >
              <h3 className="text-2xl text-black mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>₹{Math.round(tax).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                </div>
                {shipping === 0 && (
                  <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    ✓ Free shipping applied
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-black">
                    <span className="text-xl">Total</span>
                    <span className="text-2xl">₹{Math.round(total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => onNavigate('checkout')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-xl hover:shadow-lg hover:shadow-[#FDBA3A]/30 transition-all flex items-center justify-center gap-2 mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <button
                onClick={() => onNavigate('products')}
                className="w-full py-3 text-gray-600 hover:text-black transition-colors"
              >
                Continue Shopping
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
