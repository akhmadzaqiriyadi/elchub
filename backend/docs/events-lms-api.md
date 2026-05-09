# Panduan Integrasi API LMS & Silabus (Frontend & Backend)

Dokumen ini berisi detail teknis *request* dan *response* dari seluruh endpoint LMS, serta panduan penggunaannya di sisi Frontend.

---

## 🏗️ 1. Analisis Kebutuhan Frontend (Komponen & UI)

### A. Management Dashboard (Syllabus Builder)
Halaman ini ada di rute `/management/events/:id/syllabus`.
Komponen yang dibutuhkan:
1. **`SyllabusBuilder` (Induk)**: Menampilkan list bab (Section) dan materi (Material).
2. **`SectionAccordion`**: List *collapsible* yang bisa di-*drag-and-drop* (menggunakan library dnd-kit atau framer-motion).
3. **`MaterialItem`**: Row materi di dalam bab, juga bisa di-*drag-and-drop*.
4. **`MaterialFormModal`**: Modal yang berisi form untuk *Create/Update* Materi. 

### B. Public View & Learning Space
1. **`EventSyllabusTab`** (Di halaman Detail Event `/events/:id`): Menampilkan daftar materi. Kalau `isPreview: true` muncul icon `Play`/`Buka`, kalau rahasia muncul icon 🔒 *Lock*.
2. **`LearningDashboard` (Ruang Belajar Utama)**:
   - **`SidebarSyllabus`**: List bab & materi di samping kiri. Ada progres centang hijau ✅.
   - **`MaterialViewer`**: Komponen utama di kanan. Kalau tipenya `VIDEO`, maka *render* `YouTubePlayer`. Kalau `ARTICLE`, *render* `MarkdownViewer`.
   - **`CompletionToggle`**: Tombol "Tandai Selesai" / "Batal Selesai" di bawah materi.

---

## 🛠️ 2. Endpoint Reference & JSON Responses

Semua endpoint selalu mengembalikan format standar:
```json
{
  "success": true,
  "message": "Opsional pesan sukses",
  "data": { ... } // Payload data kembalian
}
```

### 2.1 Management API (Base: `/api/management/events/:id`)
*Require `ADMIN` / `ORGANIZER` Role*

#### A. Create Section (Bab Baru)
*   **POST** `/sections`
*   **Request Body**:
    ```json
    {
      "title": "Modul 1: Pengenalan",
      "order": 1,
      "isActive": true
    }
    ```
*   **Response**:
    ```json
    {
      "success": true,
      "message": "Section created",
      "data": {
        "id": "cmoy37wmj00...",
        "title": "Modul 1: Pengenalan",
        "order": 1,
        ...
      }
    }
    ```

#### B. Create Material (Materi Baru)
*   **POST** `/sections/:sectionId/materials`
*   **Request Body**:
    ```json
    {
      "title": "Video Perkenalan",
      "type": "VIDEO", // Pilihan: VIDEO, ARTICLE, DOCUMENT, QUIZ
      "content": null, // Diisi string HTML jika type ARTICLE
      "videoUrl": "https://youtube.com/watch?v=...", // Diisi jika type VIDEO
      "fileUrl": null, // Diisi URL PDF jika type DOCUMENT
      "durationMin": 15,
      "isPreview": true, // Jika true, user yang belum bayar bisa lihat content-nya
      "order": 1
    }
    ```

#### C. Bulk Reorder Sections & Materials (Drag-and-Drop)
*   **PUT** `/sections/reorder` (Untuk Bab)
*   **PUT** `/sections/:sectionId/materials/reorder` (Untuk Materi dalam Bab)
*   **Request Body**: Array ID yang sudah urut.
    ```json
    {
      "ids": ["id-section-3", "id-section-1", "id-section-2"]
    }
    ```

---

### 2.2 Public & Learning API (Base: `/api/events`)

#### A. Get Syllabus Tree (Publik & Ruang Belajar)
*   **GET** `/:id/syllabus`
*   **Auth**: Optional (`Authorization: Bearer <token>`).
*   **Cara Kerja (Masking Logic)**:
    1. Jika Header Token **TIDAK ADA**, atau user **BELUM LUNAS**: Field `content`, `videoUrl`, `fileUrl` akan disensor menjadi `null`, KECUALI jika materi di-set `isPreview: true`.
    2. Jika Header Token **ADA** dan user **SUDAH LUNAS / ORGANIZER**: Semua data akan dikembalikan utuh.
    3. *Progress Tracking*: Jika Token ADA, `userProgress` akan mengembalikan object progresnya.
*   **Response**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "cmoy37wmj00...",
          "title": "Modul 1: Pengenalan",
          "order": 1,
          "materials": [
            {
              "id": "cmoy37wmj11...",
              "title": "Video Perkenalan",
              "type": "VIDEO",
              "durationMin": 15,
              "isPreview": true,
              "order": 1,
              "content": null,
              "videoUrl": "https://youtube.com/watch?v=...", // Muncul karena isPreview: true
              "fileUrl": null,
              "userProgress": {
                 "isCompleted": true,
                 "completedAt": "2026-05-09T08:34:03.905Z"
              } // null jika belum diselesaikan
            },
            {
              "id": "cmoy37wmj22...",
              "title": "Artikel Mendalam",
              "type": "ARTICLE",
              "isPreview": false,
              "content": null, // SENSOR (karena user belum bayar & isPreview: false)
              "videoUrl": null,
              "userProgress": null
            }
          ]
        }
      ]
    }
    ```

#### B. Progress Tracking (Centang Materi Selesai)
*   **POST** `/materials/:materialId/complete`
    *   **Deskripsi**: Tandai materi sudah selesai dibaca/ditonton (Tombol Selesai ✅).
    *   **Response**: `{ "success": true, "message": "Material marked as completed", "data": { "isCompleted": true, ... } }`
*   **DELETE** `/materials/:materialId/complete`
    *   **Deskripsi**: Batalkan status selesai materi (Tombol Undo Selesai).
    *   **Response**: `{ "success": true, "message": "Material completion unmarked" }`
