# Panduan Integrasi API: Pendaftaran Event (User Registration) 📝

Dokumen ini menjelaskan alur dan struktur API untuk fitur pendaftaran event oleh pihak **User (Peserta)**.

## 📌 Endpoint Utama

- **URL:** `POST /api/events/:id/register`
- **Method:** `POST`
- **Authentication:** Wajib menggunakan token tipe `USER`, `ORGANIZER`, `MENTOR`, atau `ADMIN` (Header: `Authorization: Bearer <token>`).

---

## 🛠️ Aturan Validasi (Penting untuk Frontend)

Sebelum request berhasil disimpan, backend akan melakukan pengecekan berikut secara otomatis. Frontend diharapkan bisa menyesuaikan UX-nya:

1. **Status Event:** Event harus berstatus `PUBLISHED`.
2. **Jadwal Pendaftaran:** Backend menolak jika waktu saat ini di luar rentang `registrationOpenAt` hingga `registrationCloseAt`.
3. **Kuota Penuh:** Backend akan otomatis menolak jika jumlah pendaftar sudah menyentuh batas maksimal dari `capacity`.
4. **Sudah Pernah Mendaftar:** User yang mencoba mendaftar dua kali di event yang sama akan otomatis ditolak (mencegah *Double-Booking*).
5. **Event Berbayar:** Jika dari database dibilang event ini berbayar (`isFree: false`), maka pengiriman atribut `paymentProofUrl` hukumnya **wajib**. 

---

## 📥 Struktur Payload (Body Request)

Ketika form disubmit oleh user, Frontend wajib mengirimkan data dalam bentuk JSON berikut:

| Field | Tipe Data | Wajib / Opsional | Keterangan |
| :--- | :--- | :--- | :--- |
| `customAnswers` | `object` / `null` | Opsional | Hasil inputan user dari form yang dibuat secara dinamis oleh Admin. Bentuknya bebas (JSON). |
| `paymentProofUrl` | `string` / `null` | Tergantung Event | Link URL gambar bukti bayar (setelah berhasil upload ke endpoint MinIO). Wajib diisi jika `isFree: false`. |

### 💡 Contoh Request Payload

```json
{
  "customAnswers": {
    "question_1": "Saya ingin menambah relasi dan belajar lebih dalam mengenai Backend.",
    "question_2": "L"
  },
  "paymentProofUrl": "https://storage.elchub.local/uploads/events/payment-proof-abc123xyz.jpg"
}
```

---

## 📤 Struktur Response

Jika pendaftaran berhasil, backend akan mengembalikan status `200 OK` dengan format data sebagai berikut:

```json
{
  "success": true,
  "message": "Successfully registered for event",
  "data": {
    "id": "cm0mzf8p4000y...",
    "eventId": "event-id-123",
    "userId": "user-id-456",
    "statusId": "cuid-status-registered",
    "paymentStatus": "WAITING_VERIFICATION",
    "paymentProofUrl": "https://storage.elchub.local/uploads/...",
    "createdAt": "2026-05-01T15:00:00.000Z"
  }
}
```

### Penjelasan Status Pendaftaran & Pembayaran
- **Event Gratis (`isFree: true`)**: Saat mendaftar, `paymentStatus` otomatis menjadi `FREE`.
- **Event Berbayar (`isFree: false`)**: Saat mendaftar, `paymentStatus` akan terset menjadi `WAITING_VERIFICATION`. Nanti admin bertugas melakukan validasi (terima/tolak) di Management Dashboard.
- Status pendaftaran utama (kehadiran) secara *default* akan menembak ke ID Master Data yang ber-kode `REGISTERED`.

---

## 📅 Riwayat Pendaftaran (User)

Endpoint ini digunakan oleh user untuk melihat semua event yang sudah dia daftarkan.

- **URL:** `GET /api/events/my-events`
- **Authentication:** Wajib (Semua role)

### Contoh Response
```json
{
  "success": true,
  "data": [
    {
      "registrationId": "cmoq...",
      "status": "Registered",
      "paymentStatus": "WAITING_VERIFICATION",
      "registeredAt": "2026-05-04T09:00:00.000Z",
      "event": {
        "id": "event-id-123",
        "title": "Backend Workshop",
        ...
      }
    }
  ]
}
```

---

## 👨‍💼 Management Endpoint (Organizer / Admin)

Fitur untuk panitia / penyelenggara dalam mengelola dan menyetujui (approve) pendaftar.

### 1. List Pendaftar Event
- **URL:** `GET /api/management/events/:id/registrations`
- **Authentication:** Wajib (`ORGANIZER` atau `ADMIN`)

**Contoh Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "reg-id-123",
      "user": {
        "id": "user-id-456",
        "name": "Budi Santoso",
        "email": "budi@example.com"
      },
      "status": "Registered",
      "statusCode": "REGISTERED",
      "paymentStatus": "WAITING_VERIFICATION",
      "paymentProofUrl": "https://storage...",
      "customAnswers": { ... },
      "createdAt": "2026-05-04T09:00:00.000Z"
    }
  ]
}
```

### 2. Update Status Pendaftar (Approve / Reject)
- **URL:** `PATCH /api/management/events/:id/registrations/:registrationId`
- **Authentication:** Wajib (`ORGANIZER` atau `ADMIN`)
- **Body Payload (Opsional):**
  - `statusCode` (string): Contoh `"REGISTERED"`, `"REJECTED"`, `"CANCELLED"`
  - `paymentStatus` (string): Contoh `"PAID"`, `"WAITING_VERIFICATION"`, `"REJECTED"`

**Contoh Payload:**
```json
{
  "statusCode": "REGISTERED",
  "paymentStatus": "PAID"
}
```
