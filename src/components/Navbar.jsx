import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Leaf, Heart, ShoppingCart, User, Package, BarChart3, LogOut, ChevronDown, X
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import { getCategories } from '../lib/api';

const Navbar = ({
  currentPage,
  setCurrentPage,
  cartCount,
  selectedCategory,
  setSelectedCategory,
  setSelectedProduct,
  setSearchQuery
}) => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { addToast } = useToast();
  const { wishlist } = useWishlist();
  const [profileOpen, setProfileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories in Navbar:', error);
      }
    };
    fetchCats();
  }, []);

  const handleLogout = async () => {
    await signOut();
    setProfileOpen(false);
    setCurrentPage('home');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden mt-1 p-2 hover:bg-gray-100 rounded-full"
              aria-label="Menu navigasi"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="bg-[#16A34A] p-2 rounded-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="hidden md:block text-xl font-bold text-[#16A34A]">Hera Store</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <SearchBar
              onProductClick={(product) => {
                setSelectedProduct(product);
                setCurrentPage('detail');
              }}
              onSearch={(query) => {
                setSearchQuery(query);
                setCurrentPage('search');
              }}
              onClose={() => {}}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Search Button */}
            <div className="md:hidden">
              <SearchBar
                onProductClick={(product) => {
                  setSelectedProduct(product);
                  setCurrentPage('detail');
                }}
                onSearch={(query) => {
                  setSearchQuery(query);
                  setCurrentPage('search');
                }}
                onClose={() => {}}
              />
            </div>
            <button
              onClick={() => setCurrentPage('wishlist')}
              className="relative hidden md:block p-2 hover:bg-gray-100 rounded-full"
              aria-label={`Wishlist${wishlist.length > 0 ? ` (${wishlist.length} item)` : ''}`}
            >
              <Heart className="w-6 h-6 text-gray-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" aria-hidden="true">{wishlist.length}</span>
              )}
            </button>
            <NotificationBell />
            <button
              className="relative p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setCurrentPage('cart')}
              aria-label={`Keranjang belanja${cartCount > 0 ? ` (${cartCount} item)` : ''}`}
            >
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#16A34A] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" aria-hidden="true">{cartCount}</span>
              )}
            </button>
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-semibold overflow-hidden"
                  >
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile?.full_name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button onClick={() => { setCurrentPage('profile'); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                        <User className="w-4 h-4" /> Profil
                      </button>
                      <button onClick={() => { setCurrentPage('profile'); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Package className="w-4 h-4" /> Pesanan Saya
                      </button>
                      {isAdmin && (
                        <button onClick={() => { setCurrentPage('admin'); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" /> Admin Panel
                        </button>
                      )}
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2" aria-label="Keluar dari akun">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setCurrentPage('auth')}
                  className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#15803D] transition"
                >
                  Masuk
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sub Header Menu desktop */}
        <div className="hidden md:flex items-center gap-6 pb-3 relative">
          <button
            onClick={() => setCurrentPage('home')}
            className={`text-sm font-medium whitespace-nowrap ${currentPage === 'home' ? 'text-[#16A34A]' : 'text-gray-600 hover:text-[#16A34A]'}`}
          >
            Beranda
          </button>

          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 whitespace-nowrap hover:text-[#16A34A] transition"
            >
              <Menu className="w-4 h-4" /> Kategori <ChevronDown className="w-3 h-3" />
            </button>
            {categoryDropdownOpen && (
              <>
                {/* Click outside backdrop for categories */}
                <div className="fixed inset-0 z-40" onClick={() => setCategoryDropdownOpen(false)} />
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  <button
                    onClick={() => {
                      setSelectedCategory('Semua');
                      setCategoryDropdownOpen(false);
                      setCurrentPage('listing');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    Semua Kategori
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCategoryDropdownOpen(false);
                        setCurrentPage('listing');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button onClick={() => setCurrentPage('flashsale')} className={`text-sm font-medium whitespace-nowrap ${currentPage === 'flashsale' ? 'text-[#16A34A]' : 'text-gray-600 hover:text-[#16A34A]'}`}>Flash Sale</button>
          <button onClick={() => setCurrentPage('promo')} className={`text-sm font-medium whitespace-nowrap ${currentPage === 'promo' ? 'text-[#16A34A]' : 'text-gray-600 hover:text-[#16A34A]'}`}>Promo</button>
          <button onClick={() => setCurrentPage('baru')} className={`text-sm font-medium whitespace-nowrap ${currentPage === 'baru' ? 'text-[#16A34A]' : 'text-gray-600 hover:text-[#16A34A]'}`}>Baru</button>
          <button onClick={() => setCurrentPage('terlaris')} className={`text-sm font-medium whitespace-nowrap ${currentPage === 'terlaris' ? 'text-[#16A34A]' : 'text-gray-600 hover:text-[#16A34A]'}`}>Terlaris</button>
          <button onClick={() => setCurrentPage('about')} className={`text-sm font-medium whitespace-nowrap ${currentPage === 'about' ? 'text-[#16A34A]' : 'text-gray-600 hover:text-[#16A34A]'}`}>Tentang Kami</button>
        </div>
      </div>

      {/* Mobile Sidebar Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-50 p-6 shadow-2xl flex flex-col md:hidden overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-[#16A34A] p-2 rounded-lg">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-[#16A34A]">Hera Store</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full"
                  aria-label="Tutup menu"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* User Profile Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-semibold overflow-hidden">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        profile?.full_name?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentPage('auth');
                    }}
                    className="w-full bg-[#16A34A] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#15803D]"
                  >
                    Masuk / Daftar Akun
                  </button>
                )}
              </div>

              {/* Navigation Links */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigasi</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Beranda', page: 'home' },
                    { label: 'Kategori', page: 'listing', category: 'Semua' },
                    { label: 'Flash Sale', page: 'flashsale' },
                    { label: 'Promo', page: 'promo' },
                    { label: 'Baru', page: 'baru' },
                    { label: 'Terlaris', page: 'terlaris' },
                    { label: 'Tentang Kami', page: 'about' }
                  ].map((link) => (
                    <button
                      key={link.page + link.label}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCurrentPage(link.page);
                        if (link.category) {
                          setSelectedCategory(link.category);
                        }
                      }}
                      className={`text-left py-2 px-3 rounded-lg text-sm font-medium transition ${
                        (currentPage === link.page && (!link.category || selectedCategory === link.category)) ? 'bg-[#DCFCE7] text-[#15803D]' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                  {user && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCurrentPage('profile');
                      }}
                      className={`text-left py-2 px-3 rounded-lg text-sm font-medium transition ${
                        currentPage === 'profile' ? 'bg-[#DCFCE7] text-[#15803D]' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Profil Saya
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCurrentPage('admin');
                      }}
                      className={`text-left py-2 px-3 rounded-lg text-sm font-medium transition ${
                        currentPage === 'admin' ? 'bg-[#DCFCE7] text-[#15803D]' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Admin Panel
                    </button>
                  )}
                </div>
              </div>

              {/* Logout button at bottom */}
              {user && (
                <div className="mt-auto pt-6 border-t">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Keluar Akun
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
