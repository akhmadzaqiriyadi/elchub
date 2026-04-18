# Workspace Rules

Panduan ini menjelaskan cara menjalankan proyek dan batasan struktur kode untuk workspace Elchub.

## Cara Menjalankan

- Jalankan semua service dari root dengan `bun run dev`.
- Jalankan `bun install` dari root untuk memasang dependency frontend dan backend sekaligus.
- Frontend ada di `frontend/` dan berjalan di port `3000`.
- Backend ada di `backend/` dan berjalan di port `3001`.
- Request frontend ke `/api/*` diproxy ke backend saat development.

Frontend membaca env dari `frontend/.env.development.example` dan `frontend/.env.production.example`.
Backend membaca env dari `backend/.env.development.example` dan `backend/.env.production.example`.

## Perintah Penting

- `bun run dev` - jalankan frontend dan backend bersamaan.
- `bun run dev:frontend` - jalankan frontend saja.
- `bun run dev:backend` - jalankan backend saja.
- `bun run typecheck` - cek TypeScript kedua project.
- `bun run test` - jalankan test backend.
- `bun run test:preintegration` - jalankan test pre-integration backend.
- `bun run test:preintegration:auth` - jalankan test pre-integration auth saja.
- `bun run check:preintegration` - jalankan quality gate pre-integration (typecheck + tests).

## Batasan Struktur

- Jangan taruh logic bisnis besar di root workspace.
- Semua kode aplikasi frontend harus tetap di `frontend/`.
- Semua kode aplikasi backend harus tetap di `backend/`.
- Root hanya untuk workspace scripts, dokumentasi, dan penghubung antar project.

## Aturan Frontend

- Gunakan struktur feature-based di `frontend/src/features`.
- Biarkan `frontend/src/app` tetap tipis.
- Komponen reusable taruh di `frontend/src/components`.
- Utility global taruh di `frontend/src/lib` atau `frontend/src/config`.
- Wajib pisah layer untuk feature yang punya logic non-trivial (minimal: `components`, `hooks/use-case`, `api/services`, `types`, `constants/utils`).
- Jangan campur UI rendering dengan data orchestration dalam satu file panjang.
- Gunakan `ThemeProvider` global untuk mode terang/gelap dan simpan preference tema di localStorage.
- Gunakan class `dark:` untuk visual override pada komponen yang butuh beda tampilan di dark mode.

## Standar Layer Frontend (Wajib)

Untuk feature baru atau refactor feature existing, gunakan pemisahan ini:

- Presentation layer: komponen UI murni (render + event binding), simpan di `features/<feature>/components`.
- Use-case layer: state dan flow (mutation/query/form orchestration), simpan di `features/<feature>/hooks`.
- Data layer: API client, payload mapping, cache key policy, simpan di `features/<feature>/api` atau `services`.
- Contract layer: type/interface/schema/constants, simpan di `features/<feature>/types` dan `constants`.
- Utility layer: pure helper functions, simpan di `features/<feature>/utils` atau `lib` jika benar-benar lintas fitur.

Rule praktis:

- Komponen page/panel tidak boleh berisi semua logic validasi, API call, dan session orchestration sekaligus.
- Jika logic bisa dites tanpa DOM, pindahkan dari komponen ke hook/utils.
- Jika dipakai lintas fitur, pindah ke shared (`src/components`, `src/lib`, `src/config`).
- Jika belum lintas fitur, tetap di folder feature.

## Aturan Backend

- Simpan bootstrap app di `backend/src/app.ts`.
- Simpan route per domain di `backend/src/modules`.
- Keep route files thin.
- Validasi env di `backend/src/config/env.ts`.
- Logger, security headers, Prisma, mailer, dan auth disimpan di `backend/src/lib` dan `backend/src/modules`.

## Aturan Perubahan

- Kalau perubahan hanya untuk satu feature, ubah di feature itu dulu.
- Kalau reusable lintas fitur, baru pindahkan ke shared layer.
- Jangan menambah abstraksi baru kalau belum perlu.
- Jangan memindahkan file tanpa alasan teknis.
- Saat refactor, utamakan pecah file berdasarkan tanggung jawab, bukan berdasarkan ukuran file saja.

## Base Writing Code Standard

- Gunakan function/component kecil dengan satu tanggung jawab utama.
- Hindari nested condition berlebihan; ekstrak ke helper bernama jelas.
- Nama function harus menjelaskan intent (`validateAuthForm`, `readBackendFieldErrors`, dst).
- Type harus eksplisit untuk payload eksternal (API request/response/error).
- Error handling harus konsisten: map ke field error bila bisa, fallback ke toast/message global.
- Hindari magic string berulang; pindahkan ke constants.
- Import disusun: external, internal alias `@/`, lalu lokal.
- Semua perubahan harus lolos typecheck minimal.

## Checklist Sebelum Merge

- Root script masih bisa menjalankan kedua project.
- Frontend dan backend tetap bisa dijalankan terpisah.
- Proxy `/api/*` masih mengarah ke backend.
- Typecheck lolos.
- Test backend lolos.
- Test pre-integration auth lolos sebelum FE integration.
- Pastikan halaman auth (`/auth`, `/login`, `/register`, `/forgot-password`, `/reset-password`) tetap berjalan.
- Pastikan toggle tema dark/light bekerja di landing dan auth pages.

## Swagger Notes

- Dokumentasi API tersedia di `http://localhost:3001/api/docs`.
- Jika panel response Scalar menampilkan `No Body`, cek endpoint real dengan curl karena response bisa tetap valid.
- Pastikan menggunakan hard refresh browser jika schema baru belum terlihat.

## Backend Stack

- Bun
- Elysia
- Prisma
- Pino logger
- Security headers
- CORS
- Nodemailer
- JWT auth

## Environment Files

- `frontend/.env.development.example` dan `frontend/.env.production.example`
- `backend/.env.development.example` dan `backend/.env.production.example`
- `.env.example` di masing-masing project sebagai ringkasan default

## Prinsip Singkat

- Route hanya untuk routing.
- Feature untuk logic domain.
- Shared untuk hal yang benar-benar umum.
- Root untuk orkestrasi, bukan business logic.