# Copilot Instructions

Gunakan file ini sebagai panduan kerja untuk AI dan developer saat mengubah project ini.

## Prinsip Utama

- Prioritaskan struktur feature-based.
- Jangan taruh logic bisnis di `src/app` kecuali untuk routing dan layout tipis.
- Setiap feature harus bisa berdiri sendiri sejauh mungkin.
- Hindari file campuran yang berisi UI, fetch, state, dan helper sekaligus.
- Jangan memperluas struktur tanpa alasan yang jelas.

## Struktur Folder

- `src/app` untuk routing, layout, metadata, dan page wrapper tipis.
- `src/features/<feature-name>` untuk semua logic utama fitur.
- `src/components` untuk komponen reusable lintas fitur.
- `src/config` untuk konfigurasi global dan konstanta aplikasi.
- `src/lib` untuk helper umum, utility, dan wrapper kecil.
- `src/styles` untuk global styles dan token visual.

## Aturan Feature-Based

Saat membuat fitur baru:

- Buat folder baru di `src/features/<nama-fitur>`.
- Pisahkan file berdasarkan tanggung jawab.
- Simpan komponen spesifik fitur di dalam folder feature itu.
- Simpan data statis, mock, atau config fitur di dalam feature yang sama.
- Jika logic dipakai lintas fitur, pindahkan ke `src/components`, `src/lib`, atau `src/config`.

Contoh struktur yang disarankan:

```text
src/features/orders/
├── components/
├── hooks/
├── api/
├── types/
├── data.ts
└── orders-page.tsx
```

## Aturan Untuk `src/app`

- `page.tsx` sebaiknya hanya import dan render komponen dari feature.
- `layout.tsx` hanya untuk wrapper global, font, metadata, provider, dan style global.
- Jangan menaruh business logic panjang di route file.
- Jangan duplikasi UI besar langsung di file page kalau bisa dipindah ke feature.

## Aturan Penamaan

- Gunakan nama folder feature yang jelas dan domain-driven.
- Nama file harus deskriptif, bukan generik berlebihan.
- Hindari nama seperti `helper.ts`, `data2.ts`, atau `temp.ts`.
- Gunakan `kebab-case` untuk file dan folder.
- Gunakan nama komponen dengan `PascalCase`.

## Aturan Import

- Gunakan alias `@/` untuk import internal project.
- Jangan pakai relative path yang panjang kalau alias tersedia.
- Pisahkan import external, internal alias, dan local import secara rapi.

## Aturan UI

- Komponen UI reusable harus kecil, fokus, dan bisa dipakai ulang.
- Kalau sebuah komponen hanya dipakai satu feature, simpan di feature itu.
- Jangan membuat komponen terlalu umum sebelum benar-benar dibutuhkan.
- Jaga konsistensi style, spacing, dan token visual.
- Gunakan token warna global + class `dark:` untuk kompatibilitas theme mode.
- Gunakan `ThemeProvider` untuk state tema global, jangan duplikasi state tema lokal per halaman.

## Aturan Untuk AI

Saat AI diminta mengubah kode:

- Cari dulu file fitur yang paling dekat dengan perubahan.
- Jangan langsung menyebar edit ke banyak folder kalau cukup satu feature.
- Jika behavior berasal dari satu feature, ubah di feature itu dulu.
- Jangan memindahkan file tanpa alasan teknis yang jelas.
- Jangan menambah abstraksi baru kalau belum ada kebutuhan nyata.

## Checklist Sebelum Commit Perubahan

- Struktur folder masih feature-based.
- `src/app` tetap tipis.
- Komponen reusable tidak tercampur dengan logic feature.
- Import path rapi dan konsisten.
- Perubahan lolos typecheck.
- Tidak ada file liar yang hanya berisi eksperimen.

## Prinsip Praktis

Kalau ragu, pakai aturan ini:

- Logic yang hanya untuk satu domain -> taruh di feature.
- Logic yang dipakai banyak bagian -> taruh di shared layer.
- Hal yang mengatur route -> taruh di `src/app`.
- Hal yang mengatur tampilan global -> taruh di `src/styles` atau `src/config`.

## Konteks Auth & Theme Saat Ini

- Auth pages: `/auth`, `/login`, `/register`, `/forgot-password`, `/reset-password`.
- Auth UI memakai komponen atomic di `src/features/auth/components`.
- Theme mode (`light`/`dark`) dikelola oleh provider global dan toggle reusable.

Tujuan akhirnya: struktur tetap rapi, mudah dibaca AI maupun developer baru, dan tidak cepat berantakan saat fitur bertambah.
