import React, { useState, useEffect } from 'react';
import {
  DollarSign, Package, Users, TrendingUp, TrendingDown,
  ArrowRight
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getDashboardStats, getSalesData, getCategorySales, getAllOrders, getLowStockProducts, createNotificationForAdmins } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { formatRupiah } from '../../utils/formatters';
import { StatCardSkeleton, TableRowSkeleton } from '../../components/Skeleton';

export default function DashboardOverview({ setActiveMenu }) {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, sales, categories, orders] = await Promise.all([
        getDashboardStats('30days'),
        getSalesData(30),
        getCategorySales(),
        getAllOrders({ limit: 5 })
      ]);

      setStats(statsData);
      setSalesData(sales || []);
      setCategoryData(categories || []);
      setRecentOrders(orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Check for low stock products on mount
    const checkLowStock = async () => {
      try {
        const lowStock = await getLowStockProducts(10);
        if (lowStock && lowStock.length > 0) {
          // Only notify if not already notified recently (simple throttle via localStorage)
          const lastNotified = localStorage.getItem('hera_low_stock_notified');
          const today = new Date().toDateString();
          if (lastNotified !== today) {
            await createNotificationForAdmins(
              'Stok Produk Menipis',
              `${lowStock.length} produk memiliki stok di bawah 10 item. Segera lakukan restock!`,
              'order'
            );
            localStorage.setItem('hera_low_stock_notified', today);
          }
        }
      } catch (error) {
        console.error('Error checking low stock:', error);
      }
    };
    checkLowStock();

    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => checkLowStock())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'processing': 'bg-blue-100 text-blue-700',
      'shipped': 'bg-purple-100 text-purple-700',
      'delivered': 'bg-green-100 text-green-700',
      'completed': 'bg-[#DCFCE7] text-[#15803D]',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Menunggu',
      'processing': 'Diproses',
      'shipped': 'Dikirim',
      'delivered': 'Diterima',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5">
            <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
            <div className="h-[250px] bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
            <div className="h-[200px] bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-3 pr-4">No. Pesanan</th>
                  <th className="pr-4">Pelanggan</th>
                  <th className="pr-4">Produk</th>
                  <th className="pr-4">Total</th>
                  <th className="pr-4">Status</th>
                  <th className="pr-4">Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton columns={7} />
                <TableRowSkeleton columns={7} />
                <TableRowSkeleton columns={7} />
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // Fallback data if API returns empty
  const displayStats = stats || {
    total_revenue: 0,
    total_orders: 0,
    total_customers: 0,
    total_products_sold: 0,
    revenue_change: '+0%',
    orders_change: '+0%',
    customers_change: '+0%',
    products_change: '+0%'
  };

  const statCards = [
    {
      icon: DollarSign,
      iconColor: 'text-[#16A34A]',
      bgColor: 'bg-gray-100',
      label: 'Total Pendapatan',
      value: formatRupiah(displayStats.total_revenue),
      change: displayStats.revenue_change || '+0%',
      up: true
    },
    {
      icon: Package,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      label: 'Total Pesanan',
      value: `${displayStats.total_orders} pesanan`,
      change: displayStats.orders_change || '+0%',
      up: true
    },
    {
      icon: Users,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      label: 'Total Pelanggan',
      value: `${displayStats.total_customers} user`,
      change: displayStats.customers_change || '+0%',
      up: true
    },
    {
      icon: TrendingUp,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      label: 'Produk Terjual',
      value: `${displayStats.total_products_sold} item`,
      change: displayStats.products_change || '+0%',
      up: true
    }
  ];

  const displaySalesData = salesData.length > 0 ? salesData : Array.from({ length: 7 }, (_, i) => ({
    date: `${i + 1} Jun`,
    penjualan: 0
  }));

  const displayCategoryData = categoryData.length > 0 ? categoryData : [
    { name: 'Perawatan Tubuh', value: 40, color: '#16A34A' },
    { name: 'Perawatan Rumah', value: 25, color: '#15803D' },
    { name: 'Kesehatan', value: 15, color: '#DCFCE7' },
    { name: 'Lainnya', value: 20, color: '#6B7280' }
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${stat.up ? 'text-[#16A34A]' : 'text-red-500'}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Grafik Penjualan 30 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={displaySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}jt`} />
              <Tooltip formatter={(v) => formatRupiah(v)} />
              <Line type="monotone" dataKey="penjualan" stroke="#16A34A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Penjualan per Kategori</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={displayCategoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {displayCategoryData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {displayCategoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="truncate">{cat.name} ({cat.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Pesanan Terbaru</h3>
          <button
            onClick={() => setActiveMenu?.('orders')}
            className="text-[#16A34A] text-sm font-medium flex items-center gap-1 hover:underline"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-3 pr-4 whitespace-nowrap">No. Pesanan</th>
                <th className="pr-4 whitespace-nowrap">Pelanggan</th>
                <th className="pr-4 whitespace-nowrap">Produk</th>
                <th className="pr-4 whitespace-nowrap">Total</th>
                <th className="pr-4 whitespace-nowrap">Status</th>
                <th className="pr-4 whitespace-nowrap">Tanggal</th>
                <th className="whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono font-medium whitespace-nowrap">{order.id}</td>
                    <td className="pr-4 whitespace-nowrap">{order.profiles?.full_name || '-'}</td>
                    <td className="pr-4 max-w-[150px] truncate">{order.order_items?.map(i => i.products?.name).filter(Boolean).join(', ') || '-'}</td>
                    <td className="pr-4 font-medium whitespace-nowrap">{formatRupiah(order.total)}</td>
                    <td className="pr-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="text-gray-500 pr-4 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="whitespace-nowrap"><button onClick={() => setActiveMenu?.('orders')} className="text-[#16A34A] hover:underline">Detail</button></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Belum ada pesanan terbaru
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
