export const telemetryStatus = {
  sentry: {
    envConfigured: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
    sdkConfigured: true
  },
  posthog: {
    envConfigured: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST),
    sdkConfigured: true
  }
} as const;

