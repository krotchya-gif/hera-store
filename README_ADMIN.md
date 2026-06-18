# 👑 Cara Membuat Akun Admin

Dokumen ini menjelaskan beberapa cara untuk membuat/membesarkan user menjadi admin di Hera Store.

---

## 🎯 Cara 1: Via Supabase SQL Editor (Paling Mudah & Cepat)

Cocok untuk membuat admin pertama atau menambah admin secara manual.

### Langkah-langkah:

1. **User daftar/signup** di aplikasi Hera Store (atau sign up biasa)
2. Buka **Supabase Dashboard** → Project Anda → **SQL Editor**
3. Jalankan query berikut:

```sql
-- Ganti 'user@email.com' dengan email user yang ingin dijadikan admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'user@email.com';

-- Atau jadikan super_admin
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'user@email.com';
```

4. User bisa langsung login dan akses admin panel

### Verifikasi:
```sql
-- Cek apakah role sudah berubah
SELECT email, full_name, role
FROM public.profiles
WHERE email = 'user@email.com';
```

---

## 🎯 Cara 2: Via Supabase Dashboard (Table Editor)

Cocok untuk edit 1 user tanpa menulis SQL.

### Langkah-langkah:

1. Buka **Supabase Dashboard** → **Table Editor**
2. Pilih tabel **`profiles`**
3. Cari user berdasarkan email
4. Klik **Edit** pada row user tersebut
5. Ganti kolom **`role`** dari `'customer'` menjadi `'admin'` atau `'super_admin'`
6. Klik **Save**

---

## 🎯 Cara 3: Via Admin Dashboard (Frontend)

Cocok untuk admin yang sudah ada ingin menambah admin baru tanpa akses Supabase Dashboard.

### Langkah-langkah:

1. **Login** sebagai admin yang sudah ada
2. Masuk ke **Admin Panel** → **Pengaturan** → **Admin & Hak Akses**
3. Di bagian **"Tambah Admin Baru"**, ketik email atau nama user yang sudah terdaftar
4. Klik **"Cari"**, lalu klik **"Jadikan Admin"**
5. User akan langsung memiliki akses admin

### Catatan Penting:
- User yang ingin dijadikan admin **harus sudah sign up** terlebih dahulu
- Fitur ini menggunakan `updateUserRole()` API yang sudah dilindungi RLS
- Hanya admin/super_admin yang bisa mengubah role user lain

---

## 🔐 Role Hierarchy

| Role | Deskripsi | Akses |
|------|-----------|-------|
| `customer` | User biasa | Belanja, cart, profile, pesanan |
| `admin` | Admin toko | Semua akses customer + admin panel |
| `super_admin` | Super admin | Semua akses admin + bisa mengelola admin lain |

### Perbedaan Admin vs Super Admin:
- **Admin**: Bisa mengakses admin panel, mengelola produk, pesanan, pelanggan, keuangan, promo, settings
- **Super Admin**: Semua akses admin + bisa menambah/menghapus admin lain + tidak bisa dihapus aksesnya

---

## ⚠️ Keamanan & Best Practices

### 1. ✅ FIXED: User tidak bisa sign up sebagai admin otomatis
Trigger `handle_new_user` sekarang **hardcoded** selalu set role ke `'customer'`, terlepas dari metadata yang dikirim user:
```sql
-- schema.sql & init.sql — sudah diperbaiki
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  NEW.id,
  NEW.email,
  COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
  'customer'  -- ← hardcoded, tidak bisa di-inject
);
```
User **tidak bisa** lagi memaksa role `admin` atau `super_admin` via signup metadata.

### 2. Minimal 1 super_admin harus selalu ada
Jangan hapus semua super_admin. Pastikan selalu ada minimal 1 super_admin untuk recovery.

### 3. Gunakan email yang valid
Pastikan user yang dijadikan admin menggunakan email yang valid, karena email digunakan untuk login.

### 4. Audit log
Pertimbangkan menambahkan tabel `admin_logs` untuk mencatat siapa yang promote/demote admin:
```sql
CREATE TABLE public.admin_logs (
  id serial PRIMARY KEY,
  admin_id uuid REFERENCES public.profiles(id),
  target_id uuid REFERENCES public.profiles(id),
  action text, -- 'promote', 'demote'
  old_role text,
  new_role text,
  created_at timestamptz DEFAULT now()
);
```

---

## 🆘 Troubleshooting

### User sudah dijadikan admin tapi tidak bisa akses admin panel?

1. **Cek apakah user sudah login ulang**
   - Role di-check saat login, jadi user perlu logout dan login lagi
   
2. **Cek RLS policy**
   ```sql
   -- Pastikan RLS policy "Admins can update any profile" ada
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Cek di browser console**
   - Buka DevTools → Console → lihat error saat akses admin panel
   - Mungkin `isAdmin` di AuthContext mengembalikan false

4. **Cek JWT token**
   - Token JWT mungkin masih cache data lama. Clear localStorage dan login ulang.

### Bagaimana jika semua admin terhapus?

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Jalankan:
```sql
-- Update user tertentu jadi super_admin
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'emailanda@email.com';
```

3. Login ulang di aplikasi

---

## 📝 Quick Reference

```sql
-- PROMOTE: customer → admin
UPDATE public.profiles SET role = 'admin' WHERE email = 'user@email.com';

-- PROMOTE: customer → super_admin
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'user@email.com';

-- DEMOTE: admin → customer
UPDATE public.profiles SET role = 'customer' WHERE email = 'user@email.com';

-- LIST semua admin
SELECT email, full_name, role, created_at
FROM public.profiles
WHERE role IN ('admin', 'super_admin');

-- COUNT admin per role
SELECT role, COUNT(*) FROM public.profiles GROUP BY role;
```

---

*Last updated: 17 Jun 2026*
