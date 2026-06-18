import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../lib/api';
import { formatDate } from '../../utils/formatters';
import { TableRowSkeleton } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';

export default function CategoryManagement() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
    parent_id: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        sort_order: Number(formData.sort_order) || 0
      };
      delete payload.depth;
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        addToast('Kategori berhasil diperbarui', 'success');
      } else {
        await createCategory(payload);
        addToast('Kategori berhasil dibuat', 'success');
      }
      setShowModal(false);
      setEditingCategory(null);
      // Refresh categories
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error saving category:', error);
      addToast('Gagal menyimpan kategori', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      addToast('Kategori berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast('Gagal menghapus kategori', 'error');
    }
  };

  const filteredCategories = categories.filter(c => {
    if (!searchQuery) return true;
    return c.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const buildTree = (items, parentId = null, depth = 0) => {
    return items
      .filter(c => (c.parent_id ? Number(c.parent_id) : null) === parentId)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name))
      .flatMap(c => [{ ...c, depth }, ...buildTree(items, c.id, depth + 1)]);
  };

  const categoryTree = buildTree(filteredCategories);

  const handleMove = async (category, direction) => {
    try {
      const siblings = categoryTree.filter(
        c => (c.parent_id ? Number(c.parent_id) : null) === (category.parent_id ? Number(category.parent_id) : null)
      );
      const idx = siblings.findIndex(c => c.id === category.id);
      const target = siblings[idx + direction];
      if (!target) return;
      const newOrder = target.sort_order || 0;
      await updateCategory(category.id, { sort_order: newOrder });
      await updateCategory(target.id, { sort_order: category.sort_order || 0 });
      const data = await getCategories();
      setCategories(data || []);
      addToast('Urutan kategori diperbarui', 'success');
    } catch (error) {
      console.error('Error reordering category:', error);
      addToast('Gagal mengubah urutan kategori', 'error');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold">Manajemen Kategori</h2>
          <span className="text-sm text-gray-500">Kelola kategori produk</span>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '', icon: '📦', parent_id: '', sort_order: 0, is_active: true }); setShowModal(true); }}
          className="bg-[#16A34A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#15803D] flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton columns={5} />
                <TableRowSkeleton columns={5} />
                <TableRowSkeleton columns={5} />
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categoryTree.length > 0 ? (
                  categoryTree.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3" style={{ paddingLeft: `${(category.depth || 0) * 24}px` }}>
                          <span className="text-2xl">{category.icon || '📦'}</span>
                          <div>
                            <span className="font-medium">{category.name}</span>
                            {category.depth > 0 && <span className="text-xs text-gray-400 ml-2">sub-kategori</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">{category.description || '-'}</td>
                      <td className="p-4">{category.product_count || 0} produk</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${category.is_active ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-gray-100 text-gray-500'}`}>
                          {category.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleMove(category, -1)}
                            className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg"
                            title="Naikkan"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleMove(category, 1)}
                            className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg"
                            title="Turunkan"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => { setEditingCategory(category); setFormData({ ...category, parent_id: category.parent_id || '' }); setShowModal(true); }}
                            className="text-[#16A34A] hover:bg-[#DCFCE7] p-2 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="w-8 h-8 text-gray-300" />
                        <p>Tidak ada kategori ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Tag className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="Perawatan Tubuh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="Deskripsi kategori..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ikon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="📦"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Induk Kategori</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                >
                  <option value="">Tanpa Induk</option>
                  {categories
                    .filter(c => c.id !== formData.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urutan</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="0"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="accent-[#16A34A] w-4 h-4"
                />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#15803D]"
                >
                  {editingCategory ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
