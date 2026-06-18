import React, { useState, useEffect } from 'react';
import { ArrowLeft, Tag, Percent, Clock, Zap } from 'lucide-react';
import { getVouchers, getFlashSales } from '../lib/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import { EmptyState } from './Skeleton';

export default function PromoPage({ setCurrentPage }) {
  const [vouchers, setVouchers] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromoData = async () => {
      try {
        setLoading(true);
        const [voucherData, flashSaleData] = await Promise.all([
          getVouchers(),
          getFlashSales(false)
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

  const now = new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Promo & Flash Sale</h1>
          <p className="text-sm text-gray-500">Semua promo aktif dan event flash sale</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5 h-32 animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#16A34A]" /> Kode Voucher
            </h2>
            {vouchers.length === 0 ? (
              <EmptyState
                icon={<Tag className="w-12 h-12" />}
                title="Belum ada voucher aktif"
                description="Nantikan promo menarik dari Hera Store."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vouchers.map((v) => (
                  <div key={v.id} className="bg-white rounded-xl shadow-sm p-5 border border-dashed border-[#16A34A]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono font-bold text-lg text-[#16A34A]">{v.code}</p>
                        <p className="text-sm text-gray-500">
                          {v.type === 'percentage' ? (
                            <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> Diskon {v.value}%</span>
                          ) : (
                            <span>Diskon {formatRupiah(v.value)}</span>
                          )}
                        </p>
                      </div>
                      <span className="bg-[#DCFCE7] text-[#15803D] text-xs px-2 py-1 rounded-full">Aktif</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Min. belanja: {formatRupiah(v.min_order)}</p>
                    <p className="text-xs text-gray-400">Berlaku s/d {formatDate(v.valid_until)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" /> Flash Sale
            </h2>
            {flashSales.length === 0 ? (
              <EmptyState
                icon={<Zap className="w-12 h-12" />}
                title="Belum ada flash sale"
                description="Nantikan event flash sale berikutnya."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flashSales.map((fs) => {
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
                      <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(fs.starts_at)} - {formatDate(fs.ends_at)}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Produk</p>
                          <p className="font-bold">{fs.flash_sale_items?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Terjual</p>
                          <p className="font-bold">{fs.total_sales || 0}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
