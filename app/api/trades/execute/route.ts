import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { buildAmmV0Quote } from '@/lib/amm-v0';
import { alphaGuardrails } from '@/lib/alpha-guardrails';
import { buildQuoteHash } from '@/lib/quote-hash';
import {
  TradeRequestError,
  assertMarketOpenForTrading,
  evaluateUserEventTradeLimits,
  evaluateUserTradeLimits,
  parseTradeAction,
  parseTradeSide,
  resolveTradeInputMode
} from '@/lib/trade-guards';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type ExecuteBody = {
  marketId?: string;
  quoteHash?: string;
  quoteExpiresAt?: string;
  side?: 'yes' | 'no';
  action?: 'buy' | 'sell';
  amountEur?: number;
  shareAmount?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExecuteBody;

    if (!body.marketId || !body.side || !body.action || !body.quoteHash || !body.quoteExpiresAt) {
      return NextResponse.json(
        {
          error: 'marketId, side, action, quoteHash, and quoteExpiresAt are required'
        },
        { status: 400 }
      );
    }

    const side = parseTradeSide(body.side);
    const action = parseTradeAction(body.action);
    const amountEur = Number(body.amountEur);
    const shareAmount = Number(body.shareAmount ?? 0);
    const inputMode = resolveTradeInputMode(action, body.shareAmount);

    if (inputMode === 'shares') {
      if (!Number.isFinite(shareAmount) || shareAmount <= 0) {
        return NextResponse.json({ error: 'shareAmount must be > 0' }, { status: 400 });
      }
    } else if (!Number.isFinite(amountEur) || amountEur <= 0) {
      return NextResponse.json({ error: 'amountEur must be > 0' }, { status: 400 });
    }

    if (inputMode !== 'shares' && amountEur > alphaGuardrails.maxSingleTradeEur) {
      return NextResponse.json(
        {
          error: `amountEur exceeds max single trade (${alphaGuardrails.maxSingleTradeEur})`
        },
        { status: 400 }
      );
    }

    const expiresAtMs = new Date(body.quoteExpiresAt).getTime();
    if (!Number.isFinite(expiresAtMs)) {
      return NextResponse.json({ error: 'quoteExpiresAt is invalid' }, { status: 400 });
    }

    if (Date.now() > expiresAtMs) {
      return NextResponse.json({ error: 'quote expired, request a fresh quote' }, { status: 409 });
    }

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'auth required for trade execution' }, { status: 401 });
    }

    Sentry.setUser({ id: user.id });

    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('id,status,b_liquidity,fee_bps,close_time,event_id,is_event_child')
      .eq('id', body.marketId)
      .limit(1)
      .maybeSingle();

    if (marketError) {
      Sentry.captureException(new Error(marketError.message), {
        tags: { route: 'api/trades/execute' }
      });
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: 'market not found' }, { status: 404 });
    }

    const marketRow = market as any;
    const closeTime = assertMarketOpenForTrading({
      status: marketRow.status,
      closeTime: marketRow.close_time
    });

    if (closeTime && expiresAtMs > closeTime.getTime()) {
      return NextResponse.json({ error: 'quote expiry exceeds market close, request a fresh quote' }, { status: 409 });
    }

    const { data: state, error: stateError } = await supabase
      .from('market_state')
      .select('yes_price,no_price,q_yes,q_no')
      .eq('market_id', marketRow.id)
      .limit(1)
      .maybeSingle();

    if (stateError) {
      Sentry.captureException(new Error(stateError.message), {
        tags: { route: 'api/trades/execute' }
      });
      return NextResponse.json({ error: stateError.message }, { status: 500 });
    }

    if (!state) {
      return NextResponse.json({ error: 'market state missing' }, { status: 500 });
    }

    const stateRow = state as any;

    let quote: ReturnType<typeof buildAmmV0Quote>;

    try {
      quote = buildAmmV0Quote({
        side,
        action,
        amountEur: inputMode === 'shares' ? undefined : amountEur,
        shareAmount: inputMode === 'shares' ? shareAmount : undefined,
        inputMode,
        qYes: Number(stateRow.q_yes),
        qNo: Number(stateRow.q_no),
        depth: Number(marketRow.b_liquidity),
        feeBps: Number(marketRow.fee_bps)
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'quote unavailable'
        },
        { status: 400 }
      );
    }

    if (quote.amountEur > alphaGuardrails.maxSingleTradeEur) {
      return NextResponse.json(
        {
          error: `gross trade exceeds max single trade (${alphaGuardrails.maxSingleTradeEur})`
        },
        { status: 400 }
      );
    }

    const serverQuoteHash = buildQuoteHash({
      marketId: marketRow.id,
      side,
      action,
      inputMode,
      amountEur: inputMode === 'shares' ? null : amountEur,
      shareAmount: inputMode === 'shares' ? shareAmount : null,
      expectedQYes: Number(stateRow.q_yes),
      expectedQNo: Number(stateRow.q_no),
      averagePrice: quote.averagePrice,
      shareDelta: quote.shareDelta,
      postYesPrice: quote.postYesPrice,
      expiresAtIso: new Date(body.quoteExpiresAt).toISOString()
    });

    if (serverQuoteHash !== body.quoteHash) {
      return NextResponse.json(
        {
          error: 'quote hash mismatch, request a fresh quote',
          expectedHash: serverQuoteHash
        },
        { status: 409 }
      );
    }

    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('yes_shares,no_shares,yes_cost_basis,no_cost_basis')
      .eq('user_id', user.id)
      .eq('market_id', marketRow.id)
      .limit(1)
      .maybeSingle();

    if (positionError) {
      Sentry.captureException(new Error(positionError.message), {
        tags: { route: 'api/trades/execute' }
      });
      return NextResponse.json({ error: positionError.message }, { status: 500 });
    }

    const positionRow = (position as any) ?? null;

    evaluateUserTradeLimits({
      action,
      side,
      shareDelta: quote.shareDelta,
      totalAmountEur: quote.totalAmountEur,
      currentExposureEur: Number(positionRow?.yes_cost_basis ?? 0) + Number(positionRow?.no_cost_basis ?? 0),
      availableShares: action === 'sell' ? Number(side === 'yes' ? positionRow?.yes_shares ?? 0 : positionRow?.no_shares ?? 0) : null,
      maxUserExposureEur: alphaGuardrails.maxUserExposurePerMarketEur
    });

    let maxUserEventExposureEur: number | null = null;

    if (marketRow.is_event_child && marketRow.event_id) {
      const [{ data: eventRow, error: eventError }, { data: childRows, error: childRowsError }] = await Promise.all([
        supabase
          .from('market_events')
          .select('id,max_user_event_exposure')
          .eq('id', marketRow.event_id)
          .limit(1)
          .maybeSingle(),
        supabase.from('markets').select('id').eq('event_id', marketRow.event_id).eq('is_event_child', true)
      ]);

      if (eventError) {
        Sentry.captureException(new Error(eventError.message), {
          tags: { route: 'api/trades/execute' }
        });
        return NextResponse.json({ error: eventError.message }, { status: 500 });
      }

      if (childRowsError) {
        Sentry.captureException(new Error(childRowsError.message), {
          tags: { route: 'api/trades/execute' }
        });
        return NextResponse.json({ error: childRowsError.message }, { status: 500 });
      }

      maxUserEventExposureEur = Number((eventRow as any)?.max_user_event_exposure ?? 0) || null;

      const eventChildMarketIds = ((childRows as any[]) ?? []).map((child) => child.id);
      const { data: eventPositions, error: eventPositionsError } = eventChildMarketIds.length
        ? await supabase
            .from('positions')
            .select('yes_cost_basis,no_cost_basis')
            .eq('user_id', user.id)
            .in('market_id', eventChildMarketIds)
        : { data: [], error: null };

      if (eventPositionsError) {
        Sentry.captureException(new Error(eventPositionsError.message), {
          tags: { route: 'api/trades/execute' }
        });
        return NextResponse.json({ error: eventPositionsError.message }, { status: 500 });
      }

      const currentEventExposureEur = ((eventPositions as any[]) ?? []).reduce(
        (sum, item) => sum + Number(item.yes_cost_basis ?? 0) + Number(item.no_cost_basis ?? 0),
        0
      );

      evaluateUserEventTradeLimits({
        action,
        totalAmountEur: quote.totalAmountEur,
        currentEventExposureEur,
        maxUserEventExposureEur
      });
    }

    const admin = getSupabaseAdminClient();
    const executionRpcName = marketRow.is_event_child ? 'execute_alpha_trade_with_event_guard' : 'execute_alpha_trade';
    const executionRpcParams: Record<string, unknown> = {
      p_user_id: user.id,
      p_market_id: marketRow.id,
      p_side: side,
      p_action: action,
      p_amount: quote.amountEur,
      p_avg_price: quote.averagePrice,
      p_share_delta: quote.shareDelta,
      p_fee_amount: quote.feeAmountEur,
      p_total_amount: quote.totalAmountEur,
      p_post_yes_price: quote.postYesPrice,
      p_post_no_price: quote.postNoPrice,
      p_quote_hash: body.quoteHash,
      p_expected_yes_price: Number(stateRow.yes_price),
      p_expected_no_price: Number(stateRow.no_price),
      p_expected_q_yes: Number(stateRow.q_yes),
      p_expected_q_no: Number(stateRow.q_no),
      p_max_user_exposure: alphaGuardrails.maxUserExposurePerMarketEur
    };

    if (marketRow.is_event_child) {
      executionRpcParams.p_max_user_event_exposure = maxUserEventExposureEur;
    }

    const { data: executionData, error: executionError } = await (admin as any).rpc(executionRpcName, executionRpcParams);

    if (executionError) {
      const detail = executionError.message ?? 'unknown';
      const normalized = detail.toLowerCase();
      const status = normalized.includes('market not found')
        ? 404
        : normalized.includes('stale quote') ||
            normalized.includes('insufficient') ||
            normalized.includes('market is not open') ||
            normalized.includes('max user exposure')
          ? 409
          : 500;

      if (status >= 500) {
        Sentry.captureException(new Error(detail), {
          tags: { route: 'api/trades/execute' }
        });
      }

      return NextResponse.json(
        {
          error: 'atomic trade execution failed',
          detail
        },
        { status }
      );
    }

    const execution = Array.isArray(executionData) ? executionData[0] : executionData;

    return NextResponse.json(
      {
        status: 'executed',
        userId: user.id,
        marketId: marketRow.id,
        inputMode,
        quote,
        execution: execution ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof TradeRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    Sentry.captureException(error, {
      tags: { route: 'api/trades/execute' }
    });

    return NextResponse.json(
      {
        error: 'trade execution unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
