import * as Sentry from '@sentry/nextjs';
import { cleanEnv } from '@/lib/env-clean';

const dsn = cleanEnv(process.env.NEXT_PUBLIC_SENTRY_DSN);

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.15,
    environment: cleanEnv(process.env.NEXT_PUBLIC_APP_ENV) || cleanEnv(process.env.VERCEL_ENV) || cleanEnv(process.env.NODE_ENV) || 'unknown'
  });
}
