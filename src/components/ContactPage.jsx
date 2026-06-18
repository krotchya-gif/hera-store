import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare, Clock, Send } from 'lucide-react';

export default function ContactPage({ setCurrentPage }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Hubungi Kami</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Kontak</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Email</h3>
                <p className="text-sm text-gray-600">support@herastore.com</p>
                <p className="text-sm text-gray-600">order@herastore.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <Phone className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Telepon</h3>
                <p className="text-sm text-gray-600">0812-3456-7890</p>
                <p className="text-sm text-gray-600">021-1234-5678</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-50 p-3 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Alamat</h3>
                <p className="text-sm text-gray-600">Jl. Raya No. 123</p>
                <p className="text-sm text-gray-600">Jakarta Selatan, 12345</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Jam Operasional</h3>
                <p className="text-sm text-gray-600">Senin - Jumat: 08:00 - 18:00</p>
                <p className="text-sm text-gray-600">Sabtu: 09:00 - 15:00</p>
                <p className="text-sm text-gray-600">Minggu: Tutup</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Kirim Pesan</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                placeholder="Nama Anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjek</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none">
                <option>Pertanyaan Umum</option>
                <option>Masalah Pesanan</option>
                <option>Pengembalian</option>
                <option>Kerjasama</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
              <textarea
                rows="4"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#16A34A] outline-none"
                placeholder="Tulis pesan Anda di sini..."
              ></textarea>
            </div>
            <button
              type="button"
              className="w-full bg-[#16A34A] text-white py-2 rounded-lg font-medium hover:bg-[#15803D] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Kirim Pesan
            </button>
          </form>
        </div>
      </div>

      {/* Quick Support Options */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Bantuan Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold text-gray-800 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-3">Chat dengan customer service kami</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
              Mulai Chat
            </button>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Phone className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-semibold text-gray-800 mb-1">Telepon</h3>
            <p className="text-sm text-gray-600 mb-3">Hubungi kami langsung</p>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600">
              0812-3456-7890
            </button>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Mail className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
            <p className="text-sm text-gray-600 mb-3">Kirim email ke kami</p>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600">
              support@herastore.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
