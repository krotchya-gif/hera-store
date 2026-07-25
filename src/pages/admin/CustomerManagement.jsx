import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Mail, Phone, ShoppingBag, Download } from 'lucide-react';
import { getAllUsers } from '../../lib/api';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { exportCustomersToCSV } from '../../utils/exportUtils';
import { TableRowSkeleton } from '../../components/Skeleton';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (c.full_name && c.full_name.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.phone && c.phone.toLowerCase().includes(query))
    );
  });

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      super_admin: 'bg-red-100 text-red-700',
      customer: 'bg-blue-100 text-blue-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      super_admin: 'Super Admin',
      customer: 'Pelanggan',
    };
    return labels[role] || role;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold">Manajemen Pelanggan</h2>
          <span className="text-sm text-gray-500">{customers.length} Pelanggan</span>
        </div>
        <button
          onClick={() => exportCustomersToCSV(filteredCustomers)}
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
            placeholder="Cari nama, email, atau telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-3 lg:p-4 whitespace-nowrap">Pelanggan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Kontak</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Role</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Bergabung</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton columns={5} />
                <TableRowSkeleton columns={5} />
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
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-3 lg:p-4 whitespace-nowrap">Pelanggan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Kontak</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Role</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Bergabung</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#16A34A] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {customer.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{customer.full_name || 'User'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{customer.email || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(customer.role)}`}>
                          {getRoleLabel(customer.role)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{formatDate(customer.created_at)}</td>
                      <td className="p-4">
                        <button className="text-[#16A34A] text-sm hover:underline">Detail</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="w-8 h-8 text-gray-300" />
                        <p>Tidak ada pelanggan ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t text-xs text-gray-500">
            <span>{customers.length} pelanggan</span>
          </div>
        </div>
      )}
    </>
  );
}
