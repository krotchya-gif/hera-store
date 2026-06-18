import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const QUICK_REPLIES = [
  'Bagaimana cara pesan?',
  'Status pengiriman saya?',
  'Cara retur produk?',
  'Promo apa yang tersedia?',
];

const BOT_RESPONSES = {
  'Bagaimana cara pesan?': 'Untuk memesan, cukup pilih produk yang Anda inginkan, klik "+ Keranjang", lalu lanjut ke Checkout. Mudah! 🛒',
  'Status pengiriman saya?': 'Cek status pengiriman di menu **Profil → Pesanan Saya**. Anda bisa melacak resi langsung dari sana. 📦',
  'Cara retur produk?': 'Retur bisa dilakukan dalam 14 hari setelah produk diterima. Hubungi kami di support@herastore.com dengan foto produk. 🔄',
  'Promo apa yang tersedia?': 'Cek halaman **Flash Sale** dan **Promo** untuk penawaran terkini! Atau masukkan kode promo di keranjang. 🎁',
  'default': 'Terima kasih sudah menghubungi Hera Store! Tim kami akan segera merespons. Sementara itu, cek FAQ kami untuk jawaban cepat. 😊',
};

export default function LiveChatWidget() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: 'Halo! Selamat datang di Hera Store 👋\nAda yang bisa kami bantu hari ini?',
      time: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const addBotMessage = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg = { id: Date.now(), from: 'bot', text, time: new Date() };
      setMessages(prev => [...prev, botMsg]);
      if (!isOpen) setUnread(prev => prev + 1);
    }, 1200);
  };

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = {
      id: Date.now(),
      from: 'user',
      text: trimmed,
      time: new Date(),
      name: profile?.full_name || user?.email?.split('@')[0] || 'Anda',
    };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');

    const reply = BOT_RESPONSES[trimmed] || BOT_RESPONSES['default'];
    addBotMessage(reply);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(message);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const renderText = (text) => {
    return text.split('**').map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <div className="fixed bottom-20 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-300 rounded-full border-2 border-[#16A34A]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Hera Store Support</p>
                  <p className="text-green-200 text-xs">Biasanya membalas dalam beberapa menit</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition"
                  title="Kecilkan"
                >
                  {isMinimized ? <ChevronDown className="w-4 h-4 text-white" /> : <Minimize2 className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition"
                  title="Tutup"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.from === 'bot' && (
                          <div className="w-6 h-6 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">
                            HS
                          </div>
                        )}
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          msg.from === 'user'
                            ? 'bg-[#16A34A] text-white rounded-br-sm'
                            : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-line">
                            {msg.from === 'bot' ? renderText(msg.text) : msg.text}
                          </p>
                          <p className={`text-xs mt-1 ${msg.from === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                            {formatTime(msg.time)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          HS
                        </div>
                        <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                          <div className="flex gap-1 items-center h-4">
                            {[0, 1, 2].map(i => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Replies */}
                  <div className="px-4 py-2 border-t border-gray-100 flex gap-1.5 overflow-x-auto hide-scrollbar">
                    {QUICK_REPLIES.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => sendMessage(reply)}
                        className="flex-shrink-0 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1.5 rounded-full hover:bg-green-100 transition whitespace-nowrap"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-2">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tulis pesan..."
                      rows={1}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent max-h-20"
                    />
                    <button
                      onClick={() => sendMessage(message)}
                      disabled={!message.trim()}
                      className="p-2.5 bg-[#16A34A] text-white rounded-xl hover:bg-[#15803D] disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Buka live chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute w-full h-full rounded-full border-2 border-[#16A34A] animate-ping opacity-30" />
        )}
      </motion.button>
    </div>
  );
}
