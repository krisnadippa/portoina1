# portoina1

# Employee Payroll Management System (PayrollPro)

Sistem manajemen penggajian karyawan (payroll) modern, profesional, dan akurat yang dibangun dengan **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, dan **Prisma ORM**.

Aplikasi ini dirancang untuk mempermudah pengelolaan data karyawan, perhitungan gaji bulanan otomatis, pencatatan transaksi karyawan (kasbon/bon, top up dana, tarik tunai, potongan denda/pinjaman, dan bonus/insentif/lembur), pembuatan & pencetakan slip gaji instan, serta laporan keuangan penggajian.

---

## ✨ Fitur Utama

### 1. Dashboard Eksekutif
- **Statistik Real-time**: Total Karyawan Aktif, Total Pengeluaran Gaji, Total Bon/Kasbon, Total Potongan, dan Total Gaji Bersih yang harus dibayarkan.
- **Grafik Interaktif**: Analisis tren penggajian bulanan, komparasi gaji kotor vs gaji bersih, dan proporsi transaksi karyawan menggunakan Recharts.
- **Aktivitas Terkini & Status Penggajian**: Ringkasan status periode (Draft, Diproses, Disetujui, Dibayarkan) dan aksi cepat (*Quick Actions*).

### 2. Manajemen Data Karyawan (CRUD Lengkap)
- Nomor ID karyawan otomatis, detail kontak, jabatan, divisi/departemen, tanggal bergabung, status (Aktif/Nonaktif).
- Konfigurasi gaji pokok bulanan dan tunjangan tetap.
- Halaman detail komprehensif: riwayat penggajian, saldo bon belum lunas, riwayat transaksi, dan estimasi *take-home pay*.

### 3. Sistem Transaksi & Kasbon Otomatis
- **Bon / Kasbon**: Pengambilan uang di muka yang otomatis mengurangi gaji bersih periode berjalan.
- **Top Up Dana**: Pemberian atau pengisian dana operasional maupun uang muka karyawan.
- **Tarik Tunai**: Penarikan tunai dengan klasifikasi jelas.
- **Potongan Lainnya**: Denda, pinjaman cicilan, ketidakhadiran, atau potongan khusus lainnya.
- **Tambahan Pendapatan**: Bonus kinerja, insentif target, uang lembur, dan komisi.

### 4. Sistem Penggajian Otomatis (Payroll Engine)
- Formula otomatis berbasis transaksi yang disetujui:
  $$\text{Gaji Kotor} = \text{Gaji Pokok} + \text{Tunjangan Tetap} + \text{Bonus} + \text{Insentif} + \text{Lembur}$$
  $$\text{Total Potongan} = \text{Bon / Kasbon Terkunci} + \text{Potongan Khusus / Denda / Pinjaman}$$
  $$\text{Gaji Bersih} = \text{Gaji Kotor} - \text{Total Potongan}$$
- Fitur Kunci Penggajian (*Lock Payroll*), penandaan status pembayaran (*Mark as Paid*), dan cetak ringkasan rekapitulasi.

### 5. Slip Gaji Otomatis & Cetak PDF
- Format slip gaji standar perusahaan dengan kop surat, rincian pendapatan, rincian potongan, total gaji bersih terbilang, dan kolom tanda tangan resmi.
- Pratinjau langsung di aplikasi serta tombol cetak / simpan ke format PDF.

### 6. Laporan Keuangan & Rekapitulasi
- Filter fleksibel berdasarkan bulan, tahun, divisi, dan kategori transaksi.
- Tabel rincian pengeluaran keuangan dan ringkasan eksekutif.

### 7. Responsif & Antarmuka Aplikasi Mobile
- Desain minimalis tanpa gradien berlebihan dengan palet profesional (*Dark Slate* & *Royal Blue*).
- Sidebar desktop tetap (*fixed*) dengan area konten yang terskrol mandiri.
- **Mobile Bottom Navigation Bar** layaknya aplikasi *native* pada perangkat smartphone / tablet.
- Dialog konfirmasi & pop-up modal kustom menggantikan `alert()` bawaan browser.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **Library UI**: [React 19](https://react.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: SQLite & [Prisma ORM](https://www.prisma.io/)
- **Visualisasi Data**: [Recharts](https://recharts.org/)
- **Ikon**: [Lucide React](https://lucide.dev/)

---

## 🚀 Memulai Instalasi Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/krisnadippa/portoina1.git
cd portoina1
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

### 4. Migrasi & Seeding Database
Inisialisasi skema Prisma dan data awal contoh (*dummy data* karyawan & transaksi):
```bash
npx prisma db push
npm run seed
```

### 5. Jalankan Development Server
```bash
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## 📋 Skrip yang Tersedia

| Skrip | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan Next.js development server |
| `npm run build` | Menjalankan kompilasi produksi |
| `npm run start` | Menjalankan aplikasi hasil kompilasi produksi |
| `npm run lint` | Menjalankan pemeriksaan ESLint |
| `npm run seed` | Menjalankan *seeder* data awal Prisma |
