export const alphaPlan = [
  {
    stage: 'Week 0',
    title: 'Foundation and repo prep',
    items: ['alpha branch', 'Next.js scaffold', 'Supabase env map', 'route map', 'design-token extraction']
  },
  {
    stage: 'Week 1',
    title: 'Auth, shell, schema',
    items: ['auth flow', 'profiles and wallet schema', 'seeded markets', 'admin role support']
  },
  {
    stage: 'Week 2',
    title: 'Market catalog and detail',
    items: ['discover page', 'market detail', 'DB-backed data', 'rules panel']
  },
  {
    stage: 'Week 3',
    title: 'AMM v0 quote engine',
    items: ['server-side quotes', 'controlled slippage', 'exposure checks', 'quote preview']
  },
  {
    stage: 'Week 4',
    title: 'Trade execution and ledger',
    items: ['execute endpoint', 'wallet updates', 'positions', 'portfolio summary']
  },
  {
    stage: 'Weeks 5-6',
    title: 'Admin ops, settlement, QA, closed alpha',
    items: ['admin controls', 'resolution and settlement', 'telemetry', 'tester readiness']
  }
] as const;
