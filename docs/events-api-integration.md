# Panduan Integrasi API: Sorting & Filtering Events 🚀

Dokumen ini menjelaskan perubahan terbaru pada endpoint `GET /api/management/events` dan `GET /api/events` yang sekarang telah mendukung fitur **Dynamic Sorting** dan **Date Range Filtering**.

## 📌 Apa yang Berubah?

Terdapat 4 *Query Parameter* baru yang bisa dikirimkan dari frontend (semuanya opsional):
- `sortBy` (string): Menentukan kolom yang digunakan untuk mengurutkan data.
- `sortOrder` (string): Menentukan arah pengurutan (`asc` atau `desc`).
- `startDate` (ISO 8601 string): Batas awal pencarian tanggal acara (`startAt`).
- `endDate` (ISO 8601 string): Batas akhir pencarian tanggal acara (`startAt`).

---

## 🛠️ Detail Query Parameters Baru

| Parameter | Tipe Data | Nilai Valid | Default Value | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `sortBy` | `string` | `'createdAt'`, `'startAt'`, `'endAt'`, `'title'` | `'createdAt'` | Kolom referensi *sorting*. |
| `sortOrder` | `string` | `'asc'`, `'desc'` | `'desc'` | Arah *sorting*. Naik (A-Z, Lama-Baru) atau turun. |
| `startDate` | `string` | ISO Date (ex: `2026-05-01T00:00:00Z`) | `undefined` | Mencari acara yang *dimulai* (**startAt**) setelah atau pada tanggal ini. |
| `endDate` | `string` | ISO Date (ex: `2026-05-31T23:59:59Z`) | `undefined` | Mencari acara yang *dimulai* (**startAt**) sebelum atau pada tanggal ini. |

---

## 💡 Contoh Penggunaan (Use Cases) di Frontend

### 1. Menampilkan Event Paling Baru Dibuat (Default Behavior)
Jika frontend tidak mengirim parameter apapun, API akan otomatis mengurutkan berdasarkan waktu input `createdAt` dari yang terbaru ke terlama (`desc`).
```http
GET /api/management/events
```

### 2. Mengurutkan Berdasarkan Jadwal Acara Terdekat
Digunakan jika user ingin melihat tabel terurut dari acara yang "Paling cepat/segera berjalan" berdasarkan atribut `startAt`.
```http
GET /api/management/events?sortBy=startAt&sortOrder=asc
```

### 3. Mengurutkan Judul Sesuai Abjad (A-Z)
Biasanya dieksekusi jika pengguna menekan *header* kolom **Nama Event** pada tabel UI.
```http
GET /api/management/events?sortBy=title&sortOrder=asc
```

### 4. Menampilkan Event pada Rentang Waktu Spesifik (Date Picker)
Misal: User memilih filter tanggal dari 1 Mei 2026 sampai 31 Mei 2026. Ini sangat berguna untuk filter bulanan di tabel *Management*.
```http
GET /api/management/events?startDate=2026-05-01T00:00:00Z&endDate=2026-05-31T23:59:59Z
```

### 5. Kombinasi Filter Status & Tanggal (Kompleks)
Misal mencari: Event yang berstatus "PUBLISHED", di bulan Mei 2026, lalu diurutkan dari acara yang paling cepat mulai.
```http
GET /api/management/events?statusCode=PUBLISHED&startDate=2026-05-01T00:00:00Z&endDate=2026-05-31T23:59:59Z&sortBy=startAt&sortOrder=asc
```

---

## ⚠️ Catatan Penting untuk Tim Frontend

- **Format Tanggal**: Pastikan untuk selalu memformat nilai `Date` dari *Date Picker* UI menjadi string **ISO 8601** saat memanggil API (kalian bisa menggunakan `.toISOString()` di JS/TS).
- **Graceful Handling**: Jika parameter *date* dikirim kosong (misal di URL cuma `startDate=&endDate=`), API akan secara pintar mengabaikannya dan tidak akan mengembalikan HTTP Error.
- **Kompatibilitas**: Perubahan ini bersifat *non-breaking*. Semua kode FE yang memanggil API ini sebelumnya dengan cara lama akan tetap berjalan normal menggunakan format *default sorting*.
