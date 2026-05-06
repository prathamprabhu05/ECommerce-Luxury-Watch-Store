import { motion } from 'motion/react';
import { ArrowRight, Shield, Truck, Award, Clock } from 'lucide-react';
import ProductCard from '../ProductCard';
import referenceImage from 'figma:asset/6ed00ecdde6ba09ae6f2ef2be0d245626820ddee.png';

interface HomePageProps {
  onNavigate: (page: string, productId?: number) => void;
  onAddToCart: (id: number) => void;
  onToggleWishlist: (id: number) => void;
  products: any[];
  newCollection: any[];
  wishlist: any[];
}

export default function HomePage({ onNavigate, onAddToCart, onToggleWishlist, products, newCollection, wishlist }: HomePageProps) {
  const handleBuyNow = (id: number) => {
    onAddToCart(id);
    onNavigate('cart');
  };

  const handleViewDetails = (id: number) => {
    onNavigate('product-detail', id);
  };

  const features = [
    {
      Icon: Shield,
      title: 'Authentic Guarantee',
      description: '100% genuine luxury timepieces',
    },
    {
      Icon: Truck,
      title: 'Free Shipping',
      description: 'On all orders over $500',
    },
    {
      Icon: Award,
      title: 'Premium Quality',
      description: 'Swiss-made craftsmanship',
    },
    {
      Icon: Clock,
      title: 'Lifetime Support',
      description: 'Expert care & maintenance',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://cdn.pixabay.com/video/2020/11/07/55760-503981016_large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl text-white mb-6 font-serif"
          >
            Discover Timeless Elegance
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 mb-12"
          >
            Premium watches crafted for every style.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => onNavigate('products')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-full text-lg hover:shadow-2xl hover:shadow-[#FDBA3A]/50 transition-all flex items-center gap-2"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => onNavigate('new-collection')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-full text-lg hover:bg-white/20 transition-all"
            >
              View Collections
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm flex flex-col items-center gap-2"
        >
          <span>Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FDBA3A]/10 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-[#FDBA3A]" />
                </div>
                <h3 className="text-xl text-black mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Watches Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-black mb-4 font-serif">Our Watches</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore our curated collection of premium timepieces, each one a masterpiece of
              precision and style.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 auto-rows-fr">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard
                  {...product}
                  onAddToCart={onAddToCart}
                  onBuyNow={handleBuyNow}
                  onViewDetails={handleViewDetails}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.some(item => item.id === product.id)}
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <motion.button
              onClick={() => onNavigate('products')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              View All Watches
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* New Collection Section */}
      <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-4 font-serif">
              <span className="text-[#FDBA3A]">New</span> Collection
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Discover the latest arrivals. Exquisite, Curated, Crafted, and Perfected.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 auto-rows-fr">
            {newCollection.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard
                  {...product}
                  onAddToCart={onAddToCart}
                  onBuyNow={handleBuyNow}
                  onViewDetails={handleViewDetails}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.some(item => item.id === product.id)}
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <motion.button
              onClick={() => onNavigate('new-collection')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-full hover:shadow-lg hover:shadow-[#FDBA3A]/50 transition-all inline-flex items-center gap-2"
            >
              Explore Collection
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-4xl md:text-5xl text-black mb-6 font-serif">
                About <span className="text-[#FDBA3A]">MyWatches</span>
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                MyWatches is founded on a timeless pursuit of perfection. Each timepiece in our
                collection represents decades of horological expertise, combining traditional
                craftsmanship with modern innovation.
              </p>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                We believe a watch is more than just a tool for telling time—it's a statement of
                character, a symbol of achievement, and a legacy to be passed down through
                generations.
              </p>
              <motion.button
                onClick={() => onNavigate('about')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                Learn More
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1760541791863-424a4af5de1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaCUyMGJveHxlbnwxfHx8fDE3NjMwNDI2Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Luxury watch collection"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl mb-6 font-serif">Get in Touch</h2>
            <p className="text-white/70 text-lg mb-8">
              Have questions about our timepieces? Our expert team is here to help you find the
              perfect watch.
            </p>
            <motion.button
              onClick={() => onNavigate('contact')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-[#FDBA3A] to-[#f5a623] text-black rounded-full hover:shadow-lg hover:shadow-[#FDBA3A]/50 transition-all inline-flex items-center gap-2 text-lg"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
