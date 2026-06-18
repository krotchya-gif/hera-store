import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, ShoppingCart } from 'lucide-react';
import LazyImage from './LazyImage';
import { useWishlist } from '../context/WishlistContext';
import { formatRupiah } from '../utils/formatters';
import { EmptyState } from './Skeleton';

export default function WishlistPage({ setCurrentPage, setSelectedProduct, addToCart }) {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setCurrentPage('home')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wishlist Saya</h1>
          <p className="text-sm text-gray-500">{wishlist.length} produk tersimpan</p>
        </div>
      </div>

      {/* Wishlist Grid */}
      {wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-12 h-12" />}
          title="Wishlist kosong"
          description="Belum ada produk yang ditambahkan ke wishlist. Jelajahi produk kami dan tambahkan ke wishlist!"
          action={
            <button 
              onClick={() => setCurrentPage('home')}
              className="bg-[#16A34A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D]"
            >
              Jelajahi Produk
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlist.map((product) => (
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
                  onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
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
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className="mt-3 w-full bg-[#16A34A] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#15803D] flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> + Keranjang
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
