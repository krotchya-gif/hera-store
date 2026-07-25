import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  BarChart3, Package, ShoppingCart, Users, Tag, DollarSign,
  Star, MessageSquare, Settings, LogOut, Leaf, Menu, X
} from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';

const menuItems = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'products', icon: Package, label: 'Produk' },
  { id: 'orders', icon: ShoppingCart, label: 'Pesanan' },
  { id: 'customers', icon: Users, label: 'Pelanggan' },
  { id: 'categories', icon: Tag, label: 'Kategori' },
  { id: 'finance', icon: DollarSign, label: 'Keuangan' },
  { id: 'promo', icon: Tag, label: 'Promo & Diskon' },
  { id: 'reviews', icon: Star, label: 'Ulasan' },
  { id: 'marketing', icon: MessageSquare, label: 'Marketing' },
  { id: 'settings', icon: Settings, label: 'Pengaturan' },
];

const getMenuLabel = (id) => {
  const labels = {
    dashboard: 'Dashboard Utama',
    products: 'Manajemen Produk',
    orders: 'Manajemen Pesanan',
    customers: 'Manajemen Pelanggan',
    categories: 'Manajemen Kategori',
    finance: 'Laporan Keuangan',
    promo: 'Promo & Diskon',
    reviews: 'Manajemen Ulasan',
    marketing: 'Marketing',
    settings: 'Pengaturan Toko',
  };
  return labels[id] || id;
};

export default function AdminLayout({ activeMenu, setActiveMenu, setCurrentPage, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    addToast('Berhasil keluar dari admin panel', 'info');
    setCurrentPage('home');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {!sidebarOpen && isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#16A34A]" />
          </div>
          <NotificationBell dark={false} alignLeft />
        </header>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#16A34A]" />
            <div>
              <p className="font-bold">Hera Store</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1 text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                aria-label={`Menu admin: ${item.label}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                  activeMenu === item.id
                    ? 'bg-[#16A34A] text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#16A34A] rounded-full flex items-center justify-center font-bold text-white">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.role || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Page Content */}
        <div className={`${isMobile ? 'pt-14 px-4 pb-4' : 'p-4'} lg:p-6`}>
          {children}
        </div>
      </div>
    </div>
  );
}
