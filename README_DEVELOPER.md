# Panduan Lokasi Kode Sumber (Developer Guide)

Dokumen ini membantu Anda mengetahui letak kodingan untuk bagian-bagian penting di aplikasi Samira Travel.

## 1. Tombol Direct WhatsApp & Email
Hampir seluruh tombol kontak mengarah ke WhatsApp `083815862300` atau Email `yadikomputerofficial@gmail.com`.

*   **Header (Dapatkan Penawaran):** `src/components/layout/header.tsx`
*   **Footer (Link WA & Email):** `src/components/layout/footer.tsx`
*   **Halaman Paket (Tombol Bismillah Daftar):** `src/components/templates/package-detail-view.tsx` (Cari variabel `Link` dengan `wa.me`).
*   **Halaman Kontak:** `src/app/kontak/page.tsx`
*   **Bagian CTA Akhir:** `src/components/sections/final-cta.tsx`

## 2. Informasi Mitra (Nama & Alamat)
Detail mengenai **Mitra Karawang (Triyadi Yanuar)**.

*   **Nama & Foto Mitra (Testimoni):** `src/components/sections/testimonials.tsx` (Cari variabel `ownerImage` dan teks `Triyadi Yanuar`).
*   **Alamat Mitra & Jam Operasional:**
    *   `src/components/layout/footer.tsx` (Bagian info kontak di bawah).
    *   `src/app/kontak/page.tsx` (Bagian array `locations` dan `contactInfo`).
*   **Data Foto Mitra:** `src/lib/placeholder-images.json` (ID: `owner-photo`).

## 3. Halaman & Bagian Utama (Main Sections)

*   **Beranda (Halaman Utama):** `src/app/page.tsx` (File ini memanggil semua komponen di bawah).
*   **Hero Section (Banner Utama):** `src/components/sections/hero.tsx`
*   **Tentang Kami (About Us):**
    *   Ringkasan di Beranda: `src/components/sections/about-us.tsx` dan `src/components/sections/why-samira.tsx`.
    *   Halaman Detail Lengkap: `src/app/tentang/page.tsx`.
*   **Paket (Packages):**
    *   Daftar Paket di Beranda: `src/components/sections/featured-packages.tsx`.
    *   Struktur Tampilan Detail Paket: `src/components/templates/package-detail-view.tsx`.
    *   Data Isi Paket (Harga, Jadwal, Fasilitas): `src/components/templates/package-detail-view.tsx` (Cari objek `packagesData`).
*   **Testimoni:** `src/components/sections/testimonials.tsx`.
*   **Kontak:** `src/app/kontak/page.tsx`.

## 4. Navigasi & Menu
*   **Menu Atas:** `src/components/layout/header.tsx`.
*   **Menu Melayang (Gooey Nav):** `src/app/page.tsx` (Konfigurasi `navItems`).
*   **Menu Bawah:** `src/components/layout/footer.tsx`.

## 5. Gambar & Aset
*   **Daftar Link Gambar:** `src/lib/placeholder-images.json`.
*   **Penyimpanan File Fisik:** Folder `public/images/`.
