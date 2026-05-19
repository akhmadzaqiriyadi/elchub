# Panduan Integrasi API Assignment / Task Module (Frontend & Backend)

Dokumen ini menjelaskan kontrak API untuk modul assignment/task agar frontend bisa langsung mengonsumsi endpoint dengan aman dan konsisten.

Base URL backend: `http://localhost:3001`

---

## 1. Gambaran Modul untuk Frontend

Modul ini dipakai untuk 2 area utama:

1. Learning Space / Student View
- daftar assignment per event
- detail assignment
- submit jawaban assignment
- menampilkan status submission user

2. Management / Organizer View
- list assignment per event
- create assignment
- update assignment
- delete assignment
- grade submission assignment

---

## 2. Format Response Standar

Semua endpoint mengikuti pola berikut:

```json
{
  "success": true,
  "message": "Opsional",
  "data": { }
}
```

Untuk error:

```json
{
  "success": false,
  "message": "Pesan error"
}
```

---

## 3. Status dan Akses

### Public / Student API
- `GET /api/events/:id/assignments`
- `GET /api/events/:id/assignments/:assignmentId`
- `POST /api/events/assignments/:assignmentId/submit`

### Management API
- `GET /api/management/events/:id/assignments`
- `POST /api/management/events/:id/assignments`
- `PUT /api/management/events/:id/assignments/:assignmentId`
- `DELETE /api/management/events/:id/assignments/:assignmentId`

### Role / Auth
- `GET list/detail` assignment: token optional, tapi jika user login dan terdaftar maka `userSubmission` ikut tampil.
- `POST submit`: wajib login.
- `Management API`: wajib `ORGANIZER`, `MENTOR`, atau `ADMIN`.

---

## 4. Data Shape

### 4.1 Assignment Item

```json
{
  "id": "cm...",
  "title": "Assignment 1",
  "description": "Kerjakan studi kasus berikut",
  "instructions": "Buat ringkasan 1 halaman",
  "releaseAt": "2026-05-19T10:00:00.000Z",
  "dueAt": "2026-05-25T23:59:59.000Z",
  "allowLate": false,
  "maxScore": 100,
  "isPublished": true,
  "order": 1,
  "section": {
    "id": "sec...",
    "title": "Bab 1",
    "order": 1
  },
  "userSubmission": null
}
```

### 4.2 Submission Shape

```json
{
  "status": "SUBMITTED",
  "answerText": "Jawaban saya...",
  "answerUrl": null,
  "submittedAt": "2026-05-19T11:12:00.000Z",
  "score": null,
  "feedback": null,
  "gradedAt": null
}
```

### 4.3 Grade Submission Shape

```json
{
  "status": "GRADED",
  "answerText": "Jawaban saya...",
  "answerUrl": null,
  "submittedAt": "2026-05-19T11:12:00.000Z",
  "score": 85,
  "feedback": "Bagus, tapi struktur perlu dirapikan.",
  "gradedAt": "2026-05-19T12:00:00.000Z"
}
```

---

## 5. Student API

### 5.1 List Assignment per Event

- Method: `GET`
- URL: `/api/events/:id/assignments`
- Query params:
  - `page` optional
  - `limit` optional

Contoh request:

```http
GET /api/events/cm123/assignments?page=1&limit=10
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "asg_1",
        "title": "Assignment 1",
        "description": "Kerjakan studi kasus berikut",
        "instructions": "Buat ringkasan 1 halaman",
        "releaseAt": "2026-05-19T10:00:00.000Z",
        "dueAt": "2026-05-25T23:59:59.000Z",
        "allowLate": false,
        "maxScore": 100,
        "isPublished": true,
        "order": 1,
        "section": {
          "id": "sec_1",
          "title": "Bab 1",
          "order": 1
        },
        "userSubmission": {
          "status": "SUBMITTED",
          "answerText": "Jawaban saya...",
          "answerUrl": null,
          "submittedAt": "2026-05-19T11:12:00.000Z",
          "score": null,
          "feedback": null,
          "gradedAt": null
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "totalPages": 1
    }
  }
}
```

### 5.2 Get Assignment Detail

- Method: `GET`
- URL: `/api/events/:id/assignments/:assignmentId`

Contoh request:

```http
GET /api/events/cm123/assignments/asg_1
```

Response: sama seperti item assignment di atas, tetapi langsung di `data`.

### 5.3 Submit Assignment

- Method: `POST`
- URL: `/api/events/assignments/:assignmentId/submit`
- Auth: wajib

Request body:

```json
{
  "answerText": "Jawaban essay saya",
  "answerUrl": null
}
```

atau

```json
{
  "answerText": null,
  "answerUrl": "https://drive.google.com/file/..."
}
```

Rules:
- minimal salah satu dari `answerText` atau `answerUrl` harus diisi
- `answerText` cocok untuk essay / jawaban singkat
- `answerUrl` cocok untuk file upload eksternal / link dokumen
- user harus punya akses event yang valid; kalau belum terdaftar akan mendapat `403 Not authorized to submit this assignment`

Response:

```json
{
  "success": true,
  "message": "Assignment submitted",
  "data": {
    "status": "SUBMITTED",
    "answerText": "Jawaban essay saya",
    "answerUrl": null,
    "submittedAt": "2026-05-19T11:12:00.000Z",
    "score": null,
    "feedback": null,
    "gradedAt": null
  }
}
```

---

## 6. Management API

### 6.1 List Assignment Management

- Method: `GET`
- URL: `/api/management/events/:id/assignments`
- Auth: wajib role management
- Query params:
  - `page` optional
  - `limit` optional

Response:
- format sama seperti student list
- perbedaannya: management bisa melihat assignment unpublished juga
- `userSubmission` di list management akan `null`

### 6.2 Create Assignment

- Method: `POST`
- URL: `/api/management/events/:id/assignments`

Request body:

```json
{
  "title": "Assignment 1",
  "description": "Kerjakan studi kasus berikut",
  "instructions": "Buat ringkasan 1 halaman",
  "sectionId": "sec_1",
  "releaseAt": "2026-05-19T10:00:00.000Z",
  "dueAt": "2026-05-25T23:59:59.000Z",
  "allowLate": false,
  "maxScore": 100,
  "isPublished": true,
  "order": 1
}
```

### 6.3 Update Assignment

- Method: `PUT`
- URL: `/api/management/events/:id/assignments/:assignmentId`

Catatan:
- body bersifat partial-safe secara backend, tetapi frontend disarankan tetap kirim field lengkap supaya form state konsisten
- jika `sectionId` dikirim `null`, assignment akan dilepas dari section

### 6.4 Delete Assignment

- Method: `DELETE`
- URL: `/api/management/events/:id/assignments/:assignmentId`

### 6.5 Grade Submission

- Method: `PATCH`
- URL: `/api/management/events/:id/assignments/:assignmentId/submissions/:userId/grade`
- Auth: wajib role management

Request body:

```json
{
  "score": 85,
  "feedback": "Bagus, tapi struktur perlu dirapikan.",
  "status": "GRADED"
}
```

Notes:
- `score` optional, bisa `null` jika hanya ingin memberi feedback.
- `status` mendukung `GRADED` dan `RETURNED`.
- `gradedAt` diisi otomatis oleh backend saat grading.

Response:

```json
{
  "success": true,
  "message": "Submission graded",
  "data": {
    "status": "GRADED",
    "answerText": "Jawaban saya...",
    "answerUrl": null,
    "submittedAt": "2026-05-19T11:12:00.000Z",
    "score": 85,
    "feedback": "Bagus, tapi struktur perlu dirapikan.",
    "gradedAt": "2026-05-19T12:00:00.000Z"
  }
}
```

---

## 7. Query Parameter Pagination

Gunakan pola yang sama dengan syllabus:

| Parameter | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `page` | number | `1` | halaman aktif |
| `limit` | number | `10` | jumlah item per halaman |

Contoh:

```http
GET /api/events/cm123/assignments?page=1&limit=10
```

Response pagination:

```json
{
  "page": 1,
  "limit": 10,
  "total": 42,
  "totalPages": 5
}
```

---

## 8. Catatan untuk Frontend

### 8.1 Komponen yang Disarankan

1. `AssignmentList`
- menampilkan list assignment per event
- support pagination
- menampilkan badge status submission

2. `AssignmentCard`
- judul, due date, score max, status publish
- tombol lihat detail

3. `AssignmentDetailDrawer` atau `AssignmentDetailPage`
- isi detail assignment
- section info
- status submission user
- tombol submit / resubmit

4. `AssignmentSubmitModal`
- form submit jawaban text atau URL
- disable tombol jika deadline lewat dan `allowLate = false`

### 8.2 Hook / API Client Pattern

Frontend sudah bisa mengikuti pola yang sama seperti syllabus:
- `getEventAssignments(eventId, token?, { page, limit })`
- `getEventAssignment(eventId, assignmentId, token?)`
- `submitAssignment(assignmentId, input, token)`

### 8.3 Behavior Penting

- Kalau user belum login, list/detail tetap bisa dibaca selama event memang accessible, tapi `userSubmission` akan `null`.
- Kalau user sudah submit, FE harus menampilkan status `SUBMITTED`.
- Setelah submit sukses, refetch detail/list supaya `userSubmission` ikut ter-update.
- Untuk assignment yang belum dipublish, hanya management API yang boleh melihat.

### 8.4 Error Handling

Error yang umum muncul:
- `403`: user belum punya akses atau bukan role management
- `404`: assignment/event tidak ditemukan
- `400`: body invalid, deadline lewat, atau submission kosong

---

## 9. Rekomendasi Alur FE

### Student Flow
1. Load list assignment dari `/api/events/:id/assignments`
2. Klik salah satu assignment
3. Load detail dari `/api/events/:id/assignments/:assignmentId`
4. Jika user belum submit, tampilkan form submit
5. Submit ke `/api/events/assignments/:assignmentId/submit`
6. Refetch detail dan list

### Management Flow
1. Load list assignment dari `/api/management/events/:id/assignments`
2. Create / edit assignment via modal form
3. Setelah simpan, refetch list
4. Delete assignment jika diperlukan

---

## 10. Ringkasan Kontrak FE

- Assignment selalu terikat ke event.
- List dan detail sudah pagination-safe.
- Submission user dipasang langsung di payload assignment via `userSubmission`.
- Response date-time sudah berupa string ISO, jadi aman langsung dipakai di frontend.
