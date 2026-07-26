import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import { createProduct, updateProduct, getCategories } from '../../lib/api';
import { uploadProductImage } from '../../lib/storage';
import { formatRupiah } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { validators } from '../../utils/validation';

export default function ProductModal({ product, onClose, onSuccess }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    price: '',
    original_price: '',
    stock: '',
    status: 'active',
    thumbnail: '',
    images: [],
    weight: '',
    dimensions: '',
    meta_title: '',
    meta_description: '',
    ...product
  });
  const [uploading, setUploading] = useState(false);

  const tabs = [
    { id: 'basic', label: 'Informasi Dasar' },
    { id: 'price', label: 'Harga & Stok' },
    { id: 'variants', label: 'Varian' },
    { id: 'photos', label: 'Foto' },
    { id: 'shipping', label: 'Pengiriman' },
    { id: 'seo', label: 'SEO' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        category_id: product.category_id || '',
        price: product.price || '',
        original_price: product.original_price || '',
        stock: product.stock || '',
        status: product.status || 'active',
        thumbnail: product.thumbnail || '',
        images: product.images || [],
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar', 'error');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadProductImage(file, product?.id || 'new');
      setFormData(prev => ({
        ...prev,
        thumbnail: imageUrl,
        images: [...prev.images, imageUrl]
      }));
      addToast('Gambar berhasil diupload', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      addToast('Gagal mengupload gambar', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      thumbnail: prev.thumbnail === prev.images[index] ? '' : prev.thumbnail
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama produk wajib diisi';
    if (!formData.price) newErrors.price = 'Harga wajib diisi';
    else if (isNaN(formData.price) || Number(formData.price) <= 0) newErrors.price = 'Harga harus lebih besar dari 0';
    if (!formData.stock) newErrors.stock = 'Stok wajib diisi';
    else if (isNaN(formData.stock) || Number(formData.stock) < 0) newErrors.stock = 'Stok tidak valid';
    if (!formData.category_id) newErrors.category_id = 'Kategori wajib dipilih';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      addToast('Mohon periksa kembali form Anda', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const { status, ...rest } = formData;
      const data = {
        ...rest,
        price: Number(formData.price),
        original_price: Number(formData.original_price) || null,
        stock: Number(formData.stock),
        category_id: Number(formData.category_id) || null,
        is_active: status === 'active',
      };

      if (product?.id) {
        await updateProduct(product.id, data);
        addToast('Produk berhasil diperbarui', 'success');
      } else {
        await createProduct(data);
        addToast('Produk berhasil ditambahkan', 'success');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      addToast('Gagal menyimpan produk. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{product ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-[#16A34A] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Basic Info */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Produk *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Sabun Cair Hera"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="HR-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="Deskripsi produk..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                    errors.category_id ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
              </div>
            </div>
          )}

          {/* Price & Stock */}
          {activeTab === 'price' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Harga *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                      errors.price ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="25000"
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Harga Asli (Opsional)</label>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                    placeholder="31000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stok *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none ${
                      errors.stock ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="100"
                  />
                  {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Variants */}
          {activeTab === 'variants' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Fitur varian akan segera hadir.</p>
            </div>
          )}

          {/* Photos */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail && (
                  <img src={formData.thumbnail} alt="Preview" className="mt-2 w-32 h-32 object-contain bg-gray-50 rounded-lg" />
                )}
              </div>
              
              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {uploading ? 'Mengupload...' : 'Drag & drop foto atau klik untuk upload'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Maks 5MB per file</p>
                {uploading && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#16A34A] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              {formData.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Galeri Foto ({formData.images.length})</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {formData.thumbnail === image && (
                          <div className="absolute bottom-1 left-1 bg-[#16A34A] text-white text-xs px-2 py-0.5 rounded">
                            Thumbnail
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, thumbnail: image }))}
                          className="absolute bottom-1 right-1 p-1 bg-white text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ImageIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shipping */}
          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Berat (gram)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dimensi (PxLxT cm)</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="10x5x3"
                />
              </div>
            </div>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="Meta title untuk SEO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="Meta description untuk SEO"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t mt-6 pt-4 flex gap-3">
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
                  <Save className="w-4 h-4" />
                  {product ? 'Simpan Perubahan' : 'Publish Produk'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
