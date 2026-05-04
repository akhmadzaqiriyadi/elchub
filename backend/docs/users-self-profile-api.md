# Self Profile API Documentation

Dokumen ini menjelaskan endpoint backend untuk manajemen profil milik user yang sedang login.

Base URL: `http://localhost:3000`
Authorization: wajib pakai header `Authorization: Bearer <ACCESS_TOKEN>`.

---

## 1. Update Profil Sendiri

Endpoint ini dipakai user untuk memperbarui data profil dasar tanpa akses admin.

- Method: `PATCH`
- URL: `/api/users/me`
- Role: semua role yang sudah terautentikasi (`USER`, `ORGANIZER`, `MENTOR`, `ADMIN`)

### Request Body

Semua field bersifat opsional (partial update).

| Field | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `name` | `string \| null` | No | Nama user. Kirim `null` atau string kosong untuk menghapus nama. Maksimal 120 karakter. |

Contoh request:

```json
{
  "name": "Budi Santoso"
}
```

### Response Success (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmorn50abc0001i1jtxyz",
      "name": "Budi Santoso",
      "profilePhotoUrl": "https://cdn.elchub.local/profiles/budi.png",
      "email": "budi@elchub.local",
      "role": "USER",
      "createdAt": "2026-05-04T10:00:00.000Z",
      "updatedAt": "2026-05-04T10:30:00.000Z"
    }
  }
}
```

### Response Error

401 Unauthorized:

```json
{
  "success": false,
  "message": "Token not found in Authorization header"
}
```

400 Bad Request (contoh URL tidak valid):

```json
{
  "success": false,
  "message": "Failed to update profile"
}
```

---

## 2. Upload Foto Profil (MinIO)

Endpoint ini dipakai untuk upload foto profil ke MinIO, lalu backend otomatis menyimpan `profilePhotoUrl` ke user yang sedang login.

- Method: `POST`
- URL: `/api/users/me/profile-photo`
- Content-Type: `multipart/form-data`
- Field file: `file`

### Validasi Upload

- File wajib ada.
- File harus bertipe image.
- Ukuran maksimal 2MB.

### Response Success (200)

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://storage.elchub.local/elchub/users/profile-photos/abc123.png",
    "user": {
      "id": "cmorn50abc0001i1jtxyz",
      "name": "Budi Santoso",
      "profilePhotoUrl": "https://storage.elchub.local/elchub/users/profile-photos/abc123.png",
      "email": "budi@elchub.local",
      "role": "USER",
      "createdAt": "2026-05-04T10:00:00.000Z",
      "updatedAt": "2026-05-04T10:35:00.000Z"
    }
  }
}
```

### Response Error (400)

```json
{
  "success": false,
  "message": "Only image files are allowed"
}
```

---

## 3. Ganti Password Sendiri

Endpoint ini dipakai user untuk ganti password akun sendiri (terpisah dari update profil).

- Method: `PATCH`
- URL: `/api/users/me/change-password`

### Request Body

| Field | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `currentPassword` | `string` | Yes | Password lama user saat ini. |
| `newPassword` | `string` | Yes | Password baru user (minimal 8 karakter). |

Contoh request:

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Response Error (400)

```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## Catatan Kontrak Data

- Field `profilePhotoUrl` sudah tersedia di tabel `users`.
- Payload user pada endpoint auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) menyertakan `profilePhotoUrl`.
