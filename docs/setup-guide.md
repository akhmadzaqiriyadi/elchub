# Setup Guide

Panduan ini menjelaskan urutan setup yang disarankan untuk workspace Elchub.

## 1. Clone Project

```bash
git clone <repo-url>
cd elchub
```

## 2. Install Dependencies

Jalankan dari root:

```bash
bun install
```

Karena root sudah diset sebagai Bun workspace, satu instalasi ini mencakup:

- frontend
- backend

## 3. Siapkan Environment

### Frontend

```bash
cp frontend/.env.development.example frontend/.env.local
```

### Backend

```bash
cp backend/.env.development.example backend/.env
```

Pastikan `DATABASE_URL` dan secret JWT sudah sesuai untuk environment yang dipakai.

## 4. Siapkan Database PostgreSQL

Pastikan PostgreSQL sudah jalan, lalu buat database sesuai `DATABASE_URL`.

Contoh lokal:

- host: `localhost`
- port: `5432`
- database: `elchub`

## 5. Prisma Setup

Jalankan dari backend:

```bash
bun run --cwd backend prisma:generate
bun run --cwd backend db:migrate
bun run --cwd backend db:seed
```

Kalau hanya ingin sync schema tanpa migration file:

```bash
bun run --cwd backend db:push
```

## 6. Jalankan Backend

```bash
bun run dev:backend
```

Backend berjalan di `http://localhost:3001`.

Swagger tersedia di `http://localhost:3001/api/docs`.

## 7. Jalankan Frontend

```bash
bun run dev:frontend
```

Frontend berjalan di `http://localhost:3000`.

Frontend memanggil backend lewat proxy `/api/*`.

Auth pages terbaru:

- `http://localhost:3000/auth`
- `http://localhost:3000/login`
- `http://localhost:3000/register`
- `http://localhost:3000/forgot-password`
- `http://localhost:3000/reset-password?token=<token>`

Theme mode:

- Toggle dark/light tersedia di landing dan auth shell.
- Pilihan tema disimpan di localStorage (`elchub-theme`).

## 7.5 Pre-Integration Auth Testing (Sebelum FE Integration)

Jalankan test rules backend terlebih dulu:

```bash
bun run check:preintegration
```

Atau khusus auth:

```bash
bun run test:preintegration:auth
```

## 8. Jalankan Keduanya Bersamaan

```bash
bun run dev
```

## Alur Kerja Yang Disarankan

Kalau mulai dari nol, urutan paling aman adalah:

1. clone
2. bun install
3. setup env
4. jalankan PostgreSQL
5. prisma generate + migrate
6. backend dulu
7. frontend terakhir
8. jalankan pre-integration auth checks sebelum integrasi FE

## Checklist Cepat

- `bun install` sukses di root
- `.env` frontend dan backend sudah ada
- PostgreSQL aktif
- Prisma client tergenerate
- migration sudah jalan
- backend jalan di port 3001
- frontend jalan di port 3000