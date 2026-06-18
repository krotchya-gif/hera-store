import React, { useState } from 'react';
import { X, Plus, Percent, Tag, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createVoucher } from '../../lib/api';

export default function VoucherModal({ onClose, onSuccess }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateCode = () => {
    const prefix = 'HERA';
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    setFormData(prev => ({ ...prev, code: `${prefix}${random}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        valid_from: formData.valid_from || new Date().toISOString().split('T')[0],
        valid_until: formData.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      await createVoucher(payload);
      addToast('Voucher berhasil dibuat!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating voucher:', error);
      addToast('Gagal membuat voucher: ' + (error.message || 'Coba lagi'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Buat Voucher Baru</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kode Voucher *</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                placeholder="PROMO10"
              />
              <button
                type="button"
                onClick={generateCode}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" /> Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipe Diskon *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discount_type: 'percentage' })}
                className={`flex-1 py-2 rounded-lg text-sm border ${formData.discount_type === 'percentage' ? 'border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]' : 'border-gray-200'}`}
              >
                <Percent className="w-4 h-4 inline mr-1" /> Persentase
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discount_type: 'fixed' })}
                className={`flex-1 py-2 rounded-lg text-sm border ${formData.discount_type === 'fixed' ? 'border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]' : 'border-gray-200'}`}
              >
                <Tag className="w-4 h-4 inline mr-1" /> Nominal
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {formData.discount_type === 'percentage' ? 'Persentase Diskon (%)' : 'Nominal Diskon (Rp)'} *
            </label>
            <input
              type="number"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              placeholder={formData.discount_type === 'percentage' ? '10' : '10000'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Min. Order (Rp)</label>
            <input
              type="number"
              name="min_order"
              value={formData.min_order}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              placeholder="100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max. Penggunaan</label>
            <input
              type="number"
              name="max_uses"
              value={formData.max_uses}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              placeholder="100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Berlaku Dari</label>
              <input
                type="date"
                name="valid_from"
                value={formData.valid_from}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Berlaku Sampai</label>
              <input
                type="date"
                name="valid_until"
                value={formData.valid_until}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="accent-[#16A34A] w-4 h-4"
            />
            <span className="text-sm text-gray-700">Aktif</span>
          </label>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#15803D] disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Buat Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
