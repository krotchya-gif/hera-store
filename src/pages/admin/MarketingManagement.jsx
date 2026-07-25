import React, { useState } from 'react';
import { Mail, Send, Users, TrendingUp, Megaphone } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { createNotification } from '../../lib/api';

export default function MarketingManagement() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('email');
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    target: 'all'
  });
  const [pushForm, setPushForm] = useState({
    title: '',
    message: '',
    target: 'all'
  });

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      await createNotification({
        type: 'email_broadcast',
        title: emailForm.subject,
        message: emailForm.content,
        data: { target: emailForm.target }
      });
      addToast('Email broadcast berhasil disimpan & dikirim!', 'success');
      setEmailForm({ subject: '', content: '', target: 'all' });
    } catch (error) {
      console.error('Error sending broadcast:', error);
      addToast('Gagal mengirim email', 'error');
    }
  };

  const handleSendPush = async (e) => {
    e.preventDefault();
    try {
      await createNotification({
        type: 'push_notification',
        title: pushForm.title,
        message: pushForm.message,
        data: { target: pushForm.target }
      });
      addToast('Push notification berhasil disimpan & dikirim!', 'success');
      setPushForm({ title: '', message: '', target: 'all' });
    } catch (error) {
      console.error('Error sending push:', error);
      addToast('Gagal mengirim push notification', 'error');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-lg lg:text-xl font-bold">Marketing</h2>
          <span className="text-sm text-gray-500">Kelola kampanye marketing</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'email' ? 'bg-[#16A34A] text-white' : 'bg-white border'}`}
        >
          <Mail className="w-4 h-4 inline mr-2" /> Email Broadcast
        </button>
        <button
          onClick={() => setActiveTab('push')}
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'push' ? 'bg-[#16A34A] text-white' : 'bg-white border'}`}
        >
          <Megaphone className="w-4 h-4 inline mr-2" /> Push Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pelanggan</p>
              <p className="text-xl font-bold">1,234</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Terkirim</p>
              <p className="text-xl font-bold">5,678</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Rate</p>
              <p className="text-xl font-bold">42.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Form */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Kirim Email Broadcast</h3>
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target</label>
              <select
                value={emailForm.target}
                onChange={(e) => setEmailForm({ ...emailForm, target: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A]"
              >
                <option value="all">Semua Pelanggan</option>
                <option value="active">Pelanggan Aktif</option>
                <option value="inactive">Pelanggan Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subjek *</label>
              <input
                type="text"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A]"
                placeholder="Promo Spesial Weekend!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konten *</label>
              <textarea
                value={emailForm.content}
                onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                required
                rows="6"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A]"
                placeholder="Tulis konten email di sini..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#15803D] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Kirim Email
            </button>
          </form>
        </div>
      )}

      {/* Push Notification Form */}
      {activeTab === 'push' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Kirim Push Notification</h3>
          <form onSubmit={handleSendPush} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target</label>
              <select
                value={pushForm.target}
                onChange={(e) => setPushForm({ ...pushForm, target: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A]"
              >
                <option value="all">Semua Pengguna</option>
                <option value="active">Pengguna Aktif</option>
                <option value="inactive">Pengguna Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Judul *</label>
              <input
                type="text"
                value={pushForm.title}
                onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A]"
                placeholder="Flash Sale Hari Ini!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pesan *</label>
              <textarea
                value={pushForm.message}
                onChange={(e) => setPushForm({ ...pushForm, message: e.target.value })}
                required
                rows="4"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#16A34A]"
                placeholder="Tulis pesan notifikasi di sini..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#15803D] flex items-center justify-center gap-2"
            >
              <Megaphone className="w-4 h-4" /> Kirim Notifikasi
            </button>
          </form>
        </div>
      )}
    </>
  );
}
