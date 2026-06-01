import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { buildAmmV0Quote, type TradeAction, type TradeInputMode, type TradeSide } from '@/lib/amm-v0';
import { alphaGuardrails } from '@/lib/alpha-guardrails';
import { buildQuoteHash } from '@/lib/quote-hash';
import {
  TradeRequestError,
  assertMarketOpenForTrading,
  evaluateUserEventTradeLimits,
  evaluateUserTradeLimits,
  parseTradeAction,
  parseTradeSide,
  resolveQuoteExpiry,
  resolveTradeInputMode
} from '@/lib/trade-guards';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type PreviewBody = {
  marketId?: string;
  marketSlug?: string;
  side?: TradeSide;
  action?: TradeAction;
  amountEur?: number;
  shareAmount?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewBody;
    const side = parseTradeSide(body.side);
    const action = parseTradeAction(body.action, 'buy');
    const amountEur = Number(body.amountEur ?? 0);
    const shareAmount = Number(body.shareAmount ?? 0);
    const inputMode: TradeInputMode = resolveTradeInputMode(action, body.shareAmount);
    const sizeValue = inputMode === 'shares' ? shareAmount : amountEur;

    if (!Number.isFinite(sizeValue) || sizeValue <= 0) {
      return NextResponse.json(
        { error: inputMode === 'shares' ? 'shareAmount must be > 0' : 'amountEur must be > 0' },
        { status: 400 }
      );
    }

    if (inputMode !== 'shares' && amountEur > alphaGuardrails.maxSingleTradeEur) {
      return NextResponse.json(
        {
          error: `amountEur exceeds max single trade (${alphaGuardrails.maxSingleTradeEur})`
        },
        { status: 400 }
      );
    }

    if (!body.marketId && !body.marketSlug) {
      return NextResponse.json({ error: 'marketId or marketSlug is required' }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();

    let marketQuery = supabase
      .from('markets')
      .select('id,slug,question,status,b_liquidity,fee_bps,close_time,event_id,is_event_child')
      .limit(1);

    marketQuery = body.marketId ? marketQuery.eq('id', body.marketId) : marketQuery.eq('slug', body.marketSlug!);

    const { data: market, error: marketError } = await marketQuery.maybeSingle();

    if (marketError) {
      Sentry.captureException(new Error(marketError.message), {
        tags: { route: 'api/quotes/preview' }
      });
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: 'market not found' }, { status: 404 });
    }

    const marketRow = market as any;

    assertMarketOpenForTrading({
      status: marketRow.status,
      closeTime: marketRow.close_time
    });

    const { data: state, error: stateError } = await supabase
      .from('market_state')
      .select('market_id,yes_price,no_price,q_yes,q_no,volume_total,participants_count')
      .eq('market_id', marketRow.id)
      .limit(1)
      .maybeSingle();

    if (stateError) {
      Sentry.captureException(new Error(stateError.message), {
        tags: { route: 'api/quotes/preview' }
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

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      Sentry.setUser({ id: user.id });
    }

    let userLimits: {
      openExposureEur: number;
      exposureAfterEur: number | null;
      availableShares: number | null;
    } | null = null;
    let eventLimits: {
      eventId: string;
      openEventExposureEur: number;
      eventExposureAfterEur: number | null;
      maxUserEventExposureEur: number | null;
    } | null = null;
    let eventContext: {
      eventId: string;
      eventSlug: string;
      eventTitle: string;
      outcomeKey: string;
      outcomeLabel: string;
      outcomeStructure: 'independent_cluster';
      currentUserEventExposure: number;
      userEventExposureAfter: number | null;
      maxUserEventExposure: number | null;
    } | null = null;
    let eventMetadata: {
      eventId: string;
      eventSlug: string;
      eventTitle: string;
      outcomeKey: string;
      outcomeLabel: string;
      maxUserEventExposure: number | null;
    } | null = null;
    let eventChildMarketIds: string[] = [];

    if (marketRow.is_event_child && marketRow.event_id) {
      const [
        { data: eventRow, error: eventError },
        { data: outcomeRow, error: outcomeError },
        { data: childRows, error: childRowsError }
      ] = await Promise.all([
        supabase
          .from('market_events')
          .select('id,slug,title,max_user_event_exposure')
          .eq('id', marketRow.event_id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('market_event_outcomes')
          .select('outcome_key,outcome_label')
          .eq('event_id', marketRow.event_id)
          .eq('child_market_id', marketRow.id)
          .limit(1)
          .maybeSingle(),
        supabase.from('markets').select('id').eq('event_id', marketRow.event_id).eq('is_event_child', true)
      ]);

      if (eventError) {
        Sentry.captureException(new Error(eventError.message), {
          tags: { route: 'api/quotes/preview' }
        });
        return NextResponse.json({ error: eventError.message }, { status: 500 });
      }

      if (outcomeError) {
        Sentry.captureException(new Error(outcomeError.message), {
          tags: { route: 'api/quotes/preview' }
        });
        return NextResponse.json({ error: outcomeError.message }, { status: 500 });
      }

      if (childRowsError) {
        Sentry.captureException(new Error(childRowsError.message), {
          tags: { route: 'api/quotes/preview' }
        });
        return NextResponse.json({ error: childRowsError.message }, { status: 500 });
      }

      const eventRowData = eventRow as any;
      const outcomeRowData = outcomeRow as any;
      eventChildMarketIds = ((childRows as any[]) ?? []).map((child) => child.id);

      if (eventRowData && outcomeRowData) {
        eventMetadata = {
          eventId: marketRow.event_id,
          eventSlug: eventRowData.slug,
          eventTitle: eventRowData.title,
          outcomeKey: outcomeRowData.outcome_key,
          outcomeLabel: outcomeRowData.outcome_label,
          maxUserEventExposure: Number(eventRowData.max_user_event_exposure ?? 0) || null
        };

        eventContext = {
          eventId: eventMetadata.eventId,
          eventSlug: eventMetadata.eventSlug,
          eventTitle: eventMetadata.eventTitle,
          outcomeKey: eventMetadata.outcomeKey,
          outcomeLabel: eventMetadata.outcomeLabel,
          outcomeStructure: 'independent_cluster',
          currentUserEventExposure: 0,
          userEventExposureAfter: null,
          maxUserEventExposure: eventMetadata.maxUserEventExposure
        };
      }
    }

    if (user) {
      const { data: position, error: positionError } = await supabase
        .from('positions')
        .select('yes_shares,no_shares,yes_cost_basis,no_cost_basis')
        .eq('user_id', user.id)
        .eq('market_id', marketRow.id)
        .limit(1)
        .maybeSingle();

      if (positionError) {
        Sentry.captureException(new Error(positionError.message), {
          tags: { route: 'api/quotes/preview' }
        });
        return NextResponse.json({ error: positionError.message }, { status: 500 });
      }

      const positionRow = (position as any) ?? null;
      const userLimitState = evaluateUserTradeLimits({
        action,
        side,
        shareDelta: quote.shareDelta,
        totalAmountEur: quote.totalAmountEur,
        currentExposureEur: Number(positionRow?.yes_cost_basis ?? 0) + Number(positionRow?.no_cost_basis ?? 0),
        availableShares: action === 'sell' ? Number(side === 'yes' ? positionRow?.yes_shares ?? 0 : positionRow?.no_shares ?? 0) : null,
        maxUserExposureEur: alphaGuardrails.maxUserExposurePerMarketEur
      });

      userLimits = {
        openExposureEur: userLimitState.openExposureEur,
        exposureAfterEur: userLimitState.exposureAfterEur,
        availableShares: userLimitState.availableShares
      };

      if (eventMetadata && eventChildMarketIds.length) {
        const { data: eventPositions, error: eventPositionsError } = eventChildMarketIds.length
          ? await supabase
              .from('positions')
              .select('yes_cost_basis,no_cost_basis')
              .eq('user_id', user.id)
              .in('market_id', eventChildMarketIds)
          : { data: [], error: null };

        if (eventPositionsError) {
          Sentry.captureException(new Error(eventPositionsError.message), {
            tags: { route: 'api/quotes/preview' }
          });
          return NextResponse.json({ error: eventPositionsError.message }, { status: 500 });
        }

        const currentEventExposureEur = ((eventPositions as any[]) ?? []).reduce(
          (sum, item) => sum + Number(item.yes_cost_basis ?? 0) + Number(item.no_cost_basis ?? 0),
          0
        );
        const eventLimitState = evaluateUserEventTradeLimits({
          action,
          totalAmountEur: quote.totalAmountEur,
          currentEventExposureEur,
          maxUserEventExposureEur: eventMetadata.maxUserEventExposure
        });

        eventLimits = {
          eventId: eventMetadata.eventId,
          openEventExposureEur: eventLimitState.openEventExposureEur,
          eventExposureAfterEur: eventLimitState.eventExposureAfterEur,
          maxUserEventExposureEur: eventLimitState.maxUserEventExposureEur
        };
        eventContext = {
          eventId: eventMetadata.eventId,
          eventSlug: eventMetadata.eventSlug,
          eventTitle: eventMetadata.eventTitle,
          outcomeKey: eventMetadata.outcomeKey,
          outcomeLabel: eventMetadata.outcomeLabel,
          outcomeStructure: 'independent_cluster',
          currentUserEventExposure: eventLimitState.openEventExposureEur,
          userEventExposureAfter: eventLimitState.eventExposureAfterEur,
          maxUserEventExposure: eventLimitState.maxUserEventExposureEur
        };
      }
    }

    const issuedAt = new Date();
    const expiresAt = resolveQuoteExpiry({
      closeTime: marketRow.close_time,
      now: issuedAt,
      ttlSeconds: alphaGuardrails.quoteTtlSeconds
    });

    const quoteHash = buildQuoteHash({
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
      expiresAtIso: expiresAt.toISOString()
    });

    return NextResponse.json(
      {
        market: {
          id: marketRow.id,
          slug: marketRow.slug,
          question: marketRow.question,
          status: marketRow.status,
          closeTime: marketRow.close_time,
          feeBps: marketRow.fee_bps,
          depth: marketRow.b_liquidity
        },
        state: {
          yesPrice: Number(stateRow.yes_price),
          noPrice: Number(stateRow.no_price),
          qYes: Number(stateRow.q_yes),
          qNo: Number(stateRow.q_no),
          volumeTotal: Number(stateRow.volume_total),
          participantsCount: Number(stateRow.participants_count)
        },
        quote,
        tradeInput: {
          inputMode,
          amountEur: inputMode === 'shares' ? null : amountEur,
          shareAmount: inputMode === 'shares' ? shareAmount : null
        },
        guardrails: alphaGuardrails,
        userLimits,
        eventLimits,
        eventContext,
        quoteHash,
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof TradeRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    Sentry.captureException(error, {
      tags: { route: 'api/quotes/preview' }
    });

    return NextResponse.json(
      {
        error: 'quote preview unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
