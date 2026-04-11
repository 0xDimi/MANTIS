import { NextResponse } from 'next/server';
import { buildAmmV0Quote } from '@/lib/amm-v0';
import { alphaGuardrails } from '@/lib/alpha-guardrails';
import { buildQuoteHash } from '@/lib/quote-hash';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type ExecuteBody = {
  marketId?: string;
  quoteHash?: string;
  quoteExpiresAt?: string;
  side?: 'yes' | 'no';
  action?: 'buy' | 'sell';
  amountEur?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExecuteBody;

    if (!body.marketId || !body.side || !body.action || !body.amountEur || !body.quoteHash || !body.quoteExpiresAt) {
      return NextResponse.json(
        {
          error: 'marketId, side, action, amountEur, quoteHash, and quoteExpiresAt are required'
        },
        { status: 400 }
      );
    }

    const amountEur = Number(body.amountEur);

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

    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('id,status,b_liquidity,fee_bps')
      .eq('id', body.marketId)
      .limit(1)
      .maybeSingle();

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
      .select('yes_price,no_price,q_yes,q_no')
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
      side: body.side,
      action: body.action,
      amountEur,
      pYes: Number(stateRow.yes_price),
      depth: Number(marketRow.b_liquidity),
      feeBps: Number(marketRow.fee_bps)
    });

    const serverQuoteHash = buildQuoteHash({
      marketId: marketRow.id,
      side: body.side,
      action: body.action,
      amountEur,
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

    const admin = getSupabaseAdminClient();

    const { data: executionData, error: executionError } = await (admin as any).rpc('execute_alpha_trade', {
      p_user_id: user.id,
      p_market_id: marketRow.id,
      p_side: body.side,
      p_action: body.action,
      p_amount: quote.amountEur,
      p_avg_price: quote.averagePrice,
      p_share_delta: quote.shareDelta,
      p_fee_amount: quote.feeAmountEur,
      p_total_amount: quote.totalAmountEur,
      p_post_yes_price: quote.postYesPrice,
      p_post_no_price: quote.postNoPrice,
      p_quote_hash: body.quoteHash
    });

    if (executionError) {
      return NextResponse.json(
        {
          error: 'atomic trade execution failed',
          detail: executionError.message
        },
        { status: 500 }
      );
    }

    const execution = Array.isArray(executionData) ? executionData[0] : executionData;

    return NextResponse.json(
      {
        status: 'executed',
        userId: user.id,
        marketId: marketRow.id,
        quote,
        execution: execution ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'trade execution unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
