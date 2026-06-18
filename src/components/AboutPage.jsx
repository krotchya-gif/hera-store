import React, { useState } from 'react';
import { ArrowLeft, Leaf, Truck, Shield, Headphones, Heart, Star, Users, Package, ShoppingBag, CheckCircle, Target, Eye, Award, MapPin, Phone, Mail } from 'lucide-react';

const teamMembers = [
  {
    name: 'Hera Wijayanti',
    role: 'CEO & Pendiri',
    description: 'Berpengalaman 10+ tahun di industri e-commerce Indonesia.',
    avatar: 'HW',
    color: 'bg-green-100 text-green-700'
  },
  {
    name: 'Bagas Pratama',
    role: 'CTO',
    description: 'Memimpin pengembangan platform teknologi Hera Store.',
    avatar: 'BP',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    name: 'Siti Rahayu',
    role: 'Head of Operations',
    description: 'Memastikan pengiriman dan logistik berjalan lancar setiap hari.',
    avatar: 'SR',
    color: 'bg-purple-100 text-purple-700'
  },
  {
    name: 'Deni Kurniawan',
    role: 'Head of Marketing',
    description: 'Strategi pemasaran kreatif untuk menjangkau lebih banyak pelanggan.',
    avatar: 'DK',
    color: 'bg-orange-100 text-orange-700'
  }
];

const milestones = [
  { year: '2022', title: 'Ide Lahir', desc: 'Hera Wijayanti melihat kebutuhan marketplace produk rumah tangga berkualitas yang belum terpenuhi di Indonesia.' },
  { year: '2023', title: 'Hera Store Diluncurkan', desc: 'Platform resmi diluncurkan dengan 500 produk pilihan dan 50 mitra terpercaya.' },
  { year: '2024', title: 'Ekspansi Nasional', desc: 'Jangkauan pengiriman diperluas ke seluruh 34 provinsi Indonesia dengan 10.000+ pelanggan aktif.' },
  { year: '2025', title: 'Penghargaan & Kepercayaan', desc: 'Meraih penghargaan "Best E-Commerce Platform 2025" dan mencapai 50.000+ transaksi sukses.' },
  { year: '2026', title: 'Hari Ini', desc: 'Lebih dari 3.200 pelanggan setia, 1.500+ produk tersedia, dan terus berkembang setiap harinya.' }
];

const stats = [
  { icon: <Users className="w-7 h-7" />, value: '3.200+', label: 'Pelanggan Aktif', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: <Package className="w-7 h-7" />, value: '1.500+', label: 'Produk Tersedia', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: <ShoppingBag className="w-7 h-7" />, value: '50.000+', label: 'Transaksi Sukses', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: <Star className="w-7 h-7" />, value: '4.8/5', label: 'Rating Kepuasan', color: 'text-yellow-600', bg: 'bg-yellow-50' }
];

const values = [
  {
    icon: <Shield className="w-6 h-6 text-green-600" />,
    title: 'Kepercayaan',
    desc: 'Setiap produk telah melalui kurasi ketat. Kami hanya menjual yang benar-benar berkualitas dan original.',
    bg: 'bg-green-50'
  },
  {
    icon: <Heart className="w-6 h-6 text-red-500" />,
    title: 'Kepedulian',
    desc: 'Kami peduli pada kepuasan Anda. Customer service kami siap 24/7 untuk membantu setiap kebutuhan.',
    bg: 'bg-red-50'
  },
  {
    icon: <Truck className="w-6 h-6 text-blue-500" />,
    title: 'Kecepatan',
    desc: 'Pesanan diproses cepat dan dikirim oleh kurir-kurir terpercaya ke seluruh penjuru Indonesia.',
    bg: 'bg-blue-50'
  },
  {
    icon: <Award className="w-6 h-6 text-yellow-500" />,
    title: 'Kualitas',
    desc: 'Standar kualitas tinggi bukan hanya pada produk, tapi juga di setiap aspek layanan yang kami berikan.',
    bg: 'bg-yellow-50'
  }
];

export default function AboutPage({ setCurrentPage }) {
  const [activeTab, setActiveTab] = useState('cerita');

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-green-100 hover:text-white mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Kembali ke Beranda</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Tentang Hera Store</h1>
              <p className="text-green-100 mt-1">Marketplace Produk Rumah Tangga Premium Indonesia</p>
            </div>
          </div>

          <p className="text-green-50 text-lg leading-relaxed max-w-2xl">
            Kami hadir untuk memenuhi kebutuhan rumah tangga Anda dengan produk-produk berkualitas tinggi, harga terjangkau, dan layanan yang terpercaya.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 text-center border border-gray-100">
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { id: 'cerita', label: '📖 Cerita Kami' },
              { id: 'tim', label: '👥 Tim Kami' },
              { id: 'timeline', label: '🗓️ Perjalanan' },
              { id: 'nilai', label: '💚 Nilai Kami' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'text-[#16A34A] border-b-2 border-[#16A34A] bg-green-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">

            {/* Tab: Cerita Kami */}
            {activeTab === 'cerita' && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Siapa Kami?</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      <strong>Hera Store</strong> adalah marketplace produk rumah tangga yang lahir dari keyakinan sederhana: setiap keluarga Indonesia berhak mendapatkan produk berkualitas tanpa harus merogoh kocek terlalu dalam.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Kami memulai perjalanan dari sebuah toko kecil di Jakarta, dengan tekad besar untuk menghadirkan produk-produk pilihan — mulai dari perawatan tubuh, kebersihan rumah, hingga kesehatan keluarga — langsung ke tangan Anda.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Kini, Hera Store telah melayani ribuan pelanggan di seluruh Indonesia dengan lebih dari 1.500 produk pilihan yang telah melalui seleksi kualitas ketat dari tim ahli kami.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                    <div className="text-center mb-6">
                      <div className="bg-[#16A34A] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Leaf className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-[#16A34A]">Visi Kami</h3>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <Eye className="w-5 h-5 text-[#16A34A] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Menjadi marketplace produk rumah tangga <strong>paling terpercaya</strong> dan <strong>paling dicintai</strong> oleh keluarga Indonesia.
                      </p>
                    </div>
                    <hr className="border-green-200 my-4" />
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-[#16A34A]">Misi Kami</h3>
                    </div>
                    <ul className="space-y-3">
                      {[
                        'Menghadirkan produk berkualitas dengan harga yang adil',
                        'Memberikan pengalaman belanja yang mudah, aman, dan menyenangkan',
                        'Melayani setiap pelanggan dengan sepenuh hati',
                        'Mendukung UMKM lokal Indonesia untuk berkembang bersama'
                      ].map((misi, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#16A34A] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{misi}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Kontak Info */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Informasi Kontak</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: <MapPin className="w-5 h-5 text-[#16A34A]" />, label: 'Alamat', value: 'Jl. Raya No. 123, Jakarta Selatan, DKI Jakarta 12345' },
                      { icon: <Phone className="w-5 h-5 text-[#16A34A]" />, label: 'Telepon', value: '0812-3456-7890 (WhatsApp)' },
                      { icon: <Mail className="w-5 h-5 text-[#16A34A]" />, label: 'Email', value: 'support@herastore.com' }
                    ].map((info, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">{info.icon}</div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">{info.label}</p>
                          <p className="text-sm font-medium text-gray-800">{info.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Tim Kami */}
            {activeTab === 'tim' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Tim di Balik Hera Store</h2>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Orang-orang berdedikasi yang bekerja keras setiap hari untuk memastikan pengalaman belanja terbaik bagi Anda.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {teamMembers.map((member, i) => (
                    <div key={i} className="text-center group">
                      <div className={`w-20 h-20 rounded-2xl ${member.color} flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-105 transition-transform`}>
                        {member.avatar}
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm">{member.name}</h3>
                      <p className="text-xs text-[#16A34A] font-medium mb-2">{member.role}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{member.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-10 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 text-center">
                  <Target className="w-8 h-8 text-[#16A34A] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Bergabunglah Bersama Kami</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Kami selalu mencari individu yang bersemangat dan berbakat untuk bergabung dalam tim Hera Store.
                  </p>
                  <button
                    onClick={() => setCurrentPage('contact')}
                    className="bg-[#16A34A] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15803D] transition"
                  >
                    Hubungi Kami
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Perjalanan / Timeline */}
            {activeTab === 'timeline' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Perjalanan Hera Store</h2>
                  <p className="text-gray-500 text-sm">Dari mimpi kecil hingga menjadi kepercayaan ribuan keluarga Indonesia.</p>
                </div>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-200 hidden sm:block" />
                  <div className="space-y-6">
                    {milestones.map((m, i) => (
                      <div key={i} className="flex gap-6 items-start">
                        <div className="flex-shrink-0 relative z-10">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${
                            i === milestones.length - 1
                              ? 'bg-[#16A34A] text-white'
                              : 'bg-white border-2 border-green-300 text-[#16A34A]'
                          }`}>
                            {m.year.slice(2)}
                          </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{m.year}</span>
                            <h3 className="font-semibold text-gray-800">{m.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Nilai Kami */}
            {activeTab === 'nilai' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Nilai-Nilai yang Kami Pegang</h2>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Setiap keputusan yang kami ambil selalu berlandaskan nilai-nilai ini demi kebaikan pelanggan dan masyarakat.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {values.map((v, i) => (
                    <div key={i} className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition">
                      <div className={`${v.bg} p-3 rounded-xl h-fit flex-shrink-0`}>
                        {v.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">{v.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8 bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-2xl p-8 text-center text-white">
                  <Leaf className="w-10 h-10 mx-auto mb-4 text-green-200" />
                  <h3 className="text-xl font-bold mb-2">Siap Mulai Berbelanja?</h3>
                  <p className="text-green-100 text-sm mb-6">
                    Temukan ribuan produk rumah tangga pilihan dengan harga terbaik. Dijamin puas!
                  </p>
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="bg-white text-[#16A34A] px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
                  >
                    Jelajahi Produk Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="pb-12" />
    </div>
  );
}
