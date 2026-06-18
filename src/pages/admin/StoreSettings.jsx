import React, { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSettings, getAllUsers, updateUserRole, getAdminInvitations, createAdminInvitation, updateInvitationStatus } from '../../lib/api';
import { formatRupiah } from '../../utils/formatters';
import { Search, UserCheck, Shield } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StatCardSkeleton } from '../../components/Skeleton';

export default function StoreSettings() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('info');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');
  const [inviting, setInviting] = useState(false);

  const tabs = [
    { id: 'info', label: 'Informasi Toko' },
    { id: 'shipping', label: 'Pengiriman' },
    { id: 'payment', label: 'Pembayaran' },
    { id: 'notification', label: 'Notifikasi' },
    { id: 'admin', label: 'Admin & Hak Akses' },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getStoreSettings();
        setSettings(data || {});
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await getAllUsers();
        setAdmins(data.filter(u => u.role === 'admin' || u.role === 'super_admin'));
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };
    const fetchInvitations = async () => {
      try {
        const data = await getAdminInvitations();
        setInvitations(data || []);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    };
    fetchAdmins();
    fetchInvitations();
  }, []);

  const handleSearchUser = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await getAllUsers();
      const filtered = data.filter(u =>
        (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        u.role === 'customer'
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setUpdatingRole(true);
      await updateUserRole(userId, newRole);
      setAdmins(admins.map(a => a.id === userId ? { ...a, role: newRole } : a));
      setSearchResults(searchResults.filter(u => u.id !== userId));
      addToast('Role berhasil diperbarui!', 'success');
    } catch (error) {
      console.error('Error updating role:', error);
      addToast('Gagal memperbarui role.', 'error');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const invitation = await createAdminInvitation({ email: inviteEmail.trim(), role: inviteRole });
      setInvitations([invitation, ...invitations]);
      setInviteEmail('');
      addToast(`Undangan dikirim ke ${invitation.email}`, 'success');
    } catch (error) {
      console.error('Error creating invitation:', error);
      addToast('Gagal membuat undangan admin', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (id) => {
    try {
      await updateInvitationStatus(id, 'expired');
      setInvitations(invitations.map(inv => inv.id === id ? { ...inv, status: 'expired' } : inv));
      addToast('Undangan dibatalkan', 'success');
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      addToast('Gagal membatalkan undangan', 'error');
    }
  };

  const handleSave = async (updates) => {
    try {
      setSaving(true);
      await updateStoreSettings(updates);
      setSettings({ ...settings, ...updates });
      addToast('Perubahan berhasil disimpan!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast('Gagal menyimpan perubahan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  const defaultSettings = {
    store_name: 'Hera Store',
    description: 'Marketplace produk rumah tangga premium',
    email: 'admin@herastore.com',
    phone: '6281234567890',
    free_shipping_min: 100000,
    ...settings
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex gap-4 border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id ? 'border-b-2 border-[#16A34A] text-[#16A34A]' : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="mb-4 bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Toko</label>
            <input
              type="text"
              defaultValue={defaultSettings.store_name}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Toko</label>
            <textarea
              rows="4"
              defaultValue={defaultSettings.description}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
            ></textarea>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Toko</label>
              <input
                type="email"
                defaultValue={defaultSettings.email}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No. WhatsApp</label>
              <input
                type="text"
                defaultValue={defaultSettings.phone}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              />
            </div>
          </div>
          <button
            onClick={() => handleSave({
              store_name: document.querySelector('input[type="text"]').value,
              description: document.querySelector('textarea').value,
              email: document.querySelectorAll('input[type="email"]')[0].value,
              phone: document.querySelectorAll('input[type="text"]')[1].value,
            })}
            disabled={saving}
            className="bg-[#16A34A] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#15803D] disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      )}

      {activeTab === 'shipping' && (
        <div className="space-y-4 max-w-2xl">
          <h3 className="font-semibold">Kurir Tersedia</h3>
          {['JNE', 'J&T', 'SiCepat', 'Gosend', 'Anteraja'].map((courier) => (
            <div key={courier} className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">{courier}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-checked:bg-[#16A34A] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Gratis Ongkir (Min. {formatRupiah(defaultSettings.free_shipping_min)})</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-300 peer-checked:bg-[#16A34A] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-4 max-w-2xl">
          <h3 className="font-semibold">Metode Pembayaran</h3>
          {['Transfer Bank', 'GoPay', 'OVO', 'Dana', 'ShopeePay', 'Virtual Account', 'COD'].map((method) => (
            <div key={method} className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">{method}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-checked:bg-[#16A34A] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notification' && (
        <div className="space-y-4 max-w-2xl">
          <h3 className="font-semibold">Notifikasi Email & WhatsApp</h3>
          {['Pesanan baru masuk', 'Pembayaran diterima', 'Stok produk menipis', 'Ulasan baru masuk', 'Pertanyaan Q&A baru'].map((event) => (
            <div key={event} className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">{event}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-300 peer-checked:bg-[#16A34A] rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="space-y-6">
          {/* Invite Admin */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="font-semibold mb-4">Undang Admin Baru</h3>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="email"
                required
                placeholder="Email calon admin..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <button
                type="submit"
                disabled={inviting}
                className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#15803D] disabled:opacity-50"
              >
                {inviting ? 'Mengirim...' : 'Kirim Undangan'}
              </button>
            </form>

            <h4 className="text-sm font-semibold mb-3">Atau tambahkan user yang sudah terdaftar</h4>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari user berdasarkan email atau nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                />
              </div>
              <button
                onClick={handleSearchUser}
                className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#15803D]"
              >
                Cari
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateRole(user.id, 'admin')}
                      disabled={updatingRole}
                      className="bg-[#16A34A] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#15803D] disabled:opacity-50 flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" /> Jadikan Admin
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">User tidak ditemukan atau sudah admin.</p>
            )}
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Undangan Tertunda</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Kadaluarsa</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv) => (
                      <tr key={inv.id} className="border-b">
                        <td className="p-3">{inv.email}</td>
                        <td className="p-3 capitalize">{inv.role}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {inv.status === 'pending' ? 'Menunggu' : inv.status === 'accepted' ? 'Diterima' : 'Kadaluarsa'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">{new Date(inv.expires_at).toLocaleDateString('id-ID')}</td>
                        <td className="p-3">
                          {inv.status === 'pending' && (
                            <button
                              onClick={() => handleCancelInvitation(inv.id)}
                              className="text-red-500 text-sm hover:underline"
                            >
                              Batalkan
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin List */}
          <div>
            <h3 className="font-semibold mb-4">Daftar Admin</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="p-3">Admin</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {admin.full_name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <span className="font-medium">{admin.full_name || 'Admin'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{admin.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          admin.role === 'super_admin' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="p-3">
                        {admin.role !== 'super_admin' && (
                          <button
                            onClick={() => handleUpdateRole(admin.id, 'customer')}
                            className="text-red-500 text-sm hover:underline"
                          >
                            Hapus Akses
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Shield className="w-8 h-8 text-gray-300" />
                          <p>Belum ada admin</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
