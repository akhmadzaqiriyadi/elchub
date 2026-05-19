import cors from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';

import { env } from './config/env';
import { logger } from './lib/logger';
import { securityHeaders } from './lib/security-headers';
import { authRoute } from './modules/auth/auth.route';
import { assignmentsManagementRoute, assignmentsRoute } from './modules/assignments/assignments.route';
import { eventsManagementRoute, eventsRoute } from './modules/events/events.route';
import { healthRoute } from './modules/health/health.route';
import { rootRoute } from './modules/root/root.route';
import { usersManagementRoute } from './modules/users/users.route';

function parseCorsOrigins(origin: string) {
  const trimmed = origin.trim();

  if (!trimmed || trimmed === '*') {
    return true;
  }

  return trimmed.split(',').map((item) => item.trim());
}

export const app = new Elysia({ name: 'elchub-backend' })
  .use(securityHeaders)
  .use(
    cors({
      origin: parseCorsOrigins(env.CORS_ORIGIN),
    }),
  )
  .use(
    swagger({
      path: '/api/docs',
      documentation: {
        info: {
          title: 'Elchub Backend API',
          version: '0.1.0',
          description: 'Comprehensive backend starter with auth, Prisma, logger, and mailer support.',
        },
      },
    }),
  )
  .onRequest(({ request }) => {
    const pathname = new URL(request.url).pathname;

    logger.info(
      {
        method: request.method,
        path: pathname,
      },
      'incoming request',
    );
  })
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
    } else if (code === 'VALIDATION') {
      set.status = 422;
    } else {
      set.status = 500;
    }

    logger.error(
      {
        code,
        error,
      },
      'request failed',
    );

    return {
      success: false,
      error: code,
      message: error instanceof Error ? error.message : 'Unexpected server error',
      ...(code === 'VALIDATION' && typeof error === 'object' && error !== null
        ? {
            property: 'path' in error ? (error as { path?: unknown }).path : undefined,
            summary: 'summary' in error ? (error as { summary?: unknown }).summary : undefined,
            errors: 'all' in error ? (error as { all?: unknown }).all : undefined,
          }
        : {}),
    };
  })
  .use(rootRoute)
  .use(healthRoute)
  .use(assignmentsRoute)
  .use(assignmentsManagementRoute)
  .use(eventsRoute)
  .use(eventsManagementRoute)
  .use(authRoute)
  .use(usersManagementRoute);

export function buildApp() {
  return app;
}