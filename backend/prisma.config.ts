import { defineConfig } from 'prisma/config';

const osUser = process.env.USER ?? 'postgres';
const defaultDatabaseUrl = `postgresql://${osUser}@localhost:5432/elchub?schema=public`;
const resolvedDatabaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl;

process.env.DATABASE_URL = resolvedDatabaseUrl;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: resolvedDatabaseUrl,
  },
});