import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, User, Calendar, CreditCard, MapPin, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getAllOrders, adminUpdateOrderStatus } from '../../lib/firebase/firestore';
import { Order } from '../../lib/types';

interface AdminOrdersPageProps {
  user: any;
}

export default function AdminOrdersPage({ user }: AdminOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const orderStatuses = [
    { value: 'Processing', label: 'Processing', color: 'bg-blue-500' },
    { value: 'Confirmed', label: 'Confirmed', color: 'bg-green-500' },
    { value: 'Out for Delivery', label: 'Out for Delivery', color: 'bg-[#FDBA3A]' },
    { value: 'Delivered', label: 'Delivered', color: 'bg-emerald-500' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-500' },
  ];

  useEffect(() => {
    loadOrders();
    
    // Set up real-time polling every 5 seconds
    const interval = setInterval(() => {
      loadOrders(true); // Silent reload
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const allOrders = await getAllOrders();
      setOrders(allOrders);
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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      await adminUpdateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      toast.success('Order status updated!', {
        description: `Status changed to: ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status', {
        description: error.message || 'Please try again',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-500';
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Processing').length,
    confirmed: orders.filter(o => o.status === 'Confirmed').length,
    outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FDBA3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl text-black mb-4 font-serif">
            Order Management
          </h1>
          <p className="text-gray-600">
            Manage all customer orders and update their status
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl text-black">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-sm text-gray-600 mb-1">Processing</p>
            <p className="text-2xl text-blue-600">{stats.processing}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-sm text-gray-600 mb-1">Confirmed</p>
            <p className="text-2xl text-green-600">{stats.confirmed}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-sm text-gray-600 mb-1">Out for Delivery</p>
            <p className="text-2xl text-[#FDBA3A]">{stats.outForDelivery}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-sm text-gray-600 mb-1">Delivered</p>
            <p className="text-2xl text-emerald-600">{stats.delivered}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-sm text-gray-600 mb-1">Cancelled</p>
            <p className="text-2xl text-red-600">{stats.cancelled}</p>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-[#FDBA3A] text-black'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Orders ({stats.total})
          </button>
          {orderStatuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === status.value
                  ? 'bg-[#FDBA3A] text-black'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.label} ({orders.filter(o => o.status === status.value).length})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No orders found</p>
            <p className="text-sm text-gray-400">
              {filterStatus === 'all' 
                ? 'Orders will appear here once customers place them'
                : `No orders with status: ${filterStatus}`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl text-black">
                          Order #{order.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleString()}
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

                    {/* Status Update Dropdown */}
                    <div className="flex items-center gap-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={updatingOrderId === order.id}
                        className="px-4 py-2 border-2 border-gray-200 rounded-xl text-black bg-white focus:outline-none focus:border-[#FDBA3A] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => toggleOrderExpand(order.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedOrderId === order.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Customer Info Summary */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Customer ID: {order.userId}</span>
                  </div>
                </div>

                {/* Expanded Order Details */}
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

                      {/* Payment Method */}
                      <div>
                        <h4 className="text-black mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-[#FDBA3A]" />
                          Payment Method
                        </h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-black capitalize">{order.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
