import React, { useState, useEffect } from 'react';
import { X, MapPin, Home, Briefcase, Check } from 'lucide-react';
import { createAddress, updateAddress } from '../../lib/api';
import { validators } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import useFocusTrap from '../../hooks/useFocusTrap';

export default function AddressModal({ address, onClose, onSuccess, userId }) {
  const { addToast } = useToast();
  const containerRef = useFocusTrap(true, onClose);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient_name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    label: 'home',
    is_default: false,
    ...address
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (address) {
      setFormData({
        recipient_name: address.recipient_name || '',
        phone: address.phone || '',
        address: address.address || '',
        city: address.city || '',
        province: address.province || '',
        postal_code: address.postal_code || '',
        label: address.label || 'home',
        is_default: address.is_default || false,
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.recipient_name.trim()) newErrors.recipient_name = 'Nama penerima wajib diisi';
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else {
      const phoneError = validators.phone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
    if (!formData.city.trim()) newErrors.city = 'Kota wajib diisi';
    if (!formData.province.trim()) newErrors.province = 'Provinsi wajib diisi';
    
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Kode pos wajib diisi';
    } else {
      const postalError = validators.postalCode(formData.postal_code);
      if (postalError) newErrors.postal_code = postalError;
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        user_id: userId,
      };

      if (address?.id) {
        await updateAddress(address.id, data);
        addToast('Alamat berhasil diperbarui', 'success');
      } else {
        await createAddress(data);
        addToast('Alamat berhasil ditambahkan', 'success');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      addToast('Gagal menyimpan alamat. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const labelOptions = [
    { value: 'home', label: 'Rumah', icon: Home },
    { value: 'office', label: 'Kantor', icon: Briefcase },
    { value: 'other', label: 'Lainnya', icon: MapPin },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={address ? 'Edit Alamat' : 'Tambah Alamat Baru'}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={containerRef} className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{address ? 'Edit Alamat' : 'Tambah Alamat Baru'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Label Selection */}
          <div className="flex gap-2">
            {labelOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, label: opt.value }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm border transition ${
                    formData.label === opt.value
                      ? 'border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Recipient Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Nama Penerima *</label>
            <input
              type="text"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                errors.recipient_name ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Budi Santoso"
            />
            {errors.recipient_name && <p className="text-xs text-red-500 mt-1">{errors.recipient_name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Telepon *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                errors.phone ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="08123456789"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Alamat Lengkap *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                errors.address ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Jl. Mawar No. 10, RT 01/RW 02"
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* City & Province */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kota *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                  errors.city ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Jakarta Selatan"
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Provinsi *</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                  errors.province ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="DKI Jakarta"
              />
              {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium mb-1">Kode Pos *</label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                errors.postal_code ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="12345"
            />
            {errors.postal_code && <p className="text-xs text-red-500 mt-1">{errors.postal_code}</p>}
          </div>

          {/* Is Default */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="accent-[#16A34A] w-4 h-4"
            />
            <span className="text-sm text-gray-700">Jadikan alamat utama</span>
          </label>

          {/* Actions */}
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
              className="flex-1 bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#15803D] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {address ? 'Simpan Perubahan' : 'Tambah Alamat'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
