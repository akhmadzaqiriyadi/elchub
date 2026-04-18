# Backend Feature-Based Guide

Panduan ini dipakai oleh developer dan AI saat mengubah backend Elchub.

## Tujuan

- Menjaga backend tetap modular.
- Mencegah bootstrap app jadi tempat logic bisnis.
- Memisahkan concern seperti auth, prisma, logging, dan mailer.
- Menjaga struktur tetap mudah di-scan oleh manusia dan AI.

## Struktur Yang Dipakai

- `src/app.ts` untuk bootstrap aplikasi.
- `src/index.ts` untuk entrypoint runtime.
- `src/config` untuk konfigurasi dan env validation.
- `src/lib` untuk helper lintas modul seperti logger, prisma, auth, dan mailer.
- `src/modules/<domain>` untuk feature / domain backend.
- `prisma/` untuk schema database dan migration.

## Aturan Utama

### 1. Bootstrap Harus Tipis

`src/app.ts` hanya untuk wiring plugin dan route.

Yang boleh ada di bootstrap:

- security headers
- cors
- logger hook
- swagger
- route registration
- error handler global

Yang tidak boleh dominan di bootstrap:

- query database
- hashing password
- token generation
- email delivery
- business rule per domain

### 2. Logic Domain Masuk `src/modules`

Kalau kode hanya dipakai oleh satu domain, taruh di modul domain itu.

Contoh:

- auth -> `src/modules/auth`
- health -> `src/modules/health`
- user -> `src/modules/user`
- billing -> `src/modules/billing`

### 3. Shared Helper Masuk `src/lib`

Masukkan helper yang dipakai banyak modul ke `src/lib`.

Contoh:

- logger
- prisma client
- JWT helper
- mailer
- password helper

### 4. Prisma Hanya Untuk Data Access

- Schema database berada di `prisma/schema.prisma`.
- Jangan menaruh query langsung di route kalau bisa dipindah ke service.
- Gunakan service layer jika logika mulai kompleks.

### 5. Auth Harus Dipisah

Auth minimal terdiri dari:

- schema / validation
- service / business logic
- route / HTTP adapter
- helper token dan password di `src/lib`

Flow auth aktif saat ini:

- register
- login
- me
- logout
- forgot-password
- reset-password

## Aturan Penamaan

- Gunakan `kebab-case` untuk file dan folder.
- Gunakan nama domain yang jelas.
- Hindari nama generik seperti `helper.ts`, `misc.ts`, atau `temp.ts`.
- Komponen / class / type tetap pakai `PascalCase`.

## Aturan Import

- Gunakan import relatif yang pendek dan jelas.
- Jangan buat alias baru tanpa alasan kuat.
- Pisahkan import external, internal, lalu local secara rapi.

## Aturan Environment

- `backend/.env.development.example` untuk local dev.
- `backend/.env.production.example` untuk deployment production.
- `.env.example` hanya sebagai ringkasan default.
- Semua env wajib didokumentasikan kalau dipakai di code.

## Checklist Saat Menambah Modul Baru

- Buat folder baru di `src/modules/<nama-modul>`.
- Tambah schema jika butuh validasi input.
- Tambah service jika logic mulai banyak.
- Tambah route hanya sebagai adapter HTTP.
- Taruh helper umum di `src/lib`.
- Update README dan guide jika module itu berpengaruh ke cara kerja project.

## Checklist Sebelum Merge

- `src/app.ts` masih tipis.
- Logger, security headers, cors, prisma, mailer, dan auth tetap terpusat.
- Env dev / prod terdokumentasi.
- Prisma schema sinkron dengan code.
- Typecheck dan test lolos.
- Pre-integration tests lolos sebelum FE integration.

## Prinsip Akhir

- Route untuk HTTP.
- Service untuk business logic.
- Lib untuk helper umum.
- Prisma untuk data access.
- Config untuk env dan bootstrap settings.