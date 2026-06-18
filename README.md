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
├── public/                  # Static assets & PWA
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── App.jsx             # Root component + routing
│   ├── main.jsx            # Entry point
│   ├── index.css           # Tailwind directives
│   ├── components/         # Shared UI components
│   │   ├── Navbar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── LazyImage.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── RouteGuard.jsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── ProductListing.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── AuthPage.jsx
│   │   └── admin/          # Admin panel pages
│   │       ├── AdminLayout.jsx
│   │       ├── DashboardOverview.jsx
│   │       ├── ProductManagement.jsx
│   │       └── ...
│   ├── context/            # React contexts
│   │   ├── AuthContext.jsx
│   │   ├── ToastContext.jsx
│   │   ├── WishlistContext.jsx
│   │   └── ComparisonContext.jsx
│   ├── lib/                # API & utilities
│   │   ├── supabase.js     # Supabase client
│   │   ├── api.js          # API functions (30+)
│   │   ├── storage.js      # File upload helpers
│   │   └── shipping.js     # Mock shipping calculator
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Formatters, validators
│   └── services/           # Realtime subscriptions
├── supabase/               # Database SQL files
│   ├── init.sql            # All-in-one database init
│   ├── functions.sql       # RPC functions
│   ├── rls.sql             # Row Level Security
│   ├── seed.sql            # Seed data
│   ├── storage.sql         # Storage buckets
│   ├── schema.sql          # Table schemas
│   └── migration_*.sql     # Incremental migrations
├── .env.example            # Environment template
└── package.json
```

---

## 🗄️ Database

16 tabel dengan Row Level Security, 13 RPC functions, dan 5 realtime notification triggers:

- `profiles` — Extended user profiles (extends auth.users)
- `categories` — Product categories (tree with parent_id)
- `products` — Product catalog with variants
- `product_variants` — Size/color variants
- `addresses` — User shipping addresses
- `cart_items` — Shopping cart
- `orders` — Orders with auto-generated ID (TJ-YYYYMMDD-XXXXX)
- `order_items` — Order line items
- `wishlists` — User wishlists
- `reviews` — Product reviews & ratings
- `vouchers` — Discount coupons
- `flash_sales` — Flash sale events
- `flash_sale_items` — Flash sale products
- `notifications` — Real-time notifications
- `store_settings` — Store configuration
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
