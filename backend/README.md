# Elchub Backend

Backend boilerplate built with **Bun**, **Elysia**, **Prisma**, **Pino**, **security headers**, **CORS**, **Nodemailer**, and **JWT auth**.

## What this starter includes

- Modular route structure
- Logger and request logging
- Security headers (helmet-style)
- Environment validation
- Central app bootstrap
- Swagger docs
- CORS support
- Prisma data layer starter
- Auth starter with register, login, me, logout, forgot-password, and reset-password endpoints
- Nodemailer mailer starter
- `/api/health` health check endpoint
- Bun test coverage for the health route

## Stack

- [Bun](https://bun.sh/)
- [Elysia](https://elysiajs.com/)
- [Prisma](https://www.prisma.io/)
- [Pino](https://getpino.io/)
- Security headers plugin (internal Elysia middleware)
- [Nodemailer](https://nodemailer.com/)
- [Zod](https://zod.dev/)

## Project Structure

```text
src/
├── app.ts
├── index.ts
├── config/
│   └── env.ts
├── lib/
│   ├── auth.ts
│   ├── logger.ts
│   ├── mailer.ts
│   └── prisma.ts
├── modules/
│   ├── auth/
│   │   ├── auth.route.ts
│   │   ├── auth.schema.ts
│   │   └── auth.service.ts
│   ├── health/
│   │   └── health.route.ts
│   └── root/
│       └── root.route.ts
└── tests/
	└── health.test.ts

prisma/
└── schema.prisma
```

## Getting Started

1. Install dependencies.
2. Copy `.env.development.example` to `.env` for local dev.
3. Run the dev server with `bun run dev`.

If you are working from the workspace root, a single `bun install` there will install both frontend and backend dependencies.

## Scripts

- `bun run dev` - start in watch mode
- `bun run start` - start once
- `bun run prisma:generate` - generate Prisma client
- `bun run prisma:studio` - open Prisma Studio
- `bun run db:setup:brew` - install/start PostgreSQL via Homebrew and create local database
- `bun run db:push` - push schema without migration files
- `bun run db:migrate` - create and run migrations
- `bun run db:seed` - seed initial users for development
- `bun run test` - run Bun tests
- `bun run test:preintegration` - run backend pre-integration test suite
- `bun run test:preintegration:auth` - run auth pre-integration tests only
- `bun run check:preintegration` - typecheck + pre-integration tests
- `bun run typecheck` - run TypeScript check

## Pre-Integration Testing

Pre-integration tests are intentionally separated before FE integration:

- `tests/pre-integration/auth/auth.rules.test.ts` for helper-level auth checks
- `tests/pre-integration/auth/auth.api.test.ts` for API-level auth checks

Covered auth API behavior includes:

- register/login/me/logout
- forgot-password request flow
- reset-password invalid token handling
- expired JWT handling

The pre-integration runner automatically:

- resolves `DATABASE_URL`
- runs `db:push`
- runs `db:seed`
- runs selected tests

## Environment Variables

- `PORT` - server port, default `3001`
- `NODE_ENV` - runtime mode, default `development`
- `APP_URL` - backend public URL, default `http://localhost:3001`
- `FRONTEND_URL` - frontend URL, default `http://localhost:3000`
- `CORS_ORIGIN` - allowed CORS origin, default `http://localhost:3000`
- `DATABASE_URL` - Prisma database connection string
- `JWT_ACCESS_SECRET` - access token signing secret
- `JWT_REFRESH_SECRET` - refresh token signing secret
- `SMTP_*` - mailer settings for Nodemailer

## Environment Files

- `.env.development.example` for local development
- `.env.production.example` for production deployments
- `.env.example` as a quick reference for common defaults

## Prisma Version Note

This backend currently runs on Prisma 6.x. In this version, `datasource.url` is still required in `prisma/schema.prisma`.

`prisma.config.ts` has been added as preparation for Prisma 7 migration. When upgrading to Prisma 7, move datasource URL and client adapter config fully into `prisma.config.ts` and update PrismaClient initialization accordingly.

## Notes

- Keep `src/app.ts` as the bootstrap file only.
- Put feature-specific logic inside `src/modules/<feature>`.
- Keep reusable utilities in `src/lib`.
- Keep route files thin and easy to scan.
- Keep Prisma schema in sync with auth and user flow changes.

## Swagger Behavior Notes

- API docs: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/docs/json`
- Some Scalar panels can show `No Body` even when schema and runtime response are valid.

## PostgreSQL (Brew) Quick Setup

If you already use Homebrew, this is the fastest local setup:

```bash
bun run db:setup:brew
```

Then run:

```bash
bun run prisma:generate
bun run db:migrate
bun run db:seed
```

Default seed users:

- `admin@elchub.local` (password: `Admin123!`)
- `user@elchub.local` (password: `User123!`)

## Why "Cannot find module 'bun:test'" Can Happen

If TypeScript shows `Cannot find module 'bun:test'` in test files, the usual causes are:

- backend `tsconfig.json` does not include the `tests/**` folder
- Bun types are not enabled in `compilerOptions.types`

This project has been configured to include both:

- `"types": ["bun"]`
- `"include": ["src/**/*.ts", "tests/**/*.ts", "prisma/**/*.ts", ...]`
