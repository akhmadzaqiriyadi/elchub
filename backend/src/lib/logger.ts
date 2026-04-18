import pino from 'pino';

import { env } from '../config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: 'elchub-backend',
    environment: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});