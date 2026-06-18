import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Send, Lock, ThumbsUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// API helpers with graceful fallback
// ─────────────────────────────────────────────
const getProductQnA = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_qna')
      .select('*, profiles(full_name, avatar)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
};

const createQuestion = async (payload) => {
  const { data, error } = await supabase
    .from('product_qna')
    .insert(payload)
    .select('*, profiles(full_name, avatar)')
    .single();
  if (error) throw error;
  return data;
};

const upvoteQuestion = async (id, current) => {
  const { data, error } = await supabase
    .from('product_qna')
    .update({ helpful_count: current + 1 })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ─────────────────────────────────────────────
// Mock Q&A data shown when table is empty/missing
// ─────────────────────────────────────────────
const getMockQnA = (productName) => [
  {
    id: 'mock-1',
    question: `Apakah ${productName} aman untuk kulit sensitif?`,
    answer: 'Ya, produk ini telah dermatologically tested dan aman untuk semua jenis kulit termasuk sensitif. Namun jika ada reaksi tidak wajar, segera hentikan pemakaian.',
    profiles: { full_name: 'Siti R***' },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    helpful_count: 12,
    is_answered: true,
    isMock: true,
  },
  {
    id: 'mock-2',
    question: 'Berapa lama produk ini bisa bertahan setelah dibuka?',
    answer: 'Setelah dibuka, produk ini dapat bertahan 12 bulan jika disimpan di tempat sejuk dan terhindar dari paparan sinar matahari langsung.',
    profiles: { full_name: 'Budi W***' },
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    helpful_count: 8,
    is_answered: true,
    isMock: true,
  },
  {
    id: 'mock-3',
    question: 'Apakah tersedia dalam ukuran yang lebih besar?',
    answer: null,
    profiles: { full_name: 'Dewi A***' },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    helpful_count: 3,
    is_answered: false,
    isMock: true,
  },
];

const formatRelativeDate = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
};

// ─────────────────────────────────────────────
// Q&A Item
// ─────────────────────────────────────────────
function QnAItem({ item, onUpvote }) {
  const [expanded, setExpanded] = useState(item.is_answered ? false : true);
  const [voted, setVoted] = useState(false);

  const handleUpvote = async () => {
    if (voted || item.isMock) return;
    setVoted(true);
    onUpvote(item.id, item.helpful_count);
  };

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm transition">
      {/* Question header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between p-4 text-left bg-white hover:bg-gray-50 transition"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
            {item.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-800 text-sm leading-relaxed">{item.question}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400">{item.profiles?.full_name || 'Pengguna'}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">{formatRelativeDate(item.created_at)}</span>
              {item.is_answered ? (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle className="w-3 h-3" /> Terjawab
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                  <Clock className="w-3 h-3" /> Menunggu jawaban
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); handleUpvote(); }}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition ${
              voted ? 'bg-green-50 border-green-300 text-green-600' : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{item.helpful_count}</span>
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Answer */}
      {expanded && item.answer && (
        <div className="bg-green-50 border-t border-green-100 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              HS
            </div>
            <div>
              <p className="text-xs font-semibold text-[#16A34A] mb-1">Hera Store Official</p>
              <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
            </div>
          </div>
        </div>
      )}
      {expanded && !item.answer && (
        <div className="bg-yellow-50 border-t border-yellow-100 px-4 py-3">
          <p className="text-xs text-yellow-700 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Tim Hera Store akan segera menjawab pertanyaan ini.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main ProductQnA Component
// ─────────────────────────────────────────────
export default function ProductQnA({ productId, productName }) {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const [qnaList, setQnaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [usingMock, setUsingMock] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchQnA = async () => {
      setLoading(true);
      const data = await getProductQnA(productId);
      if (data.length === 0) {
        setQnaList(getMockQnA(productName));
        setUsingMock(true);
      } else {
        setQnaList(data);
        setUsingMock(false);
      }
      setLoading(false);
    };
    if (productId) fetchQnA();
  }, [productId, productName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (question.trim().length < 10) {
      addToast('Pertanyaan minimal 10 karakter', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const newItem = await createQuestion({
        product_id: productId,
        user_id: user.id,
        question: question.trim(),
        is_answered: false,
        helpful_count: 0,
      });
      setQnaList(prev => [newItem, ...prev]);
      setQuestion('');
      setUsingMock(false);
      addToast('Pertanyaan berhasil dikirim! Tim kami akan segera menjawab.', 'success');
    } catch {
      addToast('Gagal mengirim pertanyaan. Silakan coba lagi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id, currentCount) => {
    try {
      const updated = await upvoteQuestion(id, currentCount);
      setQnaList(prev => prev.map(q => q.id === id ? { ...q, helpful_count: updated.helpful_count } : q));
    } catch { /* silent */ }
  };

  const displayList = showAll ? qnaList : qnaList.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#16A34A]" />
          <h3 className="font-semibold text-gray-800">Tanya Jawab</h3>
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {qnaList.length} pertanyaan
          </span>
        </div>
        {usingMock && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Contoh data
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Form kirim pertanyaan */}
        {user ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white font-semibold text-sm flex items-center justify-center flex-shrink-0">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Tulis pertanyaan Anda tentang produk ini..."
                  rows={3}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                  maxLength={500}
                />
              </div>
              <div className="flex items-center justify-between pl-11">
                <span className="text-xs text-gray-400">{question.length}/500 karakter</span>
                <button
                  type="submit"
                  disabled={submitting || !question.trim()}
                  className="flex items-center gap-2 bg-[#16A34A] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting ? 'Mengirim...' : 'Kirim Pertanyaan'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 pl-1">
              Pertanyaan akan ditinjau sebelum ditampilkan. Harap tidak menyertakan informasi pribadi.
            </p>
          </form>
        ) : (
          <div className="mb-6 bg-gray-50 rounded-2xl p-5 border border-gray-200 text-center">
            <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">Masuk untuk mengajukan pertanyaan</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : qnaList.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada pertanyaan</p>
            <p className="text-gray-400 text-sm mt-1">Jadilah yang pertama bertanya tentang produk ini!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayList.map(item => (
                <QnAItem key={item.id} item={item} onUpvote={handleUpvote} />
              ))}
            </div>
            {qnaList.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-4 py-3 text-sm font-medium text-[#16A34A] border border-green-200 rounded-xl hover:bg-green-50 transition flex items-center justify-center gap-2"
              >
                {showAll ? (
                  <><ChevronUp className="w-4 h-4" /> Tampilkan Lebih Sedikit</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> Lihat Semua {qnaList.length} Pertanyaan</>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
