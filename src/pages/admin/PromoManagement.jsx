import React, { useState, useEffect } from 'react';
import { Plus, Edit, Tag, Percent } from 'lucide-react';
import { getVouchers, getFlashSales } from '../../lib/api';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { TableRowSkeleton } from '../../components/Skeleton';
import VoucherModal from './VoucherModal';
import FlashSaleModal from './FlashSaleModal';

export default function PromoManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vouchers');
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);

  useEffect(() => {
    const fetchPromoData = async () => {
      try {
        setLoading(true);
        const [voucherData, flashSaleData] = await Promise.all([
          getVouchers(),
          getFlashSales()
        ]);
        setVouchers(voucherData || []);
        setFlashSales(flashSaleData || []);
      } catch (error) {
        console.error('Error fetching promo data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromoData();
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>

          <span className="text-sm text-gray-500">Kelola voucher dan flash sale</span>
        </div>
        <button 
          onClick={() => activeTab === 'vouchers' ? setShowVoucherModal(true) : setShowFlashSaleModal(true)}
          className="bg-[#16A34A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#15803D] flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> {activeTab === 'vouchers' ? 'Buat Voucher' : 'Buat Flash Sale'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'vouchers' ? 'bg-[#16A34A] text-white' : 'bg-white border'}`}
        >
          Voucher
        </button>
        <button
          onClick={() => setActiveTab('flashsales')}
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'flashsales' ? 'bg-[#16A34A] text-white' : 'bg-white border'}`}
        >
          Flash Sale
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-3 lg:p-4 whitespace-nowrap">Kode</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Tipe</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Nilai</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Min. Belanja</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Digunakan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Periode</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Status</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton columns={8} />
                <TableRowSkeleton columns={8} />
                <TableRowSkeleton columns={8} />
                <TableRowSkeleton columns={8} />
                <TableRowSkeleton columns={8} />
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'vouchers' ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-3 lg:p-4 whitespace-nowrap">Kode</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Tipe</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Nilai</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Min. Belanja</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Digunakan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Periode</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Status</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                  {vouchers.length > 0 ? (
                  vouchers.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-mono font-bold text-[#16A34A]">{v.code}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-sm">
                          {v.type === 'percentage' ? <Percent className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                          {v.type === 'percentage' ? 'Persentase' : 'Nominal'}
                        </span>
                      </td>
                      <td className="p-4 font-medium">
                        {v.type === 'percentage' ? `${v.value}%` : formatRupiah(v.value)}
                      </td>
                      <td className="p-4">{formatRupiah(v.min_order)}</td>
                      <td className="p-4">{v.usage_count || 0} / {v.usage_limit || '∞'}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatDate(v.valid_from)} - {formatDate(v.valid_until)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${v.is_active ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-gray-100 text-gray-500'}`}>
                          {v.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="text-[#16A34A] text-sm hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="w-8 h-8 text-gray-300" />
                        <p>Belum ada voucher</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flashSales.length > 0 ? (
            flashSales.map((fs) => {
              const now = new Date();
              const start = new Date(fs.starts_at);
              const end = new Date(fs.ends_at);
              const isActive = now >= start && now <= end;
              const isUpcoming = now < start;

              return (
                <div key={fs.id} className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{fs.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isActive ? 'bg-red-100 text-red-700' : isUpcoming ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isActive ? 'Berlangsung' : isUpcoming ? 'Akan Datang' : 'Selesai'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {formatDate(fs.starts_at)} - {formatDate(fs.ends_at)}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Produk</p>
                      <p className="font-bold">{fs.flash_sale_items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Penjualan</p>
                      <p className="font-bold">{fs.total_sales || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 border border-[#16A34A] text-[#16A34A] py-2 rounded-lg text-sm hover:bg-[#DCFCE7]">Edit</button>
                    <button className="flex-1 bg-[#16A34A] text-white py-2 rounded-lg text-sm hover:bg-[#15803D]">Lihat Produk</button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <Tag className="w-8 h-8 text-gray-300" />
                <p className="text-gray-500">Belum ada flash sale</p>
              </div>
            </div>
          )}
        </div>
      )}

      {showVoucherModal && (
        <VoucherModal
          onClose={() => setShowVoucherModal(false)}
          onSuccess={() => {
            // Refresh voucher list
            const fetchVouchers = async () => {
              try {
                const data = await getVouchers();
                setVouchers(data || []);
              } catch (error) {
                console.error('Error fetching vouchers:', error);
              }
            };
            fetchVouchers();
          }}
        />
      )}

      {showFlashSaleModal && (
        <FlashSaleModal
          onClose={() => setShowFlashSaleModal(false)}
          onSuccess={() => {
            // Refresh flash sale list
            const fetchFlashSales = async () => {
              try {
                const data = await getFlashSales();
                setFlashSales(data || []);
              } catch (error) {
                console.error('Error fetching flash sales:', error);
              }
            };
            fetchFlashSales();
          }}
        />
      )}
    </>
  );
}
