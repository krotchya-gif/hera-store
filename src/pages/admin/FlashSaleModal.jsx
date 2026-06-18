import React, { useState } from 'react';
import { X, Plus, Tag, Clock, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createFlashSale } from '../../lib/api';
import { uploadBannerImage } from '../../lib/storage';

export default function FlashSaleModal({ onClose, onSuccess }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    starts_at: '',
    ends_at: '',
    is_active: true,
    banner: ''
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Ukuran banner maksimal 5MB', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      addToast('Banner harus berupa gambar', 'error');
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));

    setUploadingBanner(true);
    try {
      const url = await uploadBannerImage(file, 'flashsale');
      setFormData(prev => ({ ...prev, banner: url }));
      addToast('Banner berhasil diupload', 'success');
    } catch (error) {
      console.error('Error uploading banner:', error);
      addToast('Gagal mengupload banner', 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.name || !formData.starts_at || !formData.ends_at) {
        addToast('Nama, tanggal mulai, dan tanggal selesai wajib diisi', 'warning');
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        banner: formData.banner || null,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString(),
        is_active: formData.is_active
      };

      await createFlashSale(payload);
      addToast('Flash Sale berhasil dibuat!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating flash sale:', error);
      addToast('Gagal membuat flash sale: ' + (error.message || 'Coba lagi'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Buat Flash Sale Baru</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Flash Sale *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              placeholder="Flash Sale Weekend"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mulai</label>
              <input
                type="datetime-local"
                name="starts_at"
                value={formData.starts_at}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Selesai</label>
              <input
                type="datetime-local"
                name="ends_at"
                value={formData.ends_at}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              />
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Banner Flash Sale</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {bannerPreview || formData.banner ? (
                <div className="relative inline-block">
                  <img
                    src={bannerPreview || formData.banner}
                    alt="Banner preview"
                    className="max-h-40 rounded-lg mx-auto"
                  />
                  <div className="absolute bottom-1 right-1 bg-white text-gray-600 rounded p-1">
                    <ImageIcon className="w-3 h-3" />
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {uploadingBanner ? 'Mengupload...' : 'Klik atau drag banner di sini'}
                  </p>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Maks 5MB, format gambar</p>
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

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Flash Sale akan otomatis aktif/nonaktif berdasarkan waktu yang ditentukan.
            </p>
          </div>

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
              {loading ? 'Memproses...' : 'Buat Flash Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
