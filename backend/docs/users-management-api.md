# Management Users API Documentation

Modul `Users Management` menyediakan antarmuka REST API bagi Admin untuk mengelola data user secara komprehensif, termasuk operasi Read (dengan search, filter, pagination), Create, Update, dan Delete.

**Base URL**: `http://localhost:3000/api/management/users` *(Sesuaikan dengan port backend yang berjalan)*
**Authorization**: Wajib menyertakan header `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`. Semua endpoint ini dilindungi dan HANYA bisa diakses oleh role `ADMIN`.

---

## 1. Get Users List

Mengambil daftar seluruh user. Mendukung fitur pencarian, filter berdasarkan role & status aktif, serta pagination.

**Endpoint**: `GET /`
**Role Required**: `ADMIN`

### Query Parameters

| Parameter  | Type      | Required | Description |
| ---------- | --------- | -------- | ----------- |
| `q`        | string    | No       | Keyword pencarian untuk field `name` atau `email`. Pencarian bersifat _case-insensitive_. |
| `role`     | string    | No       | Filter berdasarkan role. Nilai valid: `USER`, `ORGANIZER`, `MENTOR`, `ADMIN`. |
| `isActive` | boolean   | No       | Filter berdasarkan status user. Nilai valid: `true` (aktif), `false` (inaktif). |
| `page`     | number    | No       | Nomor halaman untuk pagination. Default: `1`. |
| `limit`    | number    | No       | Jumlah maksimal data per halaman. Default: `10`, Maksimal: `50`. |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cuid_string",
        "name": "Budi Santoso",
        "email": "budi@elchub.local",
        "role": "MENTOR",
        "isActive": true,
        "emailVerifiedAt": "2024-03-20T10:00:00.000Z",
        "createdAt": "2024-03-15T08:30:00.000Z",
        "updatedAt": "2024-03-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

---

## 2. Get User By ID

Mengambil detail satu user spesifik berdasarkan ID.

**Endpoint**: `GET /:id`
**Role Required**: `ADMIN`

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "cuid_string",
    "name": "Budi Santoso",
    "email": "budi@elchub.local",
    "role": "MENTOR",
    "isActive": true,
    "emailVerifiedAt": "2024-03-20T10:00:00.000Z",
    "createdAt": "2024-03-15T08:30:00.000Z",
    "updatedAt": "2024-03-20T10:00:00.000Z"
  }
}
```

### Response (404 Not Found)

Jika user ID tidak ditemukan.
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 3. Create New User

Membuat akun user baru langsung dari dashboard management.

**Endpoint**: `POST /`
**Role Required**: `ADMIN`

### Request Body (JSON)

| Field      | Type    | Required | Description |
| ---------- | ------- | -------- | ----------- |
| `email`    | string  | Yes      | Email user yang valid. Harus unik. |
| `password` | string  | Yes      | Password user (Minimal 8 karakter). |
| `name`     | string  | No       | Nama user. |
| `role`     | string  | No       | Role user (`USER`, `ORGANIZER`, `MENTOR`, `ADMIN`). Default: `USER`. |
| `isActive` | boolean | No       | Status aktif user. Default: `true`. |

```json
{
  "name": "Admin Baru",
  "email": "admin2@elchub.local",
  "password": "SuperSecretPassword123!",
  "role": "ADMIN",
  "isActive": true
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "cuid_new",
    "name": "Admin Baru",
    "email": "admin2@elchub.local",
    "role": "ADMIN",
    "isActive": true,
    "emailVerifiedAt": null,
    "createdAt": "2024-03-27T10:00:00.000Z",
    "updatedAt": "2024-03-27T10:00:00.000Z"
  }
}
```

### Response (409 Conflict)

Jika email sudah terdaftar sebelumnya.
```json
{
  "success": false,
  "message": "Email is already registered"
}
```

---

## 4. Update User

Memperbarui data user yang sudah ada. **Semua field bersifat opsional (Partial Update)**. Jika dikirim kosong atau tidak di-include, datanya tidak akan berubah.

**Endpoint**: `PATCH /:id`
**Role Required**: `ADMIN`

### Request Body (JSON)

| Field      | Type    | Required | Description |
| ---------- | ------- | -------- | ----------- |
| `name`     | string  | No       | Nama user baru. |
| `email`    | string  | No       | Email baru. (Jika diubah, sistem memvalidasi ulang keunikan email). |
| `password` | string  | No       | Password baru (Min 8 karakter). |
| `role`     | string  | No       | Role baru (`USER`, `ORGANIZER`, `MENTOR`, `ADMIN`). |
| `isActive` | boolean | No       | Set menjadi `false` untuk me-nonaktifkan akun (banned/suspend) tanpa menghapusnya. |

```json
{
  "role": "ORGANIZER",
  "isActive": false
}
```

### Response (200 OK)

Mengembalikan payload object user terbaru.
```json
{
  "success": true,
  "data": { ... }
}
```

### Response (409 Conflict)
Jika mengubah `email`, dan `email` tersebut sudah dipakai oleh user lain.
```json
{
  "success": false,
  "message": "Email is already used by another user"
}
```

---

## 5. Delete User

Menghapus data user secara permanen.

**Endpoint**: `DELETE /:id`
**Role Required**: `ADMIN`

### Response (200 OK)

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Error Handling

Selain error spesifik di atas, backend menggunakan struktur baku untuk error response:

- **401 Unauthorized**: Token hilang, invalid, atau expired.
- **403 Forbidden**: Token valid, tapi role user BUKAN `ADMIN`.
- **422 Unprocessable Entity**: Format body tidak sesuai dengan Schema validation (contoh: password < 8 char, format email salah).
