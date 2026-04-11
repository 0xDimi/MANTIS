export const appConfig = {
  name: 'xyz Labs',
  codename: 'MANTIS',
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'local',
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.9.0-alpha.0',
  alphaScope: {
    marketsTarget: '12-15',
    testers: '10-20',
    startingPaperBalanceEur: 1000,
    mode: 'paper-trading'
  }
} as const;

export const routeMap = [
  '/',
  '/markets',
  '/markets/[slug]',
  '/portfolio',
  '/profile',
  '/rules',
  '/admin',
  '/admin/markets',
  '/admin/resolution',
  '/admin/users'
] as const;
