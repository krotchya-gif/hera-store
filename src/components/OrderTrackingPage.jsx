import React, { useState } from 'react';
import { ArrowLeft, Search, Truck, Package, CheckCircle, Clock, MapPin, Calendar } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { getTrackingHistory } from '../lib/shipping';

const orderDetails = {
  status: 'shipped',
  estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID'),
  total: 150000,
  items: [
    { name: 'Sabun Mandi Cair Premium', qty: 2, price: 50000 },
    { name: 'Shampoo Herbal Alami', qty: 1, price: 50000 }
  ]
};

const iconMap = {
  Package: <Package className="w-5 h-5 text-blue-500" />,
  Clock: <Clock className="w-5 h-5 text-yellow-500" />,
  Truck: <Truck className="w-5 h-5 text-purple-500" />,
  MapPin: <MapPin className="w-5 h-5 text-orange-500" />,
  CheckCircle: <CheckCircle className="w-5 h-5 text-green-500" />
};

export default function OrderTrackingPage({ setCurrentPage }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const history = await getTrackingHistory(trackingNumber.trim());
      setTrackingHistory(history);
      setShowResult(true);
    } catch (err) {
      setError('Gagal melacak pengiriman. Silakan coba lagi.');
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Lacak Pesanan</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Masukkan nomor resi atau nomor pesanan..."
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !trackingNumber.trim()}
            className="bg-[#16A34A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#15803D] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mencari...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Lacak
              </>
            )}
          </button>
        </div>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>

      {showResult && (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{trackingNumber.toUpperCase()}</h2>
                <p className="text-sm text-gray-500">Nomor Resi: {trackingNumber.toUpperCase()}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {orderDetails.status === 'shipped' ? 'Dikirim' : orderDetails.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Kurir</p>
                <p className="font-semibold text-gray-800">{trackingHistory[0]?.courier || 'JNE'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Estimasi Sampai</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#16A34A]" />
                  <p className="font-semibold text-gray-800">{orderDetails.estimatedDelivery}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Total Pesanan</p>
                <p className="font-semibold text-[#16A34A]">{formatRupiah(orderDetails.total)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Produk</h3>
              <div className="space-y-2">
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">x{item.qty}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{formatRupiah(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Riwayat Pengiriman</h2>
            <div className="space-y-4">
              {trackingHistory.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-[#DCFCE7]' : 'bg-gray-100'
                    }`}>
                      {iconMap[step.icon] || <Package className="w-5 h-5 text-gray-500" />}
                    </div>
                    {index < trackingHistory.length - 1 && (
                      <div className={`w-0.5 h-12 ${
                        step.completed ? 'bg-[#16A34A]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className={`font-semibold text-sm ${
                      step.completed ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {step.status}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!showResult && !loading && (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Lacak Pesanan Anda</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Masukkan nomor resi atau nomor pesanan Anda untuk melihat status pengiriman secara real-time.
          </p>
        </div>
      )}
    </div>
  );
}
