import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, AlertTriangle, TrendingUp, Edit, Search } from 'lucide-react';
import { getAllProducts, type Product } from '../lib/products';
import { updateProductStock, getLowStockProducts, getOutOfStockProducts } from '../lib/inventory';
import { toast } from 'sonner@2.0.3';
import { User } from '../lib/types';

interface AdminInventoryPageProps {
  user: User | null;
}

const AdminInventoryPage = ({ user }: AdminInventoryPageProps) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [stockData, setStockData] = useState<{ [key: string]: { quantity: number; threshold: number } }>({});

  useEffect(() => {
    if (user?.isAdmin) {
      loadProducts();
    }
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, filterType]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
      
      // Initialize stock data
      const initialStockData: { [key: string]: { quantity: number; threshold: number } } = {};
      allProducts.forEach((product) => {
        initialStockData[product.id] = {
          quantity: product.stockQuantity || 0,
          threshold: product.lowStockThreshold || 5,
        };
      });
      setStockData(initialStockData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by type
    if (filterType === 'low') {
      filtered = filtered.filter((p) => {
        const stock = p.stockQuantity || 0;
        const threshold = p.lowStockThreshold || 5;
        return stock <= threshold && stock > 0;
      });
    } else if (filterType === 'out') {
      filtered = filtered.filter((p) => (p.stockQuantity || 0) === 0);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleUpdateStock = async (productId: string) => {
    const data = stockData[productId];
    if (!data) return;

    try {
      const success = await updateProductStock(
        productId,
        data.quantity,
        data.threshold,
        user?.email || 'admin',
        'Manual stock update'
      );

      if (success) {
        toast.success('Stock updated successfully');
        setEditingProduct(null);
        loadProducts();
      } else {
        toast.error('Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const getStockStatus = (product: Product) => {
    const stock = product.stockQuantity || 0;
    const threshold = product.lowStockThreshold || 5;

    if (stock === 0) {
      return { label: 'Out of Stock', color: 'text-red-400', bgColor: 'bg-red-400/10' };
    } else if (stock <= threshold) {
      return { label: 'Low Stock', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' };
    } else {
      return { label: 'In Stock', color: 'text-green-400', bgColor: 'bg-green-400/10' };
    }
  };

  const lowStockCount = products.filter((p) => {
    const stock = p.stockQuantity || 0;
    const threshold = p.lowStockThreshold || 5;
    return stock <= threshold && stock > 0;
  }).length;

  const outOfStockCount = products.filter((p) => (p.stockQuantity || 0) === 0).length;

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
          <h1 className="text-5xl text-white mb-4">Inventory Management</h1>
          <p className="text-xl text-white/60">
            Manage stock levels and track inventory across all products
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6"
          >
            <div className="flex items-center gap-4 mb-2">
              <Package className="w-8 h-8 text-[#FDBA3A]" />
              <h3 className="text-white/60">Total Products</h3>
            </div>
            <p className="text-4xl text-white">{products.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6"
          >
            <div className="flex items-center gap-4 mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <h3 className="text-white/60">Low Stock</h3>
            </div>
            <p className="text-4xl text-white">{lowStockCount}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6"
          >
            <div className="flex items-center gap-4 mb-2">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-white/60">Out of Stock</h3>
            </div>
            <p className="text-4xl text-white">{outOfStockCount}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              {[
                { label: 'All Products', value: 'all' as const },
                { label: 'Low Stock', value: 'low' as const },
                { label: 'Out of Stock', value: 'out' as const },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value)}
                  className={`px-6 py-3 rounded-lg transition-all ${
                    filterType === filter.value
                      ? 'bg-[#FDBA3A] text-[#0A0A0A]'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 p-4">Product</th>
                  <th className="text-left text-white/60 p-4">Brand</th>
                  <th className="text-left text-white/60 p-4">Current Stock</th>
                  <th className="text-left text-white/60 p-4">Low Stock Alert</th>
                  <th className="text-left text-white/60 p-4">Status</th>
                  <th className="text-left text-white/60 p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  const isEditing = editingProduct === product.id;

                  return (
                    <tr key={product.id} className="border-b border-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || '/placeholder.png'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <p className="text-white">{product.name}</p>
                        </div>
                      </td>
                      <td className="p-4 text-white/60">{product.brand}</td>
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={stockData[product.id]?.quantity || 0}
                            onChange={(e) =>
                              setStockData({
                                ...stockData,
                                [product.id]: {
                                  ...stockData[product.id],
                                  quantity: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-24 bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                          />
                        ) : (
                          <span className="text-white">{product.stockQuantity || 0}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={stockData[product.id]?.threshold || 5}
                            onChange={(e) =>
                              setStockData({
                                ...stockData,
                                [product.id]: {
                                  ...stockData[product.id],
                                  threshold: parseInt(e.target.value) || 5,
                                },
                              })
                            }
                            className="w-24 bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                          />
                        ) : (
                          <span className="text-white">{product.lowStockThreshold || 5}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStock(product.id)}
                              className="px-4 py-2 bg-[#FDBA3A] text-[#0A0A0A] rounded hover:bg-[#FDBA3A]/90"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(null);
                                setStockData({
                                  ...stockData,
                                  [product.id]: {
                                    quantity: product.stockQuantity || 0,
                                    threshold: product.lowStockThreshold || 5,
                                  },
                                });
                              }}
                              className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingProduct(product.id)}
                            className="p-2 text-[#FDBA3A] hover:bg-white/5 rounded"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-white/60">
              No products found matching your criteria
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminInventoryPage;
