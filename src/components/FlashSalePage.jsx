import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Zap, Percent, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { getProducts } from '../lib/api';
import { formatRupiah } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductGridSkeleton } from '../components/Skeleton';
import LazyImage from '../components/LazyImage';

export default function FlashSalePage({ setCurrentPage, setSelectedProduct, addToCart }) {
  const { addToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ limit: 20, flash_sale: true });
        // Add flash sale prices to products
        const flashSaleProducts = data.map(p => ({
          ...p,
          originalPrice: p.price,
          price: Math.round(p.price * 0.7), // 30% discount
          discount: 30,
          sold: Math.floor(Math.random() * 500) + 50,
          stock: Math.floor(Math.random() * 100) + 20
        }));
        setProducts(flashSaleProducts);
      } catch (error) {
        console.error('Error fetching flash sale products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail,
      qty: 1
    });
  };

  const handleToggleWishlist = (product, e) => {
    e.stopPropagation();
    toggleWishlist(product);
    addToast(isInWishlist(product.id) ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Flash Sale</h1>
      </div>

      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-xl p-6 mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Flash Sale</h2>
              <p className="text-sm text-white/80">Diskon hingga 70% untuk produk pilihan</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <ProductGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => {
                setSelectedProduct(product);
                setCurrentPage('detail');
              }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="relative aspect-square">
                <LazyImage
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{product.discount}%
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => handleToggleWishlist(product, e)}
                    className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition"
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="w-full bg-white/30 rounded-full h-1.5 mb-1">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: `${(product.sold / (product.sold + product.stock)) * 100}%` }}
                    />
                  </div>
                  <p className="text-white text-xs">
                    Terjual {product.sold}/{product.sold + product.stock}
                  </p>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500 font-bold text-lg">{formatRupiah(product.price)}</span>
                  <span className="text-gray-400 text-xs line-through">{formatRupiah(product.originalPrice)}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                    Hemat {formatRupiah(product.originalPrice - product.price)}
                  </span>
                </div>
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="w-full bg-[#16A34A] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#15803D] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ShoppingCart className="w-4 h-4" /> Tambah
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flash Sale Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Flash Sale</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Waktu Terbatas</h3>
              <p className="text-sm text-gray-600">Flash sale berlangsung selama 24 jam atau hingga stok habis.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Percent className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Diskon Besar</h3>
              <p className="text-sm text-gray-600">Dapatkan diskon hingga 70% untuk produk pilihan.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Stok Terbatas</h3>
              <p className="text-sm text-gray-600">Stok terbatas untuk setiap produk flash sale. Segera checkout sebelum kehabisan!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
