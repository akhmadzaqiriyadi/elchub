# Elchub Frontend Boilerplate

Frontend starter based on the reference Next.js app.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Class-based dark mode theming (`light` / `dark`)
- Shared utility helpers for future UI components
- Environment config for dev/prod API endpoints
- Sonner notifications
- Axios API client
- TanStack Query for request state + caching

## Getting Started

1. Install dependencies.
2. Copy `.env.development.example` to `.env.local` for local development.
3. Run `bun run dev`.

If you are working from the workspace root, a single `bun install` there will install both frontend and backend dependencies.

## Package Manager

This project is set up to use [Bun](https://bun.sh/) as the primary package manager.

Recommended commands:

- `bun install`
- `bun run dev`
- `bun run build`
- `bun run lint`
- `bun run typecheck`

## Environment Files

- `.env.development.example` for local development
- `.env.production.example` for production deployments
- `.env.example` as a quick reference

## Backend Proxy

During development, requests to `/api/*` are proxied to the backend URL configured by `BACKEND_PROXY_URL`.

The landing page includes a small backend health card that calls `/api/health` through this proxy.

## Auth Integration

Frontend auth sekarang memakai halaman terpisah + komponen atomic yang tetap terhubung ke endpoint backend:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Route frontend yang tersedia:

- `/auth`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password?token=...`

Auth requests use TanStack Query mutations and `/auth/me` is cached with query keys that include current token.
Token is persisted in localStorage plus a client cookie (demo purpose) and both are cleared when logout is triggered.

## Theme Mode

Boilerplate frontend sudah mendukung mode terang/gelap dengan persistensi localStorage.

- Provider: `src/components/providers/theme-provider.tsx`
- Toggle UI: `src/components/ui/theme-toggle.tsx`
- Token warna global: `src/styles/globals.css`
- Tailwind dark mode: `frontend/tailwind.config.cjs` (`darkMode: 'class'`)

## Base UI Components

Reusable primitives are provided in `src/components/ui`:

- `button.tsx`
- `card.tsx`
- `input.tsx`
- `label.tsx`
- `field.tsx`
- `skeleton.tsx`
- `spinner.tsx`
- `theme-toggle.tsx`

## Structure

- `src/app` for routes and layouts
- `src/components` for shared UI pieces
- `src/features` for feature-based modules and business flows
- `src/config` for application constants
- `src/lib` for helpers
- `src/styles` for global CSS