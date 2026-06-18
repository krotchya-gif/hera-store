import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ShoppingCart, Heart, Star } from 'lucide-react';
import { getProducts } from '../lib/api';
import { formatRupiah } from '../utils/formatters';
import LazyImage from './LazyImage';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function RecommendedProducts({ currentProduct, onProductClick, onAddToCart }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const filters = {
          limit: 8,
          exclude: currentProduct?.id
        };

        if (currentProduct?.category_id) {
          filters.category = currentProduct.category_id;
        }

        const data = await getProducts(filters);
        setRecommendations(data || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProduct?.id, currentProduct?.category_id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[160px] max-w-[180px]">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-1" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#16A34A]" />
          <h2 className="text-lg font-bold text-gray-800">Rekomendasi untuk Anda</h2>
        </div>
        <button className="text-[#16A34A] font-medium text-sm flex items-center gap-1 hover:underline">
          Lihat Semua <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="min-w-[160px] max-w-[180px] cursor-pointer group"
          >
            <div
              className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2 relative"
              onClick={() => onProductClick?.(product)}
            >
              <LazyImage
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {product.discount_percent > 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  -{product.discount_percent}%
                </span>
              )}
              {/* Hover actions */}
              <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/30 to-transparent">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart?.(product);
                    addToast('Ditambahkan ke keranjang', 'success');
                  }}
                  className="flex-1 bg-[#16A34A] text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#15803D]"
                >
                  <ShoppingCart className="w-3 h-3" /> + Keranjang
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
                  className="p-1.5 bg-white rounded-lg hover:bg-gray-50"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
            <div onClick={() => onProductClick?.(product)}>
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
                <span className="text-xs text-gray-500">{product.rating} | Terjual {product.sold_count}</span>
              </div>
              <p className="text-[#16A34A] font-bold text-sm">{formatRupiah(product.price)}</p>
              {product.original_price && (
                <p className="text-gray-400 text-xs line-through">{formatRupiah(product.original_price)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
