import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, ShoppingCart, User, Package, BarChart3, LogOut, X, Copy
} from 'lucide-react';

// Extracted Pages & Components
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

// Lazy Loaded Pages
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage'));
const WishlistPage = lazy(() => import('./components/WishlistPage'));
const NewProductsPage = lazy(() => import('./components/NewProductsPage'));
const BestSellersPage = lazy(() => import('./components/BestSellersPage'));
const PromoPage = lazy(() => import('./components/PromoPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const FAQPage = lazy(() => import('./components/FAQPage'));
const ReturnsPage = lazy(() => import('./components/ReturnsPage'));
const FlashSalePage = lazy(() => import('./components/FlashSalePage'));
const OrderTrackingPage = lazy(() => import('./components/OrderTrackingPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));

// Providers & Contexts
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { ComparisonProvider, useComparison } from './context/ComparisonContext';

// Components
import RouteGuard from './components/RouteGuard';
import ScrollToTop from './components/ScrollToTop';
import OfflineIndicator from './components/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import CompareBar from './components/CompareBar';
import ComparisonModal from './components/ComparisonModal';
import LiveChatWidget from './components/LiveChatWidget';
import NewsletterSection from './components/NewsletterSection';

// API Helpers
import {
  getCart, addToCart as addToCartAPI, removeCartItem, updateCartItem,
  validateVoucher
} from './lib/api';

// Font Styles
const FontStyles = () => (
  <style>{`
    body { font-family: 'Poppins', sans-serif; background-color: #F9FAFB; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// Main App Layout & Routing Bridge
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { compareItems, removeFromCompare } = useComparison();

  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('hera_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showComparison, setShowComparison] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  // Derive currentPage from route path for legacy checks
  let currentPage = 'home';
  const path = location.pathname;
  if (path === '/') currentPage = 'home';
  else if (path.startsWith('/product/')) currentPage = 'detail';
  else currentPage = path.substring(1);

  // Legacy page transition bridge
  const setCurrentPage = (page) => {
    if (page === 'home') navigate('/');
    else if (page === 'detail' && selectedProduct) navigate(`/product/${selectedProduct.id}`);
    else navigate(`/${page}`);
  };

  // Listen for route guard navigation events
  useEffect(() => {
    const handleNavigate = (e) => {
      setCurrentPage(e.detail);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, [selectedProduct]);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('hera_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync cart with Supabase when user is logged in (merging guest cart)
  useEffect(() => {
    if (!user?.id) {
      setCart([]);
      localStorage.removeItem('hera_cart');
      return;
    }
    const syncCart = async () => {
      try {
        const serverCart = await getCart(user.id);
        const serverCartMapped = (serverCart || []).map(item => ({
          id: item.product_id,
          name: item.products?.name,
          price: item.products?.price,
          thumbnail: item.products?.thumbnail,
          qty: item.quantity,
          variant: item.variant,
          cart_item_id: item.id
        }));

        const saved = localStorage.getItem('hera_cart');
        const guestCart = saved ? JSON.parse(saved) : [];

        if (guestCart.length === 0) {
          setCart(serverCartMapped);
          return;
        }

        const finalCart = [...serverCartMapped];
        for (const guestItem of guestCart) {
          const existingServerItemIdx = finalCart.findIndex(
            item => item.id === guestItem.id && (item.variant || null) === (guestItem.variant || null)
          );

          if (existingServerItemIdx !== -1) {
            const newQty = finalCart[existingServerItemIdx].qty + guestItem.qty;
            finalCart[existingServerItemIdx].qty = newQty;
            const cartItemId = finalCart[existingServerItemIdx].cart_item_id;
            await updateCartItem(cartItemId, { quantity: newQty });
          } else {
            const newServerItem = await addToCartAPI(
              user.id,
              guestItem.id,
              guestItem.qty,
              guestItem.variant || null
            );
            finalCart.push({
              ...guestItem,
              cart_item_id: newServerItem.id
            });
          }
        }

        setCart(finalCart);
        localStorage.setItem('hera_cart', JSON.stringify(finalCart));
      } catch (error) {
        console.error('Error syncing cart:', error);
      }
    };
    syncCart();
  }, [user?.id]);

  const addToCart = async (product) => {
    if (!user) {
      addToast('Silakan masuk (login) terlebih dahulu untuk menambah ke keranjang', 'warning');
      setCurrentPage('auth');
      return;
    }
    const existing = cart.find(item => item.id === product.id && (item.variant || null) === (product.variant || null));
    if (existing) {
      const updatedCart = cart.map(item => (item.id === product.id && (item.variant || null) === (product.variant || null)) ? { ...item, qty: item.qty + (product.qty || 1) } : item);
      setCart(updatedCart);
      addToast(`${product.name} ditambahkan ke keranjang`, 'success');
      if (user?.id) {
        try {
          await addToCartAPI(user.id, product.id, product.qty || 1, product.variant || null);
        } catch (error) {
          console.error('Error adding to cart:', error);
        }
      }
    } else {
      const newItem = { ...product, qty: product.qty || 1 };
      setCart([...cart, newItem]);
      addToast(`${product.name} ditambahkan ke keranjang`, 'success');
      if (user?.id) {
        try {
          await addToCartAPI(user.id, product.id, product.qty || 1, product.variant || null);
        } catch (error) {
          console.error('Error adding to cart:', error);
        }
      }
    }
  };

  const removeFromCart = async (id, variant) => {
    const item = cart.find(item => item.id === id && (item.variant || null) === (variant || null));
    setCart(cart.filter(item => !(item.id === id && (item.variant || null) === (variant || null))));
    if (item) {
      addToast(`${item.name} dihapus dari keranjang`, 'info');
    }
    if (user?.id) {
      if (item?.cart_item_id) {
        try {
          await removeCartItem(item.cart_item_id);
        } catch (error) {
          console.error('Error removing cart item:', error);
        }
      }
    }
  };

  const calculateVoucherDiscount = (voucher, subtotal) => {
    if (!voucher) return 0;
    const value = Number(voucher.value || 0);
    if (voucher.type === 'percentage') {
      const maxDiscount = Number(voucher.max_discount) || Infinity;
      return Math.min(Math.round(subtotal * (value / 100)), maxDiscount, subtotal);
    }
    return Math.min(value, subtotal);
  };

  const handleApplyVoucher = async (code, subtotal) => {
    const voucher = await validateVoucher(code, subtotal);
    if (!voucher) {
      throw new Error('Kode promo tidak valid atau tidak memenuhi syarat');
    }
    const discount = calculateVoucherDiscount(voucher, subtotal);
    setAppliedVoucher(voucher);
    setVoucherDiscount(discount);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
  };

  const handleCheckout = (selectedCart) => {
    setCheckoutItems(selectedCart);
    setCurrentPage('checkout');
  };

  const handleBuyNow = (product) => {
    if (!user) {
      addToast('Silakan masuk terlebih dahulu', 'warning');
      setCurrentPage('auth');
      return;
    }
    const newItem = { ...product, qty: product.qty || 1 };
    addToCart(product);
    setCheckoutItems([newItem]);
    setCurrentPage('checkout');
  };

  // Auth Page renders standalone (without layout navbar/footer)
  if (path === '/auth') {
    return (
      <>
        <FontStyles />
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]" />
          </div>
        }>
          <AuthPage setCurrentPage={setCurrentPage} />
        </Suspense>
      </>
    );
  }

  // Admin Dashboard renders standalone
  if (path === '/admin' || path.startsWith('/admin/')) {
    return (
      <ErrorBoundary>
        <FontStyles />
        <OfflineIndicator />
        <RouteGuard requireAdmin>
          <AdminDashboard setCurrentPage={setCurrentPage} />
        </RouteGuard>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <FontStyles />
      <OfflineIndicator />
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setSelectedProduct={setSelectedProduct}
        setSearchQuery={setSearchQuery}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} setSelectedCategory={setSelectedCategory} />} />
              <Route path="/listing" element={<ProductListing setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />} />
              <Route path="/product/:id" element={<ProductDetail product={selectedProduct} setCurrentPage={setCurrentPage} addToCart={addToCart} setSelectedCategory={setSelectedCategory} onBuyNow={handleBuyNow} />} />
              <Route path="/detail" element={<ProductDetail product={selectedProduct} setCurrentPage={setCurrentPage} addToCart={addToCart} setSelectedCategory={setSelectedCategory} onBuyNow={handleBuyNow} />} />
              <Route path="/search" element={<SearchResultsPage query={searchQuery} setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />} />
              <Route path="/about" element={<AboutPage setCurrentPage={setCurrentPage} />} />
              <Route path="/faq" element={<FAQPage setCurrentPage={setCurrentPage} />} />
              <Route path="/returns" element={<ReturnsPage setCurrentPage={setCurrentPage} />} />
              <Route path="/flashsale" element={<FlashSalePage setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />} />
              <Route path="/baru" element={<NewProductsPage setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />} />
              <Route path="/terlaris" element={<BestSellersPage setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />} />
              <Route path="/promo" element={<PromoPage setCurrentPage={setCurrentPage} />} />
              <Route path="/tracking" element={<OrderTrackingPage setCurrentPage={setCurrentPage} />} />
              <Route path="/contact" element={<ContactPage setCurrentPage={setCurrentPage} />} />
              <Route path="/terms" element={<TermsPage setCurrentPage={setCurrentPage} />} />
              <Route path="/privacy" element={<PrivacyPage setCurrentPage={setCurrentPage} />} />
              <Route path="/cart" element={
                <RouteGuard requireAuth>
                  <CartPage
                    cart={cart}
                    setCart={setCart}
                    removeFromCart={removeFromCart}
                    setCurrentPage={setCurrentPage}
                    onCheckout={handleCheckout}
                    appliedVoucher={appliedVoucher}
                    discount={voucherDiscount}
                    onApplyVoucher={handleApplyVoucher}
                    onRemoveVoucher={handleRemoveVoucher}
                  />
                </RouteGuard>
              } />
              <Route path="/checkout" element={
                <RouteGuard requireAuth>
                  <CheckoutPage
                    cart={checkoutItems}
                    setCart={setCart}
                    setCurrentPage={setCurrentPage}
                    discount={voucherDiscount}
                    appliedVoucher={appliedVoucher}
                  />
                </RouteGuard>
              } />
              <Route path="/profile" element={
                <RouteGuard requireAuth>
                  <ProfilePage setCurrentPage={setCurrentPage} addToCart={addToCart} />
                </RouteGuard>
              } />
              <Route path="/wishlist" element={
                <RouteGuard requireAuth>
                  <WishlistPage setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} addToCart={addToCart} />
                </RouteGuard>
              } />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>

      <ScrollToTop />
      <LiveChatWidget />
      <CompareBar onShowComparison={() => setShowComparison(true)} />

      {showComparison && (
        <ComparisonModal
          products={compareItems}
          onClose={() => setShowComparison(false)}
          onRemove={removeFromCompare}
        />
      )}

      <NewsletterSection />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#16A34A] p-2 rounded-lg">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-[#16A34A]">Hera Store</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Solusi produk rumah tangga premium dengan kualitas terbaik dan harga terjangkau untuk kebutuhan Anda sehari-hari.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Tautan Cepat</h3>
              <div className="space-y-2">
                <button onClick={() => setCurrentPage('about')} className="block text-sm text-gray-600 hover:text-[#16A34A] transition-colors">
                  Tentang Kami
                </button>
                <button onClick={() => setCurrentPage('faq')} className="block text-sm text-gray-600 hover:text-[#16A34A] transition-colors">
                  FAQ
                </button>
                <button onClick={() => setCurrentPage('flashsale')} className="block text-sm text-gray-600 hover:text-[#16A34A] transition-colors">
                  Flash Sale
                </button>
                <button onClick={() => setCurrentPage('returns')} className="block text-sm text-gray-600 hover:text-[#16A34A] transition-colors">
                  Pengembalian
                </button>
                <button onClick={() => setCurrentPage('tracking')} className="block text-sm text-gray-600 hover:text-[#16A34A] transition-colors">
                  Lacak Pesanan
                </button>
                <button onClick={() => setCurrentPage('contact')} className="block text-sm text-gray-600 hover:text-[#16A34A] transition-colors">
                  Hubungi Kami
                </button>
                <button onClick={() => setCurrentPage('profile')} className="block text-sm text-gray-600 hover:text-[#16A34A] transition-colors">
                  Profil Saya
                </button>
                <button onClick={() => setCurrentPage('admin')} className="block text-sm text-gray-600 hover:text-[#16A34A] transition-colors">
                  Admin Panel
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Hubungi Kami</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Email: support@herastore.com</p>
                <p>Telepon: 0812-3456-7890</p>
                <p>Alamat: Jl. Raya No. 123, Jakarta</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <span>&copy; 2026 Hera Store. All rights reserved.</span>
            <div className="flex gap-4">
              <button onClick={() => setCurrentPage('terms')} className="hover:text-[#16A34A] transition-colors">
                Syarat & Ketentuan
              </button>
              <button onClick={() => setCurrentPage('privacy')} className="hover:text-[#16A34A] transition-colors">
                Kebijakan Privasi
              </button>
            </div>
          </div>
        </div>
      </footer>
    </ErrorBoundary>
  );
}

import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <ComparisonProvider>
                <AppContent />
              </ComparisonProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </HelmetProvider>
  );
}
