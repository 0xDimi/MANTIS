import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getAthensNowParts, isOpsAuthorized, parseBoolean } from '@/lib/ops-automation';

type OpenMarketRow = {
  id: string;
  slug: string;
  close_time: string;
  updated_at: string;
  market_state:
    | {
        last_trade_at: string | null;
        volume_total: number;
      }
    | Array<{
        last_trade_at: string | null;
        volume_total: number;
      }>
    | null;
};

type MarketCheckMode = 'baseline' | 'high_risk' | 'overnight';

type StatePayload = {
  lastRunAt?: string;
  lastMode?: MarketCheckMode;
  overnightDayKey?: string;
  checksRun?: number;
};

const CHECK_STATE_ID = 'ops_market_checks_state';
const CHECK_RUNTIME_ID = 'ops_market_checks_latest';

function getStateRow<T>(row: unknown) {
  return (row && typeof row === 'object' ? (row as T) : null) as T | null;
}

function normalizeMarketState(input: OpenMarketRow['market_state']) {
  if (Array.isArray(input)) return input[0] ?? null;
  return input ?? null;
}

function diffMinutes(nowIso: string, pastIso: string | null | undefined) {
  if (!pastIso) return Number.POSITIVE_INFINITY;
  const diff = new Date(nowIso).getTime() - new Date(pastIso).getTime();
  if (!Number.isFinite(diff)) return Number.POSITIVE_INFINITY;
  return diff / 60_000;
}

function resolveSchedule(hourAthens: number, hasHighRisk: boolean): { mode: MarketCheckMode; intervalMinutes: number } | null {
  if (hasHighRisk) {
    return { mode: 'high_risk', intervalMinutes: 35 };
  }

  if (hourAthens >= 9 && hourAthens <= 23) {
    return { mode: 'baseline', intervalMinutes: 120 };
  }

  if (hourAthens >= 2 && hourAthens < 3) {
    return { mode: 'overnight', intervalMinutes: 24 * 60 };
  }

  return null;
}

export async function GET(request: Request) {
  const auth = isOpsAuthorized(request);

  if (!auth.ok) {
    return NextResponse.json({ error: 'unauthorized ops trigger' }, { status: 401 });
  }

  try {
    const force = parseBoolean(new URL(request.url).searchParams.get('force'), false);
    const admin = getSupabaseAdminClient();

    const now = new Date();
    const nowIso = now.toISOString();
    const athens = getAthensNowParts(now);

    const [{ data: openMarkets, error: openError }, { data: closedMarkets, error: closedError }, { data: stateRow, error: stateError }] =
      await Promise.all([
        admin
          .from('markets')
          .select('id,slug,close_time,updated_at,market_state(last_trade_at,volume_total)')
          .eq('status', 'open')
          .limit(250),
        admin.from('markets').select('id,slug,close_time,updated_at').eq('status', 'closed').limit(250),
        admin.from('mission_control_state').select('id,payload').eq('id', CHECK_STATE_ID).limit(1).maybeSingle()
      ]);

    if (openError) {
      throw new Error(openError.message);
    }

    if (closedError) {
      throw new Error(closedError.message);
    }

    if (stateError) {
      throw new Error(stateError.message);
    }

    const openRows = ((openMarkets ?? []) as OpenMarketRow[]).map((row) => ({
      ...row,
      market_state: normalizeMarketState(row.market_state)
    }));

    const highRiskMarkets = openRows
      .filter((row) => {
        const closeMs = new Date(row.close_time).getTime();
        return Number.isFinite(closeMs) && closeMs - now.getTime() <= 24 * 60 * 60 * 1000;
      })
      .map((row) => row.slug);

    const schedule = resolveSchedule(athens.hour, highRiskMarkets.length > 0);
    const currentState = getStateRow<{ payload?: StatePayload }>(stateRow)?.payload ?? {};
    const minutesSinceLastRun = diffMinutes(nowIso, currentState.lastRunAt);

    let skipReason: string | null = null;

    if (!force) {
      if (!schedule) {
        skipReason = 'outside monitoring window';
      } else if (schedule.mode === 'overnight' && currentState.overnightDayKey === athens.dayKey) {
        skipReason = 'overnight check already completed';
      } else if (minutesSinceLastRun < schedule.intervalMinutes) {
        skipReason = `interval gate (${schedule.intervalMinutes}m)`;
      }
    }

    if (skipReason) {
      return NextResponse.json(
        {
          status: 'skipped',
          reason: skipReason,
          now: {
            utc: nowIso,
            athens: athens
          },
          authMode: auth.mode,
          highRiskCount: highRiskMarkets.length
        },
        { status: 200 }
      );
    }

    const closedIds = ((closedMarkets ?? []) as Array<{ id: string; slug: string; close_time: string; updated_at: string }>).map((row) => row.id);

    const [{ data: resolutions, error: resolutionsError }, settlementsResult] = await Promise.all([
      closedIds.length
        ? admin.from('resolutions').select('market_id').in('market_id', closedIds).limit(500)
        : Promise.resolve({ data: [] as Array<{ market_id: string }>, error: null as { message: string } | null }),
      closedIds.length
        ? admin.from('market_settlements').select('market_id').in('market_id', closedIds).limit(500)
        : Promise.resolve({ data: [] as Array<{ market_id: string }>, error: null as { message: string } | null })
    ]);

    if (resolutionsError) {
      throw new Error(resolutionsError.message);
    }

    if (settlementsResult.error && !(settlementsResult.error.message ?? '').toLowerCase().includes('does not exist')) {
      throw new Error(settlementsResult.error.message);
    }

    const resolutionSet = new Set(((resolutions ?? []) as Array<{ market_id: string }>).map((row) => row.market_id));
    const settlementSet = new Set(((settlementsResult.data ?? []) as Array<{ market_id: string }>).map((row) => row.market_id));

    const unresolvedClosed = ((closedMarkets ?? []) as Array<{ id: string; slug: string; close_time: string; updated_at: string }>).filter(
      (row) => !resolutionSet.has(row.id)
    );

    const resolvedUnsettled = ((closedMarkets ?? []) as Array<{ id: string; slug: string; close_time: string; updated_at: string }>).filter(
      (row) => resolutionSet.has(row.id) && !settlementSet.has(row.id)
    );

    const staleOpen = openRows
      .map((row) => {
        const lastTradeAt = row.market_state && 'last_trade_at' in row.market_state ? row.market_state.last_trade_at : null;
        return {
          slug: row.slug,
          closeTime: row.close_time,
          lastTradeAt,
          minutesSinceTrade: diffMinutes(nowIso, lastTradeAt)
        };
      })
      .filter((row) => Number.isFinite(row.minutesSinceTrade) && row.minutesSinceTrade >= 12 * 60)
      .sort((a, b) => b.minutesSinceTrade - a.minutesSinceTrade)
      .slice(0, 8);

    const summary = {
      runAt: nowIso,
      mode: schedule?.mode ?? (highRiskMarkets.length > 0 ? 'high_risk' : 'baseline'),
      openMarkets: openRows.length,
      highRiskOpenMarkets: highRiskMarkets.length,
      highRiskSlugs: highRiskMarkets.slice(0, 8),
      unresolvedClosedMarkets: unresolvedClosed.length,
      unresolvedClosedSlugs: unresolvedClosed.map((row) => row.slug).slice(0, 8),
      resolvedUnsettledMarkets: resolvedUnsettled.length,
      resolvedUnsettledSlugs: resolvedUnsettled.map((row) => row.slug).slice(0, 8),
      staleOpenMarketsSample: staleOpen
    };

    const nextState: StatePayload = {
      ...currentState,
      lastRunAt: nowIso,
      lastMode: summary.mode,
      checksRun: Number(currentState.checksRun ?? 0) + 1,
      overnightDayKey: summary.mode === 'overnight' ? athens.dayKey : currentState.overnightDayKey
    };

    const [{ error: stateWriteError }, { error: runtimeWriteError }] = await Promise.all([
      (admin as any).from('mission_control_state').upsert({ id: CHECK_STATE_ID, payload: nextState, updated_at: nowIso }),
      (admin as any).from('mission_control_runtime').upsert({ id: CHECK_RUNTIME_ID, payload: summary, generated_at: nowIso, updated_at: nowIso })
    ]);

    if (stateWriteError) {
      throw new Error(stateWriteError.message);
    }

    if (runtimeWriteError) {
      throw new Error(runtimeWriteError.message);
    }

    return NextResponse.json(
      {
        status: 'ok',
        authMode: auth.mode,
        forced: force,
        summary
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: 'api/ops/market-checks/run' }
    });

    return NextResponse.json(
      {
        error: 'market checks run failed',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
