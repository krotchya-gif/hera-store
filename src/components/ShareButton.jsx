import React from 'react';
import { Share2, Facebook, Twitter, Link as LinkIcon, MessageCircle, X } from 'lucide-react';
import useFocusTrap from '../hooks/useFocusTrap';

export default function ShareButton({ product, onClose }) {
  const containerRef = useFocusTrap(true, onClose);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = product?.name || 'Hera Store';
  const shareDescription = product?.description || 'Produk berkualitas dari Hera Store';

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5 text-green-500" />,
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5 text-blue-600" />,
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5 text-blue-400" />,
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Copy Link',
      icon: <LinkIcon className="w-5 h-5 text-gray-600" />,
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link berhasil disalin!');
      }
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: show custom share options
      return;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Bagikan produk"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={containerRef} className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Bagikan Produk</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Tutup">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Product Preview */}
        {product && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <img src={product.thumbnail} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
              <p className="text-xs text-gray-500 truncate">{shareUrl}</p>
            </div>
          </div>
        )}

        {/* Share Options */}
        <div className="grid grid-cols-4 gap-3">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {option.icon}
              <span className="text-xs text-gray-600">{option.name}</span>
            </button>
          ))}
        </div>

        {/* Native Share (Mobile) */}
        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full mt-4 bg-[#16A34A] text-white py-3 rounded-lg font-medium hover:bg-[#15803D] flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Bagikan ke Aplikasi Lain
          </button>
        )}
      </div>
    </div>
  );
}
