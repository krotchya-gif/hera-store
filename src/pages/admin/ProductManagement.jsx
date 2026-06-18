import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, Filter, Download } from 'lucide-react';
import { getProducts, deleteProduct } from '../../lib/api';
import { formatRupiah } from '../../utils/formatters';
import { exportProductsToCSV } from '../../utils/exportUtils';
import ProductModal from './ProductModal';
import { useToast } from '../../context/ToastContext';

export default function ProductManagement() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const itemsPerPage = 10;

  const filterOptions = ['Semua', 'Aktif', 'Nonaktif', 'Habis'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filters = {
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        };
        if (searchQuery) filters.search = searchQuery;

        const data = await getProducts(filters);
        setProducts(data || []);
        setTotalCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, searchQuery, activeFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      addToast('Produk berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      addToast('Gagal menghapus produk', 'error');
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    addToast('Daftar produk berhasil diperbarui', 'success');
    // Refresh product list
    const fetchProducts = async () => {
      try {
        const filters = {
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        };
        if (searchQuery) filters.search = searchQuery;
        const data = await getProducts(filters);
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  };

  const filteredProducts = activeFilter === 'Semua'
    ? products
    : products.filter(p => {
        if (activeFilter === 'Aktif') return p.status === 'active' || p.status === true;
        if (activeFilter === 'Nonaktif') return p.status === 'inactive' || p.status === false;
        if (activeFilter === 'Habis') return p.stock <= 0;
        return true;
      });

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold">Manajemen Produk</h2>
          <span className="text-sm text-gray-500">{totalCount} Produk</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportProductsToCSV(products)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handleAdd}
            className="bg-[#16A34A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#15803D] flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
          />
        </div>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none">
          <option>Semua Kategori</option>
        </select>
        <div className="flex gap-1 overflow-x-auto">
          {filterOptions.map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                s === activeFilter ? 'bg-[#16A34A] text-white' : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s}
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
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-4"><input type="checkbox" className="accent-[#16A34A]" /></th>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Terjual</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="p-4"><input type="checkbox" className="accent-[#16A34A]" /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.thumbnail} alt="" className="w-12 h-12 rounded-lg object-contain bg-gray-50 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-xs text-gray-400">SKU: {p.sku || `TRG-${p.id.toString().padStart(4, '0')}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{p.categories?.name || p.category || '-'}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{formatRupiah(p.price)}</p>
                        {p.original_price && <p className="text-xs text-gray-400 line-through">{formatRupiah(p.original_price)}</p>}
                      </td>
                      <td className="p-4">
                        <span className={p.stock < 10 ? 'text-red-500 font-medium' : ''}>{p.stock}</span>
                        {p.stock < 10 && (
                          <div className="w-16 h-1 bg-red-200 rounded-full mt-1">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.max(5, (p.stock/100)*100)}%` }}></div>
                          </div>
                        )}
                      </td>
                      <td className="p-4">{p.sold_count || 0}</td>
                      <td className="p-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={p.status === 'active' || p.status === true} className="sr-only peer" readOnly />
                          <div className="w-9 h-5 bg-gray-300 peer-checked:bg-[#16A34A] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(p)} className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="w-8 h-8 text-gray-300" />
                        <p>Tidak ada produk ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between border-t text-sm text-gray-500 gap-3">
            <span>Showing {filteredProducts.length} of {totalCount}</span>
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
                disabled={filteredProducts.length < itemsPerPage}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}
