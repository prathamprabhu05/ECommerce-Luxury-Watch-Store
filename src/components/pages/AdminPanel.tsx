import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, Save, X, Package, DollarSign, Star, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../lib/types';
import { addProduct, updateProduct, deleteProduct } from '../../lib/firebase/firestore';
import { toast } from 'sonner';

interface AdminPanelProps {
  products: Product[];
  onProductsUpdate: () => void;
}

export default function AdminPanel({ products, onProductsUpdate }: AdminPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: 0,
    originalPrice: 0,
    image: '',
    description: '',
    badge: '',
    rating: 0,
    reviews: 0,
    stock: 0,
    movement: '',
    caseMaterial: '',
    caseSize: '',
    waterResistance: '',
    strapMaterial: '',
    warranty: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        brand: editingProduct.brand,
        price: editingProduct.price,
        originalPrice: editingProduct.originalPrice || 0,
        image: editingProduct.image,
        description: editingProduct.description,
        badge: editingProduct.badge || '',
        rating: editingProduct.rating || 0,
        reviews: editingProduct.reviews || 0,
        stock: editingProduct.stock,
        movement: editingProduct.specs?.movement || '',
        caseMaterial: editingProduct.specs?.caseMaterial || '',
        caseSize: editingProduct.specs?.caseSize || '',
        waterResistance: editingProduct.specs?.waterResistance || '',
        strapMaterial: editingProduct.specs?.strapMaterial || '',
        warranty: editingProduct.specs?.warranty || '',
      });
      setShowAddForm(true);
    }
  }, [editingProduct]);

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      price: 0,
      originalPrice: 0,
      image: '',
      description: '',
      badge: '',
      rating: 0,
      reviews: 0,
      stock: 0,
      movement: '',
      caseMaterial: '',
      caseSize: '',
      waterResistance: '',
      strapMaterial: '',
      warranty: '',
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // --- NEW CONSTRAINT LOGIC INTEGRATED HERE ---
  // Helper function to allow only letters and spaces
  const handleTextOnlyInput = (value: string): string => {
    // Allow only letters (A-Z, a-z), spaces, hyphens, and apostrophes
    return value.replace(/[^a-zA-Z\s\-']/g, '');
  };
  // --------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        image: formData.image,
        description: formData.description,
        badge: formData.badge || undefined,
        rating: formData.rating ? Number(formData.rating) : undefined,
        reviews: formData.reviews ? Number(formData.reviews) : undefined,
        stock: Number(formData.stock),
        specs: {
          movement: formData.movement || undefined,
          caseMaterial: formData.caseMaterial || undefined,
          caseSize: formData.caseSize || undefined,
          waterResistance: formData.waterResistance || undefined,
          strapMaterial: formData.strapMaterial || undefined,
          warranty: formData.warranty || undefined,
        },
      };

      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, productData as Partial<Product>);
        toast.success('Product updated successfully!');
      } else {
        // Add new product
        await addProduct(productData);
        toast.success('Product added successfully!');
      }

      // Reload products
      await onProductsUpdate();
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      // Handle duplicate product error
      if (error.message && error.message.includes('already exists')) {
        toast.error('Duplicate Product', {
          description: error.message,
          duration: 6000,
        });
      }
      // Handle Firestore permission errors
      else if (error.code === 'permission-denied') {
        toast.error('Permission Denied', {
          description: 'Firestore rules need to be deployed. Check QUICK_FIX_INSTRUCTIONS.md for setup.',
          duration: 6000,
        });
      } else {
        toast.error(error.message || 'Failed to save product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully!');
      await onProductsUpdate();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      // Handle Firestore permission errors
      if (error.code === 'permission-denied') {
        toast.error('Permission Denied', {
          description: 'Firestore rules need to be deployed. Check QUICK_FIX_INSTRUCTIONS.md for setup.',
          duration: 6000,
        });
      } else {
        toast.error(error.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-black via-[#0A0A0A] to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-2 bg-[#FDBA3A]/20 rounded-lg mb-4">
            <p className="text-[#FDBA3A] text-sm">👑 Welcome Back Admin</p>
          </div>
          <h1 className="text-5xl mb-4 text-white">
            Admin <span className="text-[#FDBA3A]">Dashboard</span>
          </h1>
          <p className="text-white/60">Manage your watch inventory - All changes sync to Firebase in real-time</p>
        </motion.div>

        {/* Add Product Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex justify-between items-center"
        >
          <div className="text-white/80">
            <span className="text-2xl">{products.length}</span> Products
          </div>
          {!showAddForm && (
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#FDBA3A] text-black rounded-lg hover:bg-[#FDBA3A]/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Add Product
            </motion.button>
          )}
        </motion.div>

        {/* Add/Edit Product Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl text-white">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 mb-2">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        // UPDATED: Now uses handleTextOnlyInput
                        onChange={(e) => setFormData({ ...formData, name: handleTextOnlyInput(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                        placeholder="Rolex Submariner"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Brand *</label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        // UPDATED: Now uses handleTextOnlyInput
                        onChange={(e) => setFormData({ ...formData, brand: handleTextOnlyInput(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                        placeholder="Rolex"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Price ($) *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                        placeholder="999.99"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Original Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                        placeholder="1299.99"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Badge</label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                        placeholder="NEW ARRIVAL"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Rating (0-5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                        placeholder="4.8"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Number of Reviews</label>
                      <input
                        type="number"
                        value={formData.reviews}
                        onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                        placeholder="128"
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-white/80 mb-2">Image URL *</label>
                    <input
                      type="url"
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                    <p className="text-white/40 text-xs mt-1">
                      💡 Tip: Use <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-[#FDBA3A] hover:underline">Unsplash</a> for high-quality watch images
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-white/80 mb-2">Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A] resize-none"
                      placeholder="Elegant timepiece with premium materials..."
                    />
                  </div>

                  {/* Specifications */}
                  <div>
                    <h3 className="text-xl text-white mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/60 text-sm mb-2">Movement</label>
                        <input
                          type="text"
                          value={formData.movement}
                          onChange={(e) => setFormData({ ...formData, movement: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                          placeholder="Automatic"
                        />
                      </div>

                      <div>
                        <label className="block text-white/60 text-sm mb-2">Case Material</label>
                        <input
                          type="text"
                          value={formData.caseMaterial}
                          onChange={(e) => setFormData({ ...formData, caseMaterial: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                          placeholder="Stainless Steel"
                        />
                      </div>

                      <div>
                        <label className="block text-white/60 text-sm mb-2">Case Size</label>
                        <input
                          type="text"
                          value={formData.caseSize}
                          onChange={(e) => setFormData({ ...formData, caseSize: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                          placeholder="42mm"
                        />
                      </div>

                      <div>
                        <label className="block text-white/60 text-sm mb-2">Water Resistance</label>
                        <input
                          type="text"
                          value={formData.waterResistance}
                          onChange={(e) => setFormData({ ...formData, waterResistance: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                          placeholder="100m"
                        />
                      </div>

                      <div>
                        <label className="block text-white/60 text-sm mb-2">Strap Material</label>
                        <input
                          type="text"
                          value={formData.strapMaterial}
                          onChange={(e) => setFormData({ ...formData, strapMaterial: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                          placeholder="Leather"
                        />
                      </div>

                      <div>
                        <label className="block text-white/60 text-sm mb-2">Warranty</label>
                        <input
                          type="text"
                          value={formData.warranty}
                          onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#FDBA3A]"
                          placeholder="2 Years International"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 bg-[#FDBA3A] text-black rounded-lg hover:bg-[#FDBA3A]/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products List */}
        <div className="grid grid-cols-1 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#FDBA3A]/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Product Image */}
                <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl text-white mb-1">{product.name}</h3>
                      <p className="text-white/60">{product.brand}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 bg-[#FDBA3A]/20 text-[#FDBA3A] rounded-lg hover:bg-[#FDBA3A]/30 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-white/80">
                      <DollarSign className="w-4 h-4 text-[#FDBA3A]" />
                      <span>${product.price}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Package className="w-4 h-4 text-[#FDBA3A]" />
                      <span>{product.stock} in stock</span>
                    </div>
                    {product.rating && (
                      <div className="flex items-center gap-2 text-white/80">
                        <Star className="w-4 h-4 text-[#FDBA3A] fill-[#FDBA3A]" />
                        <span>{product.rating} ({product.reviews})</span>
                      </div>
                    )}
                    {product.badge && (
                      <div className="px-3 py-1 bg-[#FDBA3A]/20 text-[#FDBA3A] rounded-lg text-sm w-fit">
                        {product.badge}
                      </div>
                    )}
                  </div>

                  <p className="text-white/60 text-sm line-clamp-2">{product.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg">No products yet. Add your first product!</p>
          </div>
        )}
      </div>
    </div>
  );
}