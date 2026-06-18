import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getProducts } from '../lib/api';
import { formatRupiah } from '../utils/formatters';
import { ProductCardSkeleton } from './Skeleton';

export default function SearchBar({ onProductClick, onSearch, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await getProducts({ search: query, limit: 5 });
        setResults(data || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Cari produk, kategori, atau merek..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && results.length > 0 && setShowResults(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSearch) {
              onSearch(query);
              setShowResults(false);
            }
          }}
          className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none pr-10"
          aria-label="Cari produk"
          autoComplete="off"
          autoFocus
        />
        {query ? (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          {loading ? (
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onProductClick(product);
                    setShowResults(false);
                    setQuery('');
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-contain bg-gray-50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-[#16A34A] font-medium">{formatRupiah(product.price)}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={() => { 
                  if (onSearch) {
                    onSearch(query);
                  }
                  setShowResults(false);
                }}
                className="w-full text-center py-2 text-sm text-[#16A34A] font-medium hover:bg-[#DCFCE7] border-t"
              >
                Lihat semua hasil
              </button>
            </div>
          ) : query ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Tidak ada produk ditemukan
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
