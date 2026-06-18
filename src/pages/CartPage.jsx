import React, { useState } from 'react';
import {
  ShoppingCart, Trash2, Minus, Plus, Check, Lock, ChevronLeft
} from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { formatRupiah } from '../utils/formatters';

const CartPage = ({
  cart,
  setCart,
  removeFromCart,
  setCurrentPage,
  onCheckout,
  appliedVoucher,
  discount,
  onApplyVoucher,
  onRemoveVoucher
}) => {
  const { addToast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const updateQty = (id, variant, delta) => {
    const item = cart.find(item => item.id === id && (item.variant || null) === (variant || null));
    if (!item) return;
    const newQty = Math.max(1, item.qty + delta);
    setCart(cart.map(item => (item.id === id && (item.variant || null) === (variant || null)) ? { ...item, qty: newQty } : item));
    if (newQty === 1 && delta < 0) {
      addToast('Jumlah minimum adalah 1', 'warning');
    }
  };

  const toggleSelectItem = (id, variant) => {
    const itemKey = `${id}_${variant || 'default'}`;
    if (selectedItems.includes(itemKey)) {
      setSelectedItems(selectedItems.filter(k => k !== itemKey));
    } else {
      setSelectedItems([...selectedItems, itemKey]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => `${item.id}_${item.variant || 'default'}`));
    }
  };

  const selectedCart = cart.filter(item => selectedItems.includes(`${item.id}_${item.variant || 'default'}`));
  const subtotal = selectedCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal - discount;
  const freeShippingThreshold = 100000;
  const hasFreeShipping = subtotal >= freeShippingThreshold;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      addToast('Masukkan kode promo', 'warning');
      return;
    }
    if (selectedCart.length === 0) {
      addToast('Pilih produk terlebih dahulu', 'warning');
      return;
    }
    setApplying(true);
    try {
      await onApplyVoucher(promoCode.trim(), subtotal);
      addToast('Kode promo berhasil diterapkan', 'success');
      setPromoCode('');
    } catch (error) {
      console.error('Error applying voucher:', error);
      addToast(error.message || 'Kode promo tidak valid', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleCheckout = () => {
    if (selectedCart.length === 0) {
      addToast('Pilih minimal 1 produk untuk checkout', 'warning');
      return;
    }
    onCheckout(selectedCart);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Keranjang Belanja <span className="text-gray-500 text-lg font-normal">({cart.length} produk)</span></h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {cart.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Keranjang belanja Anda kosong</p>
              <button onClick={() => setCurrentPage('home')} className="bg-[#16A34A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D]">Mulai Belanja</button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="accent-[#16A34A] w-4 h-4"
                    checked={selectedItems.length === cart.length}
                    onChange={toggleSelectAll}
                  />
                  <span className="text-sm font-medium">Pilih Semua ({cart.length})</span>
                </div>
                {selectedItems.length > 0 && (
                  <button
                    onClick={() => {
                      cart.forEach(item => {
                        const itemKey = `${item.id}_${item.variant || 'default'}`;
                        if (selectedItems.includes(itemKey)) {
                          removeFromCart(item.id, item.variant);
                        }
                      });
                      setSelectedItems([]);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Hapus Terpilih
                  </button>
                )}
              </div>
              {cart.map((item, idx) => {
                const itemKey = `${item.id}_${item.variant || 'default'}`;
                return (
                  <div key={`${item.id}_${item.variant || idx}`} className="bg-white rounded-xl shadow-sm p-4 mb-3 flex gap-4">
                    <input
                      type="checkbox"
                      className="accent-[#16A34A] w-4 h-4 mt-12"
                      checked={selectedItems.includes(itemKey)}
                      onChange={() => toggleSelectItem(item.id, item.variant)}
                    />
                    <img src={item.thumbnail} alt={item.name} className="w-16 h-16 rounded-lg object-contain bg-gray-50" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.variant || '-'}</p>
                      <p className="text-[#16A34A] font-bold text-sm mt-1">{formatRupiah(item.price)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeFromCart(item.id, item.variant)} className="text-red-400 hover:text-red-600" aria-label={`Hapus ${item.name} dari keranjang`}><Trash2 className="w-4 h-4" /></button>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button onClick={() => updateQty(item.id, item.variant, -1)} className="p-1" aria-label="Kurangi jumlah"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.variant, 1)} className="p-1" aria-label="Tambah jumlah"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className="text-[#16A34A] font-bold text-sm">{formatRupiah(item.price * item.qty)}</p>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-[#16A34A] font-medium text-sm mt-4 hover:underline">
                <ChevronLeft className="w-4 h-4" /> Lanjut Belanja
              </button>
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Ringkasan Pesanan</h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Masukkan kode promo..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={!!appliedVoucher}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A] disabled:bg-gray-50"
              />
              <button
                onClick={handleApplyPromo}
                disabled={applying || !!appliedVoucher}
                className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#15803D] disabled:opacity-50"
              >
                {applying ? '...' : 'Gunakan'}
              </button>
            </div>

            {appliedVoucher && (
              <div className="bg-[#DCFCE7] text-[#15803D] text-sm px-3 py-2 rounded-lg mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> {appliedVoucher.code} aktif
                </span>
                <button onClick={onRemoveVoucher} className="text-xs underline hover:text-red-600">Hapus</button>
              </div>
            )}

            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal ({selectedCart.length} produk)</span><span>{formatRupiah(subtotal)}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className={hasFreeShipping ? 'text-[#16A34A]' : 'text-gray-800'}>
                  {hasFreeShipping ? 'Gratis' : 'Dihitung di checkout'}
                </span>
              </div>
              {discount > 0 && <div className="flex justify-between text-red-500"><span>Diskon</span><span>- {formatRupiah(discount)}</span></div>}
              <hr />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-[#16A34A]">{formatRupiah(total)}</span></div>
            </div>

            {!hasFreeShipping && subtotal > 0 && (
              <div className="bg-blue-50 text-blue-700 rounded-lg p-3 mb-4 text-xs">
                Tambah belanja {formatRupiah(freeShippingThreshold - subtotal)} lagi untuk gratis ongkir!
              </div>
            )}

            {discount > 0 && (
              <div className="bg-[#DCFCE7] rounded-lg p-3 mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-[#15803D]" />
                <span className="text-sm text-[#15803D]">Kamu hemat {formatRupiah(discount)}!</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="w-full bg-[#16A34A] text-white h-12 rounded-lg font-semibold hover:bg-[#15803D] transition"
            >
              Checkout ({selectedCart.length}) →
            </button>

            <div className="mt-4 text-xs text-gray-500 flex items-center gap-2 justify-center">
              <Lock className="w-3 h-3" /> Transaksi dijamin aman
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
