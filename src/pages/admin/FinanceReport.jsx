import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download, FileText } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getSalesData, getPaymentMethods } from '../../lib/api';
import { formatRupiah } from '../../utils/formatters';
import { exportFinanceReportToCSV } from '../../utils/exportUtils';
import { StatCardSkeleton } from '../../components/Skeleton';

export default function FinanceReport() {
  const [period, setPeriod] = useState('30days');
  const [salesData, setSalesData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    aov: 0,
    total_discount: 0,
  });

  const periods = [
    { value: 'today', label: 'Hari Ini' },
    { value: '7days', label: '7 Hari' },
    { value: '30days', label: '30 Hari' },
    { value: 'this_month', label: 'Bulan Ini' },
    { value: 'this_year', label: 'Tahun Ini' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sales, payments] = await Promise.all([
          getSalesData(period === '7days' ? 7 : 30),
          getPaymentMethods(period)
        ]);
        setSalesData(sales || []);
        setPaymentData(payments || []);
      } catch (error) {
        console.error('Error fetching finance data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const displaySalesData = salesData.length > 0 ? salesData : Array.from({ length: 7 }, (_, i) => ({
    date: `${i + 1} Jun`,
    penjualan: 0
  }));

  const displayPaymentData = paymentData.length > 0 ? paymentData : [
    { name: 'Transfer Bank', value: 45, amount: 0, color: '#16A34A' },
    { name: 'E-Wallet', value: 30, amount: 0, color: '#15803D' },
    { name: 'COD', value: 15, amount: 0, color: '#FBBF24' },
    { name: 'VA', value: 10, amount: 0, color: '#6B7280' }
  ];

  const kpiCards = [
    { label: 'Total Pendapatan Bersih', value: formatRupiah(stats.total_revenue), change: '+12.5%' },
    { label: 'Total Pesanan Selesai', value: stats.total_orders.toString(), change: '+8.2%' },
    { label: 'Rata-rata Nilai Pesanan', value: formatRupiah(stats.aov), change: '+3.1%' },
    { label: 'Total Diskon Diberikan', value: formatRupiah(stats.total_discount), change: '+18.0%' }
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>

          <span className="text-sm text-gray-500">Ringkasan pendapatan dan metode pembayaran</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportFinanceReportToCSV(salesData, period)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
              p.value === period ? 'bg-[#16A34A] text-white' : 'bg-white border hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-xl lg:text-2xl font-bold text-gray-800 my-1">{kpi.value}</p>
            <span className="text-xs text-[#16A34A] font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {kpi.change}
            </span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
            <div className="h-[250px] bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
            <div className="h-[200px] bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-4">Pendapatan Harian</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={displaySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}jt`} />
                <Tooltip formatter={(v) => formatRupiah(v)} />
                <Bar dataKey="penjualan" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-4">Metode Pembayaran</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={displayPaymentData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {displayPaymentData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {displayPaymentData.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                    <span>{p.name}</span>
                  </div>
                  <span className="font-medium">{formatRupiah(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
