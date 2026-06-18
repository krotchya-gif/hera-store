import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Globe, User, Server } from 'lucide-react';

export default function PrivacyPage({ setCurrentPage }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Kebijakan Privasi</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#16A34A]/10 p-3 rounded-xl">
            <Shield className="w-8 h-8 text-[#16A34A]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#16A34A]">Kebijakan Privasi</h2>
            <p className="text-sm text-gray-500">Terakhir diperbarui: 17 Juni 2026</p>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Pendahuluan</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Hera Store berkomitmen untuk melindungi privasi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan situs web dan layanan kami.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dengan menggunakan situs web kami, Anda setuju dengan pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini. Jika Anda tidak setuju dengan kebijakan ini, mohon untuk tidak menggunakan situs web kami.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Informasi yang Kami Kumpulkan</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Kami mengumpulkan informasi yang Anda berikan secara langsung saat:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1 mb-3">
              <li>Membuat akun dan profil</li>
              <li>Membuat pesanan dan pembayaran</li>
              <li>Mengisi formulir kontak atau survei</li>
              <li>Berkomunikasi dengan customer service</li>
              <li>Mengikuti program promosi atau undian</li>
            </ul>
            <p className="text-sm text-gray-600 leading-relaxed">
              Informasi yang dikumpulkan meliputi: nama, email, nomor telepon, alamat pengiriman, informasi pembayaran, dan preferensi produk.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Penggunaan Informasi</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Kami menggunakan informasi Anda untuk:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1 mb-3">
              <li>Memproses dan mengelola pesanan Anda</li>
              <li>Mengirimkan konfirmasi dan update pesanan</li>
              <li>Memberikan dukungan pelanggan</li>
              <li>Mengirimkan informasi promosi dan penawaran (dengan persetujuan Anda)</li>
              <li>Meningkatkan pengalaman pengguna dan layanan kami</li>
              <li>Menjaga keamanan dan mencegah penipuan</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Keamanan Data</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Kami mengambil langkah-langkah keamanan yang sesuai untuk melindungi informasi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Langkah-langkah ini meliputi:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1 mb-3">
              <li>Enkripsi data sensitif menggunakan SSL/TLS</li>
              <li>Autentikasi dan otorisasi pengguna</li>
              <li>Pembatasan akses ke data pribadi</li>
              <li>Monitoring keamanan secara berkala</li>
              <li>Backup dan disaster recovery</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Berbagi Informasi</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Kami tidak menjual, menukar, atau mentransfer informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1 mb-3">
              <li>Untuk memenuhi kewajiban hukum</li>
              <li>Untuk melindungi hak dan keamanan kami</li>
              <li>Dengan mitra pengiriman untuk memproses pengiriman</li>
              <li>Dengan penyedia pembayaran untuk memproses transaksi</li>
              <li>Dengan persetujuan eksplisit dari Anda</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Cookie dan Teknologi Pelacakan</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna, menganalisis trafik, dan mempersonalisasi konten. Anda dapat mengatur browser Anda untuk menolak cookie, namun beberapa fitur situs web mungkin tidak berfungsi dengan baik.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Hak Anda</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Anda memiliki hak untuk:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed space-y-1 mb-3">
              <li>Mengakses informasi pribadi Anda yang kami simpan</li>
              <li>Meminta koreksi atau penghapusan data</li>
              <li>Membatasi atau menolak pemrosesan data</li>
              <li>Menerima data dalam format yang terstruktur</li>
              <li>Menarik persetujuan pemasaran kapan saja</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">8. Kontak</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menjalankan hak Anda, silakan hubungi kami di privacy@herastore.com atau melalui formulir kontak di situs web kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
