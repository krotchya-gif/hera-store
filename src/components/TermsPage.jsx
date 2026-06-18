import React from 'react';
import { ArrowLeft, Shield, FileText, Lock, Eye, Globe } from 'lucide-react';

export default function TermsPage({ setCurrentPage }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Syarat & Ketentuan</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#16A34A]/10 p-3 rounded-xl">
            <FileText className="w-8 h-8 text-[#16A34A]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#16A34A]">Syarat & Ketentuan</h2>
            <p className="text-sm text-gray-500">Terakhir diperbarui: 17 Juni 2026</p>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Ketentuan Umum</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Dengan mengakses dan menggunakan situs web Hera Store, Anda setuju untuk terikat dengan syarat dan ketentuan ini. Jika Anda tidak setuju dengan syarat dan ketentuan ini, mohon untuk tidak menggunakan situs web kami.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Kami berhak untuk mengubah, memodifikasi, atau mengupdate syarat dan ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Perubahan akan efektif segera setelah diposting di situs web.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Penggunaan Situs</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Anda setuju untuk menggunakan situs web ini hanya untuk tujuan yang sah dan tidak akan melakukan aktivitas yang melanggar hukum atau hak pihak ketiga.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Anda tidak diperbolehkan untuk mengakses, mengubah, atau menghancurkan bagian mana pun dari situs web ini, atau mengintervensi dengan penggunaan dan kenikmatan situs web oleh pengguna lain.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Akun Pengguna</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Untuk menggunakan fitur tertentu dari situs web, Anda mungkin perlu membuat akun. Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun Anda dan membatasi akses ke komputer Anda.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Anda setuju untuk bertanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda. Kami berhak untuk menutup akun Anda kapan saja jika terdapat pelanggaran.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Produk dan Pembelian</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Semua produk yang ditampilkan di situs web kami tersedia untuk dibeli sesuai dengan ketersediaan stok. Kami berhak untuk membatasi jumlah produk yang dapat dibeli per pengguna.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Harga produk dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Kami berusaha untuk menampilkan informasi produk yang akurat, namun tidak dapat menjamin bahwa semua informasi bebas dari kesalahan.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Pembayaran dan Pengiriman</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Pembayaran dapat dilakukan dengan berbagai metode yang tersedia di situs web. Pesanan akan diproses setelah pembayaran berhasil diverifikasi.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Waktu pengiriman merupakan estimasi dan dapat berubah tergantung pada lokasi dan kondisi pengiriman. Kami tidak bertanggung jawab atas keterlambatan yang disebabkan oleh pihak ketiga.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Pengembalian dan Refund</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Pengembalian produk dapat dilakukan dalam waktu 14 hari sejak tanggal penerimaan. Produk harus dalam kondisi asli, belum digunakan, dan kemasan masih utuh.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Refund akan diproses dalam waktu 3-5 hari kerja setelah produk kami terima. Metode refund mengikuti metode pembayaran asli atau sebagai kredit toko.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Hukum yang Berlaku</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. Setiap perselisihan yang timbul akan diselesaikan melalui musyawarah atau melalui pengadilan yang berwenang di Jakarta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
