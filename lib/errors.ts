// Zentraler Logger mit strukturierten Feldern.
// Produktion: JSON-Lines (Logtail/Datadog-kompatibel), Dev: Pretty-Print.
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  base: { app: 'kapazito' },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,
});

export function childLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
