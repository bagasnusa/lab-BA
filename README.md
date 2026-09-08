# LAB TI POLINEMA - Sistem Informasi Manajemen & Peminjaman Laboratorium Komputer

Aplikasi web fullstack modern untuk manajemen operasional, inventaris hardware riset, dan otomasi peminjaman laboratorium di **Gedung Jurusan Teknologi Informasi, Politeknik Negeri Malang (JTI Polinema)**. Terhubung langsung dengan database **MySQL (Laragon / XAMPP)** dan dilengkapi E-Ticket QR Code real-time.

---

## 🚀 Fitur Utama

1. **Katalog Laboratorium Modern**:
   - 🏢 **Lab RPL & Basis Data** *(Gedung TI Polinema Lt. 6 R.601)*
   - 🤖 **Lab AI & Data Science** *(Gedung TI Polinema Lt. 6 R.602)*
   - 🔒 **Lab Jaringan & Cyber Security** *(Gedung TI Polinema Lt. 7 R.701)*
   - 🎨 **Lab Multimedia, Animasi & Game** *(Gedung TI Polinema Lt. 7 R.702)*
   - ⚡ **Lab IoT & Robotika** *(Gedung TI Polinema Lt. 5 R.505)*
2. **Multi-Stage Approval Workflow**:
   - Peminjaman oleh Mahasiswa ➔ Validasi Dosen Pembimbing ➔ Persetujuan Akhir Admin Laboran.
3. **E-Ticket & QR Code Check-in**:
   - Tiket digital resmi ber-QR Code dengan fitur cetak surat izin / simpan PDF.
4. **Manajemen Jadwal & Export Data**:
   - Tabel jadwal pemakaian live, filter lab/tanggal, dan export laporan CSV.
5. **Terintegrasi Database MySQL**:
   - Otomatis membuat database `db_lab_ilkom`, tabel, dan seed data saat server dijalankan.

---

## 🗄️ Panduan Menjalankan dengan Laragon (MySQL)

### Langkah 1: Nyalakan Laragon
1. Buka aplikasi **Laragon**.
2. Klik tombol **"Start All"** (pastikan service MySQL aktif di port `3306`).

### Langkah 2: Konfigurasi Environment (`.env`)
Salin template `.env.example` ke `.env` di dalam folder `backend/`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_lab_ilkom
JWT_SECRET=lab-ilkom-super-secret-key-2026
```

### Langkah 3: Jalankan Backend & Frontend
Buka terminal di root project atau VS Code, lalu jalankan:
```bash
cd backend
npm install
npm start
```

### Langkah 4: Buka Aplikasi
Akses melalui browser:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 👥 Akun Demo Pengujian

| Peran (Role) | Username / NIM / Email | Password |
|---|---|---|
| **Mahasiswa (Bagas)** | `22051204001` *(atau `bagas@mhs.ilkom.ac.id`)* | `mhs123` |
| **Dosen (Dr. Hendra)** | `197805122003121001` *(atau `hendra@ilkom.ac.id`)* | `dosen123` |
| **Admin Lab (Laboran)** | `admin@ilkom.ac.id` | `admin123` |

---

## 📁 Struktur Database (`database.sql`)
- 👤 **`users`**: Mahasiswa, Dosen, Admin Laboran.
- 🏢 **`labs`**: Daftar 5 lab komputer, kapasitas PC, dan status ketersediaan.
- 📦 **`equipments`**: Inventaris alat riset (VR Headset, NVIDIA Jetson, IoT Kit, Proyektor, Oscilloscope).
- 📋 **`bookings`**: Riwayat peminjaman, status persetujuan berjenjang, dan QR Code check-in.
