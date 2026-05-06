import { motion } from 'motion/react';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

interface OrderConfirmationPageProps {
  orderId: string;
  onNavigate: (page: string) => void;
}

export default function OrderConfirmationPage({ orderId, onNavigate }: OrderConfirmationPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-32 pb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl p-12 shadow-xl text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8"
        >
          <CheckCircle className="w-14 h-14 text-green-600" />
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl text-black mb-4 font-serif"
        >
          Order Confirmed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 text-lg mb-8"
        >
          Thank you for your purchase. Your order has been successfully placed.
        </motion.p>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-6 h-6 text-[#FDBA3A]" />
            <span className="text-gray-600">Order ID</span>
          </div>
          <p className="text-3xl text-black font-mono">{orderId}</p>
        </motion.div>

        {/* Payment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-full">
            <CheckCircle className="w-5 h-5" />
            <span>Payment Successful</span>
          </div>
        </motion.div>

        {/* Delivery Estimate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8 text-gray-600"
        >
          <p>
            Estimated delivery:{' '}
            <span className="text-black">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </p>
          <p className="text-sm mt-2">
            A confirmation email has been sent to your registered email address.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={() => onNavigate('orders')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-xl hover:shadow-lg hover:shadow-[#FDBA3A]/30 transition-all inline-flex items-center justify-center gap-2"
          >
            View My Orders
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={() => onNavigate('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white border-2 border-gray-200 text-black rounded-xl hover:bg-gray-50 transition-all"
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
