import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Package, CheckCircle, XCircle, X, Download, Printer } from 'lucide-react';
import { getAllOrders, updateOrderStatus, updateOrderTracking } from '../../lib/api';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { exportOrdersToCSV } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export default function OrderManagement() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const itemsPerPage = 10;

  const statusOptions = ['Semua', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

  const statusLabels = {
    pending: 'Menunggu',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Diterima',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    completed: 'bg-[#DCFCE7] text-[#15803D]',
    cancelled: 'bg-red-100 text-red-700',
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const filters = {
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        };
        if (searchQuery) filters.search = searchQuery;
        if (statusFilter !== 'Semua') filters.status = statusFilter;

        const data = await getAllOrders(filters);
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage, searchQuery, statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder(null);
      addToast(`Status pesanan ${orderId} diperbarui ke ${statusLabels[newStatus]}`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      addToast('Gagal memperbarui status pesanan', 'error');
    }
  };

  const handleUpdateTracking = async (orderId) => {
    if (!trackingNumber.trim()) return;
    try {
      await updateOrderTracking(orderId, trackingNumber);
      setOrders(orders.map(o => o.id === orderId ? { ...o, tracking_number: trackingNumber } : o));
      setTrackingNumber('');
      setSelectedOrder(null);
      addToast('Nomor resi berhasil diperbarui', 'success');
    } catch (error) {
      console.error('Error updating tracking:', error);
      addToast('Gagal memperbarui nomor resi', 'error');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold">Manajemen Pesanan</h2>
          <span className="text-sm text-gray-500">{orders.length} Pesanan</span>
        </div>
        <button
          onClick={() => exportOrdersToCSV(orders)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari no. pesanan atau pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                s === statusFilter ? 'bg-[#16A34A] text-white' : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {statusLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-3 lg:p-4 whitespace-nowrap">No. Pesanan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Pelanggan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Produk</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Total</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Status</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Tanggal</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 lg:p-4 font-mono font-medium whitespace-nowrap">{order.id}</td>
                      <td className="p-3 lg:p-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-sm">{order.profiles?.full_name || '-'}</p>
                          <p className="text-xs text-gray-500">{order.profiles?.email || '-'}</p>
                        </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="space-y-1 max-w-[120px] lg:max-w-[200px]">
                          {order.order_items?.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-xs text-gray-600 truncate">
                              {item.products?.name || item.name} x{item.qty || item.quantity}
                            </p>
                          )) || <p className="text-xs text-gray-500">-</p>}
                          {(order.order_items?.length || 0) > 2 && (
                            <p className="text-xs text-[#16A34A]">+{order.order_items.length - 2} lainnya</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 lg:p-4 font-medium whitespace-nowrap">{formatRupiah(order.total)}</td>
                      <td className="p-3 lg:p-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="p-3 lg:p-4 text-gray-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="p-3 lg:p-4 whitespace-nowrap">
                        <div className="flex gap-1 lg:gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 hover:bg-gray-100 rounded"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          {order.status === 'processing' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'shipped')}
                              className="p-1.5 hover:bg-gray-100 rounded"
                              title="Kirim"
                            >
                              <Package className="w-4 h-4 text-blue-500" />
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'processing')}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Proses"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Batalkan"
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="w-8 h-8 text-gray-300" />
                        <p>Tidak ada pesanan ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between border-t text-sm text-gray-500 gap-3">
            <span>Showing {orders.length} pesanan</span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button className="px-3 py-1 bg-[#16A34A] text-white rounded">{currentPage}</button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={orders.length < itemsPerPage}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Detail Pesanan</h3>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    title="Cetak / PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{selectedOrder.id}</p>
            </div>

            {/* Print-only invoice header */}
            <div className="hidden print:block p-6 border-b">
              <h1 className="text-2xl font-bold">INVOICE HERA STORE</h1>
              <p className="text-sm text-gray-600">No. Pesanan: {selectedOrder.id}</p>
              <p className="text-sm text-gray-600">Tanggal: {new Date(selectedOrder.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-2">Pelanggan</h4>
                <p className="font-medium">{selectedOrder.profiles?.full_name || '-'}</p>
                <p className="text-sm text-gray-600">{selectedOrder.profiles?.email || '-'}</p>
                <p className="text-sm text-gray-600">{selectedOrder.profiles?.phone || '-'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-500 mb-2">Produk</h4>
                {selectedOrder.order_items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 mb-2">
                    <img src={item.products?.thumbnail} alt={item.products?.name || "Thumbnail Produk"} className="w-10 h-10 rounded object-contain bg-gray-50" />
                    <div className="flex-1">
                      <p className="text-sm">{item.products?.name || item.name}</p>
                      <p className="text-xs text-gray-500">x{item.qty} • {formatRupiah(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatRupiah(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Ongkir</span>
                  <span>{formatRupiah(selectedOrder.shipping_cost)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Diskon</span>
                  <span>{formatRupiah(selectedOrder.discount_amount || selectedOrder.discount || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm mt-2">
                  <span>Total</span>
                  <span className="text-[#16A34A]">{formatRupiah(selectedOrder.total)}</span>
                </div>
              </div>

              {selectedOrder.payment_proof && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Bukti Pembayaran</h4>
                  <a
                    href={selectedOrder.payment_proof}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={selectedOrder.payment_proof}
                      alt="Bukti pembayaran"
                      className="max-h-48 rounded-lg border hover:opacity-90 transition"
                    />
                  </a>
                </div>
              )}

              {selectedOrder.status === 'processing' && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Input Nomor Resi</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="JNE123456789"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                    />
                    <button
                      onClick={() => handleUpdateTracking(selectedOrder.id)}
                      className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#15803D]"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
