import React from 'react';
import { X, Check, Minus, BarChart3 } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import LazyImage from './LazyImage';
import useFocusTrap from '../hooks/useFocusTrap';

export default function ComparisonModal({ products, onClose, onRemove }) {
  const containerRef = useFocusTrap(true, onClose);
  if (products.length === 0) return null;

  const attributes = [
    { key: 'price', label: 'Harga', formatter: (val) => formatRupiah(val) },
    { key: 'rating', label: 'Rating', formatter: (val) => `${val} / 5` },
    { key: 'sold_count', label: 'Terjual', formatter: (val) => val },
    { key: 'stock', label: 'Stok', formatter: (val) => val },
    { key: 'discount_percent', label: 'Diskon', formatter: (val) => `${val}%` },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Bandingkan produk"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={containerRef} className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#16A34A]" />
            <h3 className="font-bold text-lg">Bandingkan Produk</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Tutup">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 text-sm text-gray-500 font-medium">Fitur</th>
                  {products.map(product => (
                    <th key={product.id} className="p-2 text-center min-w-[150px]">
                      <div className="relative">
                        <button
                          onClick={() => onRemove(product.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <LazyImage src={product.thumbnail} alt={product.name} className="w-20 h-20 object-cover rounded-lg mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributes.map(attr => (
                  <tr key={attr.key} className="border-t">
                    <td className="p-2 text-sm font-medium text-gray-600">{attr.label}</td>
                    {products.map(product => (
                      <td key={product.id} className="p-2 text-center text-sm text-gray-800">
                        {attr.formatter(product[attr.key] || 0)}
                      </td>
                    ))}
                  </tr>
                ))}
                
                {/* Additional Features */}
                <tr className="border-t">
                  <td className="p-2 text-sm font-medium text-gray-600">Gratis Ongkir</td>
                  {products.map(product => (
                    <td key={product.id} className="p-2 text-center">
                      {product.price >= 100000 ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <Minus className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                
                <tr className="border-t">
                  <td className="p-2 text-sm font-medium text-gray-600">Garansi</td>
                  {products.map(() => (
                    <td className="p-2 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          {products.length < 2 && (
            <div className="text-center py-8 text-gray-500">
              <p>Tambahkan minimal 2 produk untuk membandingkan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
