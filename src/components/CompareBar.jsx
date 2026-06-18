import React from 'react';
import { BarChart3, X } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import LazyImage from './LazyImage';

export default function CompareBar({ onShowComparison }) {
  const { compareItems, removeFromCompare, clearCompare } = useComparison();

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-md w-full mx-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#16A34A]" />
          <span className="font-medium text-gray-800">Bandingkan ({compareItems.length})</span>
        </div>
        <button
          onClick={clearCompare}
          className="text-sm text-gray-500 hover:text-red-500"
        >
          Hapus Semua
        </button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {compareItems.map(product => (
          <div key={product.id} className="relative flex-shrink-0">
            <img
              src={product.thumbnail}
              alt={product.name}
              as={LazyImage}
            />
            <button
              onClick={() => removeFromCompare(product.id)}
              className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      
      {compareItems.length >= 2 && (
        <button
          onClick={onShowComparison}
          className="w-full mt-3 bg-[#16A34A] text-white py-2 rounded-lg font-medium hover:bg-[#15803D]"
        >
          Lihat Perbandingan
        </button>
      )}
    </div>
  );
}
