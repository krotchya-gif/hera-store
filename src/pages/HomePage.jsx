import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf, ChevronRight, Star, Heart, Eye, Truck, Shield, Lock, Headphones
} from 'lucide-react';

import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { getProducts, getCategories, getFlashSales } from '../lib/api';
import { formatRupiah } from '../utils/formatters';
import LazyImage from '../components/LazyImage';
import QuickViewModal from '../components/QuickViewModal';
import RecentViews, { addToRecentViews } from '../components/RecentViews';
import { ProductGridSkeleton } from '../components/Skeleton';

import { Helmet } from 'react-helmet-async';

const heroImage = "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=600&q=80";

const HomePage = ({ setCurrentPage, setSelectedProduct, addToCart, setSelectedCategory }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const [countdown, setCountdown] = useState({ h: 5, m: 23, s: 45 });
  const [flashSaleEnd, setFlashSaleEnd] = useState(null);
  const [flashSaleName, setFlashSaleName] = useState('Flash Sale');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const computeCountdown = (endTime) => {
      const diff = Math.max(0, Math.floor((new Date(endTime) - Date.now()) / 1000));
      return { h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 };
    };

    if (flashSaleEnd) {
      setCountdown(computeCountdown(flashSaleEnd));
      const timer = setInterval(() => {
        const res = computeCountdown(flashSaleEnd);
        setCountdown(res);
        if (res.h === 0 && res.m === 0 && res.s === 0) {
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCountdown({ h: 0, m: 0, s: 0 });
    }
  }, [flashSaleEnd]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, flashSalesData] = await Promise.all([
          getProducts({ limit: 8 }),
          getCategories(),
          getFlashSales(true).catch(() => [])
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        if (flashSalesData?.length > 0) {
          setFlashSaleEnd(flashSalesData[0].ends_at);
          setFlashSaleName(flashSalesData[0].name || 'Flash Sale');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryIcons = {
    'Perawatan Tubuh': '🧴',
    'Perawatan Rumah': '🏠',
    'Kesehatan': '💊',
    'Kecantikan': '💄',
    'Elektronik': '🔌',
    'Lainnya': '📦'
  };

  return (
    <div>
      <Helmet>
        <title>Hera Store — Solusi Produk Rumah Tangga Premium</title>
        <meta name="description" content="Temukan berbagai produk rumah tangga berkualitas tinggi dengan harga terbaik dan terjangkau di Hera Store." />
        <meta name="keywords" content="produk rumah tangga, marketplace premium, online shop, harian rumah tangga" />
      </Helmet>
      {/* Hero Banner — redesigned */}
      <div className="relative bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#166534] min-h-[420px] md:min-h-[480px] px-4 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-white/20 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white/30 rounded-full" />
          <div className="absolute top-2/3 left-1/5 w-3 h-3 bg-[#22C55E]/40 rounded-full" />
          <div className="absolute bottom-1/4 right-1/3 w-6 h-6 bg-white/10 rounded-full" />
          {/* Grid pattern overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto w-full min-h-[420px] md:min-h-[480px] flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 py-10 md:py-0">
          {/* Left: Text Content */}
          <div className="text-center md:text-left md:w-1/2 z-10">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6"
            >
              <div className="bg-white p-1.5 rounded-full">
                <Leaf className="w-5 h-5 text-[#16A34A]" />
              </div>
              <span className="text-white font-bold text-lg tracking-wide">Hera Store</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4"
            >
              Solusi Produk Berkualitas
              <span className="block text-[#BBF7D0]">untuk Kebutuhan Anda</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-green-100/90 mb-8 text-base md:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed"
            >
              Temukan berbagai produk rumah tangga premium dengan harga terbaik dan kualitas terjamin.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3"
            >
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setCurrentPage('listing');
                }}
                className="group relative bg-white text-[#16A34A] px-8 py-3.5 rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Belanja Sekarang</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </button>
              <button
                onClick={() => setCurrentPage('promo')}
                className="group border-2 border-white/40 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/10 hover:border-white/60 transition-all duration-300 flex items-center gap-2"
              >
                <span>Lihat Promo</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hidden md:flex items-center gap-6 mt-8 text-green-200/80 text-xs"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Gratis Ongkir
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Produk Original
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Pembayaran Aman
              </span>
            </motion.div>
          </div>

          {/* Right: Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative md:w-1/2 flex justify-center items-center z-10"
          >
            {/* Floating badge - Top */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -top-2 -left-4 md:-top-4 md:-left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg rotate-[-6deg] z-20"
            >
              🔥 Flash Sale
            </motion.div>

            {/* Image container */}
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl scale-125" />
              <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                <motion.img
                  src={heroImage}
                  alt="Produk Unggulan Hera Store"
                  className="w-48 h-48 md:w-60 md:h-60 object-contain drop-shadow-2xl"
                  initial={{ rotate: -8, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
              </div>

              {/* Floating badge - Bottom right */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-2 -right-4 md:-bottom-4 md:-right-2 bg-white rounded-xl shadow-lg px-3 py-2 z-20"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">2.3K+ Terjual</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck className="w-6 h-6 text-[#16A34A]" />, title: 'Gratis Ongkir', sub: 'Min. belanja tertentu' },
            { icon: <Shield className="w-6 h-6 text-[#16A34A]" />, title: 'Garansi Produk', sub: '100% Original' },
            { icon: <Lock className="w-6 h-6 text-[#16A34A]" />, title: 'Pembayaran Aman', sub: 'Dijamin aman' },
            { icon: <Headphones className="w-6 h-6 text-[#16A34A]" />, title: 'Support 24/7', sub: 'Siap membantu' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {item.icon}
              <div>
                <p className="font-bold text-sm text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Kategori Populer</h2>
          <button
            onClick={() => {
              setSelectedCategory('Semua');
              setCurrentPage('listing');
            }}
            className="text-[#16A34A] font-medium text-sm flex items-center gap-1"
          >
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center border border-gray-100">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
            ))
          ) : (
            categories.map((cat, idx) => (
              <motion.div
                key={cat.id || idx}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 flex flex-col items-center cursor-pointer border border-gray-100"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage('listing');
                }}
              >
                <span className="text-4xl mb-3">{categoryIcons[cat.name] || '📦'}</span>
                <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Flash Sale */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {flashSaleName}
            </span>
            {flashSaleEnd && (countdown.h > 0 || countdown.m > 0 || countdown.s > 0) ? (
              <div className="flex items-end gap-1">
                {[{ label: 'Jam', val: countdown.h }, { label: 'Mnt', val: countdown.m }, { label: 'Dtk', val: countdown.s }].map(({ label, val }, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-gray-400 font-bold text-lg mb-1">:</span>}
                    <div className="text-center">
                      <span className="bg-gray-900 text-white px-2 py-1 rounded text-sm font-mono font-bold block">{String(val).padStart(2, '0')}</span>
                      <span className="text-xs text-gray-400 mt-0.5 block">{label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <span className="text-gray-500 text-sm font-medium">Flash sale telah berakhir</span>
            )}
          </div>
          <button onClick={() => setCurrentPage('flashsale')} className="text-[#16A34A] font-medium text-sm flex items-center gap-1">Lihat Semua <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[160px] max-w-[180px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))
          ) : (
            products.slice(0, 5).map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -4 }}
                className="min-w-[160px] max-w-[180px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer flex-shrink-0"
                onClick={() => { setSelectedProduct(product); setCurrentPage('detail'); }}
              >
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <LazyImage src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-2" />
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">-{product.discount_percent}%</span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</p>
                  <p className="text-[#16A34A] font-bold text-sm">{formatRupiah(product.price)}</p>
                  <p className="text-gray-400 text-xs line-through">{formatRupiah(product.original_price)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
                    <span className="text-xs text-gray-500">{product.rating} | Terjual {product.sold_count}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Recent Views */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <RecentViews
          onProductClick={(product) => { setSelectedProduct(product); setCurrentPage('detail'); }}
        />
      </div>

      {/* Best Sellers */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Produk Terlaris</h2>
          <button onClick={() => setCurrentPage('terlaris')} className="text-[#16A34A] font-medium text-sm flex items-center gap-1">Lihat Semua <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            products.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer"
                onClick={() => { addToRecentViews(product); setSelectedProduct(product); setCurrentPage('detail'); }}
              >
                <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                  <LazyImage src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-4" />
                  {product.discount_percent > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">-{product.discount_percent}%</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToRecentViews(product);
                      setQuickViewProduct(product);
                    }}
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Pratinjau produk"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isInWishlist(product.id)) {
                        removeFromWishlist(product.id);
                        addToast('Dihapus dari wishlist', 'info');
                      } else {
                        addToWishlist(product);
                        addToast('Ditambahkan ke wishlist', 'success');
                      }
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition"
                    aria-label={isInWishlist(product.id) ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
                    <span className="text-xs text-gray-500">{product.rating} | Terjual {product.sold_count}</span>
                  </div>
                  <p className="text-[#16A34A] font-bold text-sm">{formatRupiah(product.price)}</p>
                  {product.original_price && (
                    <p className="text-gray-400 text-xs line-through">{formatRupiah(product.original_price)}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">🚚 Gratis Ongkir</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="mt-3 w-full bg-[#16A34A] text-white py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition hover:bg-[#15803D]"
                    aria-label={`Tambah ${product.name} ke keranjang`}
                  >
                    + Keranjang
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={addToCart}
          onViewDetail={(product) => {
            setSelectedProduct(product);
            setCurrentPage('detail');
          }}
          onToggleWishlist={(product) => {
            if (isInWishlist(product.id)) {
              removeFromWishlist(product.id);
              addToast('Dihapus dari wishlist', 'info');
            } else {
              addToWishlist(product);
              addToast('Ditambahkan ke wishlist', 'success');
            }
          }}
          isInWishlist={isInWishlist}
        />
      )}
    </div>
  );
};

export default HomePage;
