import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Filter, Grid, List, X, Package, Heart, Star
} from 'lucide-react';

import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { getProducts, getProductsCount, getCategories } from '../lib/api';
import { formatRupiah } from '../utils/formatters';
import LazyImage from '../components/LazyImage';
import { ProductGridSkeleton, EmptyState } from '../components/Skeleton';

const ProductListing = ({
  setCurrentPage,
  setSelectedProduct,
  addToCart,
  selectedCategory,
  setSelectedCategory
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'Semua');

  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    if (setSelectedCategory) {
      setSelectedCategory(catId);
    }
  };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [sortBy, setSortBy] = useState('Relevansi');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRating, setSelectedRating] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  const sortMap = {
    'Harga Terendah': 'price.asc',
    'Harga Tertinggi': 'price.desc',
    'Terlaris': 'sold_count.desc',
    'Rating Tertinggi': 'rating.desc',
    'Terbaru': 'created_at.desc'
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Reset page when filters/sort change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, sortBy, priceRange.min, priceRange.max, selectedRating.length]);

  // Fetch filtered products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filters = {
          limit,
          offset: (page - 1) * limit
        };

        if (activeCategory !== 'Semua') {
          filters.category = activeCategory;
        }
        if (priceRange.min) filters.minPrice = Number(priceRange.min);
        if (priceRange.max) filters.maxPrice = Number(priceRange.max);
        if (selectedRating.length > 0) {
          filters.rating = Math.min(...selectedRating);
        }
        if (sortMap[sortBy]) {
          filters.sort = sortMap[sortBy];
        }

        const [data, count] = await Promise.all([
          getProducts(filters),
          getProductsCount({
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            rating: filters.rating
          })
        ]);

        setProducts(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
        addToast('Gagal memuat produk', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, sortBy, priceRange.min, priceRange.max, selectedRating, page]);

  const activeCategoryName = activeCategory === 'Semua'
    ? 'Semua Kategori'
    : categories.find(c => c.id === activeCategory)?.name || 'Kategori';

  const resetFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSortBy('Relevansi');
    setSelectedRating([]);
    setActiveCategory('Semua');
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <span className="cursor-pointer hover:text-[#16A34A]" onClick={() => setCurrentPage('home')}>Beranda</span>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-800">{activeCategoryName}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{activeCategoryName}</h1>
        <p className="text-sm text-gray-500 mb-4">{totalCount} produk ditemukan</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => handleSelectCategory('Semua')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              activeCategory === 'Semua'
                ? 'bg-[#16A34A] text-white'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-[#16A34A] text-white'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
            <h3 className="font-semibold mb-4">Urutkan</h3>
            <div className="space-y-2 mb-6">
              {['Relevansi', 'Terbaru', 'Terlaris', 'Harga Terendah', 'Harga Tertinggi', 'Rating Tertinggi'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    className="accent-[#16A34A]"
                    checked={sortBy === opt}
                    onChange={() => setSortBy(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            <h3 className="font-semibold mb-4">Harga</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                placeholder="Rp Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A]"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Rp Maks"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A]"
              />
            </div>

            <h3 className="font-semibold mb-4 mt-6">Rating</h3>
            <div className="space-y-2 mb-6">
              {[5, 4, 3].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-[#16A34A]"
                    checked={selectedRating.includes(r)}
                    onChange={() => {
                      if (selectedRating.includes(r)) {
                        setSelectedRating(selectedRating.filter(rating => rating !== r));
                      } else {
                        setSelectedRating([...selectedRating, r]);
                      }
                    }}
                  />
                  <span className="text-[#FBBF24]">{'★'.repeat(r)}</span> ke atas
                </label>
              ))}
            </div>

            <h3 className="font-semibold mb-4">Lokasi Pengiriman</h3>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6">
              <option>Semua Lokasi</option>
              <option>Jakarta</option>
              <option>Bandung</option>
              <option>Surabaya</option>
            </select>

            <button
              onClick={resetFilters}
              className="w-full border border-[#16A34A] text-[#16A34A] py-2 rounded-lg text-sm hover:bg-[#DCFCE7]"
            >
              Reset Filter
            </button>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filter</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="Relevansi">Urutkan: Relevansi</option>
                <option value="Terbaru">Urutkan: Terbaru</option>
                <option value="Terlaris">Urutkan: Terlaris</option>
                <option value="Harga Terendah">Urutkan: Harga Terendah</option>
                <option value="Harga Tertinggi">Urutkan: Harga Tertinggi</option>
                <option value="Rating Tertinggi">Urutkan: Rating Tertinggi</option>
              </select>
              <div className="hidden md:flex border border-gray-200 rounded-lg overflow-hidden">
                <button className="p-2 bg-[#16A34A] text-white"><Grid className="w-4 h-4" /></button>
                <button className="p-2 text-gray-500"><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(activeCategory !== 'Semua' || priceRange.min || priceRange.max || selectedRating.length > 0 || sortBy !== 'Relevansi') && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {activeCategory !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full text-xs">
                  {categories.find(c => c.id === activeCategory)?.name || 'Kategori'}
                  <button onClick={() => setActiveCategory('Semua')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(priceRange.min || priceRange.max) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full text-xs">
                  Harga {priceRange.min ? formatRupiah(Number(priceRange.min)) : '0'} - {priceRange.max ? formatRupiah(Number(priceRange.max)) : '∞'}
                  <button onClick={() => setPriceRange({ min: '', max: '' })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedRating.map((r) => (
                <span key={r} className="inline-flex items-center gap-1 px-3 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full text-xs">
                  {r}★ ke atas
                  <button onClick={() => setSelectedRating(selectedRating.filter(rating => rating !== r))}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {sortBy !== 'Relevansi' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  Urutkan: {sortBy}
                  <button onClick={() => setSortBy('Relevansi')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button onClick={resetFilters} className="text-xs text-[#16A34A] hover:underline">Hapus semua</button>
            </div>
          )}

          {/* Mobile Filter Drawer */}
          {showMobileFilter && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold">Filter</h3>
                  <button onClick={() => setShowMobileFilter(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Kategori</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSelectCategory('Semua')}
                        className={`px-3 py-1.5 rounded-full text-sm ${activeCategory === 'Semua' ? 'bg-[#16A34A] text-white' : 'border'}`}
                      >
                        Semua
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-sm ${activeCategory === cat.id ? 'bg-[#16A34A] text-white' : 'border'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Urutkan</h3>
                    {['Relevansi', 'Terbaru', 'Terlaris', 'Harga Terendah', 'Harga Tertinggi', 'Rating Tertinggi'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                        <input
                          type="radio"
                          name="sort"
                          className="accent-[#16A34A]"
                          checked={sortBy === opt}
                          onChange={() => setSortBy(opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Harga</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="number"
                        placeholder="Rp Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Rp Maks"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Rating</h3>
                    {[5, 4, 3].map((r) => (
                      <label key={r} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                        <input
                          type="checkbox"
                          className="accent-[#16A34A]"
                          checked={selectedRating.includes(r)}
                          onChange={() => {
                            if (selectedRating.includes(r)) {
                              setSelectedRating(selectedRating.filter(rating => rating !== r));
                            } else {
                              setSelectedRating([...selectedRating, r]);
                            }
                          }}
                        />
                        <span className="text-[#FBBF24]">{'★'.repeat(r)}</span> ke atas
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={resetFilters}
                      className="flex-1 border border-[#16A34A] text-[#16A34A] py-2 rounded-lg text-sm hover:bg-[#DCFCE7]"
                    >
                      Reset
                    </button>
                    <button onClick={() => setShowMobileFilter(false)} className="flex-1 bg-[#16A34A] text-white py-2 rounded-lg text-sm">Terapkan</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {loading ? (
            <ProductGridSkeleton count={limit} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Package className="w-12 h-12" />}
              title="Tidak ada produk"
              description="Belum ada produk yang cocok dengan filter ini."
              action={
                <button
                  onClick={resetFilters}
                  className="bg-[#16A34A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D]"
                >
                  Reset Filter
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer"
                  onClick={() => { setSelectedProduct(product); setCurrentPage('detail'); }}
                >
                  <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                    <LazyImage src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-4" />
                    {product.discount_percent > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">-{product.discount_percent}%</span>
                    )}
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
                    {product.original_price && <p className="text-gray-400 text-xs line-through">{formatRupiah(product.original_price)}</p>}
                    <p className="text-xs text-gray-500 mt-1">🚚 Gratis Ongkir</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="mt-3 w-full bg-[#16A34A] text-white py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition hover:bg-[#15803D]"
                    >
                      + Keranjang
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    p === page ? 'bg-[#16A34A] text-white' : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
