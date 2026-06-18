import React from 'react';
import { ArrowLeft, RefreshCw, Package, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';

const returnSteps = [
  {
    icon: <Package className="w-6 h-6 text-blue-500" />,
    title: 'Ajukan Pengembalian',
    description: 'Masuk ke halaman "Pesanan Saya" dan pilih pesanan yang ingin dikembalikan. Klik tombol "Ajukan Pengembalian".'
  },
  {
    icon: <Clock className="w-6 h-6 text-yellow-500" />,
    title: 'Tunggu Konfirmasi',
    description: 'Tim kami akan meninjau pengajuan Anda dalam 1-2 hari kerja. Anda akan menerima notifikasi via email.'
  },
  {
    icon: <Truck className="w-6 h-6 text-purple-500" />,
    title: 'Kirim Produk',
    description: 'Setelah disetujui, kirim produk kembali ke alamat yang kami berikan dengan kondisi asli dan kemasan utuh.'
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    title: 'Pengembalian Dana',
    description: 'Dana akan dikembalikan dalam 3-5 hari kerja ke metode pembayaran asli atau sebagai kredit toko.'
  }
];

const returnPolicy = [
  {
    title: 'Waktu Pengembalian',
    content: 'Produk dapat dikembalikan dalam waktu 14 hari sejak tanggal penerimaan.'
  },
  {
    title: 'Kondisi Produk',
    content: 'Produk harus dalam kondisi asli, belum digunakan, dan kemasan masih utuh. Semua label dan tag harus masih terpasang.'
  },
  {
    title: 'Produk yang Tidak Dapat Dikembalikan',
    content: 'Produk pribadi (pakaian dalam, kaus kaki), produk digital, voucher, dan produk yang sudah dibuka/digunakan tidak dapat dikembalikan demi alasan kesehatan dan keamanan.'
  },
  {
    title: 'Biaya Pengembalian',
    content: 'Biaya pengiriman pengembalian ditanggung oleh pembeli, kecuali jika produk yang diterima rusak atau salah kirim.'
  },
  {
    title: 'Metode Pengembalian Dana',
    content: 'Dana dapat dikembalikan ke metode pembayaran asli, transfer bank, atau sebagai kredit toko yang dapat digunakan untuk pembelian berikutnya.'
  }
];

export default function ReturnsPage({ setCurrentPage }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Pengembalian & Refund</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#16A34A]/10 p-3 rounded-xl">
            <RefreshCw className="w-8 h-8 text-[#16A34A]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#16A34A]">Kebijakan Pengembalian</h2>
            <p className="text-sm text-gray-500">Kepuasan Anda adalah prioritas kami</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">
          Kami memahami bahwa terkadang produk yang Anda terima mungkin tidak sesuai dengan harapan Anda. 
          Jangan khawatir, kami menyediakan kebijakan pengembalian yang mudah dan transparan untuk memastikan 
          pengalaman belanja Anda tetap menyenankan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {returnPolicy.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Cara Mengajukan Pengembalian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {returnSteps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    {step.icon}
                  </div>
                  <span className="text-lg font-bold text-gray-300">{index + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
              {index < returnSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <div className="w-4 h-0.5 bg-gray-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pertanyaan Umum</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Berapa lama proses refund?</h3>
            <p className="text-sm text-gray-600">Proses refund membutuhkan waktu 3-5 hari kerja setelah produk kami terima dan diperiksa. Untuk transfer bank, bisa memakan waktu 1-2 hari kerja tambahan.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Apakah saya bisa tukar dengan produk lain?</h3>
            <p className="text-sm text-gray-600">Ya, Anda bisa memilih untuk menukar dengan produk lain yang sama nilainya. Jika produk baru lebih mahal, Anda hanya perlu membayar selisihnya.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Bagaimana jika produk rusak saat pengiriman?</h3>
            <p className="text-sm text-gray-600">Jika produk rusak saat pengiriman, silakan hubungi customer service kami dalam 24 jam dengan foto produk yang rusak. Kami akan mengganti produk atau mengembalikan dana penuh termasuk biaya pengiriman.</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-800 mb-2">Butuh Bantuan?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tim customer service kami siap membantu Anda dengan proses pengembalian.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="bg-[#16A34A] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#15803D]">
            Hubungi Customer Service
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Lihat Status Pengembalian
          </button>
        </div>
      </div>
    </div>
  );
}
