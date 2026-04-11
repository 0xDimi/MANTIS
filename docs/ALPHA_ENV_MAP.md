# Alpha Env Map

## Public
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_VERSION`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

## Server-only
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENTRY_AUTH_TOKEN`
- `RESEND_API_KEY`
- `APP_BASE_URL`

## First integration order
1. Supabase URL + anon key
2. Supabase service role
3. PostHog key + host
4. Sentry DSN/auth token
5. Resend API key
