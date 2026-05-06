// MyWatches - Luxury E-commerce Platform
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Product, CartItem, User } from './lib/types';
import { MOCK_PRODUCTS } from './lib/mockData';
import { registerUser, loginUser, logoutUser, onAuthChange, getUserData } from './lib/firebase/auth';
import { addOrderWithStockDecrease, getAllProducts } from './lib/firebase/firestore';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import ProductsPage from './components/pages/ProductsPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import CartPage from './components/pages/CartPage';
import CheckoutPage from './components/pages/CheckoutPage';
import OrderConfirmationPage from './components/pages/OrderConfirmationPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import ProfilePage from './components/pages/ProfilePage';
import TeamPage from './components/pages/TeamPage';
import AdminPanel from './components/pages/AdminPanel';
import MyOrdersPage from './components/pages/MyOrdersPage';
import AdminOrdersPage from './components/pages/AdminOrdersPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import WishlistPage from './pages/WishlistPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [lastOrderId, setLastOrderId] = useState('');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [newCollection, setNewCollection] = useState<Product[]>(
    MOCK_PRODUCTS.filter(p => p.badge).slice(0, 6)
  );
  const [loading, setLoading] = useState(true);

  // Load products from Firebase on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Load user's cart and wishlist when logged in
  useEffect(() => {
    if (user) {
      loadCart();
      loadWishlist();
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const firestoreProducts = await getAllProducts();
      
      if (firestoreProducts.length > 0) {
        // Use products from Firestore
        setProducts(firestoreProducts);
        setNewCollection(firestoreProducts.filter(p => p.badge).slice(0, 6));
      } else {
        // Use mock products as fallback
        setProducts(MOCK_PRODUCTS);
        setNewCollection(MOCK_PRODUCTS.filter(p => p.badge).slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading products from Firestore:', error);
      // Use mock products as fallback
      setProducts(MOCK_PRODUCTS);
      setNewCollection(MOCK_PRODUCTS.filter(p => p.badge).slice(0, 6));
    }
  };

  const checkSession = () => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            const userObj = {
              id: firebaseUser.uid,
              name: userData.name,
              email: firebaseUser.email || '',
              isAdmin: userData.isAdmin || false,
            };
            setIsLoggedIn(true);
            setUser(userObj);
            setCurrentPage('home');
          }
        } else {
          // User is signed out
          setIsLoggedIn(false);
          setUser(null);
          setCurrentPage('login');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  };

  const loadCart = () => {
    if (!user) return;
    try {
      const savedCart = localStorage.getItem(`mywatches_cart_${user.id}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadWishlist = () => {
    if (!user) return;
    try {
      const savedWishlist = localStorage.getItem(`mywatches_wishlist_${user.id}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    if (!user) return;
    localStorage.setItem(`mywatches_cart_${user.id}`, JSON.stringify(newCart));
    setCart(newCart);
  };

  const saveWishlist = (newWishlist: Product[]) => {
    if (!user) return;
    localStorage.setItem(`mywatches_wishlist_${user.id}`, JSON.stringify(newWishlist));
    setWishlist(newWishlist);
  };

  const handleNavigate = (page: string, productId?: number) => {
    // Check if user is trying to access admin panel without admin rights
    if (page === 'admin' && !user?.isAdmin) {
      toast.error('Access Denied', {
        description: 'You do not have permission to access the admin panel',
        duration: 3000,
      });
      return;
    }
    
    setCurrentPage(page);
    if (productId !== undefined) {
      setSelectedProductId(productId);
    }
    // Scroll to top smoothly when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (productId: number) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(updatedCart);
      
      toast.success(`${product.name} quantity updated!`, {
        description: `Quantity: ${existingItem.quantity + 1}`,
        duration: 3000,
      });
    } else {
      const newCart = [...cart, { ...product, quantity: 1 }];
      saveCart(newCart);
      
      toast.success(`${product.name} added to cart!`, {
        description: 'Go to cart to view your items',
        duration: 3000,
      });
    }
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (!user) return;
    
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    saveCart(updatedCart);
  };

  const handleRemoveItem = (productId: number) => {
    if (!user) return;
    
    const product = cart.find(item => item.id === productId);
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
    
    if (product) {
      toast.info(`${product.name} removed from cart`, {
        duration: 3000,
      });
    }
  };

  const handleBuyNow = (productId: number) => {
    handleAddToCart(productId);
    setCurrentPage('cart');
  };

  const handleToggleWishlist = (productId: number) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const isInWishlist = wishlist.some(item => item.id === productId);
    
    if (isInWishlist) {
      const updatedWishlist = wishlist.filter(item => item.id !== productId);
      saveWishlist(updatedWishlist);
      
      toast.info(`${product.name} removed from wishlist`, {
        duration: 2000,
      });
    } else {
      const updatedWishlist = [...wishlist, product];
      saveWishlist(updatedWishlist);
      
      toast.success(`${product.name} added to wishlist!`, {
        description: 'View your wishlist in Profile',
        duration: 3000,
      });
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const userData = await loginUser(email, password);
      
      setIsLoggedIn(true);
      setUser(userData);
      
      // Show admin-specific welcome message
      if (userData.isAdmin) {
        toast.success('Welcome Back Admin!', {
          description: 'You have full administrative access',
          duration: 3000,
        });
      } else {
        toast.success('Welcome back!', {
          description: 'You have successfully logged in',
          duration: 3000,
        });
      }
      setCurrentPage('home');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to login';
      let errorDescription = undefined;
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
        
        // Special message for admin trying to login
        if (email === 'admin@mywatches.in') {
          errorMessage = 'Admin Account Not Found';
          errorDescription = 'Please register the admin account first. Check QUICK_FIX_INSTRUCTIONS.md for setup guide.';
        }
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
        
        // Special message for admin
        if (email === 'admin@mywatches.in') {
          errorMessage = 'Admin Account Not Registered';
          errorDescription = 'Click "Register" and create an account with admin@mywatches.in';
        }
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      const userData = await registerUser(name, email, password);

      toast.success('Account created!', {
        description: 'Signing you in...',
        duration: 2000,
      });

      // Auto login after registration
      setIsLoggedIn(true);
      setUser(userData);
      
      toast.success('Welcome to MyWatches!', {
        description: `Hello, ${name}!`,
        duration: 3000,
      });
      setCurrentPage('home');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to register';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      
      setIsLoggedIn(false);
      setUser(null);
      setCart([]);
      setWishlist([]);
      
      toast.info('You have been logged out', {
        duration: 3000,
      });
      setCurrentPage('login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handlePlaceOrder = async (orderData: any) => {
    if (!user) return;
    
    try {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = total * 0.1;
      const shipping = total > 500 ? 0 : 25;
      const finalTotal = total + tax + shipping;

      const order = {
        userId: user.id,
        items: cart,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        total: finalTotal,
        status: 'Processing',
      };

      // Prepare stock updates
      const stockUpdates = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      // Save order to Firestore and decrease stock in a single atomic transaction
      const savedOrder = await addOrderWithStockDecrease(user.id, order, stockUpdates);
      setLastOrderId(savedOrder.id);

      // Reload products to get updated stock
      await loadProducts();

      // Clear cart
      saveCart([]);
      
      toast.success('Order placed successfully!', {
        description: `Order ID: ${savedOrder.id}`,
        duration: 4000,
      });
      setCurrentPage('order-confirmation');
    } catch (error: any) {
      console.error('Error placing order:', error);
      
      // Check if error is related to stock
      if (error.message && error.message.includes('Insufficient stock')) {
        toast.error('Some items are out of stock', {
          description: error.message,
          duration: 5000,
        });
        // Reload products to show updated stock
        await loadProducts();
      } else if (error.message && error.message.includes('not found')) {
        toast.error('Some products are no longer available', {
          description: 'Please refresh the page and try again',
          duration: 5000,
        });
      } else {
        toast.error('Failed to place order. Please try again.', {
          description: error.message || 'An unexpected error occurred',
          duration: 5000,
        });
      }
      
      // Navigate back to cart so user can review
      setCurrentPage('cart');
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId)
    : null;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FDBA3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading MyWatches...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={3000}
      />
      <div className="min-h-screen bg-white">
        {/* Show Navigation only when logged in */}
        {isLoggedIn && (
          <Navigation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            cartItemCount={cartItemCount}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            isAdmin={user?.isAdmin}
          />
        )}

        {/* Authentication Pages - Always Accessible */}
        {currentPage === 'login' && (
          <LoginPage 
            onNavigate={handleNavigate} 
            onLogin={handleLogin}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage 
            onNavigate={handleNavigate} 
            onRegister={handleRegister}
          />
        )}

        {currentPage === 'forgot-password' && (
          <ForgotPasswordPage onNavigate={handleNavigate} />
        )}

        {/* Protected Pages - Only Accessible When Logged In */}
        {isLoggedIn && (
          <>
            {currentPage === 'home' && (
              <HomePage
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                products={products}
                newCollection={newCollection}
                wishlist={wishlist}
              />
            )}

            {currentPage === 'products' && (
              <ProductsPage
                products={products}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onToggleWishlist={handleToggleWishlist}
                onViewDetails={(id) => handleNavigate('product-detail', id)}
                wishlist={wishlist}
              />
            )}

            {currentPage === 'new-collection' && (
              <ProductsPage
                products={newCollection}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onToggleWishlist={handleToggleWishlist}
                onViewDetails={(id) => handleNavigate('product-detail', id)}
                wishlist={wishlist}
              />
            )}

            {currentPage === 'product-detail' && selectedProduct && (
              <ProductDetailPage
                product={selectedProduct}
                relatedProducts={products.filter((p) => p.id !== selectedProduct.id)}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onToggleWishlist={handleToggleWishlist}
                onNavigate={handleNavigate}
                wishlist={wishlist}
              />
            )}

            {currentPage === 'cart' && (
              <CartPage
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'checkout' && (
              <CheckoutPage cart={cart} user={user} onPlaceOrder={handlePlaceOrder} onNavigate={handleNavigate} />
            )}

            {currentPage === 'order-confirmation' && (
              <OrderConfirmationPage
                orderId={lastOrderId}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}

            {currentPage === 'team' && <TeamPage onNavigate={handleNavigate} />}

            {currentPage === 'contact' && <ContactPage />}

            {/* Admin Panel - Only accessible to admin users */}
            {currentPage === 'admin' && user?.isAdmin && (
              <AdminPanel
                products={products}
                onProductsUpdate={loadProducts}
              />
            )}

            {/* Orders Pages */}
            {currentPage === 'orders' && (
              <MyOrdersPage user={user} />
            )}

            {currentPage === 'admin-orders' && user?.isAdmin && (
              <AdminOrdersPage user={user} />
            )}

            {currentPage === 'admin-analytics' && user?.isAdmin && (
              <AdminAnalyticsPage user={user} />
            )}

            {currentPage === 'admin-inventory' && user?.isAdmin && (
              <AdminInventoryPage user={user} />
            )}

            {currentPage === 'wishlist' && (
              <WishlistPage user={user} onNavigate={handleNavigate} />
            )}

            {currentPage === 'profile' && (
              <ProfilePage 
                user={user} 
                onNavigate={handleNavigate}
              />
            )}
          </>
        )}

        {/* Footer - Show only when logged in */}
        {isLoggedIn && <Footer onNavigate={handleNavigate} />}
      </div>
    </>
  );
}