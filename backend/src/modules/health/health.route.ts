import { Elysia, t } from 'elysia';

import { logger } from '../../lib/logger';

const healthResponseSchema = t.Object({
  status: t.String({ examples: ['ok'] }),
  service: t.String({ examples: ['elchub-backend'] }),
  timestamp: t.String({ format: 'date-time' }),
});

export const healthRoute = new Elysia({ name: 'health-route' }).get(
  '/api/health',
  () => {
    logger.debug('health check requested');

    return {
      status: 'ok',
      service: 'elchub-backend',
      timestamp: new Date().toISOString(),
    };
  },
  {
    response: {
      200: healthResponseSchema,
    },
    detail: {
      tags: ['System'],
      summary: 'Health check',
    },
  },
);