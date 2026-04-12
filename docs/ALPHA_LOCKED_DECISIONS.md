# Alpha Locked Decisions (2026-04-11)

## Product and trading
- AMM v0 behavior follows `08_AMM_V0_BUILD_READY_SPEC`
- Sell-before-resolution is enabled in alpha

## Tester economics
- Starting paper balance per tester: **€1,000**

## Launch market slate
- Target launch set: **12-15 markets**
- Final market selection happens close to alpha launch for freshness
- Launch-first slate must stay simple and mainstream (clear YES/NO, easy-to-understand resolution)
- No crypto markets in the initial alpha launch set

## Access and onboarding
- Access mode: email invite + auth

## Resend
- Keep test sender identity first
- Move to domain setup after core trading/admin flows are stable

## Deployment and naming
- Keep `https://xyz-labs-demo.vercel.app` as the single canonical demo surface
- Treat `*-git-alpha-*` URLs as internal preview links only (not user-facing)
- Continue alpha plan by wiring backend operations into the polished existing UI
- Final public naming target when ready: **Alpha Demo v1**
