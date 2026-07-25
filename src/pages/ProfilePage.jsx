import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { getOrders, cancelOrder, updateOrderStatus, getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, getNotifications, markNotificationRead } from '../lib/api';
import { formatRupiah } from '../utils/formatters';
import { User, Package, Heart, MapPin, CreditCard, Bell, MessageSquare, Shield, LogOut, Plus, Trash2, Edit, Camera, Eye, EyeOff, Lock, Check, Home } from 'lucide-react';
import { OrderCardSkeleton, EmptyState } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import AddressModal from './admin/AddressModal';
import LazyImage from '../components/LazyImage';
import { supabase } from '../lib/supabase';

export default function ProfilePage({ setCurrentPage, addToCart }) {
  const { user, profile, signOut, uploadAvatar } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const { wishlist, removeFromWishlist } = useWishlist();
  const { updateProfile: updateProfileAuth } = useAuth();

  // Profile Edit State
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Payment Methods State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethodsList, setPaymentMethodsList] = useState([
    { id: 1, type: 'Kartu Kredit', provider: 'Visa', number: '**** **** **** 4321', expiry: '12/28', name: 'Budi Santoso' },
    { id: 2, type: 'Rekening Bank', provider: 'BCA', number: '123-456-7890', expiry: '-', name: 'Budi Santoso' }
  ]);
  const [newCardType, setNewCardType] = useState('Kartu Kredit');
  const [newCardProvider, setNewCardProvider] = useState('BCA');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardName, setNewCardName] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Reviews State
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const menuItems = [
    { label: 'Kembali ke Beranda', icon: <Home className="w-4 h-4" />, action: () => setCurrentPage('home') },
    { label: 'Informasi Akun', icon: <User className="w-4 h-4" /> },
    { label: 'Pesanan Saya', icon: <Package className="w-4 h-4" /> },
    { label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
    { label: 'Alamat Tersimpan', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Metode Pembayaran', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Notifikasi', icon: <Bell className="w-4 h-4" /> },
    { label: 'Ulasan Saya', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Keamanan Akun', icon: <Shield className="w-4 h-4" /> },
  ];

  const statusTabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Menunggu Pembayaran', value: 'pending' },
    { label: 'Diproses', value: 'processing' },
    { label: 'Dikirim', value: 'shipped' },
    { label: 'Selesai', value: 'delivered' },
    { label: 'Dibatalkan', value: 'cancelled' }
  ];

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-700',
    'processing': 'bg-blue-100 text-blue-700',
    'shipped': 'bg-purple-100 text-purple-700',
    'delivered': 'bg-green-100 text-green-700',
    'cancelled': 'bg-red-100 text-red-700',
    'paid': 'bg-indigo-100 text-indigo-700'
  };

  const statusLabels = {
    'pending': 'Menunggu Pembayaran',
    'paid': 'Menunggu Pembayaran',
    'processing': 'Diproses',
    'shipped': 'Dikirim',
    'delivered': 'Selesai',
    'cancelled': 'Dibatalkan',
    'refunded': 'Dikembalikan'
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders(user.id);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchAddresses = async () => {
      try {
        const data = await getAddresses(user.id);
        setAddresses(data || []);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };
    fetchAddresses();
  }, [user?.id]);

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab);

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      addToast('Pesanan berhasil dibatalkan', 'success');
    } catch (error) {
      console.error('Error cancelling order:', error);
      addToast('Gagal membatalkan pesanan', 'error');
    }
  };

  const handleConfirmReceived = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'delivered');
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
      addToast('Pesanan berhasil dikonfirmasi diterima', 'success');
    } catch (error) {
      console.error('Error confirming order:', error);
      addToast('Gagal mengkonfirmasi pesanan', 'error');
    }
  };

  const handleBuyAgain = (order) => {
    const items = order.order_items || order.items || [];
    items.forEach(item => {
      addToCart({
        id: item.product_id,
        name: item.products?.name || item.name,
        price: item.price,
        thumbnail: item.products?.thumbnail || item.thumbnail,
        variant: item.variant,
        qty: item.quantity || item.qty || 1
      });
    });
    addToast('Produk ditambahkan ke keranjang', 'success');
    setCurrentPage('cart');
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await setDefaultAddress(user.id, addressId);
      setAddresses(addresses.map(a => ({ ...a, is_default: a.id === addressId })));
      addToast('Alamat default berhasil diubah', 'success');
    } catch (error) {
      console.error('Error setting default address:', error);
      addToast('Gagal mengubah alamat default', 'error');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
    try {
      await deleteAddress(addressId);
      setAddresses(addresses.filter(a => a.id !== addressId));
      addToast('Alamat berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting address:', error);
      addToast('Gagal menghapus alamat', 'error');
    }
  };

  const handleAddressSuccess = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
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
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Ukuran foto maksimal 5MB', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar', 'error');
      return;
    }
    setAvatarUploading(true);
    try {
      const { error } = await uploadAvatar(file);
      if (error) throw error;
      addToast('Foto profil berhasil diperbarui', 'success');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      addToast('Gagal mengupload foto profil', 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Initialize edit fields
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Fetch notifications and reviews when activeMenu changes
  useEffect(() => {
    if (!user?.id) return;
    if (activeMenu === 'Notifikasi') {
      const fetchNotifs = async () => {
        try {
          setNotifLoading(true);
          const data = await getNotifications(user.id);
          setNotifications(data || []);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setNotifLoading(false);
        }
      };
      fetchNotifs();
    } else if (activeMenu === 'Ulasan Saya') {
      const fetchReviews = async () => {
        try {
          setReviewsLoading(true);
          const { data, error } = await supabase
            .from('reviews')
            .select('*, products(name, thumbnail)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setMyReviews(data || []);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        } finally {
          setReviewsLoading(false);
        }
      };
      fetchReviews();
    }
  }, [activeMenu, user?.id]);

  // Profile Edit Save Handlers
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast('Nama lengkap wajib diisi', 'warning');
      return;
    }
    setProfileSaving(true);
    try {
      const { error } = await updateProfileAuth({
        full_name: fullName,
        phone: phone
      });
      if (error) throw error;
      addToast('Profil berhasil diperbarui', 'success');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Gagal memperbarui profil', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // Payment Methods Handlers
  const handleDeletePayment = (id) => {
    setPaymentMethodsList(paymentMethodsList.filter(pm => pm.id !== id));
    addToast('Metode pembayaran berhasil dihapus', 'success');
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!newCardNumber || !newCardName) {
      addToast('Harap isi nomor dan nama pemilik', 'warning');
      return;
    }
    const newPM = {
      id: Date.now(),
      type: newCardType,
      provider: newCardProvider,
      number: newCardNumber,
      expiry: newCardType === 'Kartu Kredit' ? newCardExpiry : '-',
      name: newCardName
    };
    setPaymentMethodsList([...paymentMethodsList, newPM]);
    addToast('Metode pembayaran berhasil ditambahkan', 'success');
    setShowPaymentModal(false);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardName('');
  };

  // Notification Handlers
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      addToast('Notifikasi ditandai dibaca', 'success');
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => markNotificationRead(n.id)));
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      addToast('Semua notifikasi ditandai dibaca', 'success');
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  };

  // Password Update Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Password konfirmasi tidak cocok', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password minimal 6 karakter', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      addToast('Password berhasil diperbarui', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      addToast(error.message || 'Gagal memperbarui password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className={`bg-white rounded-xl shadow-sm p-4 ${activeMenu ? 'hidden md:block' : 'block'}`}>
          <div className="text-center mb-4 pb-4 border-b">
            <label className="relative w-16 h-16 block mx-auto mb-2 cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
                className="hidden"
              />
              <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar Pengguna" className="w-full h-full object-cover rounded-full" />
                ) : (
                  profile?.full_name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {avatarUploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </label>
            <p className="font-semibold">{profile?.full_name || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <button
              onClick={() => setActiveMenu('Informasi Akun')}
              className={`mt-2 text-xs px-3 py-1 rounded-full ${activeMenu === 'Informasi Akun' ? 'bg-[#16A34A] text-white' : 'text-[#16A34A] border border-[#16A34A]'}`}
            >
              Edit Profil
            </button>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveMenu(item.label);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  activeMenu === item.label
                    ? 'bg-[#DCFCE7] text-[#15803D] border-l-4 border-[#16A34A]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={async () => { 
                await signOut(); 
                addToast('Berhasil keluar', 'info');
                setCurrentPage('home'); 
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className={`md:col-span-3 ${activeMenu ? 'block' : 'hidden md:block'}`}>
          {activeMenu && (
            <button
              onClick={() => setActiveMenu(null)}
              className="md:hidden flex items-center gap-1 text-[#16A34A] mb-4 font-medium"
            >
              ← Kembali ke Menu Utama
            </button>
          )}
          {!activeMenu && (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-[#16A34A]/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-[#16A34A]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Selamat Datang, {profile?.full_name || 'User'}!
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Kelola akun, lihat pesanan, dan atur preferensi Anda di sini.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {menuItems.filter(m => m.label !== 'Kembali ke Beranda').slice(0, 4).map(item => (
                  <button
                    key={item.label}
                    onClick={() => item.action ? item.action() : setActiveMenu(item.label)}
                    className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-[#DCFCE7] hover:text-[#15803D] transition text-gray-600"
                  >
                    {item.icon}
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeMenu === 'Pesanan Saya' && (
            <>
              <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar -mx-4 px-4">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.value ? 'bg-[#16A34A] text-white' : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <>
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Belum ada pesanan</p>
                  <button onClick={() => setCurrentPage('home')} className="bg-[#16A34A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D]">
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const orderItems = order.order_items || order.items || [];
                  return (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-3 overflow-hidden">
                      <div className="flex items-center justify-between mb-3 pb-3 border-b gap-2">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                          <span className="font-mono text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-none">{order.id}</span>
                          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      {orderItems.length > 0 ? orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 sm:gap-3 mb-3">
                          <LazyImage src={item.products?.thumbnail || item.thumbnail || ''} alt={item.products?.name || item.name || 'Produk'} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-contain bg-gray-50 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">{item.products?.name || item.name || 'Produk'}</p>
                            <p className="text-xs text-gray-500">x{item.quantity || item.qty || 1}</p>
                          </div>
                          <span className="font-medium text-xs sm:text-sm flex-shrink-0">{formatRupiah((item.price || 0) * (item.quantity || item.qty || 1))}</span>
                        </div>
                      )) : (
                        <div className="text-xs text-gray-400 italic mb-3">Detail produk tidak tersedia</div>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t gap-2">
                        <div className="w-full sm:w-auto">
                          <p className="font-bold text-sm">Total: {formatRupiah(order.total)}</p>
                          {(order.shipping_method || order.shipping_courier) && (
                            <p className="text-xs text-gray-500 truncate">{order.shipping_method || order.shipping_courier}{order.tracking_number ? ` • ${order.tracking_number}` : ''}</p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-start sm:justify-end">
                          {(order.status === 'pending' || order.status === 'paid') && (
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => addToast('Silakan lakukan pembayaran sesuai metode yang dipilih. Bukti bayar bisa diunggah di detail pesanan.', 'info')}
                                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-[#16A34A] text-white rounded-lg text-xs sm:text-sm font-medium active:scale-95 transition"
                              >
                                Bayar
                              </button>
                              <button onClick={() => handleCancel(order.id)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm active:scale-95 transition">Batalkan</button>
                            </div>
                          )}
                          {order.status === 'shipped' && (
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button onClick={() => setCurrentPage('tracking')} className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-[#16A34A] text-white rounded-lg text-xs sm:text-sm font-medium active:scale-95 transition">Lacak</button>
                              <button onClick={() => handleConfirmReceived(order.id)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm active:scale-95 transition">Terima ✓</button>
                            </div>
                          )}
                          {order.status === 'delivered' && (
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button onClick={() => handleBuyAgain(order)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-[#16A34A] text-white rounded-lg text-xs sm:text-sm font-medium active:scale-95 transition">Beli Lagi</button>
                              <button onClick={() => addToast('Fitur ulasan akan segera hadir', 'info')} className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm active:scale-95 transition">Ulasan</button>
                            </div>
                          )}
                          {order.status === 'cancelled' && (
                            <button onClick={() => handleBuyAgain(order)} className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-[#16A34A] text-white rounded-lg text-xs sm:text-sm font-medium active:scale-95 transition">Beli Lagi</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            }
          </>
          )}
          {activeMenu === 'Alamat Tersimpan' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Alamat Tersimpan</h2>
                <button 
                  onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                  className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#15803D]"
                >
                  <Plus className="w-4 h-4" /> Tambah Alamat
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Belum ada alamat tersimpan</p>
                  <button 
                    onClick={() => { setEditingAddress(null); setShowAddressModal(true); }}
                    className="bg-[#16A34A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D]"
                  >
                    Tambah Alamat
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold">{address.recipient_name}</span>
                            {address.is_default && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                          <p className="text-sm text-gray-600">{address.city}, {address.province}, {address.postal_code}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setEditingAddress(address); setShowAddressModal(true); }}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {!address.is_default && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="text-xs text-[#16A34A] hover:underline"
                            >
                              Jadikan Default
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Informasi Akun' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Informasi Akun</h2>
              {editMode ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A] focus:border-[#16A34A] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A] focus:border-[#16A34A] outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#15803D] disabled:opacity-50"
                    >
                      {profileSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFullName(profile?.full_name || '');
                        setPhone(profile?.phone || '');
                        setEditMode(false);
                      }}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nama Lengkap</label>
                    <p className="text-sm font-medium">{profile?.full_name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm font-medium">{user?.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">No. Telepon</label>
                    <p className="text-sm font-medium">{profile?.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Role</label>
                    <p className="text-sm font-medium capitalize">{profile?.role || 'customer'}</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#15803D]"
                    >
                      Edit Profil
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Klik foto profil di sidebar untuk mengganti avatar.</p>
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Wishlist' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Wishlist Saya</h2>
              {wishlist.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Wishlist kamu masih kosong</p>
                  <button onClick={() => setCurrentPage('home')} className="bg-[#16A34A] text-white px-6 py-2 rounded-lg hover:bg-[#15803D]">
                    Cari Produk
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
                      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                        <LazyImage src={product.thumbnail || product.image} alt={product.name} className="w-full h-full object-contain p-4" />
                        <button
                          onClick={() => {
                            removeFromWishlist(product.id);
                            addToast('Dihapus dari wishlist', 'info');
                          }}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow"
                        >
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</p>
                          <p className="text-[#16A34A] font-bold text-sm">{formatRupiah(product.price)}</p>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="mt-3 w-full bg-[#16A34A] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#15803D]"
                        >
                          + Keranjang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Metode Pembayaran' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Metode Pembayaran</h2>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#15803D]"
                >
                  <Plus className="w-4 h-4" /> Tambah Metode
                </button>
              </div>

              {paymentMethodsList.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada metode pembayaran tersimpan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethodsList.map((pm) => (
                    <div key={pm.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <CreditCard className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{pm.provider} ({pm.type})</p>
                          <p className="text-xs text-gray-500">{pm.number}</p>
                          <p className="text-xs text-gray-400 mt-0.5">a.n. {pm.name} {pm.expiry !== '-' && `• Exp: ${pm.expiry}`}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(pm.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                    <h3 className="text-lg font-bold mb-4">Tambah Metode Pembayaran</h3>
                    <form onSubmit={handleAddPayment} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1 text-sm cursor-pointer">
                            <input type="radio" checked={newCardType === 'Kartu Kredit'} onChange={() => setNewCardType('Kartu Kredit')} className="accent-[#16A34A]" /> Kartu Kredit/Debit
                          </label>
                          <label className="flex items-center gap-1 text-sm cursor-pointer">
                            <input type="radio" checked={newCardType === 'Rekening Bank'} onChange={() => setNewCardType('Rekening Bank')} className="accent-[#16A34A]" /> Rekening Bank
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Penyedia / Nama Bank</label>
                        <input
                          type="text"
                          value={newCardProvider}
                          onChange={(e) => setNewCardProvider(e.target.value)}
                          placeholder="Contoh: BCA, Mandiri, Visa, Mastercard"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A] focus:border-[#16A34A] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Kartu / Rekening</label>
                        <input
                          type="text"
                          value={newCardNumber}
                          onChange={(e) => setNewCardNumber(e.target.value)}
                          placeholder="Masukkan nomor..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A] focus:border-[#16A34A] outline-none"
                          required
                        />
                      </div>
                      {newCardType === 'Kartu Kredit' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Masa Berlaku (MM/YY)</label>
                          <input
                            type="text"
                            value={newCardExpiry}
                            onChange={(e) => setNewCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A] focus:border-[#16A34A] outline-none"
                            required
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik</label>
                        <input
                          type="text"
                          value={newCardName}
                          onChange={(e) => setNewCardName(e.target.value)}
                          placeholder="Nama lengkap pemilik..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A] focus:border-[#16A34A] outline-none"
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setShowPaymentModal(false)}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#15803D]"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Notifikasi' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Notifikasi</h2>
                {notifications.some(n => !n.is_read) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-[#16A34A] hover:underline"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              {notifLoading ? (
                <div className="space-y-3">
                  <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada notifikasi baru</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                      className={`p-4 rounded-xl shadow-sm border transition flex items-start justify-between cursor-pointer ${
                        n.is_read ? 'bg-white border-gray-100 opacity-75' : 'bg-green-50/50 border-green-200'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${n.is_read ? 'bg-gray-100' : 'bg-green-100 text-[#16A34A]'}`}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>{n.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {new Date(n.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                      {!n.is_read && (
                        <span className="w-2.5 h-2.5 bg-[#16A34A] rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Ulasan Saya' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Ulasan Saya</h2>
              {reviewsLoading ? (
                <div className="space-y-3">
                  <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ) : myReviews.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Anda belum pernah menulis ulasan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                      <div className="flex gap-3 items-center mb-3">
                        <img src={review.products?.thumbnail} alt={review.products?.name || "Thumbnail Produk"} className="w-10 h-10 rounded-lg object-contain bg-gray-50" />
                        <div>
                          <p className="font-semibold text-sm">{review.products?.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                            <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                            <span className="text-[10px] text-gray-400 ml-2">
                              {new Date(review.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                      {review.admin_reply && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-3 text-xs border-l-4 border-[#16A34A]">
                          <p className="font-semibold text-gray-800 mb-1">Balasan Penjual:</p>
                          <p className="text-gray-600">{review.admin_reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Keamanan Akun' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Ganti Password</h2>
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2 text-sm focus:ring-[#16A34A] focus:border-[#16A34A] outline-none"
                      placeholder="Minimal 6 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2 text-sm focus:ring-[#16A34A] focus:border-[#16A34A] outline-none"
                      placeholder="Masukkan kembali password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#15803D] disabled:opacity-50 flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Perbarui Password'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {showAddressModal && (
        <AddressModalWrapper
          address={editingAddress}
          userId={user?.id}
          onClose={() => { setShowAddressModal(false); setEditingAddress(null); }}
          onSuccess={handleAddressSuccess}
        />
      )}
    </div>
  );
}

function AddressModalWrapper({ address, userId, onClose, onSuccess }) {
  return (
    <AddressModal 
      address={address} 
      userId={userId} 
      onClose={onClose} 
      onSuccess={onSuccess} 
    />
  );
}
