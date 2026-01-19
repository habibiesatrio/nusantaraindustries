# Pohon Industri Indonesia

Landing page untuk portal Pohon Industri Indonesia yang dikembangkan oleh BRIN (Badan Riset dan Inovasi Nasional)..

## Deskripsi

Aplikasi web ini menyediakan tracer hilirisasi komoditas nasional, memetakan pohon industri dari bahan mentah hingga produk bernilai tambah tinggi berdasarkan dataset BRIN.

## Fitur

- **Pencarian HS Code**: Cari komoditas berdasarkan kode HS atau nama.
- **Visualisasi Pohon Industri**: Lihat rantai nilai hilirisasi komoditas.
- **Data Tren Ekspor**: Grafik pertumbuhan nilai ekspor per tahun.
- **Informasi Paten**: Data inovasi dan hak kekayaan intelektual.
- **Validasi Regulasi**: Informasi kepatuhan dan regulasi hilirisasi.

## Teknologi

- React 18
- Tailwind CSS
- Recharts
- Lucide React Icons

## Instalasi

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm start
   ```
4. Buka [http://localhost:3000](http://localhost:3000) di browser

## Build untuk Production

```bash
npm run build
```

## Deployment

Setelah proses build selesai, folder `build` akan berisi semua file yang siap untuk di-deploy.

Untuk men-deploy aplikasi ke hosting seperti Hostinger, ikuti langkah berikut:

1.  **Pastikan `.htaccess` ada**: File `public/.htaccess` yang sudah dibuat akan otomatis tercopy ke dalam folder `build` saat proses build. File ini penting agar routing di sisi klien (client-side routing) berfungsi dengan benar di server.
2.  **Upload ke Server**: Unggah **semua isi** dari folder `build` lokal Anda ke direktori `public_html` di server hosting Anda. Jangan unggah folder `build` itu sendiri, tetapi hanya isinya.

Struktur file di `public_html` server Anda akan terlihat seperti ini:

```
public_html/
├── static/
├── asset-manifest.json
├── index.html
├── manifest.json
├── .htaccess
└── ... file lainnya
```

Setelah semua file diunggah, website Anda seharusnya sudah bisa diakses dan semua halaman akan berfungsi dengan benar.

## Dataset

Data komoditas didasarkan pada "Kompilasi Pohon Industri 2025" dari BRIN, mencakup:
- Kelapa Sawit (CPO)
- Batubara Anthracite
- Karet Alam (SIR 20)
- Kelapa (Coconut Fruit)

## Lisensi

©2025 Pohon Industri Indonesia. Built by BRIN Research Team.
