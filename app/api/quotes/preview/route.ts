import { NextResponse } from 'next/server';
import { buildAmmV0Quote, type TradeAction, type TradeSide } from '@/lib/amm-v0';
import { alphaGuardrails } from '@/lib/alpha-guardrails';
import { buildQuoteHash } from '@/lib/quote-hash';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type PreviewBody = {
  marketId?: string;
  marketSlug?: string;
  side?: TradeSide;
  action?: TradeAction;
  amountEur?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewBody;
    const side = body.side;
    const action = body.action ?? 'buy';
    const amountEur = Number(body.amountEur ?? 0);

    if (!side || (side !== 'yes' && side !== 'no')) {
      return NextResponse.json({ error: 'side must be yes or no' }, { status: 400 });
    }

    if (action !== 'buy' && action !== 'sell') {
      return NextResponse.json({ error: 'action must be buy or sell' }, { status: 400 });
    }

    if (!Number.isFinite(amountEur) || amountEur <= 0) {
      return NextResponse.json({ error: 'amountEur must be > 0' }, { status: 400 });
    }

    if (amountEur > alphaGuardrails.maxSingleTradeEur) {
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
      .select('id,slug,question,status,b_liquidity,fee_bps,close_time')
      .limit(1);

    marketQuery = body.marketId ? marketQuery.eq('id', body.marketId) : marketQuery.eq('slug', body.marketSlug!);

    const { data: market, error: marketError } = await marketQuery.maybeSingle();

    if (marketError) {
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: 'market not found' }, { status: 404 });
    }

    const marketRow = market as any;

    if (marketRow.status !== 'open') {
      return NextResponse.json({ error: `market is ${marketRow.status}, not open` }, { status: 409 });
    }

    const { data: state, error: stateError } = await supabase
      .from('market_state')
      .select('market_id,yes_price,no_price,q_yes,q_no,volume_total,participants_count')
      .eq('market_id', marketRow.id)
      .limit(1)
      .maybeSingle();

    if (stateError) {
      return NextResponse.json({ error: stateError.message }, { status: 500 });
    }

    if (!state) {
      return NextResponse.json({ error: 'market state missing' }, { status: 500 });
    }

    const stateRow = state as any;

    const quote = buildAmmV0Quote({
      side,
      action,
      amountEur,
      pYes: Number(stateRow.yes_price),
      depth: Number(marketRow.b_liquidity),
      feeBps: Number(marketRow.fee_bps)
    });

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + alphaGuardrails.quoteTtlSeconds * 1000);

    const quoteHash = buildQuoteHash({
      marketId: marketRow.id,
      side,
      action,
      amountEur,
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
        guardrails: alphaGuardrails,
        quoteHash,
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'quote preview unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
