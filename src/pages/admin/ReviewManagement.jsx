import React, { useState, useEffect } from 'react';
import { Search, Star, Check, X, MessageSquare, Trash2, MessageCircle } from 'lucide-react';
import { getReviews, updateReviewStatus, replyReview, deleteReview, createNotificationForAdmins } from '../../lib/api';
import { formatDate } from '../../utils/formatters';
import { TableRowSkeleton } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';

export default function ReviewManagement() {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getReviews();
        setReviews(data || []);
        // Notify admin if there are pending reviews (once per day)
        const pendingReviews = (data || []).filter(r => r.status === 'pending');
        if (pendingReviews.length > 0) {
          const lastNotified = localStorage.getItem('hera_pending_reviews_notified');
          const today = new Date().toDateString();
          if (lastNotified !== today) {
            await createNotificationForAdmins(
              'Ulasan Baru Menunggu Persetujuan',
              `${pendingReviews.length} ulasan baru perlu disetujui.`,
              'review'
            );
            localStorage.setItem('hera_pending_reviews_notified', today);
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleApprove = async (reviewId) => {
    try {
      await updateReviewStatus(reviewId, 'approved');
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: 'approved' } : r));
      addToast('Ulasan berhasil disetujui', 'success');
    } catch (error) {
      console.error('Error approving review:', error);
      addToast('Gagal menyetujui ulasan', 'error');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await updateReviewStatus(reviewId, 'rejected');
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: 'rejected' } : r));
      addToast('Ulasan berhasil ditolak', 'success');
    } catch (error) {
      console.error('Error rejecting review:', error);
      addToast('Gagal menolak ulasan', 'error');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyingReview) return;
    try {
      await replyReview(replyingReview.id, replyText);
      setReviews(reviews.map(r => r.id === replyingReview.id ? { ...r, admin_reply: replyText } : r));
      setReplyingReview(null);
      setReplyText('');
      addToast('Balasan admin disimpan', 'success');
    } catch (error) {
      console.error('Error replying review:', error);
      addToast('Gagal menyimpan balasan', 'error');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) return;
    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
      addToast('Ulasan berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting review:', error);
      addToast('Gagal menghapus ulasan', 'error');
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (!searchQuery) return true;
    return (
      r.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-lg lg:text-xl font-bold">Manajemen Ulasan</h2>
          <span className="text-sm text-gray-500">Kelola ulasan produk</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari ulasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[550px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-3 lg:p-4 whitespace-nowrap">Produk</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Pelanggan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Rating</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Ulasan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Tanggal</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Status</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton columns={7} />
                <TableRowSkeleton columns={7} />
                <TableRowSkeleton columns={7} />
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[550px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-3 lg:p-4 whitespace-nowrap">Produk</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Pelanggan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Rating</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Ulasan</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Tanggal</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Status</th>
                  <th className="p-3 lg:p-4 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={review.product?.thumbnail} alt={review.product?.name || "Thumbnail Produk"} className="w-10 h-10 rounded-lg object-contain bg-gray-50" />
                          <span className="font-medium text-sm">{review.product?.name}</span>
                        </div>
                      </td>
                      <td className="p-4">{review.user?.full_name || 'User'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24]" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-[240px]">
                        <p className="text-sm text-gray-600">{review.comment}</p>
                        {review.admin_reply && (
                          <div className="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded">
                            <span className="font-semibold">Balasan admin:</span> {review.admin_reply}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-gray-500">{formatDate(review.created_at)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          review.status === 'approved' ? 'bg-green-100 text-green-700' :
                          review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {review.status === 'approved' ? 'Disetujui' : 
                           review.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="text-green-500 hover:bg-green-50 p-2 rounded-lg"
                                title="Setujui"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(review.id)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                title="Tolak"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setReplyingReview(review); setReplyText(review.admin_reply || ''); }}
                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"
                            title="Balas"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-gray-300" />
                        <p>Tidak ada ulasan ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {replyingReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Balas Ulasan</h3>
              <button onClick={() => setReplyingReview(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReplySubmit} className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-600">{replyingReview.comment}</p>
                <p className="text-xs text-gray-400 mt-1">— {replyingReview.profiles?.full_name || 'User'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Balasan Admin</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="4"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                  placeholder="Tulis balasan..."
                />
              </div>
              <div className="flex gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#15803D]"
                >
                  Simpan Balasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
