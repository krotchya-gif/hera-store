# Panduan Deployment Hera Store

Proyek Hera Store dibangun menggunakan **React (Vite)** untuk *frontend* dan **Supabase** untuk *backend* (Database, Auth, Storage). Panduan ini akan menjelaskan cara men-*deploy* aplikasi ini agar dapat diakses publik di internet secara gratis menggunakan layanan seperti **Vercel**.

---

## 📝 1. Persiapan Awal

1. Pastikan Anda sudah membuat repositori di **GitHub** dan telah melakukan *push* kode (folder proyek `qwen` ini) ke repositori tersebut.
2. Siapkan *Environment Variables* Anda. Anda akan membutuhkan nilai yang ada di file `.env` lokal Anda:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 🚀 2. Deploy Frontend menggunakan Vercel (Paling Direkomendasikan)

Vercel sangat optimal dan mudah digunakan untuk aplikasi berbasis React dan Vite.

1. Kunjungi situs [Vercel](https://vercel.com/) dan buat akun/login menggunakan GitHub Anda.
2. Dari Dashboard utama Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Anda akan melihat daftar repositori GitHub Anda. Cari repositori "Hera Store", lalu klik tombol **"Import"**.
4. Pada halaman **"Configure Project"**, pastikan pengaturannya sebagai berikut:
   - **Framework Preset:** Vercel akan otomatis mendeteksi `Vite`. Biarkan apa adanya.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Sangat Penting:** Buka menu *dropdown* **Environment Variables** lalu tambahkan kredensial Supabase Anda satu per satu:
   - Kolom Name: `VITE_SUPABASE_URL` | Value: *(Isi dengan URL Supabase dari file .env)* lalu klik **Add**.
   - Kolom Name: `VITE_SUPABASE_ANON_KEY` | Value: *(Isi dengan Anon Key dari file .env)* lalu klik **Add**.
6. Klik tombol **"Deploy"**.
7. Tunggu beberapa menit hingga Vercel selesai melakukan *build* (*compile* kode). Jika berhasil, layar akan menampilkan konfeti dan memberikan tautan URL publik Anda (misalnya: `https://hera-store.vercel.app`).

---

## 🔐 3. Konfigurasi Wajib Supabase Setelah Deploy

Agar sistem **Login / Registrasi** (Autentikasi Supabase) dapat bekerja di URL produksi (*production*), Anda WAJIB mendaftarkan URL publik Vercel tersebut ke pengaturan Supabase Anda.

1. Buka dashboard proyek Anda di [Supabase](https://supabase.com/dashboard).
2. Pergi ke menu **Authentication** (ikon gembok di *sidebar* kiri), lalu pilih menu **URL Configuration** di bagian *Configuration*.
3. Pada bagian **Site URL**, ganti URL bawaan (`http://localhost:5173`) menjadi URL publik Vercel Anda (contoh: `https://hera-store.vercel.app`).
4. Pada bagian **Redirect URLs**, klik tombol **"Add URL"** dan tambahkan *wildcard* URL Anda, contoh: `https://hera-store.vercel.app/*` (Perhatikan tanda bintang `/*` di akhir URL).
5. Klik **Save**.

Jika tahap ini dilewati, sistem login akan terus me-*redirect* (*memantulkan*) pengguna kembali ke *localhost* atau menampilkan *error* saat login di *production*.

---

## 🔄 4. Cara Update (Deploy Ulang) di Masa Depan

Platform Vercel memiliki fitur **Continuous Deployment (CD)** terintegrasi dengan GitHub. 

Bila Anda mengubah kode, menambah fitur, atau memperbaiki bug di komputer Anda, ikuti langkah berikut:
1. *Commit* dan *Push* perubahan ke branch `main` (atau `master`) di GitHub.
   ```bash
   git add .
   git commit -m "update fitur A"
   git push origin main
   ```
2. Anda tidak perlu login ke Vercel lagi. Vercel akan **otomatis mendeteksi push tersebut** dan langsung men-*deploy* versi terbaru dari Hera Store. Aplikasi akan diperbarui dalam waktu 1-2 menit.
