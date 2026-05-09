# Panduan Integrasi API: Public Events List & Filtering 🚀

Dokumen ini memuat detail spesifikasi untuk Endpoint Publik yang digunakan untuk menampilkan daftar event (misal di halaman `/events` Frontend).

**Endpoint URL**: `GET /api/events`

Endpoint ini telah dilengkapi dengan pagination, pencarian, dan filtering lengkap untuk menampilkan data acara secara dinamis.

---

## 📌 Query Parameters yang Tersedia

Berikut adalah seluruh *Query Parameter* opsional yang bisa dikirimkan dari Frontend:

### 🔍 1. Pencarian & Dasar
| Parameter | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `q` | `string` | Fast search. Mengembalikan event yang `title` atau `description`-nya mengandung string ini. |
| `page` | `number` | Halaman data untuk pagination (default: 1). |
| `limit` | `number` | Jumlah item per halaman (default: 10). |

### 🏷️ 2. Filter Kategori / Jenis
| Parameter | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `typeSlug` | `string` | Filter berdasarkan tipe event (contoh: `workshop`, `webinar`). |
| `modeSlug` | `string` | Filter berdasarkan mode (contoh: `online`, `offline`, `hybrid`). |
| `levelSlug` | `string` | Filter berdasarkan level (contoh: `beginner`, `intermediate`, `advanced`). |
| `statusCode` | `string` | Filter status (sangat disarankan di-set `PUBLISHED` di public list agar DRAFT tidak muncul). |

### 💰 3. Filter Harga
| Parameter | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `isFree` | `boolean` (`true`/`false`) | Menampilkan khusus event gratis (`true`) atau khusus berbayar (`false`). |
| `minPrice` | `number` | Nilai minimum harga untuk filter range harga event berbayar. |
| `maxPrice` | `number` | Nilai maksimum harga untuk filter range harga event berbayar. |

### 📅 4. Pengurutan & Tanggal
| Parameter | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `sortBy` | `string` | Kolom acuan (*sorting*). Nilai valid: `'createdAt'`, `'startAt'`, `'endAt'`, `'title'`. |
| `sortOrder` | `string` | Arah sorting. Nilai valid: `'asc'`, `'desc'`. |
| `startDate` | `string` (ISO 8601) | Mencari acara yang dimulai setelah atau pada waktu ini. |
| `endDate` | `string` (ISO 8601) | Mencari acara yang dimulai sebelum atau pada waktu ini. |

---

## 💡 Contoh Penggunaan (Use Cases) di Frontend

### Kasus 1: Menampilkan halaman utama `/events` (Semua event publish terbaru)
Menampilkan halaman pertama, 12 item per halaman.
```http
GET /api/events?statusCode=PUBLISHED&page=1&limit=12
```

### Kasus 2: Filter Pencarian Text + Online Saja
User mencari "Belajar React" untuk event yang modenya online.
```http
GET /api/events?statusCode=PUBLISHED&q=Belajar React&modeSlug=online
```

### Kasus 3: Filter Range Harga
User ingin mencari event berbayar yang harganya berkisar antara Rp50.000 sampai Rp150.000.
```http
GET /api/events?statusCode=PUBLISHED&isFree=false&minPrice=50000&maxPrice=150000
```

### Kasus 4: Filter Level & Pengurutan Terdekat (Berdasarkan startAt)
User mem-filter event level Beginner, diurutkan dari yang jadwal mulainya paling dekat (ascending).
```http
GET /api/events?statusCode=PUBLISHED&levelSlug=beginner&sortBy=startAt&sortOrder=asc
```

---

## ⚠️ Catatan Penting
- Parameter bersifat kumulatif (AND operator). Jika FE mengirimkan `levelSlug=beginner` dan `isFree=true`, API hanya mengembalikan event yang **Beginner DAN Gratis**.
- Semua parameter bersifat opsional.
- Jika query boolean `isFree` digunakan di URL (misal `isFree=true` atau `isFree=false`), sistem backend akan otomatis mem-parsing value string tersebut menjadi boolean yang valid.
