# MANTIS Launch Observability + Domain Ops v1

## 1) PostHog launch events (implemented in app)

Captured event names:
- `invite opened`
- `page viewed`
- `signup started`
- `signup completed`
- `wallet seeded`
- `wallet visible`
- `market opened`
- `quote requested`
- `trade executed`
- `trade failed`
- `portfolio opened`
- `language switched`
- `logout`
- `error boundary shown`

## 2) Launch funnel (must-watch)

Primary funnel steps:
1. `invite opened`
2. `signup completed`
3. `wallet visible`
4. `market opened`
5. `trade executed`
6. `portfolio opened`

Interpretation:
- Drop before step 4 means UX confusion in onboarding/discovery.
- Drop at step 5 means trading reliability issue.
- High `trade failed` to `trade executed` ratio means operational/API issue.

## 3) Suggested PostHog dashboard blocks

Create a dashboard called `MANTIS Closed Alpha - Launch Window` with:
- Funnel insight: steps above, 24h + 7d views
- Trend: `signup started` vs `signup completed`
- Trend: `trade executed` vs `trade failed`
- Trend: `error boundary shown`
- Trend: `portfolio opened`
- Breakdown: `trade failed` by `status`, `marketSlug`, `action`, `side`

## 4) Sentry launch view

### Release window filters
- Environment: `production`
- Time: launch window (first 24-72h)
- Tags to focus: API routes
  - `api/quotes/preview`
  - `api/trades/execute`
  - `api/portfolio/summary`
  - `api/me`
  - `auth/callback`

### Must-pass before launch
- Frontend errors captured (global error boundary -> `error boundary shown` + Sentry event)
- API errors captured (critical routes emit tagged Sentry errors)
- Safe user context attached (`user.id` only)
- Source maps uploaded (requires `SENTRY_AUTH_TOKEN` + build with Sentry plugin)
- Alerts routed to an active channel (Slack/Email/Discord webhook)

### First alerts to create
- P0: Any new issue in `auth/callback` OR `api/trades/execute`
- P1: >=3 events in 10 min for `api/quotes/preview` or `api/portfolio/summary`

## 5) Feedback capture recommendation

Recommended for alpha: **Google Form** (fastest to deploy, zero friction).

- Add form URL to env: `NEXT_PUBLIC_FEEDBACK_FORM_URL`
- In-app CTA already wired on `/more`
- Suggested fields:
  - What were you trying to do?
  - Where did you get stuck?
  - Severity (P0/P1/P2)
  - Browser/device
  - Optional screenshot link

## 6) Domain cutover to `mantis-demo.xyz`

Checklist:
1. Buy/own `mantis-demo.xyz` at registrar
2. Add domain in Vercel project
3. Configure DNS records exactly as Vercel requests
4. Set production env `NEXT_PUBLIC_APP_URL=https://mantis-demo.xyz`
5. Redeploy production
6. Run smoke:
   - `/profile?invite=1` opens
   - magic link redirect host is `mantis-demo.xyz`
   - auth callback returns `auth=ok`
   - quote + trade + portfolio flow still works

Rollback: keep `xyz-labs-demo.vercel.app` active as backup target during first 24h.
