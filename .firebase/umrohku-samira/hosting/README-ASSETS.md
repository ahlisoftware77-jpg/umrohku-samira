# Folder Aset Publik SAMIRA

Gunakan folder ini untuk menyimpan semua file statis yang ingin Anda akses langsung di aplikasi.

### Struktur yang Disarankan:
- `/public/images/`: Untuk logo, ikon, dan foto khusus.
- `/public/docs/`: Untuk brosur PDF atau panduan perjalanan.
- `/public/videos/`: Untuk video profil atau dokumentasi.

### Cara Penggunaan di Kode:
Jika Anda menyimpan file bernama `logo-samira.png` di folder ini, Anda bisa memanggilnya di komponen React seperti ini:

```jsx
<Image 
  src="/logo-samira.png" 
  alt="Logo SAMIRA" 
  width={200} 
  height={50} 
/>
```

*Catatan: File di dalam folder `public` tidak akan diproses oleh Webpack, sehingga pastikan ukuran file sudah dioptimalkan.*
