import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import {
  eventEducationCopy,
  normalizeEventStatus,
  roundMetric,
  type EventCardRead,
  type EventStatus
} from '@/lib/event-read-model';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';

const publicStatuses = new Set<EventStatus>(['open', 'closed', 'under_review', 'resolved', 'settled', 'void']);

function parseLimit(value: string | null) {
  const parsed = Number(value ?? 40);
  if (!Number.isFinite(parsed)) return 40;
  return Math.min(Math.max(Math.floor(parsed), 1), 80);
}

function pickLocalization(rows: any[] | undefined, eventId: string, lang: 'en' | 'el') {
  const matches = (rows ?? []).filter((row) => row.event_id === eventId);
  return matches.find((row) => row.locale === lang) ?? matches.find((row) => row.locale === 'en') ?? null;
}

function pickOutcomeLocalization(rows: any[] | undefined, outcomeId: string, lang: 'en' | 'el') {
  const matches = (rows ?? []).filter((row) => row.outcome_id === outcomeId);
  return matches.find((row) => row.locale === lang) ?? matches.find((row) => row.locale === 'en') ?? null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lang = await resolveServerLang({ searchParam: url.searchParams.get('lang') });
    const limit = parseLimit(url.searchParams.get('limit'));
    const status = url.searchParams.get('status') as EventStatus | null;
    const category = url.searchParams.get('category');
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    const supabase = await getSupabaseServerClient();

    let eventQuery = supabase
      .from('market_events')
      .select(
        'id,slug,title,subtitle,description,category,tags,status,event_type,outcome_structure,resolution_mode,close_time,determination_time,updated_at'
      )
      .eq('event_type', 'grouped_binary')
      .eq('outcome_structure', 'independent_cluster')
      .eq('resolution_mode', 'child_independent')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (status && publicStatuses.has(status)) {
      eventQuery = eventQuery.eq('status', status);
    } else {
      eventQuery = eventQuery.in('status', Array.from(publicStatuses));
    }

    if (category) {
      eventQuery = eventQuery.eq('category', category);
    }

    const { data: eventRows, error: eventError } = await eventQuery;

    if (eventError) {
      Sentry.captureException(new Error(eventError.message), { tags: { route: 'api/events' } });
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    const events = eventRows ?? [];
    const eventIds = events.map((event: any) => event.id);

    if (eventIds.length === 0) {
      return NextResponse.json({ events: [], nextCursor: null }, { status: 200 });
    }

    const [{ data: localizations, error: localizationError }, { data: outcomes, error: outcomesError }] = await Promise.all([
      supabase
        .from('market_event_localizations')
        .select('event_id,locale,title,subtitle,description,education_copy')
        .in('event_id', eventIds)
        .in('locale', ['en', lang]),
      supabase
        .from('market_event_outcomes')
        .select('id,event_id,child_market_id,outcome_key,outcome_label,outcome_short_label,outcome_description,display_order,is_active')
        .in('event_id', eventIds)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
    ]);

    if (localizationError) {
      Sentry.captureException(new Error(localizationError.message), { tags: { route: 'api/events' } });
      return NextResponse.json({ error: localizationError.message }, { status: 500 });
    }

    if (outcomesError) {
      Sentry.captureException(new Error(outcomesError.message), { tags: { route: 'api/events' } });
      return NextResponse.json({ error: outcomesError.message }, { status: 500 });
    }

    const outcomeRows = (((outcomes as any[]) ?? []).filter((outcome: any) => outcome.child_market_id)) as any[];
    const outcomeIds = outcomeRows.map((outcome: any) => outcome.id);
    const childMarketIds = outcomeRows.map((outcome: any) => outcome.child_market_id);

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
              .select('id,slug,status,close_time,market_state(yes_price,no_price,volume_total,open_interest,participants_count,last_trade_at)')
              .in('id', childMarketIds)
          : Promise.resolve({ data: [], error: null })
      ]);

    if (outcomeLocalizationError) {
      Sentry.captureException(new Error(outcomeLocalizationError.message), { tags: { route: 'api/events' } });
      return NextResponse.json({ error: outcomeLocalizationError.message }, { status: 500 });
    }

    if (childMarketsError) {
      Sentry.captureException(new Error(childMarketsError.message), { tags: { route: 'api/events' } });
      return NextResponse.json({ error: childMarketsError.message }, { status: 500 });
    }

    const outcomesByEventId = new Map<string, any[]>();
    for (const outcome of outcomeRows) {
      const list = outcomesByEventId.get(outcome.event_id) ?? [];
      list.push(outcome);
      outcomesByEventId.set(outcome.event_id, list);
    }

    const childMarketById = new Map((childMarkets ?? []).map((market: any) => [market.id, market]));

    const cards: EventCardRead[] = events
      .map((event: any) => {
        const localization = pickLocalization(localizations as any[], event.id, lang);
        const childRows = (outcomesByEventId.get(event.id) ?? [])
          .map((outcome) => {
            const market = childMarketById.get(outcome.child_market_id);
            if (!market) return null;
            const state = Array.isArray(market.market_state) ? market.market_state[0] : market.market_state;
            const outcomeLocalization = pickOutcomeLocalization(outcomeLocalizations as any[], outcome.id, lang);
            return {
              marketId: market.id,
              slug: market.slug,
              closeTime: market.close_time,
              outcomeKey: outcome.outcome_key,
              label: outcomeLocalization?.outcome_label ?? outcome.outcome_label,
              yesPrice: Number(state?.yes_price ?? 0.5),
              noPrice: Number(state?.no_price ?? 0.5),
              status: market.status,
              volumeTotal: Number(state?.volume_total ?? 0),
              openInterest: Number(state?.open_interest ?? 0)
            };
          })
          .filter(Boolean) as Array<{
          marketId: string;
          slug: string;
          closeTime: string;
          outcomeKey: string;
          label: string;
          yesPrice: number;
          noPrice: number;
          status: string;
          volumeTotal: number;
          openInterest: number;
        }>;

        const activeChildren = childRows.filter((child) => child.status !== 'void');
        const title = localization?.title ?? event.title;
        const subtitle = localization?.subtitle ?? event.subtitle;
        const searchable = `${title} ${subtitle ?? ''} ${event.category} ${childRows.map((child) => child.label).join(' ')}`.toLowerCase();

        if (search && !searchable.includes(search)) {
          return null;
        }

        return {
          id: event.id,
          slug: event.slug,
          title,
          subtitle,
          category: event.category,
          status: normalizeEventStatus(event.status),
          outcomeStructure: 'independent_cluster',
          resolutionMode: 'child_independent',
          closeTime: event.close_time,
          determinationTime: event.determination_time,
          childCount: childRows.length,
          activeChildCount: activeChildren.length,
          topChildren: childRows.slice(0, 5).map(({ volumeTotal, openInterest, closeTime, ...child }) => child),
          volumeTotal: roundMetric(childRows.reduce((sum, child) => sum + child.volumeTotal, 0)),
          openInterest: roundMetric(childRows.reduce((sum, child) => sum + child.openInterest, 0)),
          expectedYesCount: roundMetric(activeChildren.reduce((sum, child) => sum + child.yesPrice, 0)),
          explanation: 'multiple_can_resolve_yes'
        };
      })
      .filter(Boolean) as EventCardRead[];

    return NextResponse.json({ events: cards, nextCursor: null, educationCopy: eventEducationCopy(lang) }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error, { tags: { route: 'api/events' } });
    return NextResponse.json(
      { error: 'Events API unavailable', detail: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    );
  }
}
