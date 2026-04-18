# Feature-Based Guide

Panduan ini dipakai oleh developer dan AI saat menulis atau merapikan kode di project ini.

## Tujuan

- Menjaga struktur project tetap rapi.
- Mencegah logic tercecer di banyak folder.
- Membuat setiap feature mudah dibaca, diubah, dan dipindahkan.
- Mengurangi kompleksitas sejak awal.

## Struktur Yang Dipakai

- `src/app` untuk routing, layout, metadata, dan wrapper tipis.
- `src/features` untuk logic utama per domain.
- `src/components` untuk komponen reusable lintas feature.
- `src/config` untuk konfigurasi global dan konstanta.
- `src/lib` untuk helper umum.
- `src/styles` untuk global styles.

## Aturan Utama

### 0. Layer Separation Itu Wajib

Untuk feature dengan flow data (auth, form, fetch, mutation), pemisahan layer wajib diterapkan.

Minimal layer:

- `components/` -> UI rendering saja
- `hooks/` -> state + use-case orchestration
- `api/` atau `services/` -> HTTP/data access
- `types/` + `constants/` -> kontrak data dan konfigurasi kecil
- `utils/` -> pure helper

Tujuan: komponen tetap tipis, logic bisa diuji, dan perubahan lebih aman.

Contoh implementasi saat ini:

- auth flow: halaman tipis di `src/app/*` + komponen atomic di `src/features/auth/components`
- orchestration auth: `src/features/auth/hooks/use-auth-panel.ts`
- data access auth: `src/features/auth/api.ts`

### 1. App Harus Tipis

File di `src/app` jangan jadi tempat business logic.

Yang boleh ada di `src/app`:

- `layout.tsx`
- `page.tsx`
- file route wrapper
- metadata
- provider global

Yang sebaiknya tidak ada di `src/app`:

- fetch logic panjang
- state domain
- komponen fitur yang besar
- helper khusus fitur

### 2. Logic Harus Masuk Feature

Kalau sebuah kode hanya dipakai oleh satu domain, simpan di feature itu.

Contoh:

- UI landing page -> `src/features/landing`
- auth flow -> `src/features/auth`
- dashboard -> `src/features/dashboard`
- form spesifik -> tetap di feature terkait

### 3. Feature Harus Bisa Berdiri Sendiri

Setiap feature sebaiknya punya file dan subfolder sendiri.

Contoh struktur:

```text
src/features/landing/
├── components/
├── hooks/
├── api/
├── services/
├── types/
├── constants/
├── utils/
└── index.ts
```

Catatan:

- Tidak semua folder harus ada dari awal.
- Untuk feature yang ada data flow, `components + hooks + api/services + types` adalah baseline minimum.

### 4. Shared Hanya Kalau Benar-Benar Umum

Pindahkan sesuatu ke shared layer hanya kalau memang dipakai banyak feature.

Letakkan di:

- `src/components` jika itu komponen reusable
- `src/lib` jika itu utility umum
- `src/config` jika itu konstanta atau konfigurasi global

### 5. Jangan Over-Abstract

Jangan buat folder atau layer baru kalau belum ada kebutuhan nyata.

Hindari:

- folder kosong tanpa alasan
- abstraksi terlalu dini
- komponen generik berlebihan
- file `utils` yang isinya campur aduk

## Aturan Penamaan

- Gunakan nama domain yang jelas.
- Gunakan `kebab-case` untuk file dan folder.
- Gunakan `PascalCase` untuk komponen.
- Hindari nama generik seperti `common.ts`, `misc.ts`, atau `temp.ts`.

## Aturan Import

- Gunakan alias `@/` untuk import internal.
- Hindari relative path panjang.
- Pisahkan import external, internal, lalu local dengan rapi.

## Aturan Theming

- Gunakan token warna global dari `src/styles/globals.css`.
- Gunakan class Tailwind `dark:` untuk override visual yang perlu beda di dark mode.
- State tema global dikelola oleh `ThemeProvider` di `src/components/providers/theme-provider.tsx`.
- Gunakan `ThemeToggle` (`src/components/ui/theme-toggle.tsx`) untuk tombol ganti mode.

## Cara Bikin Feature Baru

Kalau mau menambah feature baru:

1. Buat folder `src/features/<nama-feature>`.
2. Tambah komponen, data, hooks, dan types yang relevan.
3. Taruh route wrapper di `src/app` kalau memang perlu route baru.
4. Import feature ke route, jangan taruh logic di route langsung.
5. Pindahkan hal yang reusable ke shared layer hanya jika dibutuhkan oleh banyak feature.

## Checklist Sebelum Merge

- `src/app` tetap tipis.
- Logic domain ada di `src/features`.
- Komponen reusable tidak tercampur dengan logic feature.
- Import path konsisten.
- Typecheck lulus.
- Struktur folder masih mudah dibaca oleh developer baru dan AI.

## Aturan Praktis Untuk AI

Kalau AI diminta mengubah kode:

- Cari feature yang paling dekat dengan perubahan.
- Ubah file paling spesifik dulu.
- Jangan memindahkan banyak file tanpa alasan teknis.
- Jangan menambah abstraksi baru kalau belum jelas manfaatnya.
- Kalau ragu, taruh logic di feature dulu, baru shared kalau sudah terbukti umum.
- Jika file komponen mulai menampung banyak state, query/mutation, validasi, dan util parsing: pecah ke `hooks/utils/constants/types`.

## Base Writing Code

- Satu file satu tanggung jawab utama.
- Hindari helper anonim panjang di dalam komponen jika dipakai berulang.
- Pisahkan validasi form ke util/hook, jangan campur dengan JSX panjang.
- Pisahkan mapping error backend ke util khusus.
- Gunakan nama function yang deskriptif dan konsisten.
- Simpan key storage/cookie/query sebagai constants, bukan hardcoded berulang.
- Pastikan perubahan lulus typecheck sebelum merge.

## Prinsip Akhir

Kalau ada pertanyaan "taruh ini di mana?", pakai aturan berikut:

- Hanya dipakai satu domain -> `src/features`
- Dipakai banyak bagian -> `src/components`, `src/lib`, atau `src/config`
- Mengatur route -> `src/app`
- Mengatur tampilan global -> `src/styles`

Dengan pola ini, project tetap rapi, scalable, dan tidak cepat berantakan.
