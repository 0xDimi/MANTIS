import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import {
  eventEducationCopy,
  normalizeEventStatus,
  roundMetric,
  type EventChildRead,
  type EventDetailRead
} from '@/lib/event-read-model';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';

function pickLocalization(rows: any[] | undefined, lang: 'en' | 'el') {
  return (rows ?? []).find((row) => row.locale === lang) ?? (rows ?? []).find((row) => row.locale === 'en') ?? null;
}

function marketValueForPosition(position: any, yesPrice: number, noPrice: number) {
  return roundMetric(Number(position?.yes_shares ?? 0) * yesPrice + Number(position?.no_shares ?? 0) * noPrice);
}

function costBasisForPosition(position: any) {
  return roundMetric(Number(position?.yes_cost_basis ?? 0) + Number(position?.no_cost_basis ?? 0));
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const lang = await resolveServerLang({ searchParam: url.searchParams.get('lang') });
    const supabase = await getSupabaseServerClient();

    const { data: event, error: eventError } = await supabase
      .from('market_events')
      .select(
        'id,slug,title,subtitle,description,category,tags,status,event_type,outcome_structure,resolution_mode,close_time,determination_time,source_primary,source_fallback,resolution_rule,void_rule,max_user_event_exposure'
      )
      .eq('slug', slug)
      .eq('event_type', 'grouped_binary')
      .eq('outcome_structure', 'independent_cluster')
      .eq('resolution_mode', 'child_independent')
      .limit(1)
      .maybeSingle();

    if (eventError) {
      Sentry.captureException(new Error(eventError.message), { tags: { route: 'api/events/[slug]' } });
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: 'event not found' }, { status: 404 });
    }

    const eventRow = event as any;

    const [{ data: localizations, error: localizationError }, { data: outcomes, error: outcomesError }] = await Promise.all([
      supabase
        .from('market_event_localizations')
        .select(
          'locale,title,subtitle,description,source_primary,source_fallback,resolution_rule,void_rule,education_copy'
        )
        .eq('event_id', eventRow.id)
        .in('locale', ['en', lang]),
      supabase
        .from('market_event_outcomes')
        .select(
          'id,event_id,child_market_id,outcome_key,outcome_label,outcome_short_label,outcome_description,display_order,is_active'
        )
        .eq('event_id', eventRow.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
    ]);

    if (localizationError) {
      Sentry.captureException(new Error(localizationError.message), { tags: { route: 'api/events/[slug]' } });
      return NextResponse.json({ error: localizationError.message }, { status: 500 });
    }

    if (outcomesError) {
      Sentry.captureException(new Error(outcomesError.message), { tags: { route: 'api/events/[slug]' } });
      return NextResponse.json({ error: outcomesError.message }, { status: 500 });
    }

    const outcomeRows = ((outcomes as any[]) ?? []).filter((outcome) => outcome.child_market_id);
    const outcomeIds = outcomeRows.map((outcome) => outcome.id);
    const childMarketIds = outcomeRows.map((outcome) => outcome.child_market_id);

    const [{ data: outcomeLocalizations, error: outcomeLocalizationError }, { data: childMarkets, error: childMarketsError }] =
      await Promise.all([
        outcomeIds.length
          ? supabase
              .from('market_event_outcome_localizations')
              .select('outcome_id,locale,outcome_label,outcome_short_label,outcome_description,child_question')
              .in('outcome_id', outcomeIds)
              .in('locale', ['en', lang])
          : Promise.resolve({ data: [], error: null }),
        childMarketIds.length
          ? supabase
              .from('markets')
              .select(
                'id,slug,status,close_time,market_state(yes_price,no_price,volume_total,open_interest,participants_count,last_trade_at)'
              )
              .in('id', childMarketIds)
          : Promise.resolve({ data: [], error: null })
      ]);

    if (outcomeLocalizationError) {
      Sentry.captureException(new Error(outcomeLocalizationError.message), { tags: { route: 'api/events/[slug]' } });
      return NextResponse.json({ error: outcomeLocalizationError.message }, { status: 500 });
    }

    if (childMarketsError) {
      Sentry.captureException(new Error(childMarketsError.message), { tags: { route: 'api/events/[slug]' } });
      return NextResponse.json({ error: childMarketsError.message }, { status: 500 });
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { data: positions, error: positionsError } =
      user && childMarketIds.length
        ? await supabase
            .from('positions')
            .select('market_id,yes_shares,no_shares,yes_cost_basis,no_cost_basis')
            .eq('user_id', user.id)
            .in('market_id', childMarketIds)
        : { data: [], error: null };

    if (positionsError) {
      Sentry.captureException(new Error(positionsError.message), { tags: { route: 'api/events/[slug]' } });
      return NextResponse.json({ error: positionsError.message }, { status: 500 });
    }

    const localization = pickLocalization(localizations as any[], lang);
    const childMarketById = new Map(((childMarkets as any[]) ?? []).map((market) => [market.id, market]));
    const positionByMarketId = new Map(((positions as any[]) ?? []).map((position) => [position.market_id, position]));

    const children: EventChildRead[] = outcomeRows
      .map((outcome) => {
        const market = childMarketById.get(outcome.child_market_id);
        if (!market) return null;
        const state = Array.isArray(market.market_state) ? market.market_state[0] : market.market_state;
        const outcomeLocalization = pickLocalization(
          ((outcomeLocalizations as any[]) ?? []).filter((row) => row.outcome_id === outcome.id),
          lang
        );
        const yesPrice = Number(state?.yes_price ?? 0.5);
        const noPrice = Number(state?.no_price ?? 0.5);
        const position = positionByMarketId.get(market.id);
        const marketValue = position ? marketValueForPosition(position, yesPrice, noPrice) : 0;
        const costBasis = position ? costBasisForPosition(position) : 0;

        return {
          outcomeId: outcome.id,
          marketId: market.id,
          slug: market.slug,
          closeTime: market.close_time,
          outcomeKey: outcome.outcome_key,
          label: outcomeLocalization?.outcome_label ?? outcome.outcome_label,
          shortLabel: outcomeLocalization?.outcome_short_label ?? outcome.outcome_short_label,
          description: outcomeLocalization?.outcome_description ?? outcome.outcome_description,
          childQuestion: outcomeLocalization?.child_question ?? outcome.outcome_description ?? outcome.outcome_label,
          displayOrder: Number(outcome.display_order ?? 0),
          status: market.status,
          yesPrice,
          noPrice,
          volumeTotal: Number(state?.volume_total ?? 0),
          openInterest: Number(state?.open_interest ?? 0),
          participantsCount: Number(state?.participants_count ?? 0),
          lastTradeAt: state?.last_trade_at ?? null,
          userPosition: position
            ? {
                yesShares: Number(position.yes_shares ?? 0),
                noShares: Number(position.no_shares ?? 0),
                marketValue,
                unrealizedPnl: roundMetric(marketValue - costBasis)
              }
            : undefined
        };
      })
      .filter(Boolean) as EventChildRead[];

    const activeChildren = children.filter((child) => child.status !== 'void');
    const userEventExposure = children.reduce(
      (sum, child) =>
        sum +
        (child.userPosition
          ? Math.max(0, Number(child.userPosition.yesShares ?? 0) * child.yesPrice + Number(child.userPosition.noShares ?? 0) * child.noPrice)
          : 0),
      0
    );

    const response: EventDetailRead = {
      event: {
        id: eventRow.id,
        slug: eventRow.slug,
        title: localization?.title ?? eventRow.title,
        subtitle: localization?.subtitle ?? eventRow.subtitle,
        description: localization?.description ?? eventRow.description,
        category: eventRow.category,
        tags: eventRow.tags ?? [],
        status: normalizeEventStatus(eventRow.status),
        eventType: 'grouped_binary',
        outcomeStructure: 'independent_cluster',
        resolutionMode: 'child_independent',
        closeTime: eventRow.close_time,
        determinationTime: eventRow.determination_time,
        sourcePrimary: localization?.source_primary ?? eventRow.source_primary,
        sourceFallback: localization?.source_fallback ?? eventRow.source_fallback,
        resolutionRule: localization?.resolution_rule ?? eventRow.resolution_rule,
        voidRule: localization?.void_rule ?? eventRow.void_rule,
        educationCopy: localization?.education_copy ?? eventEducationCopy(lang),
        userEducationKey: 'multiple_can_resolve_yes'
      },
      children,
      aggregate: {
        childCount: children.length,
        activeChildCount: activeChildren.length,
        expectedYesCount: roundMetric(activeChildren.reduce((sum, child) => sum + child.yesPrice, 0)),
        volumeTotal: roundMetric(children.reduce((sum, child) => sum + child.volumeTotal, 0)),
        openInterest: roundMetric(children.reduce((sum, child) => sum + child.openInterest, 0)),
        userEventExposure: user ? roundMetric(userEventExposure) : undefined
      },
      serverTime: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, { tags: { route: 'api/events/[slug]' } });
    return NextResponse.json(
      { error: 'Event detail API unavailable', detail: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    );
  }
}
