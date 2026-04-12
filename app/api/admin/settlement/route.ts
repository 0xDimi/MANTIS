import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-access';
import { assertSettlementAllowed } from '@/lib/settlement-ops';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function isMissingSettlementTableError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes('market_settlements') && normalized.includes('does not exist');
}

function mapSettlementRpcStatus(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('market not found')) {
    return 404;
  }

  if (
    normalized.includes('already settled') ||
    normalized.includes('market must be resolved or void before settlement') ||
    normalized.includes('market resolution missing') ||
    normalized.includes('requires a void resolution') ||
    normalized.includes('requires a yes or no resolution')
  ) {
    return 409;
  }

  return 500;
}

type SettlementBody = {
  marketId?: unknown;
};

export async function POST(request: Request) {
  const access = await requireAdminAccess();

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as SettlementBody;
    const marketId = typeof body.marketId === 'string' ? body.marketId : '';

    if (!marketId) {
      return NextResponse.json({ error: 'marketId is required' }, { status: 400 });
    }

    const [{ data: market, error: marketError }, { data: resolution, error: resolutionError }, { data: settlement, error: settlementError }] =
      await Promise.all([
        access.supabase.from('markets').select('id,question,status').eq('id', marketId).limit(1).maybeSingle(),
        access.supabase.from('resolutions').select('id,outcome').eq('market_id', marketId).limit(1).maybeSingle(),
        access.supabase
          .from('market_settlements')
          .select('id,outcome,affected_accounts,total_payout,total_refund,total_realized_pnl,created_at')
          .eq('market_id', marketId)
          .limit(1)
          .maybeSingle()
      ]);

    if (marketError) {
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (resolutionError) {
      return NextResponse.json({ error: resolutionError.message }, { status: 500 });
    }

    if (settlementError) {
      if (isMissingSettlementTableError(settlementError.message ?? '')) {
        return NextResponse.json(
          { error: 'settlement migration is not applied on this runtime yet' },
          { status: 503 }
        );
      }

      return NextResponse.json({ error: settlementError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: 'market not found' }, { status: 404 });
    }

    const marketRow = market as any;
    const resolutionRow = (resolution as any) ?? null;
    const settlementRow = (settlement as any) ?? null;

    if (settlementRow && marketRow.status === 'settled') {
      return NextResponse.json(
        {
          status: 'ok',
          settlement: {
            id: settlementRow.id,
            marketId,
            question: marketRow.question,
            outcome: settlementRow.outcome,
            marketStatus: 'settled',
            affectedAccounts: Number(settlementRow.affected_accounts ?? 0),
            totalPayout: Number(settlementRow.total_payout ?? 0),
            totalRefund: Number(settlementRow.total_refund ?? 0),
            totalRealizedPnl: Number(settlementRow.total_realized_pnl ?? 0),
            settledAt: settlementRow.created_at
          }
        },
        { status: 200 }
      );
    }

    assertSettlementAllowed({
      marketStatus: marketRow.status,
      resolutionOutcome: resolutionRow?.outcome ?? null,
      settlementExists: false
    });

    const admin = getSupabaseAdminClient();
    const { data, error } = await (admin as any).rpc('admin_settle_market', {
      p_admin_user_id: access.user.id,
      p_market_id: marketId
    });

    if (error) {
      return NextResponse.json(
        {
          error: 'market settlement write failed',
          detail: error.message
        },
        { status: mapSettlementRpcStatus(error.message ?? '') }
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json(
      {
        status: 'ok',
        settlement: {
          id: result?.settlement_id ?? null,
          marketId,
          question: marketRow.question,
          outcome: result?.outcome ?? resolutionRow?.outcome ?? null,
          marketStatus: result?.current_status ?? 'settled',
          affectedAccounts: Number(result?.affected_accounts ?? 0),
          totalPayout: Number(result?.total_payout ?? 0),
          totalRefund: Number(result?.total_refund ?? 0),
          totalRealizedPnl: Number(result?.total_realized_pnl ?? 0),
          settledAt: result?.settled_at ?? new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'market settlement write failed'
      },
      { status: 400 }
    );
  }
}
