import { NextResponse } from 'next/server';
import { appConfig } from '@/lib/app-config';

const hasSentryEnv = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
const hasPostHogEnv = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST);

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      app: appConfig.name,
      codename: appConfig.codename,
      version: appConfig.version,
      alphaScope: appConfig.alphaScope,
      readiness: {
        supabase: {
          urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          anonKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
        },
        telemetry: {
          sentry: {
            envConfigured: hasSentryEnv,
            sdkConfigured: false
          },
          posthog: {
            envConfigured: hasPostHogEnv,
            sdkConfigured: false
          }
        }
      },
      timestamp: new Date().toISOString()
    },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store'
      }
    }
  );
}
