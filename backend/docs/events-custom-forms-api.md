# Panduan Integrasi API: Event Berbayar & Form Pendaftaran Custom 🎟️

Dokumen ini menjelaskan perubahan struktur *payload* untuk mengakomodasi fitur **Event Berbayar (Paid Events)** dan **Custom Form Schema** (membuat form pendaftaran yang dinamis untuk tiap event).

## 📌 Apa yang Berubah di Endpoint Management Event?

Endpoint pembuatan dan pengeditan Event sekarang membutuhkan/mengembalikan tiga *field* baru di dalam *body payload*-nya.

- **Route yang Terdampak:**
  - `POST /api/management/events` (Create Event)
  - `PATCH /api/management/events/:id` (Update Event)
  - `GET /api/management/events/:id` (Get Detail Event)
  - `GET /api/management/events` (List Management Events)

---

## 🛠️ Field Baru di Payload (Body & Response)

Frontend wajib menyesuaikan *interface* data event-nya dengan tambahan atribut berikut:

| Field | Tipe Data | Wajib / Opsional | Default | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `isFree` | `boolean` | Opsional | `true` | Menandakan apakah event ini gratis. Jika di-set `false`, admin *wajib* mengirimkan `price`. |
| `price` | `number` / `null` | Opsional | `null` | Harga tiket event. Wajib diisi (minimal 0) jika `isFree` adalah `false`. |
| `formSchema` | `array` / `object` / `null` | Opsional | `null` | Struktur JSON bebas yang digunakan untuk *render* form dinamis saat pendaftaran user. |

---

## 💡 Contoh Implementasi di Frontend (React / FE)

### 1. Payload Pembuatan Event (POST / PATCH)
Ketika admin menyimpan form event, frontend bisa mengirimkan JSON seperti ini:

```json
{
  "title": "Workshop Next.js 2026",
  "typeId": "cuid-tipe-1",
  "modeId": "cuid-mode-2",
  "statusId": "cuid-status-3",
  "isFree": false,
  "price": 150000,
  "formSchema": [
    { 
      "id": "question_1", 
      "type": "text", 
      "label": "Apa alasan kamu ikut event ini?", 
      "required": true 
    },
    { 
      "id": "question_2", 
      "type": "select", 
      "label": "Ukuran Kaos", 
      "options": ["S", "M", "L", "XL"],
      "required": false 
    }
  ]
}
```

### 2. Penanganan Edit Event (PATCH)
Karena payload menggunakan skema yang sama, saat admin mau mengedit event, field `isFree`, `price`, dan `formSchema` sudah langsung terdukung.
- Jika admin mau mengubah dari Berbayar menjadi Gratis: Kirim `isFree: true` dan `price: null`.
- Jika admin mau mereset/menghapus Custom Form: Kirim `formSchema: null`.

### 3. Validasi Error dari Backend (400 Bad Request)
Hati-hati saat merancang UI/Form validasi di Frontend:
- Backend akan otomatis melempar error 400 jika frontend mengirim `isFree: false` tapi `price` tidak dikirim, atau dikirim dengan angka negatif (`price: -50000`).

---

## 🚀 Persiapan Tahap Selanjutnya (Pendaftaran Pihak User)

Nantinya, sistem *User Registration* yang akan dikembangkan berikutnya bakal bergantung kuat pada `formSchema` ini. 
1. Saat user mau mendaftar, frontend akan nge-GET detail event, baca `formSchema`, lalu nge-*render* input form sesuai JSON tersebut.
2. Jawaban user akan dikirim balik ke backend sebagai `customAnswers`.
3. Jika `isFree === false`, frontend wajib menyediakan komponen untuk **Upload Bukti Pembayaran** (ke MinIO).
