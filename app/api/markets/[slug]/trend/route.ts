import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

type RangeKey = '24h' | '7d' | 'all';

type TrendPoint = {
  ts: number;
  yesPrice: number;
};

function parseRange(input: string | null): RangeKey {
  if (input === '7d' || input === 'all') return input;
  return '24h';
}

function clampPrice(value: number) {
  return Math.max(0.01, Math.min(0.99, value));
}

function normalizeYesPrice(avgPrice: number, side: 'yes' | 'no') {
  return clampPrice(side === 'yes' ? avgPrice : 1 - avgPrice);
}

function rangeWindowStart(range: RangeKey, nowMs: number) {
  if (range === '24h') return nowMs - 24 * 60 * 60 * 1000;
  if (range === '7d') return nowMs - 7 * 24 * 60 * 60 * 1000;
  return null;
}

function bucketSizeMs(range: RangeKey) {
  if (range === '24h') return 30 * 60 * 1000;
  if (range === '7d') return 3 * 60 * 60 * 1000;
  return 12 * 60 * 60 * 1000;
}

function maxPoints(range: RangeKey) {
  if (range === '24h') return 48;
  if (range === '7d') return 56;
  return 72;
}

function downsample(points: TrendPoint[], target: number) {
  if (points.length <= target) return points;

  const out: TrendPoint[] = [];
  const step = (points.length - 1) / (target - 1);

  for (let i = 0; i < target; i += 1) {
    const idx = Math.round(i * step);
    out.push(points[idx]);
  }

  return out;
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const range = parseRange(url.searchParams.get('range'));
    const nowMs = Date.now();
    const windowStart = rangeWindowStart(range, nowMs);

    const admin = getSupabaseAdminClient();

    const { data: market, error: marketError } = await admin
      .from('markets')
      .select('id')
      .eq('slug', slug)
      .limit(1)
      .maybeSingle();

    if (marketError) {
      Sentry.captureException(new Error(marketError.message), {
        tags: { route: 'api/markets/[slug]/trend' }
      });
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: 'market not found' }, { status: 404 });
    }

    const marketId = (market as { id: string }).id;

    const [{ data: stateRow, error: stateError }, tradesResult] = await Promise.all([
      admin
        .from('market_state')
        .select('yes_price')
        .eq('market_id', marketId)
        .limit(1)
        .maybeSingle(),
      (() => {
        let query = admin
          .from('trades')
          .select('created_at,avg_price,side')
          .eq('market_id', marketId)
          .order('created_at', { ascending: false })
          .limit(range === 'all' ? 2500 : 1000);

        if (windowStart) {
          query = query.gte('created_at', new Date(windowStart).toISOString());
        }

        return query;
      })()
    ]);

    if (stateError) {
      Sentry.captureException(new Error(stateError.message), {
        tags: { route: 'api/markets/[slug]/trend' }
      });
      return NextResponse.json({ error: stateError.message }, { status: 500 });
    }

    if (tradesResult.error) {
      Sentry.captureException(new Error(tradesResult.error.message), {
        tags: { route: 'api/markets/[slug]/trend' }
      });
      return NextResponse.json({ error: tradesResult.error.message }, { status: 500 });
    }

    const baseYesPrice = clampPrice(Number((stateRow as { yes_price?: number } | null)?.yes_price ?? 0.5));
    const tradeRows = ((tradesResult.data ?? []) as Array<{ created_at: string; avg_price: number; side: 'yes' | 'no' }>).reverse();

    const rawPoints: TrendPoint[] = [];

    for (const row of tradeRows) {
      const ts = new Date(row.created_at).getTime();
      const avg = Number(row.avg_price);

      if (!Number.isFinite(ts) || !Number.isFinite(avg)) continue;
      rawPoints.push({ ts, yesPrice: normalizeYesPrice(avg, row.side) });
    }

    const bucketMs = bucketSizeMs(range);
    const bucketMap = new Map<number, TrendPoint>();

    for (const point of rawPoints) {
      const bucketKey = Math.floor(point.ts / bucketMs) * bucketMs;
      bucketMap.set(bucketKey, { ts: bucketKey, yesPrice: point.yesPrice });
    }

    let points = Array.from(bucketMap.values()).sort((a, b) => a.ts - b.ts);

    if (!points.length) {
      const startTs = windowStart ?? nowMs - 6 * 60 * 60 * 1000;
      points = [
        { ts: startTs, yesPrice: baseYesPrice },
        { ts: nowMs, yesPrice: baseYesPrice }
      ];
    } else {
      if (windowStart && points[0].ts > windowStart) {
        points.unshift({ ts: windowStart, yesPrice: points[0].yesPrice });
      }

      const lastPoint = points[points.length - 1];
      if (nowMs - lastPoint.ts > bucketMs / 2) {
        points.push({ ts: nowMs, yesPrice: baseYesPrice });
      } else {
        points[points.length - 1] = { ts: lastPoint.ts, yesPrice: baseYesPrice };
      }
    }

    points = downsample(points, maxPoints(range));

    return NextResponse.json(
      {
        range,
        points: points.map((point) => ({
          time: new Date(point.ts).toISOString(),
          yesPrice: point.yesPrice
        })),
        meta: {
          source: rawPoints.length ? 'trades' : 'state',
          tradeCount: rawPoints.length
        }
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: 'api/markets/[slug]/trend' }
    });

    return NextResponse.json(
      {
        error: 'market trend unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
