# 🛒 Hera Store — Marketplace Produk Rumah Tangga

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Hera Store** adalah aplikasi marketplace e-commerce untuk produk rumah tangga premium, dibangun dengan React 18, Vite 5, Tailwind CSS 3, dan Supabase sebagai backend. Aplikasi ini mendukung fitur toko online lengkap dengan panel admin, manajemen produk, flash sale, voucher, dan real-time notifications.

---

## ✨ Fitur Utama

### 🛍️ User Facing
- **Katalog Produk** — Pencarian, filter kategori/harga/rating, sorting, pagination
- **Product Detail** — Galeri gambar, varian produk, Q&A, ulasan real-time
- **Keranjang Belanja** — Select items, kode promo, checkout 5 langkah
- **Beli Sekarang** — Langsung ke halaman checkout
- **Wishlist & Comparison** — Simpan favorit, bandingkan hingga 4 produk
- **Flash Sale & Voucher** — Countdown timer, diskon otomatis
- **User Profile** — Riwayat pesanan, alamat, notifikasi, keamanan akun

### ⚙️ Admin Panel
- **Dashboard** — Statistik penjualan, grafik 30 hari, kategori pie chart
- **Manajemen Produk** — CRUD multi-tab, upload gambar, variants
- **Manajemen Pesanan** — Workflow status, tracking number, invoice print
- **Manajemen Kategori** — Tree view, reorder
- **Voucher & Flash Sale** — Buat dan kelola promo
- **Laporan Keuangan** — Charts, CSV export
- **Moderasi Ulasan** — Approve, reject, reply
- **Marketing** — Email broadcast, push notification
- **Pengaturan Toko** — Informasi toko, admin users

### 🔔 Real-time
- Notifikasi order baru, status berubah, pembayaran diterima
- Notifikasi stok menipis, ulasan baru
- Auto-broadcast ke semua admin

---

## 🏗️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **React 18** | Frontend framework |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first CSS |
| **Framer Motion** | Animasi & transitions |
| **Recharts** | Grafik dashboard |
| **Lucide React** | Icon set |
| **Supabase** | Backend (Auth, Database, Storage, Realtime) |
| **PostgreSQL** | Database dengan RLS & triggers |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 18+
- Akun [Supabase](https://supabase.com) (free tier cukup)

### 1. Clone & Install
```bash
git clone <repo-url>
cd hera-store
npm install
```

### 2. Setup Database
1. Buat project di [Supabase Dashboard](https://supabase.com)
2. Buka **SQL Editor**
3. Paste seluruh isi `supabase/init.sql` → **Run**
4. (Opsional) Copy `.env.example` ke `.env.local` untuk development

### 3. Konfigurasi Environment
Buat file `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_APP_NAME=Hera Store
VITE_STORAGE_BUCKET=product-images
```

### 4. Jalankan
```bash
npm run dev
```

### 5. Build Production
```bash
npm run build
npm run preview
```

---

## 📁 Struktur Project

```
hera-store/
├── public/                  # Static assets & PWA icons
├── src/
│   ├── App.jsx             # Root component + routing (BrowserRouter)
│   ├── main.jsx            # Entry point (PWA via vite-plugin-pwa)
│   ├── index.css           # Tailwind directives
│   ├── components/         # Shared UI components (30+)
│   │   ├── Navbar.jsx, SearchBar.jsx, LazyImage.jsx
│   │   ├── LiveChatWidget.jsx  # FAQ bot / Tawk.to integration
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx    # Hero, categories, flash sale, best sellers
│   │   ├── ProductDetail.jsx / ProductListing.jsx
│   │   ├── CartPage.jsx / CheckoutPage.jsx  # 5-step checkout
│   │   ├── ProfilePage.jsx / AuthPage.jsx
│   │   └── admin/          # Admin panel (10 menu pages)
│   │       ├── AdminLayout.jsx / AdminDashboard.jsx
│   │       ├── DashboardOverview.jsx  # Stats, charts, recent orders
│   │       ├── ProductManagement.jsx / OrderManagement.jsx
│   │       ├── CustomerManagement.jsx / CategoryManagement.jsx
│   │       ├── FinanceReport.jsx / PromoManagement.jsx
│   │       ├── ReviewManagement.jsx / MarketingManagement.jsx
│   │       └── StoreSettings.jsx  # Info, shipping, payment, live chat
│   ├── context/            # React contexts (4)
│   │   ├── AuthContext.jsx / ToastContext.jsx
│   │   └── WishlistContext.jsx / ComparisonContext.jsx
│   ├── lib/                # API & utilities
│   │   ├── supabase.js     # Supabase client + realtime helpers
│   │   ├── api.js          # 50+ API functions (products, orders, etc.)
│   │   ├── storage.js      # File upload helpers (4 buckets)
│   │   ├── shipping.js     # Mock shipping calculator (RajaOngkir-style)
│   │   └── midtrans.js     # Midtrans Snap payment integration
│   ├── hooks/              # Custom hooks (useScrollToTop, useFocusTrap)
│   ├── utils/              # Formatters (rupiah, date), validators, CSV export
│   └── services/           # Realtime subscriptions (orders, cart, notifications)
├── supabase/               # Database SQL files
│   ├── init.sql            # All-in-one database init (18 tables)
│   ├── functions.sql       # Legacy — only init.sql is source of truth
│   └── migration_*.sql     # Local doc — individual migration files
├── .env.example            # Environment template
└── package.json            # React 18, Vite 5, Tailwind 3, Supabase 2
```

---

## 🗄️ Database

18 tabel dengan Row Level Security, 15+ RPC functions, realtime notification triggers:

- `profiles` — Extended user profiles (extends auth.users)
- `categories` — Product categories (tree with parent_id)
- `products` — Product catalog with variants
- `product_variants` — Size/color variants
- `addresses` — User shipping addresses
- `cart_items` — Shopping cart
- `orders` — Orders with auto-generated ID (TJ-YYYYMMDD-XXXXX)
- `order_items` — Order line items
- `wishlists` — User wishlists
- `reviews` — Product reviews & ratings (with status: pending/approved/rejected)
- `vouchers` — Discount coupons
- `flash_sales` — Flash sale events
- `flash_sale_items` — Flash sale products
- `admin_invitations` — Admin invitation management
- `product_qna` — Product Q&A
- `notifications` — Real-time notifications
- `store_settings` — Store configuration (includes live_chat_script)
- `newsletter_subscribers` — Email subscribers

---

## 🔐 Keamanan

- **Row Level Security (RLS)** pada semua tabel
- Customer hanya bisa akses data milik sendiri
- Admin policies untuk manajemen data
- Bypass RLS via `SECURITY DEFINER` pada fungsi tertentu (decrement_stock)
- Environment variables untuk konfigurasi sensitif

---

## 📄 Lisensi

MIT License — lihat file [LICENSE](LICENSE) untuk detail.

---

<p align="center">Dibuat dengan ❤️ untuk produk rumah tangga Indonesia</p>
