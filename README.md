# �� Belajar Database - Aplikasi Manajemen Data Mahasiswa dan Program Studi

Aplikasi mobile untuk mengelola data mahasiswa dan program studi menggunakan database lokal SQLite. Dibangun dengan React Native, Expo, dan TypeScript.

---

## 📋 Daftar Isi

1. [Prasyarat (Requirements)](#1-prasyarat-requirements)
2. [Instalasi Aplikasi](#2-instalasi-aplikasi)
3. [Struktur Project](#3-struktur-project)
4. [Setup dan Konfigurasi](#4-setup-dan-konfigurasi)
5. [Menjalankan Aplikasi](#5-menjalankan-aplikasi)
6. [Cara Menggunakan Aplikasi](#6-cara-menggunakan-aplikasi)
7. [Fitur-Fitur Aplikasi](#7-fitur-fitur-aplikasi)
8. [Troubleshooting](#8-troubleshooting)
9. [Informasi Developer](#9-informasi-developer)

---

## 1. Prasyarat (Requirements)

Sebelum memulai, pastikan Anda telah menginstall:

### Software yang Diperlukan:

- **Node.js** (versi 18.x atau lebih baru)
  - Download: [https://nodejs.org/](https://nodejs.org/)
  - Verifikasi instalasi: `node --version` dan `npm --version`

- **npm** (biasanya terinstall bersama Node.js)
  - Verifikasi: `npm --version`

- **Git** (opsional, untuk version control)
  - Download: [https://git-scm.com/](https://git-scm.com/)

### Untuk Menjalankan di Perangkat Mobile:

#### Android:
- **Android Studio** dengan Android SDK
  - Download: [https://developer.android.com/studio](https://developer.android.com/studio)
  - Atau gunakan **Expo Go** app di Play Store: [https://play.google.com/store/apps/details?id=host.exp.exponent](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### iOS (hanya untuk Mac):
- **Xcode** dengan iOS Simulator
  - Download dari App Store (gratis untuk Mac)
  - Atau gunakan **Expo Go** app di App Store: [https://apps.apple.com/app/expo-go/id982107779](https://apps.apple.com/app/expo-go/id982107779)

---

## 2. Instalasi Aplikasi

### Langkah 1: Clone atau Download Project

Jika menggunakan Git:
```bash
git clone <repository-url>
cd belajar_db
```

Atau download project sebagai ZIP dan ekstrak ke folder `belajar_db`.

### Langkah 2: Install Dependencies

Buka terminal/command prompt di folder project, lalu jalankan:

```bash
npm install
```

Proses ini akan menginstall semua package yang diperlukan. Tunggu sampai selesai (biasanya 2-5 menit).

**Catatan:** Jika ada error, coba:
```bash
npm cache clean --force
npm install
```

### Langkah 3: Verifikasi Instalasi

Pastikan semua dependencies terinstall dengan benar:
```bash
npm list
```

---

## 3. Struktur Project

Berikut adalah struktur folder dan file penting dalam project ini:

```
belajar_db/
│
├── app/                          # Folder utama untuk halaman aplikasi
│   ├── _layout.tsx              # Root layout (navigasi utama)
│   ├── (tabs)/                  # Folder untuk tab navigation
│   │   ├── _layout.tsx          # Layout untuk tab navigation
│   │   ├── index.tsx            # Halaman utama (List Mahasiswa)
│   │   ├── prodi.tsx            # Halaman List Prodi
│   │   └── explore.tsx          # Halaman Info Aplikasi
│   │
│   ├── mahasiswa/               # Folder untuk halaman mahasiswa
│   │   ├── add.tsx              # Form tambah mahasiswa
│   │   └── [id].tsx             # Form edit mahasiswa
│   │
│   ├── prodi/                   # Folder untuk halaman prodi
│   │   ├── add.tsx              # Form tambah prodi
│   │   └── [id].tsx             # Form edit prodi
│   │
│   └── modal.tsx                # Halaman modal contoh
│
├── utils/                       # Folder untuk utility functions
│   └── database.ts              # File untuk operasi database SQLite
│
├── components/                  # Folder untuk komponen reusable
│   ├── themed-text.tsx          # Komponen teks dengan tema
│   ├── themed-view.tsx          # Komponen view dengan tema
│   └── parallax-scroll-view.tsx # Komponen scroll view dengan efek parallax
│
├── constants/                   # Folder untuk konstanta
│   └── Colors.ts                # Warna tema aplikasi
│
├── hooks/                       # Folder untuk custom hooks
│   └── use-color-scheme.ts      # Hook untuk detect dark/light mode
│
├── assets/                      # Folder untuk assets (gambar, icon, dll)
│   └── images/                  # Folder untuk gambar
│
├── package.json                 # File konfigurasi npm dan dependencies
├── app.json                     # File konfigurasi Expo
├── tsconfig.json                # File konfigurasi TypeScript
└── README.md                    # Dokumentasi (file ini)
```

---

## 4. Setup dan Konfigurasi

### Setup Database

Database SQLite akan otomatis dibuat saat aplikasi pertama kali dijalankan. File database disimpan di:
- **Android:** `/data/data/[package-name]/databases/database.db`
- **iOS:** `Documents/database.db`

### Struktur Database

#### Tabel `mahasiswa`:
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `nim` (TEXT, UNIQUE, NOT NULL) - Nomor Induk Mahasiswa
- `nama` (TEXT, NOT NULL) - Nama lengkap mahasiswa
- `jurusan` (TEXT, NOT NULL) - Jurusan/prodi
- `semester` (INTEGER, NOT NULL) - Semester (1-14)
- `email` (TEXT, NOT NULL) - Email mahasiswa

#### Tabel `prodi`:
- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `kode_prodi` (TEXT, UNIQUE, NOT NULL) - Kode program studi
- `nama_prodi` (TEXT, NOT NULL) - Nama program studi
- `fakultas` (TEXT) - Nama fakultas (opsional)

**Catatan:** Database akan otomatis diinisialisasi saat aplikasi pertama kali dibuka.

---

## 5. Menjalankan Aplikasi

### Metode 1: Menggunakan Expo Go (Paling Mudah)

#### Langkah-langkah:

1. **Install Expo Go di smartphone Anda:**
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Jalankan development server:**
   ```bash
   npm start
   ```
   Atau:
   ```bash
   npx expo start
   ```

3. **Scan QR Code:**
   - Terminal akan menampilkan QR code
   - **Android:** Buka Expo Go app, pilih "Scan QR Code", lalu scan QR code dari terminal
   - **iOS:** Buka Camera app, scan QR code, lalu pilih "Open in Expo Go"

4. **Tunggu aplikasi dimuat** di smartphone Anda

### Metode 2: Menggunakan Android Emulator

1. **Buka Android Studio** dan buat/siapkan emulator Android

2. **Jalankan emulator** dari Android Studio

3. **Jalankan aplikasi:**
   ```bash
   npm run android
   ```
   Atau:
   ```bash
   npx expo start --android
   ```

### Metode 3: Menggunakan iOS Simulator (Hanya Mac)

1. **Pastikan Xcode terinstall**

2. **Buka iOS Simulator:**
   ```bash
   open -a Simulator
   ```

3. **Jalankan aplikasi:**
   ```bash
   npm run ios
   ```
   Atau:
   ```bash
   npx expo start --ios
   ```

### Metode 4: Menggunakan Web Browser

```bash
npm run web
```
Atau:
```bash
npx expo start --web
```

Aplikasi akan terbuka di browser default Anda di `http://localhost:8081`

**Catatan:** Beberapa fitur mungkin tidak berfungsi dengan baik di web karena keterbatasan native modules.

---

## 6. Cara Menggunakan Aplikasi

### 6.1. Halaman Utama (Tab Navigation)

Aplikasi memiliki 3 tab utama di bagian bawah:

1. **Tab "Mahasiswa"** (ikon people) - Halaman utama untuk mengelola data mahasiswa
2. **Tab "Prodi"** (ikon library) - Halaman untuk mengelola data program studi
3. **Tab "Info"** (ikon information-circle) - Halaman informasi aplikasi dan developer

### 6.2. Mengelola Data Program Studi (Prodi)

**Sebelum menambahkan data mahasiswa, disarankan untuk menambahkan data Prodi terlebih dahulu.**

#### Menambahkan Prodi Baru:

1. Buka tab **"Prodi"** di navigasi bawah
2. Klik tombol **"+ Tambah Prodi"** di pojok kanan atas
3. Isi form:
   - **Kode Prodi** (wajib, unik) - contoh: "TI001"
   - **Nama Prodi** (wajib) - contoh: "Teknik Informatika"
   - **Fakultas** (opsional) - contoh: "Fakultas Teknik"
4. Klik tombol **"Simpan"**
5. Prodi akan muncul di list

#### Mengedit Prodi:

1. Buka tab **"Prodi"**
2. Pilih prodi yang ingin diedit dari list
3. Ubah data yang diinginkan
4. Klik tombol **"Simpan"**

#### Menghapus Prodi:

1. Buka tab **"Prodi"**
2. Pilih prodi yang ingin dihapus dari list
3. Klik tombol **"Hapus"**
4. Konfirmasi penghapusan

**Catatan:** Prodi yang sudah digunakan oleh mahasiswa tidak boleh dihapus.

#### Mencari Prodi:

1. Buka tab **"Prodi"**
2. Gunakan search bar di atas untuk mencari prodi berdasarkan nama atau kode

### 6.3. Mengelola Data Mahasiswa

#### Menambahkan Mahasiswa Baru:

1. Buka tab **"Mahasiswa"** di navigasi bawah
2. Klik tombol **"+ Tambah Mahasiswa"** di pojok kanan atas
3. Isi form:
   - **NIM** (wajib, unik) - Nomor Induk Mahasiswa, contoh: "2024001"
   - **Nama Lengkap** (wajib) - contoh: "John Doe"
   - **Jurusan/Prodi** (wajib) - Klik field ini untuk memilih dari dropdown (harus sudah ada di data Prodi)
   - **Semester** (wajib) - Angka antara 1-14, contoh: "1"
   - **Email** (wajib) - Format email valid, contoh: "john@example.com"
4. Klik tombol **"Simpan"**
5. Mahasiswa akan muncul di list

#### Mengedit Mahasiswa:

1. Buka tab **"Mahasiswa"**
2. Pilih mahasiswa yang ingin diedit dari list
3. Ubah data yang diinginkan
4. Klik tombol **"Simpan"**

#### Menghapus Mahasiswa:

1. Buka tab **"Mahasiswa"**
2. Pilih mahasiswa yang ingin dihapus dari list
3. Klik tombol **"Hapus"**
4. Konfirmasi penghapusan

#### Mencari Mahasiswa:

1. Buka tab **"Mahasiswa"**
2. Gunakan search bar di atas untuk mencari mahasiswa berdasarkan NIM, nama, atau email
3. List akan otomatis ter-filter sesuai kata kunci

#### Refresh Data:

- Tarik ke bawah (pull to refresh) pada list untuk memperbarui data dari database

### 6.4. Halaman Info

Buka tab **"Info"** untuk melihat:
- Nama aplikasi dan deskripsi
- Informasi developer (Nama, Email, Institusi)
- Teknologi yang digunakan
- Versi aplikasi
- Lisensi

---

## 7. Fitur-Fitur Aplikasi

### Fitur Utama:

✅ **CRUD Lengkap untuk Mahasiswa:**
- Create (Tambah data mahasiswa)
- Read (Lihat list mahasiswa)
- Update (Edit data mahasiswa)
- Delete (Hapus data mahasiswa)

✅ **CRUD Lengkap untuk Prodi:**
- Create (Tambah data prodi)
- Read (Lihat list prodi)
- Update (Edit data prodi)
- Delete (Hapus data prodi)

✅ **Database Lokal SQLite:**
- Data tersimpan di perangkat (offline)
- Tidak perlu koneksi internet
- Fast dan reliable

✅ **Validasi Form:**
- Validasi field wajib
- Validasi format email
- Validasi range semester (1-14)
- Validasi NIM unik
- Validasi kode prodi unik

✅ **Search/Filter:**
- Pencarian mahasiswa (NIM, nama, email)
- Pencarian prodi (kode, nama)

✅ **Dropdown Prodi:**
- Sinkronisasi data prodi di form mahasiswa
- Memilih prodi dari data yang sudah ada (bukan input manual)

✅ **Pull to Refresh:**
- Refresh data dengan menarik list ke bawah

✅ **Loading Indicators:**
- Loading saat memuat data
- Loading saat menyimpan/hapus data

✅ **Error Handling:**
- Pesan error yang jelas untuk setiap kondisi
- Alert untuk konfirmasi tindakan penting

✅ **Responsive Design:**
- Layout yang adaptif untuk berbagai ukuran layar
- Safe area handling untuk notch/home indicator

✅ **Dark/Light Mode Support:**
- Otomatis mengikuti pengaturan sistem

---

## 8. Troubleshooting

### Masalah Umum dan Solusinya:

#### 1. Error: "Module not found"
**Solusi:**
```bash
rm -rf node_modules
npm install
```

#### 2. Error: "Metro bundler error"
**Solusi:**
```bash
npm start -- --clear
```

#### 3. QR Code tidak muncul atau tidak bisa di-scan
**Solusi:**
- Pastikan smartphone dan komputer dalam jaringan WiFi yang sama
- Coba gunakan tunnel mode:
  ```bash
  npx expo start --tunnel
  ```

#### 4. Aplikasi tidak bisa terhubung ke development server
**Solusi:**
- Restart development server: `Ctrl+C` lalu `npm start` lagi
- Pastikan firewall tidak memblokir port 8081
- Coba gunakan tunnel mode

#### 5. Database error atau data tidak muncul
**Solusi:**
- Hapus aplikasi dan install ulang (database akan dibuat ulang)
- Atau reset database melalui kode (perlu modifikasi code)

#### 6. Error saat menambahkan data (UNIQUE constraint)
**Solusi:**
- Pastikan NIM atau Kode Prodi belum pernah digunakan
- Gunakan NIM/Kode Prodi yang berbeda

#### 7. Aplikasi crash saat dibuka
**Solusi:**
- Restart development server
- Clear cache: `npm start -- --clear`
- Uninstall dan reinstall Expo Go

#### 8. Ikon tidak muncul
**Solusi:**
```bash
npm install @expo/vector-icons
npm start -- --clear
```

#### 9. TypeScript errors
**Solusi:**
```bash
npm install --save-dev @types/react @types/react-native typescript
```

#### 10. Port 8081 sudah digunakan
**Solusi:**
- Tutup aplikasi yang menggunakan port tersebut
- Atau gunakan port lain: `npx expo start --port 8082`

---

## 9. Informasi Developer

### Aplikasi: Belajar Database
**Versi:** 1.0.0  
**Tahun:** 2024

### Developer:
- **Nama:** Edi Suherlan
- **Email:** edisuherlan@gmail.com
- **Institusi:** Universitas Faletehan

### Teknologi yang Digunakan:
- React Native 0.81.5
- Expo ~54.0.22
- Expo Router ~6.0.14
- SQLite (expo-sqlite ^16.0.9)
- TypeScript ~5.9.2

### Lisensi:
Educational Purpose

---

## 📞 Bantuan Tambahan

Jika masih mengalami masalah:
1. Periksa dokumentasi Expo: [https://docs.expo.dev/](https://docs.expo.dev/)
2. Periksa dokumentasi React Native: [https://reactnative.dev/docs/getting-started](https://reactnative.dev/docs/getting-started)
3. Komunitas Expo Discord: [https://chat.expo.dev](https://chat.expo.dev)

---

**Selamat menggunakan aplikasi Belajar Database! 🎉**
