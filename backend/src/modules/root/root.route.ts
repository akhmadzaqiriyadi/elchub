import { Elysia, t } from 'elysia';

const rootResponseSchema = t.Object({
  name: t.String({ examples: ['elchub-backend'] }),
  status: t.String({ examples: ['running'] }),
  message: t.String({ examples: ['Backend is ready'] }),
  stack: t.Array(t.String()),
});

export const rootRoute = new Elysia({ name: 'root-route' })
  .get(
    '/api',
    () => ({
      name: 'elchub-backend',
      status: 'running',
      message: 'Backend is ready',
      stack: ['Bun', 'Elysia', 'Prisma', 'Nodemailer', 'Pino', 'Helmet', 'CORS'],
    }),
    {
      response: {
        200: rootResponseSchema,
      },
      detail: {
        tags: ['System'],
        summary: 'Backend root status',
      },
    },
  )
  // Compatibility alias: Scalar sometimes resolves "api/docs/json" relatively to "/api/api/docs/json".
  .get(
    '/api/api/docs/json',
    ({ set }) => {
      set.status = 307;
      set.headers.Location = '/api/docs/json';

      return '';
    },
    {
      detail: {
        hide: true,
      },
    },
  )
  .get(
    '/api/api/docs/openapi.json',
    ({ set }) => {
      set.status = 307;
      set.headers.Location = '/api/docs/json';

      return '';
    },
    {
      detail: {
        hide: true,
      },
    },
  );