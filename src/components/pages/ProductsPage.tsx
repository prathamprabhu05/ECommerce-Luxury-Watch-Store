import { useState } from "react";
import { motion } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "../ProductCard";

interface ProductsPageProps {
  products: any[];
  onAddToCart: (id: number) => void;
  onBuyNow: (id: number) => void;
  onViewDetails: (id: number) => void;
  onToggleWishlist: (id: number) => void;
  wishlist: any[];
}

export default function ProductsPage({
  products,
  onAddToCart,
  onBuyNow,
  onViewDetails,
  onToggleWishlist,
  wishlist,
}: ProductsPageProps) {
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");

  // Logic Fix: Ensure conditional strings match the select values exactly
  const filteredProducts = products.filter((product) => {
    // Safety check: ensure price is a number
    const price = Number(product.price);

    if (priceRange === "all") return true;
    if (priceRange === "under-5000") return price < 5000;
    // Updated to match the option value '5000-15000'
    if (priceRange === "5000-15000")
      return price >= 5000 && price <= 15000;
    if (priceRange === "over-15000") return price > 15000;

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low")
      return Number(a.price) - Number(b.price);
    if (sortBy === "price-high")
      return Number(b.price) - Number(a.price);
    if (sortBy === "rating")
      return Number(b.rating) - Number(a.rating);
    // 'featured' returns 0 to keep original order
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl text-black mb-4 font-serif">
            All Watches
          </h1>
          <p className="text-gray-600 text-lg">
            Discover our complete collection of premium
            timepieces
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="flex items-center gap-2 text-gray-600">
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filter:</span>
            </div>

            {/* Price Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
            >
              <option value="all">All Prices</option>
              <option value="under-5000">Under ₹5,000</option>
              {/* Ensure this value matches the logic in filteredProducts */}
              <option value="5000-15000">
                ₹5,000 - ₹15,000
              </option>
              {/* Fixed typo: was 150000, changed to 15000 */}
              <option value="over-15000">Over ₹15,000</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:border-[#FDBA3A] focus:ring-2 focus:ring-[#FDBA3A]/20"
            >
              <option value="featured">Featured</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="text-gray-600">
            <span>{sortedProducts.length} products</span>
          </div>
        </div>

        {/* Products Grid - Uniform Auto Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {sortedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="h-full"
            >
              <ProductCard
                {...product}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                onViewDetails={onViewDetails}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.some(
                  (item) => item.id === product.id,
                )}
              />
            </motion.div>
          ))}

          {/* Empty State Handling */}
          {sortedProducts.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              No products found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}