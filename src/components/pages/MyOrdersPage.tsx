import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Calendar, CreditCard, MapPin, ChevronDown, ChevronUp, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getOrders } from '../../lib/firebase/firestore';
import { Order } from '../../lib/types';

interface MyOrdersPageProps {
  user: any;
}

export default function MyOrdersPage({ user }: MyOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    
    // Set up real-time polling every 5 seconds
    const interval = setInterval(() => {
      loadOrders(true); // Silent reload
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = async (silent = false) => {
    if (!user || !user.id) return;
    
    try {
      if (!silent) setLoading(true);
      const userOrders = await getOrders(user.id);
      setOrders(userOrders);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      if (!silent) {
        toast.error('Failed to load orders', {
          description: error.message || 'Please try again',
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Clock className="w-5 h-5" />;
      case 'Confirmed':
        return <CheckCircle className="w-5 h-5" />;
      case 'Out for Delivery':
        return <Truck className="w-5 h-5" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-500';
      case 'Confirmed':
        return 'bg-green-500';
      case 'Out for Delivery':
        return 'bg-[#FDBA3A]';
      case 'Delivered':
        return 'bg-emerald-500';
      case 'Cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'Processing':
        return 25;
      case 'Confirmed':
        return 50;
      case 'Out for Delivery':
        return 75;
      case 'Delivered':
        return 100;
      case 'Cancelled':
        return 0;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FDBA3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl text-black mb-4 font-serif">
            My Orders
          </h1>
          <p className="text-gray-600">
            Track and manage your watch orders
          </p>
        </motion.div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No orders yet</p>
            <p className="text-sm text-gray-400 mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => window.location.href = '#'}
              className="px-6 py-3 bg-[#FDBA3A] text-black rounded-xl hover:bg-[#f5a623] transition-colors"
            >
              Browse Products
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl text-black">
                          Order #{order.id}
                        </h3>
                        <button
                          onClick={() => toggleOrderExpand(order.id)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {expandedOrderId === order.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          ₹{order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`p-2 rounded-full text-white ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </span>
                        <div>
                          <p className="text-black">{order.status}</p>
                          <p className="text-sm text-gray-600">
                            {order.status === 'Processing' && 'Your order is being processed'}
                            {order.status === 'Confirmed' && 'Your order has been confirmed'}
                            {order.status === 'Out for Delivery' && 'Your order is on the way'}
                            {order.status === 'Delivered' && 'Your order has been delivered'}
                            {order.status === 'Cancelled' && 'Your order has been cancelled'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {order.status !== 'Cancelled' && (
                      <div className="relative">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getStatusProgress(order.status)}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`h-full ${getStatusColor(order.status)}`}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span className={order.status === 'Processing' ? 'text-black' : ''}>
                            Processing
                          </span>
                          <span className={order.status === 'Confirmed' ? 'text-black' : ''}>
                            Confirmed
                          </span>
                          <span className={order.status === 'Out for Delivery' ? 'text-black' : ''}>
                            Shipping
                          </span>
                          <span className={order.status === 'Delivered' ? 'text-black' : ''}>
                            Delivered
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Order Details */}
                <AnimatePresence>
                  {expandedOrderId === order.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-6 space-y-6">
                        {/* Order Items */}
                        <div>
                          <h4 className="text-black mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#FDBA3A]" />
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="text-black">{item.name}</p>
                                  <p className="text-sm text-gray-600">{item.brand}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-black">₹{item.price.toFixed(2)}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h4 className="text-black mb-3 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#FDBA3A]" />
                            Shipping Address
                          </h4>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-black mb-1">{order.shippingAddress.street}</p>
                            <p className="text-gray-600">
                              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                              {order.shippingAddress.postalCode}
                            </p>
                            <p className="text-gray-600">{order.shippingAddress.country}</p>
                          </div>
                        </div>

                        {/* Payment Summary */}
                        <div>
                          <h4 className="text-black mb-3 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[#FDBA3A]" />
                            Payment Summary
                          </h4>
                          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex justify-between text-gray-600">
                              <span>Payment Method:</span>
                              <span className="text-black capitalize">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-200">
                              <span>Total Amount:</span>
                              <span className="text-black text-lg">₹{order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}