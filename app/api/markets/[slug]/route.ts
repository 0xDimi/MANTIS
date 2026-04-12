import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase = await getSupabaseServerClient();

    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select(
        'id,slug,question,description,category,status,close_time,resolution_time,source_primary,source_fallback,void_rule,fee_bps,b_liquidity,yes_label,no_label'
      )
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (marketError) {
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: 'market not found' }, { status: 404 });
    }

    const marketRow = market as any;

    const [{ data: state, error: stateError }, { data: resolution, error: resolutionError }] = await Promise.all([
      supabase
        .from('market_state')
        .select('market_id,q_yes,q_no,yes_price,no_price,last_trade_at,volume_total,open_interest,participants_count')
        .eq('market_id', marketRow.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('resolutions')
        .select('id,outcome,evidence_summary,evidence_url,created_at')
        .eq('market_id', marketRow.id)
        .limit(1)
        .maybeSingle()
    ]);

    if (stateError) {
      return NextResponse.json({ error: stateError.message }, { status: 500 });
    }

    if (resolutionError) {
      return NextResponse.json({ error: resolutionError.message }, { status: 500 });
    }

    const stateRow = state as any;

    return NextResponse.json(
      {
        market: marketRow,
        state: stateRow
          ? {
              market_id: stateRow.market_id,
              q_yes: Number(stateRow.q_yes),
              q_no: Number(stateRow.q_no),
              yes_price: Number(stateRow.yes_price),
              no_price: Number(stateRow.no_price),
              last_trade_at: stateRow.last_trade_at,
              volume_total: Number(stateRow.volume_total),
              open_interest: Number(stateRow.open_interest),
              participants_count: Number(stateRow.participants_count)
            }
          : null,
        resolution: resolution
          ? {
              id: (resolution as any).id,
              outcome: (resolution as any).outcome,
              evidence_summary: (resolution as any).evidence_summary,
              evidence_url: (resolution as any).evidence_url,
              created_at: (resolution as any).created_at
            }
          : null
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'market detail API unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
