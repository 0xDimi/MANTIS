import { NextResponse } from 'next/server';
import { appConfig } from '@/lib/app-config';
import { telemetryStatus } from '@/lib/telemetry';

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
            envConfigured: telemetryStatus.sentry.envConfigured,
            sdkConfigured: telemetryStatus.sentry.sdkConfigured
          },
          posthog: {
            envConfigured: telemetryStatus.posthog.envConfigured,
            sdkConfigured: telemetryStatus.posthog.sdkConfigured
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
