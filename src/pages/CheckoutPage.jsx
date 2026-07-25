import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check, X, Copy, Trash2, Minus, Plus, CreditCard, Banknote, Wallet, Package, Lock
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getAddresses, getVouchers, createOrder,
  updateOrderPaymentProof, createNotificationForAdmins, getProductById
} from '../lib/api';
import { uploadPaymentProof } from '../lib/storage';
import { getShippingRates } from '../lib/shipping';
import { formatRupiah } from '../utils/formatters';
import { isMidtransAvailable, createMidtransTransaction, payWithMidtrans } from '../lib/midtrans';
import AddressModal from './admin/AddressModal';

const CheckoutPage = ({
  cart,
  setCart,
  setCurrentPage,
  discount = 0,
  appliedVoucher
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [checkoutDiscount, setCheckoutDiscount] = useState(discount);
  const [checkoutVoucher, setCheckoutVoucher] = useState(appliedVoucher);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [itemNotes, setItemNotes] = useState({});
  const [midtransProcessing, setMidtransProcessing] = useState(false);

  const steps = ['Alamat', 'Pengiriman', 'Pembayaran', 'Konfirmasi', 'Selesai'];
  const freeShippingThreshold = 100000;
  const paymentMethods = ['Transfer Bank', 'E-Wallet', 'Virtual Account', 'COD (Bayar di Tempat)', 'Midtrans (Kartu/QR/Online)'];

  const originCity = 'Jakarta';

  useEffect(() => {
    if (!user?.id) return;
    const fetchAddresses = async () => {
      try {
        const data = await getAddresses(user.id);
        setAddresses(data || []);
        // Auto-select default address
        const defaultIdx = (data || []).findIndex(a => a.is_default);
        if (defaultIdx >= 0) setSelectedAddress(defaultIdx);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };
    fetchAddresses();
  }, [user?.id]);

  const totalWeight = cart.reduce((sum, item) => sum + (item.weight || 500) * item.qty, 0);
  const selectedCity = addresses[selectedAddress]?.city || 'Jakarta';

  useEffect(() => {
    const fetchRates = async () => {
      if (!selectedCity) return;
      setShippingLoading(true);
      try {
        const rates = await getShippingRates(originCity, selectedCity, totalWeight);
        setShippingRates(rates);
        setSelectedShipping(0);
      } catch (error) {
        console.error('Error fetching shipping rates:', error);
        addToast('Gagal memuat ongkir', 'error');
      } finally {
        setShippingLoading(false);
      }
    };
    fetchRates();
  }, [selectedCity, totalWeight]);

  useEffect(() => {
    setCheckoutDiscount(discount);
    setCheckoutVoucher(appliedVoucher);
  }, [discount, appliedVoucher]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await getVouchers(true);
        setAvailableVouchers(data || []);
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      }
    };
    fetchVouchers();
  }, []);

  const applyBestVoucher = () => {
    const applicable = availableVouchers.filter(v => subtotal >= (v.min_order || 0));
    if (applicable.length === 0) {
      addToast('Tidak ada voucher yang memenuhi syarat', 'info');
      return;
    }
    const best = applicable.reduce((bestV, v) => {
      let vDiscount = 0;
      if (v.type === 'percentage') vDiscount = Math.round(subtotal * (v.value / 100));
      else vDiscount = v.value;
      let bestDiscount = 0;
      if (bestV.type === 'percentage') bestDiscount = Math.round(subtotal * (bestV.value / 100));
      else bestDiscount = bestV.value;
      return vDiscount > bestDiscount ? v : bestV;
    });
    let bestDiscount = 0;
    if (best.type === 'percentage') bestDiscount = Math.round(subtotal * (best.value / 100));
    else bestDiscount = best.value;
    setCheckoutDiscount(bestDiscount);
    setCheckoutVoucher(best);
    addToast(`Voucher ${best.code} otomatis diterapkan`, 'success');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const selectedRate = shippingRates[selectedShipping] || { cost: 0, name: '-', est: '-' };
  const hasFreeShipping = subtotal >= freeShippingThreshold;
  const shipping = hasFreeShipping ? 0 : selectedRate.cost;
  const total = subtotal + shipping - checkoutDiscount;

  const handleCreateOrder = async () => {
    if (!user?.id) return;
    if (addresses.length === 0) {
      addToast('Tambahkan alamat pengiriman terlebih dahulu', 'warning');
      return;
    }
    setLoading(true);
    try {
      // Validate real-time stock from database before creating order
      for (const item of cart) {
        const dbProd = await getProductById(item.id);
        if (!dbProd) {
          addToast(`Produk ${item.name} tidak ditemukan`, 'error');
          setLoading(false);
          return;
        }
        if (dbProd.stock < item.qty) {
          addToast(`Stok ${item.name} tidak mencukupi (Tersisa: ${dbProd.stock})`, 'error');
          setLoading(false);
          return;
        }
      }

      const isMidtrans = selectedPayment === 4;
      const selectedAddr = addresses[selectedAddress];
      const orderData = {
        user_id: user.id,
        status: 'pending',
        total: total,
        subtotal: subtotal,
        shipping_cost: shipping,
        discount_amount: checkoutDiscount,
        voucher_code: checkoutVoucher?.code || null,
        payment_method: paymentMethods[selectedPayment],
        shipping_method: `${selectedRate.name} ${selectedRate.service}`,
        address_id: selectedAddr?.id || null,
        address_snapshot: selectedAddr || null,
        notes: notes,
        item_notes: itemNotes,
      };

      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.qty,
        price: item.price,
        variant: item.variant || null
      }));

      const cartItemIds = cart.map(item => item.cart_item_id).filter(Boolean);

      const order = await createOrder(orderData, items, cartItemIds);
      setOrderId(order.id);

      // Handle Midtrans Snap payment
      if (isMidtrans) {
        if (!isMidtransAvailable()) {
          addToast('Midtrans belum dikonfigurasi. Hubungi admin.', 'error');
          setLoading(false);
          return;
        }
        setMidtransProcessing(true);
        setLoading(false);
        try {
          const snapResult = await createMidtransTransaction(
            order.id,
            total,
            {
              first_name: selectedAddr?.recipient_name || user.email,
              email: user.email,
              phone: selectedAddr?.phone || '',
              billing: {
                address: selectedAddr?.address,
                city: selectedAddr?.city,
              },
            }
          );

          if (!snapResult.token) {
            addToast('Gagal mendapatkan token pembayaran', 'error');
            setMidtransProcessing(false);
            return;
          }

          const paymentResult = await payWithMidtrans(snapResult.token);
          setMidtransProcessing(false);

          if (paymentResult.status === 'success') {
            await updateOrderPaymentProof(order.id, paymentResult.transactionId);
            addToast('Pembayaran berhasil!', 'success');
          } else if (paymentResult.status === 'pending') {
            addToast('Pembayaran sedang diproses', 'info');
          } else if (paymentResult.status === 'close') {
            addToast('Pembayaran dibatalkan', 'warning');
          } else {
            addToast(`Pembayaran gagal: ${paymentResult.message}`, 'error');
          }
        } catch (midErr) {
          setMidtransProcessing(false);
          console.error('Midtrans error:', midErr);
          addToast('Gagal memproses pembayaran Midtrans', 'error');
        }
      }

      // Upload payment proof if provided (transfer bank only)
      if (proofFile && paymentMethods[selectedPayment] === 'Transfer Bank') {
        setProofUploading(true);
        try {
          const proofUrl = await uploadPaymentProof(proofFile, order.id);
          await updateOrderPaymentProof(order.id, proofUrl);
          addToast('Bukti pembayaran berhasil diupload', 'success');
        } catch (proofError) {
          console.error('Error uploading payment proof:', proofError);
          addToast('Pesanan dibuat, namun gagal mengupload bukti pembayaran', 'warning');
        } finally {
          setProofUploading(false);
        }
      }

      // Notify admins about new order
      try {
        await createNotificationForAdmins(
          'Pesanan Baru Masuk',
          `Pesanan #${order.id} — ${formatRupiah(total)} dari ${user?.email || 'Unknown'}`,
          'order'
        );
      } catch (notifErr) {
        console.error('Error sending admin notification:', notifErr);
      }

      // Remove checked-out items from local cart
      setCart(prev => prev.filter(item => !cart.some(ci => ci.id === item.id && (ci.variant || null) === (item.variant || null))));
      setStep(5);
      addToast('Pesanan berhasil dibuat!', 'success');
    } catch (error) {
      console.error('Error creating order:', error);
      addToast('Gagal membuat pesanan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto hide-scrollbar">
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center min-w-[80px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > idx + 1 ? 'bg-[#DCFCE7] text-[#16A34A]' :
                step === idx + 1 ? 'bg-[#16A34A] text-white' : 'border-2 border-gray-300 text-gray-400'
              }`}>
                {step > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 ${step === idx + 1 ? 'text-[#16A34A] font-bold' : 'text-gray-500'}`}>{s}</span>
            </div>
            {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > idx + 1 ? 'bg-[#16A34A]' : 'bg-gray-300'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Pilih Alamat Pengiriman</h2>
              {addresses.length > 0 ? (
                addresses.map((addr, idx) => (
                  <div
                    key={addr.id || idx}
                    onClick={() => setSelectedAddress(idx)}
                    className={`border-2 rounded-xl p-4 mb-3 cursor-pointer transition ${selectedAddress === idx ? 'border-[#16A34A] bg-[#DCFCE7]' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${addr.is_default ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {addr.is_default ? '🏠 Default' : '📍 Alamat'}
                      </span>
                    </div>
                    <p className="font-medium">{addr.recipient_name} • {addr.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">{addr.address}, {addr.city}, {addr.province}, {addr.postal_code}</p>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center mb-4">
                  <p className="text-gray-500 mb-2">Belum ada alamat tersimpan</p>
                  <p className="text-xs text-gray-400">Alamat default akan digunakan</p>
                </div>
              )}
              <button
                onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                className="w-full border-2 border-dashed border-[#16A34A] text-[#16A34A] py-3 rounded-xl font-medium hover:bg-[#DCFCE7]"
              >
                + Tambah Alamat Baru
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Pilih Kurir & Layanan</h2>
              <p className="text-sm text-gray-500 mb-4">Dikirim dari {originCity} ke {selectedCity} • Berat {totalWeight} gram</p>
              {hasFreeShipping ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
                  ✅ Gratis ongkir! Subtotal kamu sudah melebihi {formatRupiah(freeShippingThreshold)}.
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-700">
                  <p>Berat paket: {totalWeight} gram</p>
                  <p className="text-xs mt-1">Gratis ongkir untuk pembelanjaan ≥ {formatRupiah(freeShippingThreshold)}</p>
                </div>
              )}
              {shippingLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
                </div>
              ) : (
                shippingRates.map((rate, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedShipping(idx)}
                    className={`border-2 rounded-xl p-4 mb-3 cursor-pointer flex items-center justify-between transition ${selectedShipping === idx ? 'border-[#16A34A] bg-[#DCFCE7]' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedShipping === idx ? 'border-[#16A34A]' : 'border-gray-300'}`}>
                        {selectedShipping === idx && <div className="w-3 h-3 rounded-full bg-[#16A34A]"></div>}
                      </div>
                      <div>
                        <p className="font-medium">{rate.name} {rate.service}</p>
                        <p className="text-sm text-gray-500">Estimasi {rate.est}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#16A34A]">{hasFreeShipping ? 'Gratis' : formatRupiah(rate.cost)}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Pilih Metode Pembayaran</h2>
              {paymentMethods.map((method, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPayment(idx)}
                  className={`border-2 rounded-xl p-4 mb-3 cursor-pointer flex items-center justify-between transition ${selectedPayment === idx ? 'border-[#16A34A] bg-[#DCFCE7]' : 'border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === idx ? 'border-[#16A34A]' : 'border-gray-300'}`}>
                      {selectedPayment === idx && <div className="w-3 h-3 rounded-full bg-[#16A34A]"></div>}
                    </div>
                    <span className="font-medium">{method}</span>
                  </div>
                  {idx === 0 && <Banknote className="w-5 h-5 text-gray-400" />}
                  {idx === 1 && <Wallet className="w-5 h-5 text-gray-400" />}
                  {idx === 2 && <CreditCard className="w-5 h-5 text-gray-400" />}
                  {idx === 3 && <Package className="w-5 h-5 text-gray-400" />}
                  {idx === 4 && <CreditCard className="w-5 h-5 text-gray-400" />}
                </div>
              ))}
              {selectedPayment === 3 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ Bayar saat barang diterima. Maks Rp 2.000.000
                </div>
              )}
              {selectedPayment === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-medium mb-2">Transfer ke:</p>
                  <p>Bank BCA - 1234567890</p>
                  <p>a.n. Hera Store</p>
                  <p className="mt-2 text-xs">Upload bukti transfer setelah melakukan pembayaran</p>
                </div>
              )}
              {selectedPayment === 4 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                  <p className="font-medium mb-1">💳 Midtrans Snap</p>
                  <p>Pembayaran akan diproses melalui Midtrans — Kartu Kredit, QRIS, dan berbagai e-wallet tersedia.</p>
                  <p className="text-xs mt-1">Setelah konfirmasi, popup pembayaran akan terbuka secara otomatis.</p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Produk</h3>
                  {cart.map((item) => (
                    <div key={item.id} className="py-3 border-b">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={item.thumbnail} alt={item.name || "Thumbnail Produk"} className="w-12 h-12 rounded-lg object-contain bg-gray-50" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.variant || '-'} x{item.qty}</p>
                        </div>
                        <span className="text-sm font-bold">{formatRupiah(item.price * item.qty)}</span>
                      </div>
                      <textarea
                        value={itemNotes[item.id] || ''}
                        onChange={(e) => setItemNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder={`Catatan untuk ${item.name}...`}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#16A34A] outline-none"
                        rows="2"
                      />
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2">Alamat Pengiriman</h3>
                  {addresses.length > 0 ? (
                    <>
                      <p className="text-sm">{addresses[selectedAddress]?.recipient_name} • {addresses[selectedAddress]?.phone}</p>
                      <p className="text-sm text-gray-600">{addresses[selectedAddress]?.address}, {addresses[selectedAddress]?.city}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Alamat default</p>
                  )}
                  <p className="text-sm text-[#16A34A] mt-2">via {selectedRate.name} {selectedRate.service} ({selectedRate.est})</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span className={hasFreeShipping ? 'text-[#16A34A]' : ''}>{hasFreeShipping ? 'Gratis' : formatRupiah(shipping)}</span>
                  </div>
                  {checkoutDiscount > 0 ? (
                    <div className="flex justify-between text-red-500">
                      <span>Diskon {checkoutVoucher && <span className="text-xs">({checkoutVoucher.code})</span>}</span>
                      <span>- {formatRupiah(checkoutDiscount)}</span>
                    </div>
                  ) : (
                    availableVouchers.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm flex items-center justify-between">
                        <span className="text-yellow-800">Ada voucher yang bisa dipakai</span>
                        <button
                          onClick={applyBestVoucher}
                          className="bg-[#16A34A] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#15803D]"
                        >
                          Pakai Otomatis
                        </button>
                      </div>
                    )
                  )}
                  <hr />
                  <div className="flex justify-between text-xl font-bold"><span>Total Bayar</span><span className="text-[#16A34A]">{formatRupiah(total)}</span></div>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk penjual..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A]"
                  rows="3"
                ></textarea>
                {selectedPayment === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="payment-proof"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          addToast('Ukuran file maksimal 5MB', 'error');
                          return;
                        }
                        if (!file.type.startsWith('image/')) {
                          addToast('File harus berupa gambar', 'error');
                          return;
                        }
                        setProofFile(file);
                        setProofPreview(URL.createObjectURL(file));
                      }}
                    />
                    {proofPreview ? (
                      <div className="relative inline-block">
                        <img src={proofPreview} alt="Bukti pembayaran" className="max-h-48 rounded-lg mx-auto" />
                        <button
                          type="button"
                          onClick={() => { setProofFile(null); setProofPreview(null); }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500 mb-2">Upload bukti transfer</p>
                        <label htmlFor="payment-proof" className="cursor-pointer inline-block bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#15803D]">
                          Pilih File
                        </label>
                      </>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Maks 5MB, format gambar</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-[#16A34A] mb-2">Pesanan Berhasil!</h2>
              <p className="text-gray-600 mb-4">Terima kasih sudah berbelanja di Hera Store</p>
              <div className="bg-gray-100 px-4 py-2 rounded-lg inline-flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">No. Pesanan:</span>
                <span className="font-mono font-bold">{orderId || 'N/A'}</span>
                <Copy className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => {
                  if (orderId) {
                    navigator.clipboard.writeText(orderId);
                    addToast('No. Pesanan disalin ke clipboard', 'success');
                  }
                }} />
              </div>
              <p className="text-sm text-gray-500 mb-6">Estimasi tiba: {selectedRate.est} via {selectedRate.name} {selectedRate.service}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setCurrentPage('profile')} className="bg-[#16A34A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#15803D]">Lihat Detail Pesanan</button>
                <button onClick={() => setCurrentPage('home')} className="border-2 border-[#16A34A] text-[#16A34A] px-6 py-3 rounded-lg font-semibold hover:bg-[#DCFCE7]">Kembali ke Beranda</button>
              </div>
              <button onClick={() => setCurrentPage('tracking')} className="text-[#16A34A] text-sm mt-4 hover:underline">Lacak Pesananku →</button>
            </div>
          )}

          {step < 5 && (
            <div className="flex gap-3 mt-6 pt-6 border-t">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50">← Kembali</button>
              )}
              <button
                onClick={() => {
                  if (step === 1) {
                    if (addresses.length === 0) {
                      addToast('Silakan tambahkan alamat pengiriman', 'warning');
                      return;
                    }
                    if (!addresses[selectedAddress]) {
                      addToast('Pilih alamat pengiriman', 'warning');
                      return;
                    }
                  }
                  if (step === 3 && selectedPayment === null) {
                    addToast('Pilih metode pembayaran', 'warning');
                    return;
                  }
                  if (step === 4) {
                    handleCreateOrder();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={loading || proofUploading || midtransProcessing}
                className="flex-1 bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#15803D] disabled:opacity-50"
              >
                {midtransProcessing ? 'Memproses Pembayaran...' : loading || proofUploading ? 'Memproses...' : step === 4 ? 'Buat Pesanan →' : 'Lanjutkan →'}
              </button>
            </div>
          )}
          {step === 4 && <p className="text-xs text-gray-500 mt-3 text-center">Dengan menekan tombol ini, kamu menyetujui Syarat & Ketentuan</p>}
        </motion.div>
      </AnimatePresence>

      {showAddressModal && (
        <AddressModal
          address={editingAddress}
          userId={user?.id}
          onClose={() => setShowAddressModal(false)}
          onSuccess={() => {
            // Refresh addresses
            const fetchAddresses = async () => {
              try {
                const data = await getAddresses(user.id);
                setAddresses(data || []);
              } catch (error) {
                console.error('Error fetching addresses:', error);
              }
            };
            fetchAddresses();
          }}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
