import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Heart, Star, ChevronRight, Plus, Minus } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import useFocusTrap from '../hooks/useFocusTrap';

export default function QuickViewModal({ product, onClose, onAddToCart, onViewDetail, onToggleWishlist, isInWishlist }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const containerRef = useFocusTrap(true, onClose);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const first = product.variants[0];
      setSelectedVariant(typeof first === 'string' ? first : first.name);
    } else {
      setSelectedVariant(null);
    }
    setQty(1);
  }, [product]);

  if (!product) return null;

  const variants = (product.variants || []).map(v => typeof v === 'string' ? v : v.name);

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      variant: selectedVariant,
      qty
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau produk"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={containerRef} className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg" id="quickview-title">Quick View</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Tutup">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 flex flex-col sm:flex-row gap-4">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full sm:w-64 h-64 object-cover rounded-lg"
            />
          </div>

          {/* Details */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h2>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24]" />
                <span className="text-sm font-medium">{product.rating || 4.5}</span>
              </div>
              <span className="text-sm text-gray-500">({product.review_count || 0} ulasan)</span>
              <span className="text-sm text-gray-500">Terjual {product.sold_count || 0}</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-[#16A34A]">{formatRupiah(product.price)}</span>
              {product.original_price && (
                <span className="text-base text-gray-400 line-through">{formatRupiah(product.original_price)}</span>
              )}
              {product.discount_percent > 0 && (
                <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">-{product.discount_percent}%</span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {product.description || 'Deskripsi produk tidak tersedia.'}
            </p>

            {variants.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Varian</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                        selectedVariant === v
                          ? 'border-[#16A34A] bg-[#DCFCE7] text-[#15803D]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-500">Jumlah</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                <span className="px-4 font-medium text-sm">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))} className="p-2 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
              </div>
              <span className="text-xs text-gray-500">Stok: {product.stock || 0} tersedia</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#15803D] flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> Tambah ke Keranjang
              </button>
              <button
                onClick={() => onToggleWishlist?.(product)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              </button>
            </div>

            <button
              onClick={() => {
                onViewDetail(product);
                onClose();
              }}
              className="w-full mt-3 text-[#16A34A] font-medium text-sm hover:underline flex items-center justify-center gap-1"
            >
              Lihat Detail Lengkap <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
