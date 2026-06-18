import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Star, Grid, List, X } from 'lucide-react';
import { getProducts, getProductsCount, getCategories } from '../lib/api';
import { formatRupiah } from '../utils/formatters';
import { ProductGridSkeleton, EmptyState } from './Skeleton';
import LazyImage from './LazyImage';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function ProductDiscoveryPage({
  title,
  subtitle,
  defaultSort = 'Relevansi',
  fixedFilters = {},
  setCurrentPage,
  setSelectedProduct,
  addToCart
}) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const limit = 12;

  const [sortBy, setSortBy] = useState(defaultSort);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedRating, setSelectedRating] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(fixedFilters.category || '');

  const sortMap = {
    'Harga Terendah': 'price.asc',
    'Harga Tertinggi': 'price.desc',
    'Terlaris': 'sold_count.desc',
    'Rating Tertinggi': 'rating.desc',
    'Terbaru': 'created_at.desc'
  };

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

  useEffect(() => {
    setPage(1);
  }, [sortBy, priceRange.min, priceRange.max, selectedRating.length, selectedCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filters = {
          ...fixedFilters,
          limit,
          offset: (page - 1) * limit
        };

        if (selectedCategory) filters.category = selectedCategory;
        if (priceRange.min) filters.minPrice = Number(priceRange.min);
        if (priceRange.max) filters.maxPrice = Number(priceRange.max);
        if (selectedRating.length > 0) filters.rating = Math.min(...selectedRating);
        if (sortMap[sortBy]) filters.sort = sortMap[sortBy];

        const countFilters = { ...filters };
        delete countFilters.limit;
        delete countFilters.offset;
        delete countFilters.sort;

        const [data, count] = await Promise.all([
          getProducts(filters),
          getProductsCount(countFilters)
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
  }, [page, sortBy, priceRange.min, priceRange.max, selectedRating, selectedCategory, fixedFilters.category]);

  const resetFilters = () => {
    setSortBy(defaultSort);
    setPriceRange({ min: '', max: '' });
    setSelectedRating([]);
    setSelectedCategory(fixedFilters.category || '');
  };

  const totalPages = Math.ceil(totalCount / limit);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Urutkan</h3>
        {['Relevansi', 'Terbaru', 'Terlaris', 'Harga Terendah', 'Harga Tertinggi', 'Rating Tertinggi'].map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 py-1 cursor-pointer">
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
        <h3 className="font-semibold mb-3">Kategori</h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
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
          <label key={r} className="flex items-center gap-2 text-sm text-gray-600 py-1 cursor-pointer">
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

      <button
        onClick={resetFilters}
        className="w-full border border-[#16A34A] text-[#16A34A] py-2 rounded-lg text-sm hover:bg-[#DCFCE7]"
      >
        Reset Filter
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          <p className="text-sm text-gray-500">{totalCount} produk ditemukan</p>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" />
              <h3 className="font-semibold">Filter</h3>
            </div>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
            >
              <Filter className="w-4 h-4" /> Filter
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
                <div className="p-4">
                  <FilterContent />
                </div>
              </motion.div>
            </div>
          )}

          {loading ? (
            <ProductGridSkeleton count={limit} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Star className="w-12 h-12" />}
              title="Belum ada produk"
              description="Coba ubah filter atau kembali lagi nanti."
              action={
                <button onClick={() => setCurrentPage('home')} className="bg-[#16A34A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D]">
                  Kembali ke Beranda
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
                      <Star className={`w-4 h-4 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</p>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs text-[#FBBF24]">{'★'.repeat(Math.floor(product.rating || 0))}</span>
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
                    >
                      + Keranjang
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
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
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
