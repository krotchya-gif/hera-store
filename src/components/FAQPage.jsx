import React, { useState, useMemo } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Search, X, MessageCircle } from 'lucide-react';

const faqData = [
  {
    category: 'Pembelian',
    emoji: '🛒',
    faqs: [
      {
        question: 'Bagaimana cara membuat pesanan?',
        answer: 'Pilih produk yang Anda inginkan, klik "+ Keranjang", lalu klik tombol "Checkout". Ikuti langkah alamat pengiriman, metode pengiriman, dan pembayaran. Mudah dan cepat!'
      },
      {
        question: 'Bisakah saya membatalkan pesanan?',
        answer: 'Pesanan bisa dibatalkan selama statusnya masih "Menunggu Pembayaran". Setelah pembayaran dikonfirmasi, pembatalan tidak bisa dilakukan. Hubungi customer service kami untuk bantuan lebih lanjut.'
      },
      {
        question: 'Bagaimana cara menggunakan voucher?',
        answer: 'Masukkan kode voucher pada kolom "Kode Promo" di halaman keranjang atau checkout. Diskon akan otomatis diterapkan jika voucher valid dan memenuhi syarat minimum pembelanjaan.'
      },
      {
        question: 'Apakah saya bisa mengubah pesanan setelah dikirim?',
        answer: 'Sayangnya, pesanan yang sudah dalam proses pengiriman tidak bisa diubah. Anda bisa menghubungi kurir langsung atau menunggu paket tiba lalu mengajukan retur jika diperlukan.'
      },
    ]
  },
  {
    category: 'Pembayaran',
    emoji: '💳',
    faqs: [
      {
        question: 'Metode pembayaran apa saja yang tersedia?',
        answer: 'Kami menerima Transfer Bank (BCA, Mandiri, BRI), E-Wallet (GoPay, OVO, DANA, ShopeePay), Virtual Account, COD (Bayar di Tempat), dan Kartu Kredit/Debit.'
      },
      {
        question: 'Berapa lama batas waktu pembayaran?',
        answer: 'Setelah pesanan dibuat, Anda memiliki waktu 24 jam untuk menyelesaikan pembayaran. Lewat dari itu, pesanan akan otomatis dibatalkan.'
      },
      {
        question: 'Apakah data pembayaran saya aman?',
        answer: 'Ya, keamanan data Anda adalah prioritas kami. Semua transaksi menggunakan enkripsi SSL dan sistem keamanan berlapis. Kami tidak menyimpan data kartu kredit Anda.'
      },
    ]
  },
  {
    category: 'Pengiriman',
    emoji: '🚚',
    faqs: [
      {
        question: 'Berapa lama waktu pengiriman?',
        answer: 'Waktu pengiriman tergantung lokasi dan kurir yang dipilih. Umumnya 1-3 hari kerja untuk kota besar, dan 3-7 hari kerja untuk luar kota. Same-day delivery tersedia di area tertentu.'
      },
      {
        question: 'Apakah ada gratis ongkir?',
        answer: 'Ya! Gratis ongkir untuk pembelanjaan minimal Rp100.000. Kami juga sering mengadakan promo gratis ongkir tanpa minimum. Cek halaman Promo untuk penawaran terkini.'
      },
      {
        question: 'Bagaimana cara melacak pesanan saya?',
        answer: 'Lacak pesanan melalui menu Profil → Pesanan Saya. Klik pesanan yang ingin dilacak untuk melihat nomor resi dan status terkini. Anda juga bisa melacak langsung di website kurir.'
      },
      {
        question: 'Apa yang terjadi jika tidak ada di rumah saat paket tiba?',
        answer: 'Kurir biasanya akan meninggalkan pemberitahuan dan mencoba pengiriman ulang. Anda juga bisa mengatur pengambilan di kantor pos atau titik pengiriman terdekat.'
      },
    ]
  },
  {
    category: 'Pengembalian',
    emoji: '🔄',
    faqs: [
      {
        question: 'Apakah bisa mengembalikan produk?',
        answer: 'Ya! Kami memiliki kebijakan pengembalian dalam 14 hari. Produk harus dalam kondisi asli, belum digunakan, dan kemasan masih utuh. Hubungi customer service dengan foto produk untuk memulai proses retur.'
      },
      {
        question: 'Bagaimana jika produk yang diterima rusak atau salah?',
        answer: 'Segera hubungi kami dalam 24 jam setelah penerimaan dengan melampirkan foto/video produk. Kami akan mengganti produk atau mengembalikan dana sepenuhnya.'
      },
      {
        question: 'Berapa lama proses pengembalian dana?',
        answer: 'Setelah produk diterima dan diverifikasi, dana akan dikembalikan dalam 3-7 hari kerja ke metode pembayaran asal Anda. E-wallet biasanya lebih cepat dibanding transfer bank.'
      },
    ]
  },
  {
    category: 'Akun',
    emoji: '👤',
    faqs: [
      {
        question: 'Bagaimana cara mendaftar akun?',
        answer: 'Klik tombol "Masuk" di pojok kanan atas, lalu pilih "Daftar Sekarang". Isi email dan buat kata sandi. Verifikasi email Anda dan akun siap digunakan!'
      },
      {
        question: 'Lupa kata sandi, bagaimana cara mengatasinya?',
        answer: 'Klik "Masuk" → "Lupa Kata Sandi". Masukkan email Anda dan kami akan kirimkan link untuk membuat kata sandi baru. Cek folder spam jika email tidak masuk dalam 5 menit.'
      },
      {
        question: 'Bagaimana cara menghubungi customer service?',
        answer: 'Tim support kami bisa dihubungi via:\n• Live Chat di website (ikon chat di kanan bawah)\n• Email: support@herastore.com\n• WhatsApp: 0812-3456-7890\n• Jam operasional: Senin–Sabtu, 08.00–21.00 WIB'
      },
    ]
  },
];

export default function FAQPage({ setCurrentPage }) {
  const [openKey, setOpenKey] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const allFaqs = useMemo(() => {
    return faqData.flatMap(cat =>
      cat.faqs.map(faq => ({ ...faq, category: cat.category, emoji: cat.emoji }))
    );
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allFaqs.filter(faq => {
      const matchSearch = !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      const matchCategory = activeCategory === 'Semua' || faq.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory, allFaqs]);

  const toggleFaq = (key) => setOpenKey(openKey === key ? null : key);

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#16A34A] to-[#15803D] py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-green-100 hover:text-white mb-6 mx-auto transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Kembali ke Beranda</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Pusat Bantuan</h1>
          <p className="text-green-100 mb-8">Temukan jawaban untuk pertanyaan yang sering diajukan</p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pertanyaan... (mis. pengiriman, retur, voucher)"
              className="w-full bg-white pl-12 pr-10 py-4 rounded-2xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
          {['Semua', ...faqData.map(c => c.category)].map((cat) => {
            const catData = faqData.find(c => c.category === cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition font-medium ${
                  activeCategory === cat
                    ? 'bg-[#16A34A] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {catData && <span>{catData.emoji}</span>}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        {search && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length > 0
              ? `Ditemukan ${filtered.length} hasil untuk "${search}"`
              : `Tidak ada hasil untuk "${search}"`}
          </p>
        )}

        {/* FAQ List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">Pertanyaan tidak ditemukan</p>
            <p className="text-gray-400 text-sm mb-6">Coba kata kunci lain atau hubungi tim kami</p>
            <button
              onClick={() => setCurrentPage('contact')}
              className="flex items-center gap-2 bg-[#16A34A] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15803D] transition mx-auto"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi Kami
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, idx) => {
              const key = `${faq.category}-${idx}`;
              const isOpen = openKey === key;
              return (
                <div
                  key={key}
                  className={`bg-white rounded-2xl shadow-sm border transition-all ${
                    isOpen ? 'border-green-200 shadow-md' : 'border-gray-100'
                  }`}
                >
                  {/* Category badge */}
                  {search && (
                    <div className="px-4 pt-3 pb-0">
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {faq.emoji} {faq.category}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => toggleFaq(key)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-gray-800 text-sm leading-relaxed pr-4">
                      {highlightText(faq.question, search)}
                    </span>
                    {isOpen
                      ? <ChevronUp className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
                      : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {highlightText(faq.answer, search)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still need help */}
        <div className="mt-10 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <MessageCircle className="w-8 h-8 text-[#16A34A] mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-1">Masih butuh bantuan?</h3>
          <p className="text-sm text-gray-500 mb-4">Tim customer service kami siap membantu Anda</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setCurrentPage('contact')}
              className="bg-[#16A34A] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15803D] transition"
            >
              Hubungi Kami
            </button>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-50 text-[#16A34A] border border-green-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-100 transition"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
