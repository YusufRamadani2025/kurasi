# 🚀 Project Documentation: Kurasi
**File:** `GEMINI.md`
**Last Updated:** 2026-01-11
**Maintainer:** Yusuf Ramadani & Gemini

---

## 📋 Informasi Project
* **Nama Project:** Kurasi (Curated Second-hand Marketplace)
* **Konsep Utama:** Marketplace barang bekas terkurasi. User bisa daftar, tapi untuk jualan (posting barang) harus request akses "Seller" dulu dan di-approve oleh Admin.
* **Tech Stack:**
    * **Frontend:** React (Vite)
    * **Styling:** Tailwind CSS + Lucide React (Icons)
    * **Backend & Database:** Supabase (PostgreSQL)
    * **Auth:** Supabase Auth
    * **Storage:** Supabase Storage (untuk foto produk)

---

## 🗺️ Alur Pengerjaan (Roadmap)

### **Fase 1: Setup & Konfigurasi (✅ Done)**
- [x] Create React App (Vite).
- [x] Install & Config Tailwind CSS.
- [x] Create Supabase Client Config (`src/lib/supabaseClient.js`).
- [ ] Connect App ke Supabase (Setup Environment Variables `.env`).

### **Fase 2: Database & Security (Supabase Core)**
- [x] **Schema Generation:** SQL file `supabase_schema.sql` telah dibuat.
- [x] **Apply Schema:** Jalankan script SQL di Dashboard Supabase.
- [x] **Table Design:** `profiles`, `products`, `seller_requests`.
- [x] **RLS Policies:** Security rules sudah didefinisikan di SQL.
- [x] **Triggers:** Auto-create profile trigger sudah ada di SQL.

### **Fase 3: Authentication & Logic**
- [x] **Auth UI:** Login & Register pages.
- [x] **Role Logic:** Cek apakah user punya role 'admin', 'seller', atau 'user'.
- [x] **Seller Request Flow:** Form pengajuan -> Admin Dashboard Approval -> Role Update.

### **Fase 4: Marketplace Features (Frontend)**
- [x] **Upload Produk:** Halaman Add Product terhubung ke Storage & DB.
- [x] **Homepage:** Fetch real data dari tabel `products`.
- [x] **Product Detail:** Halaman detail produk dengan tombol kontak penjual.

### **Fase 5: Ekstra (Polishing)**
- [x] **Seller Dashboard:** Halaman "My Shop" untuk mengelola/menghapus produk sendiri.
- [x] **Admin Dashboard:** Panel khusus admin untuk memverifikasi seller.

---

## 🔨 Status Project
**Status:** ✅ MVP Complete (Functional Prototype)

Aplikasi Kurasi kini sudah berfungsi sepenuhnya sebagai marketplace barang bekas sederhana. 

### Fitur yang Tersedia:
1.  **Auth Lengkap:** Login, Register, Role Based Access (User/Seller/Admin).
2.  **Flow Seller:** User minta akses -> Admin approve -> User jadi Seller.
3.  **Manajemen Produk:** Seller bisa upload foto & data, serta menghapus produk sendiri.
4.  **Marketplace:** Halaman depan menampilkan produk asli, bisa diklik untuk detail & kontak penjual via Email/WA placeholder.

### Cara Menjalankan:
1.  Pastikan `.env` terisi dengan kredensial Supabase.
2.  Jalankan `npm run dev`.
3.  Buka `http://localhost:5173`.