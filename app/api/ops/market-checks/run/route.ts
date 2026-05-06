import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { detectEarlyResolutionDecision, hasEarlyResolutionDetector, type EarlyResolutionDecision } from '@/lib/ops-early-resolution';
import {
  diffMinutes,
  isHighRiskCloseWindow,
  isOverdueMarket,
  normalizeMarketState,
  resolveSchedule,
  summarizeStaleOpenMarkets,
  type MarketCheckMode
} from '@/lib/ops-market-checks';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getAthensNowParts, isOpsAuthorized, parseBoolean } from '@/lib/ops-automation';

type ActiveMarketRow = {
  id: string;
  slug: string;
  question: string;
  status: 'open' | 'paused';
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

type TerminalMarketRow = {
  id: string;
  slug: string;
  question: string;
  status: 'closed' | 'resolved' | 'void';
  close_time: string;
  updated_at: string;
};

type ResolutionRow = {
  market_id: string;
  outcome: 'yes' | 'no' | 'void';
};

type SettlementRow = {
  market_id: string;
  outcome: 'yes' | 'no' | 'void';
};

type StatePayload = {
  lastRunAt?: string;
  lastMode?: MarketCheckMode;
  overnightDayKey?: string;
  checksRun?: number;
};

type CloseoutAction = {
  slug: string;
  actions: string[];
  outcome?: string;
  evidenceUrl?: string;
};

type CloseoutBlocker = {
  slug: string;
  stage: 'detect_early' | 'close_overdue' | 'resolve_closed' | 'settle_resolved';
  detail: string;
};

const CHECK_STATE_ID = 'ops_market_checks_state';
const CHECK_RUNTIME_ID = 'ops_market_checks_latest';

function getStateRow<T>(row: unknown) {
  return (row && typeof row === 'object' ? (row as T) : null) as T | null;
}

function asErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function loadActiveMarkets(admin: ReturnType<typeof getSupabaseAdminClient>) {
  const { data, error } = await admin
    .from('markets')
    .select('id,slug,question,status,close_time,updated_at,market_state(last_trade_at,volume_total)')
    .in('status', ['open', 'paused'])
    .limit(250);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ActiveMarketRow[]).map((row) => ({
    ...row,
    market_state: normalizeMarketState(row.market_state)
  }));
}

async function loadTerminalMarkets(admin: ReturnType<typeof getSupabaseAdminClient>) {
  const { data, error } = await admin
    .from('markets')
    .select('id,slug,question,status,close_time,updated_at')
    .in('status', ['closed', 'resolved', 'void'])
    .limit(250);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TerminalMarketRow[];
}

async function loadResolutionAndSettlementMaps(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  marketIds: string[]
) {
  const [{ data: resolutions, error: resolutionsError }, settlementsResult] = await Promise.all([
    marketIds.length
      ? admin.from('resolutions').select('market_id,outcome').in('market_id', marketIds).limit(500)
      : Promise.resolve({ data: [] as ResolutionRow[], error: null as { message: string } | null }),
    marketIds.length
      ? admin.from('market_settlements').select('market_id,outcome').in('market_id', marketIds).limit(500)
      : Promise.resolve({ data: [] as SettlementRow[], error: null as { message: string } | null })
  ]);

  if (resolutionsError) {
    throw new Error(resolutionsError.message);
  }

  if (settlementsResult.error && !(settlementsResult.error.message ?? '').toLowerCase().includes('does not exist')) {
    throw new Error(settlementsResult.error.message);
  }

  return {
    resolutionByMarketId: new Map(((resolutions ?? []) as ResolutionRow[]).map((row) => [row.market_id, row])),
    settlementByMarketId: new Map(((settlementsResult.data ?? []) as SettlementRow[]).map((row) => [row.market_id, row]))
  };
}

async function resolveOperatorUserId(admin: ReturnType<typeof getSupabaseAdminClient>) {
  const { data, error } = await admin
    .from('profiles')
    .select('user_id,role')
    .in('role', ['admin', 'super_admin'])
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`failed to resolve admin user id: ${error.message}`);
  }

  const profile = data as { user_id?: string | null } | null;

  if (!profile?.user_id) {
    throw new Error('no admin or super_admin profile found for market closeout');
  }

  return profile.user_id;
}

async function closeMarket(admin: ReturnType<typeof getSupabaseAdminClient>, adminUserId: string, marketId: string) {
  const { error } = await (admin as any).rpc('admin_transition_market_status', {
    p_admin_user_id: adminUserId,
    p_market_id: marketId,
    p_target_status: 'closed'
  });

  if (error) {
    throw new Error(error.message ?? 'admin_transition_market_status failed');
  }
}

async function resolveMarket(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  adminUserId: string,
  marketId: string,
  decision: EarlyResolutionDecision
) {
  const { error } = await (admin as any).rpc('admin_record_market_resolution', {
    p_admin_user_id: adminUserId,
    p_market_id: marketId,
    p_outcome: decision.outcome,
    p_evidence_summary: decision.evidenceSummary,
    p_evidence_url: decision.evidenceUrl
  });

  if (error) {
    throw new Error(error.message ?? 'admin_record_market_resolution failed');
  }
}

async function settleMarket(admin: ReturnType<typeof getSupabaseAdminClient>, adminUserId: string, marketId: string) {
  const { error } = await (admin as any).rpc('admin_settle_market', {
    p_admin_user_id: adminUserId,
    p_market_id: marketId
  });

  if (error) {
    throw new Error(error.message ?? 'admin_settle_market failed');
  }
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

    const [initialActiveRows, stateResult] = await Promise.all([
      loadActiveMarkets(admin),
      admin.from('mission_control_state').select('id,payload').eq('id', CHECK_STATE_ID).limit(1).maybeSingle()
    ]);

    if (stateResult.error) {
      throw new Error(stateResult.error.message);
    }

    const highRiskMarkets = initialActiveRows
      .filter((row) => isHighRiskCloseWindow(row.close_time, now))
      .map((row) => row.slug);
    const earlyResolutionCandidates = initialActiveRows.filter((row) => hasEarlyResolutionDetector(row.slug)).map((row) => row.slug);

    const schedule = resolveSchedule({
      hourAthens: athens.hour,
      hasHighRiskWindow: highRiskMarkets.length > 0,
      hasEarlyResolutionCandidates: earlyResolutionCandidates.length > 0
    });

    const currentState = getStateRow<{ payload?: StatePayload }>(stateResult.data)?.payload ?? {};
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
            athens
          },
          authMode: auth.mode,
          highRiskCount: highRiskMarkets.length,
          earlyResolutionCandidateCount: earlyResolutionCandidates.length
        },
        { status: 200 }
      );
    }

    const closeoutActions: CloseoutAction[] = [];
    const closeoutBlockers: CloseoutBlocker[] = [];
    let adminUserIdPromise: Promise<string> | null = null;

    const getAdminUserId = () => {
      if (!adminUserIdPromise) {
        adminUserIdPromise = resolveOperatorUserId(admin);
      }

      return adminUserIdPromise;
    };

    for (const market of initialActiveRows.filter((row) => hasEarlyResolutionDetector(row.slug))) {
      try {
        const decision = await detectEarlyResolutionDecision(market);

        if (!decision) {
          continue;
        }

        const adminUserId = await getAdminUserId();
        await closeMarket(admin, adminUserId, market.id);
        await resolveMarket(admin, adminUserId, market.id, decision);
        await settleMarket(admin, adminUserId, market.id);

        closeoutActions.push({
          slug: market.slug,
          actions: ['closed_early', `resolved_${decision.outcome}`, 'settled'],
          outcome: decision.outcome,
          evidenceUrl: decision.evidenceUrl
        });
      } catch (error) {
        closeoutBlockers.push({
          slug: market.slug,
          stage: 'detect_early',
          detail: asErrorMessage(error)
        });
      }
    }

    let refreshedActiveRows = await loadActiveMarkets(admin);

    for (const market of refreshedActiveRows.filter((row) => isOverdueMarket(row.close_time, now))) {
      try {
        const adminUserId = await getAdminUserId();
        await closeMarket(admin, adminUserId, market.id);

        closeoutActions.push({
          slug: market.slug,
          actions: ['closed_on_deadline']
        });
      } catch (error) {
        closeoutBlockers.push({
          slug: market.slug,
          stage: 'close_overdue',
          detail: asErrorMessage(error)
        });
      }
    }

    refreshedActiveRows = await loadActiveMarkets(admin);
    const terminalRows = await loadTerminalMarkets(admin);
    const { resolutionByMarketId, settlementByMarketId } = await loadResolutionAndSettlementMaps(
      admin,
      terminalRows.map((row) => row.id)
    );

    const unresolvedClosed = terminalRows.filter((row) => row.status === 'closed' && !resolutionByMarketId.has(row.id));
    const resolvedUnsettled = terminalRows.filter(
      (row) => (row.status === 'resolved' || row.status === 'void') && !settlementByMarketId.has(row.id)
    );

    for (const market of unresolvedClosed) {
      if (!hasEarlyResolutionDetector(market.slug)) {
        continue;
      }

      try {
        const decision = await detectEarlyResolutionDecision(market);

        if (!decision) {
          continue;
        }

        const adminUserId = await getAdminUserId();
        await resolveMarket(admin, adminUserId, market.id, decision);
        await settleMarket(admin, adminUserId, market.id);

        closeoutActions.push({
          slug: market.slug,
          actions: [`resolved_${decision.outcome}`, 'settled'],
          outcome: decision.outcome,
          evidenceUrl: decision.evidenceUrl
        });
      } catch (error) {
        closeoutBlockers.push({
          slug: market.slug,
          stage: 'resolve_closed',
          detail: asErrorMessage(error)
        });
      }
    }

    for (const market of resolvedUnsettled) {
      try {
        const adminUserId = await getAdminUserId();
        await settleMarket(admin, adminUserId, market.id);

        closeoutActions.push({
          slug: market.slug,
          actions: ['settled']
        });
      } catch (error) {
        closeoutBlockers.push({
          slug: market.slug,
          stage: 'settle_resolved',
          detail: asErrorMessage(error)
        });
      }
    }

    const [finalActiveRows, finalTerminalRows] = await Promise.all([loadActiveMarkets(admin), loadTerminalMarkets(admin)]);
    const finalMaps = await loadResolutionAndSettlementMaps(
      admin,
      finalTerminalRows.map((row) => row.id)
    );

    const finalUnresolvedClosed = finalTerminalRows.filter(
      (row) => row.status === 'closed' && !finalMaps.resolutionByMarketId.has(row.id)
    );
    const finalResolvedUnsettled = finalTerminalRows.filter(
      (row) => (row.status === 'resolved' || row.status === 'void') && !finalMaps.settlementByMarketId.has(row.id)
    );

    const finalHighRiskSlugs = finalActiveRows
      .filter((row) => isHighRiskCloseWindow(row.close_time, now))
      .map((row) => row.slug)
      .slice(0, 8);
    const finalEarlyResolutionCandidateSlugs = finalActiveRows
      .filter((row) => hasEarlyResolutionDetector(row.slug))
      .map((row) => row.slug)
      .slice(0, 8);

    const summary = {
      runAt: nowIso,
      mode: schedule?.mode ?? (highRiskMarkets.length > 0 || earlyResolutionCandidates.length > 0 ? 'high_risk' : 'baseline'),
      openMarkets: finalActiveRows.length,
      highRiskOpenMarkets: finalHighRiskSlugs.length,
      highRiskSlugs: finalHighRiskSlugs,
      earlyResolutionCandidateMarkets: finalEarlyResolutionCandidateSlugs.length,
      earlyResolutionCandidateSlugs: finalEarlyResolutionCandidateSlugs,
      unresolvedClosedMarkets: finalUnresolvedClosed.length,
      unresolvedClosedSlugs: finalUnresolvedClosed.map((row) => row.slug).slice(0, 8),
      resolvedUnsettledMarkets: finalResolvedUnsettled.length,
      resolvedUnsettledSlugs: finalResolvedUnsettled.map((row) => row.slug).slice(0, 8),
      closeoutActions,
      closeoutBlockers,
      staleOpenMarketsSample: summarizeStaleOpenMarkets(finalActiveRows, nowIso)
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
