import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  Star,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { User } from '../lib/types';
import {
  getSalesAnalytics,
  getOrderAnalytics,
  getTopSellingProducts,
  getCustomerAnalytics,
  getInventoryAnalytics,
  getRevenueByPeriod,
  type SalesAnalytics,
  type OrderAnalytics,
  type ProductAnalytics,
  type CustomerAnalytics,
  type RevenueByPeriod,
} from '../lib/analytics';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AdminAnalyticsPageProps {
  user: User | null;
}

const AdminAnalyticsPage = ({ user }: AdminAnalyticsPageProps) => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null);
  const [topProducts, setTopProducts] = useState<ProductAnalytics[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<RevenueByPeriod[]>([]);

  useEffect(() => {
    if (user?.isAdmin) {
      loadAnalytics();
    }
  }, [user, period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [sales, orders, products, customers, inventory, revenue] = await Promise.all([
        getSalesAnalytics(),
        getOrderAnalytics(),
        getTopSellingProducts(5),
        getCustomerAnalytics(),
        getInventoryAnalytics(),
        getRevenueByPeriod(period),
      ]);

      setSalesAnalytics(sales);
      setOrderAnalytics(orders);
      setTopProducts(products);
      setCustomerAnalytics(customers);
      setInventoryAnalytics(inventory);
      setRevenueData(revenue);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    change?: string; 
    changeType?: 'up' | 'down' 
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-[#FDBA3A]/10 rounded-lg">
          <Icon className="w-6 h-6 text-[#FDBA3A]" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {changeType === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-white/60 text-sm mb-1">{title}</h3>
      <p className="text-3xl text-white">{value}</p>
    </motion.div>
  );

  const COLORS = ['#FDBA3A', '#FFA500', '#FF8C00', '#FF7F50', '#FF6347'];

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
          <h1 className="text-5xl text-white mb-4">Analytics Dashboard</h1>
          <p className="text-xl text-white/60">
            Comprehensive business insights and performance metrics
          </p>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 mb-8"
        >
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-3 rounded-lg transition-all ${
                period === p
                  ? 'bg-[#FDBA3A] text-[#0A0A0A]'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(salesAnalytics?.totalRevenue || 0)}
            icon={DollarSign}
          />
          <StatCard
            title="Total Orders"
            value={salesAnalytics?.totalOrders || 0}
            icon={ShoppingBag}
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(salesAnalytics?.averageOrderValue || 0)}
            icon={TrendingUp}
          />
          <StatCard
            title="Total Customers"
            value={customerAnalytics?.totalCustomers || 0}
            icon={Users}
          />
        </div>

        {/* Period Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            title={`${period.charAt(0).toUpperCase() + period.slice(1)} Revenue`}
            value={formatCurrency(
              period === 'week'
                ? salesAnalytics?.weekRevenue || 0
                : period === 'month'
                ? salesAnalytics?.monthRevenue || 0
                : salesAnalytics?.yearRevenue || 0
            )}
            icon={DollarSign}
          />
          <StatCard
            title={`${period.charAt(0).toUpperCase() + period.slice(1)} Orders`}
            value={
              period === 'week'
                ? salesAnalytics?.weekOrders || 0
                : period === 'month'
                ? salesAnalytics?.monthOrders || 0
                : salesAnalytics?.yearOrders || 0
            }
            icon={ShoppingBag}
          />
          <StatCard
            title="New Customers (Month)"
            value={customerAnalytics?.newCustomersThisMonth || 0}
            icon={Users}
          />
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 mb-12"
        >
          <h2 className="text-2xl text-white mb-6">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#FDBA3A" strokeWidth={2} name="Revenue (₹)" />
              <Line type="monotone" dataKey="orders" stroke="#FFA500" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Order Status Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6"
          >
            <h2 className="text-2xl text-white mb-6">Order Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Processing', value: orderAnalytics?.processingOrders || 0 },
                    { name: 'Confirmed', value: orderAnalytics?.confirmedOrders || 0 },
                    { name: 'Shipping', value: orderAnalytics?.shippingOrders || 0 },
                    { name: 'Delivered', value: orderAnalytics?.deliveredOrders || 0 },
                    { name: 'Cancelled', value: orderAnalytics?.cancelledOrders || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6"
          >
            <h2 className="text-2xl text-white mb-6">Top Selling Products</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#FDBA3A]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#FDBA3A]">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white">{product.name}</p>
                      <p className="text-white/60 text-sm">{product.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{product.totalSales} sold</p>
                    <p className="text-[#FDBA3A] text-sm">{formatCurrency(product.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Products"
            value={inventoryAnalytics?.totalProducts || 0}
            icon={Package}
          />
          <StatCard
            title="In Stock"
            value={inventoryAnalytics?.inStock || 0}
            icon={Package}
          />
          <StatCard
            title="Low Stock"
            value={inventoryAnalytics?.lowStock || 0}
            icon={AlertTriangle}
          />
          <StatCard
            title="Out of Stock"
            value={inventoryAnalytics?.outOfStock || 0}
            icon={AlertTriangle}
          />
        </div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6"
        >
          <h2 className="text-2xl text-white mb-6">Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 pb-4 px-4">Rank</th>
                  <th className="text-left text-white/60 pb-4 px-4">Email</th>
                  <th className="text-left text-white/60 pb-4 px-4">Orders</th>
                  <th className="text-left text-white/60 pb-4 px-4">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {customerAnalytics?.topCustomers.map((customer, index) => (
                  <tr key={customer.userId} className="border-b border-white/5">
                    <td className="py-4 px-4 text-white">#{index + 1}</td>
                    <td className="py-4 px-4 text-white">{customer.email}</td>
                    <td className="py-4 px-4 text-white">{customer.totalOrders}</td>
                    <td className="py-4 px-4 text-[#FDBA3A]">{formatCurrency(customer.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
