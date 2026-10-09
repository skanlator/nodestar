import pino from 'pino';
import { env } from '../../config/env.ts';

export const logger = pino({
  level: env.LOG_LEVEL || 'info',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        }
      : undefined,
});
