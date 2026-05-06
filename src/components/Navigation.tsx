import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartItemCount: number;
  isLoggedIn: boolean;
  onLogout: () => void;
  isAdmin?: boolean;
}

export default function Navigation({ currentPage, onNavigate, cartItemCount, isLoggedIn, onLogout, isAdmin }: NavigationProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = isAdmin 
    ? [
        { name: 'Home', page: 'home' },
        { name: 'Products', page: 'products' },
        { name: 'Admin Panel', page: 'admin' },
        { name: 'About', page: 'about' },
        { name: 'Contact', page: 'contact' },
      ]
    : [
        { name: 'Home', page: 'home' },
        { name: 'Products', page: 'products' },
        { name: 'About', page: 'about' },
        { name: 'Team', page: 'team' },
        { name: 'Contact', page: 'contact' },
      ];

  // Smooth scroll to top function
  const handleNavigateWithScroll = (page: string) => {
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Navigate to the page
    onNavigate(page);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.button
            onClick={() => handleNavigateWithScroll('home')}
            className="text-2xl tracking-wider text-white cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <span className="font-serif">My</span>
            <span className="text-[#FDBA3A]">Watches</span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.button
                key={link.page}
                onClick={() => handleNavigateWithScroll(link.page)}
                className={`text-sm tracking-wide transition-colors ${
                  currentPage === link.page ? 'text-[#FDBA3A]' : 'text-white hover:text-[#FDBA3A]'
                }`}
                whileHover={{ y: -2 }}
              >
                {link.name}
              </motion.button>
            ))}
          </div>

          {/* Search & Icons */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <Search className="w-4 h-4 text-white/60 mr-2" />
              <input
                type="text"
                placeholder="Search watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder:text-white/40 outline-none w-40 lg:w-60 text-sm"
              />
            </div>

            {/* Cart */}
            <motion.button
              onClick={() => onNavigate('cart')}
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-[#FDBA3A] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>

            {/* Profile */}
            <div className="relative">
              <motion.button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                  isAdmin ? 'ring-2 ring-[#FDBA3A]' : ''
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className={`w-5 h-5 ${isAdmin ? 'text-[#FDBA3A]' : 'text-white'}`} />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    {isLoggedIn ? (
                      <>
                        {isAdmin && (
                          <div className="px-4 py-3 bg-[#FDBA3A]/20 border-b border-white/10">
                            <p className="text-[#FDBA3A] text-sm">Admin Account</p>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            onNavigate('profile');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('orders');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm"
                        >
                          My Orders
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              onNavigate('admin-orders');
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 text-[#FDBA3A] hover:bg-white/10 transition-colors text-sm"
                          >
                            Manage All Orders
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onNavigate('wishlist');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm"
                        >
                          Wishlist
                        </button>
                        <div className="border-t border-white/10" />
                        <button
                          onClick={() => {
                            onLogout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/10 transition-colors text-sm"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onNavigate('login');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('register');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-[#FDBA3A] hover:bg-white/10 transition-colors text-sm"
                        >
                          Register
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-black/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                <Search className="w-4 h-4 text-white/60 mr-2" />
                <input
                  type="text"
                  placeholder="Search watches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white placeholder:text-white/40 outline-none w-full text-sm"
                />
              </div>

              {/* Mobile Nav Links */}
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => {
                    handleNavigateWithScroll(link.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-3 px-4 rounded-xl transition-colors ${
                    currentPage === link.page
                      ? 'bg-[#FDBA3A]/20 text-[#FDBA3A]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
