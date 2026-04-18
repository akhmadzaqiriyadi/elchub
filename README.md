# Elchub Workspace

Monorepo workspace for the Elchub frontend and backend.

## What This Workspace Includes

- `frontend/` - Next.js frontend built with Bun
- `backend/` - Elysia backend built with Bun
- `docs/` - workspace rules and run guidance
- Bun workspace support so one `bun install` covers both projects
- Multi-page auth flow (login/register/forgot/reset)
- Light/dark theme mode with persistent toggle

## Quick Start

1. Clone the repository.
2. Run `bun install` from the root. This installs dependencies for both `frontend/` and `backend/`.
3. Copy environment files:
	- `frontend/.env.development.example` -> `frontend/.env.local`
	- `backend/.env.development.example` -> `backend/.env`
4. Start the database first if you are using local PostgreSQL.
5. Run Prisma setup in the backend:
	- `bun run --cwd backend prisma:generate`
	- `bun run --cwd backend db:migrate` or `bun run --cwd backend db:push`
	- `bun run --cwd backend db:seed`
6. Start the backend with `bun run dev:backend`.
7. Start the frontend with `bun run dev:frontend`.
8. Or start both at once with `bun run dev`.
9. Run pre-integration auth checks before FE integration:
	- `bun run check:preintegration`

10. Open backend API docs:
	- `http://localhost:3001/api/docs`

## Recommended Order

If you want the most predictable setup, use this order:

1. Install dependencies at the root.
2. Prepare PostgreSQL and set `DATABASE_URL`.
3. Run backend Prisma generation and migration.
4. Start backend.
5. Start frontend.

## Runtime URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Backend Swagger docs: `http://localhost:3001/api/docs`
- Auth pages:
	- `http://localhost:3000/auth`
	- `http://localhost:3000/login`
	- `http://localhost:3000/register`
	- `http://localhost:3000/forgot-password`
	- `http://localhost:3000/reset-password?token=<token>`

The frontend proxies `/api/*` requests to the backend during development.

The backend starter now includes logger, security headers, Prisma, Nodemailer, and JWT auth scaffolding.

## Useful Scripts

- `bun run dev`
- `bun run dev:frontend`
- `bun run dev:backend`
- `bun run typecheck`
- `bun run test`
- `bun run test:preintegration`
- `bun run test:preintegration:auth`
- `bun run check:preintegration`

## Docs

Read the workspace guide in [docs/rules.md](docs/rules.md) before adding or moving code.

Additional setup details are available in [docs/setup-guide.md](docs/setup-guide.md).