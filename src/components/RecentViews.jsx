import React, { useState, useEffect } from 'react';
import LazyImage from './LazyImage';
import { Clock, X } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

const RECENT_VIEWS_KEY = 'recent_views';
const MAX_RECENT_ITEMS = 10;

export function addToRecentViews(product) {
  try {
    const existing = JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || '[]');
    const filtered = existing.filter(item => item.id !== product.id);
    const updated = [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error adding to recent views:', error);
  }
}

export function getRecentViews() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

export function clearRecentViews() {
  localStorage.removeItem(RECENT_VIEWS_KEY);
}

export default function RecentViews({ onProductClick, onClear }) {
  const [recentViews, setRecentViews] = useState([]);

  useEffect(() => {
    setRecentViews(getRecentViews());
  }, []);

  const handleClear = () => {
    clearRecentViews();
    setRecentViews([]);
    if (onClear) onClear();
  };

  const handleRemove = (productId) => {
    const updated = recentViews.filter(item => item.id !== productId);
    setRecentViews(updated);
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(updated));
  };

  if (recentViews.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-800">Baru Dilihat</h2>
        </div>
        <button
          onClick={handleClear}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Hapus Semua
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        {recentViews.map((product) => (
          <div
            key={product.id}
            className="min-w-[140px] max-w-[160px] relative group cursor-pointer"
            onClick={() => onProductClick?.(product)}
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
              <LazyImage
                src={product.thumbnail || product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
            <p className="text-sm font-bold text-[#16A34A]">{formatRupiah(product.price)}</p>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(product.id);
              }}
              className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
