import Link from 'next/link';
import { loadEventsBoard, loadMarketsBoard } from '@/lib/alpha-read-model';
import { localizeBoardMarketCopy, localizedCategory, localizedMarketSearchBlob } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';
import { CompactMarketRow } from '@/components/compact-market-row';
import { EventCard } from '@/components/event-card';
import { MarketPulsePanel } from '@/components/market-pulse-panel';
import { MarketCard } from '@/components/market-card';
import { FeaturedMarketsCarousel } from '@/components/featured-markets-carousel';
import { DISCOVER_BOARD_SCOPE, isInternalMarket } from '@/lib/discover-board-config';

type DiscoverView = 'trending' | 'new' | 'liquid' | 'ending';

type DiscoverBoardProps = {
  lang: UiLang;
  view: DiscoverView;
  category: string | null;
  query?: string | null;
};

function normalizeView(value: string | null | undefined): DiscoverView {
  if (value === 'new' || value === 'liquid' || value === 'ending') {
    return value;
  }

  return 'trending';
}

function statusPriority(status: string) {
  if (status === 'open') return 0;
  if (status === 'paused') return 1;
  if (status === 'draft') return 2;
  return 3;
}

function hrefWith(lang: UiLang, view: DiscoverView, category: string | null, queryText?: string | null) {
  const params = new URLSearchParams();

  if (lang === 'el') params.set('lang', 'el');
  if (view !== 'trending') params.set('view', view);
  if (category) params.set('cat', category);
  if (queryText) params.set('q', queryText);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function sortMarkets(markets: Awaited<ReturnType<typeof loadMarketsBoard>>['markets'], view: DiscoverView) {
  const list = [...markets];

  const withOpenPriority = (a: (typeof list)[number], b: (typeof list)[number], fallback: number) => {
    const rank = statusPriority(a.status) - statusPriority(b.status);
    return rank !== 0 ? rank : fallback;
  };

  if (view === 'ending') {
    return list.sort((a, b) => withOpenPriority(a, b, new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()));
  }

  if (view === 'liquid') {
    return list.sort((a, b) => withOpenPriority(a, b, (b.liquidity ?? 0) - (a.liquidity ?? 0)));
  }

  if (view === 'new') {
    return list.sort((a, b) => withOpenPriority(a, b, new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime()));
  }

  return list.sort((a, b) => withOpenPriority(a, b, (b.state?.volumeTotal ?? 0) - (a.state?.volumeTotal ?? 0)));
}

const FEATURED_PINNED_SLUGS = [
  'gre-politics-cabinet-reshuffle-announced',
  'gre-politics-tsipras-new-party-may15',
  'gre-economy-cpi-above-5-may2026'
] as const;

export async function DiscoverBoard({ lang, view, category, query }: DiscoverBoardProps) {
  const [{ markets, error }, eventBoard] = await Promise.all([
    loadMarketsBoard({ scope: DISCOVER_BOARD_SCOPE, lang }),
    loadEventsBoard({ lang, category, search: query })
  ]);
  const userMarkets = markets
    .filter((market) => !isInternalMarket(market.slug, market.question))
    .map((market) => localizeBoardMarketCopy(market, lang));
  const normalizedView = normalizeView(view);
  const sorted = sortMarkets(userMarkets, normalizedView);
  const activeMarkets = sorted.filter((market) => market.status === 'open' || market.status === 'paused');
  const watchlistMarkets = sorted.filter((market) => ['open', 'paused', 'draft'].includes(market.status));
  const curatedBase = normalizedView === 'trending'
    ? (activeMarkets.length >= 4 ? activeMarkets : watchlistMarkets)
    : sorted;
  const normalizedQuery = (query ?? '').trim().toLowerCase();
  const categoryFiltered = category ? curatedBase.filter((market) => market.category === category) : curatedBase;
  const filtered = normalizedQuery
    ? categoryFiltered.filter((market) => localizedMarketSearchBlob(market, lang).includes(normalizedQuery))
    : categoryFiltered;
  const featuredSource = normalizedQuery || category || normalizedView !== 'trending' ? filtered : curatedBase;
  const pulseSource = (normalizedQuery || category || normalizedView !== 'trending' ? filtered : activeMarkets).filter(
    (market) => market.status === 'open' || market.status === 'paused'
  );
  const featuredPool = [...featuredSource].sort((a, b) => statusPriority(a.status) - statusPriority(b.status));
  const pinnedFeatured = FEATURED_PINNED_SLUGS
    .map((slug) => featuredPool.find((market) => market.slug === slug))
    .filter((market): market is (typeof featuredPool)[number] => Boolean(market));
  const pinnedSlugs = new Set(pinnedFeatured.map((market) => market.slug));
  const fallbackFeatured = featuredPool.filter((market) => !pinnedSlugs.has(market.slug));
  const featured = [...pinnedFeatured, ...fallbackFeatured].slice(0, 2);
  const featuredIds = new Set(featured.map((market) => market.id));
  const gridMarkets = filtered.filter((market) => !featuredIds.has(market.id));
  const leadStandardMarkets = gridMarkets.slice(0, 2);
  const compactMarkets = gridMarkets.slice(2);
  const featuredWithinFilterCount = filtered.filter((market) => featuredIds.has(market.id)).length;
  const categories = Array.from(new Set(userMarkets.map((market) => market.category)));

  const tabs: Array<{ key: DiscoverView; en: string; el: string }> = [
    { key: 'trending', en: 'Trending', el: 'Τάση' },
    { key: 'new', en: 'New', el: 'Νέα' },
    { key: 'liquid', en: 'Liquid', el: 'Ρευστότητα' },
    { key: 'ending', en: 'Ending Soon', el: 'Λήγουν Σύντομα' }
  ];

  return (
    <>
      {error ? <div className="notice noticeError">{tr(lang, 'Live board unavailable', 'Το live board δεν είναι διαθέσιμο')}.</div> : null}

      <section className="shelfTabs" aria-label={tr(lang, 'Market views', 'Προβολές αγοράς')}>
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            className={view === tab.key ? 'shelfTab shelfTabActive' : 'shelfTab'}
            href={hrefWith(lang, tab.key, category, normalizedQuery)}
          >
            {lang === 'el' ? tab.el : tab.en}
          </Link>
        ))}
      </section>

      {(featured.length > 0 || pulseSource.length > 0) ? (
        <section className="discoverHeroGrid" aria-label={tr(lang, 'Board highlights', 'Κύρια σημεία ταμπλό')}>
          <div className="discoverHeroMain">
            {featured.length > 0 ? <FeaturedMarketsCarousel markets={featured} lang={lang} /> : null}
          </div>
          <MarketPulsePanel markets={pulseSource.filter((market) => !featuredIds.has(market.id))} lang={lang} />
        </section>
      ) : null}

      <section className="categoryStrip" aria-label={tr(lang, 'Categories', 'Κατηγορίες')}>
        <Link className={!category ? 'categoryPill categoryPillActive' : 'categoryPill'} href={hrefWith(lang, view, null, normalizedQuery)}>
          {tr(lang, 'All', 'Όλες')}
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            className={category === item ? 'categoryPill categoryPillActive' : 'categoryPill'}
            href={hrefWith(lang, view, item, normalizedQuery)}
          >
            {localizedCategory(item, lang)}
          </Link>
        ))}
      </section>

      {normalizedQuery ? (
        <p className="subtle searchResultHint">
          {tr(lang, 'Results for', 'Αποτελέσματα για')} <strong>{query}</strong>
        </p>
      ) : null}

      {normalizedQuery || category || normalizedView !== 'trending' ? (
        <p className="subtle searchResultHint">
          {tr(
            lang,
            `Showing ${filtered.length} single markets and ${eventBoard.events.length} grouped markets. ${featuredWithinFilterCount} featured above, ${gridMarkets.length + eventBoard.events.length} in the list below.`,
            `Εμφανίζονται ${filtered.length} απλές αγορές και ${eventBoard.events.length} ομαδοποιημένες. ${featuredWithinFilterCount} προτεινόμενες πιο πάνω, ${gridMarkets.length + eventBoard.events.length} στη λίστα πιο κάτω.`
          )}
        </p>
      ) : null}

      {eventBoard.events.length > 0 ? (
        <section className="discoverSection stackSm" aria-label={tr(lang, 'Grouped market clusters', 'Ομαδοποιημένα clusters')}>
          <div className="sectionHeaderInline">
            <h2>{tr(lang, 'Grouped clusters', 'Ομαδοποιημένα clusters')}</h2>
            <p className="subtle">{tr(lang, 'Independent binary markets under one thesis.', 'Ανεξάρτητες δυαδικές αγορές κάτω από μία ενιαία θεματική.')}</p>
          </div>
          <div className="marketList groupedEventGrid">
            {eventBoard.events.map((event) => (
              <EventCard key={event.id} event={event} lang={lang} />
            ))}
          </div>
        </section>
      ) : null}

      {leadStandardMarkets.length > 0 ? (
        <section className="discoverSection stackSm" aria-label={tr(lang, 'Board leaders', 'Κύριες αγορές')}>
          <div className="sectionHeaderInline">
            <h2>{tr(lang, 'Board leaders', 'Κύριες αγορές')}</h2>
            <p className="subtle">{tr(lang, 'Highest-conviction questions on the board right now.', 'Οι πιο σημαντικές ερωτήσεις του ταμπλό αυτή τη στιγμή.')}</p>
          </div>
          <div className="marketList standardMarketGrid">
            {leadStandardMarkets.map((market) => (
              <MarketCard key={market.id} market={market} lang={lang} />
            ))}
          </div>
        </section>
      ) : null}

      {compactMarkets.length > 0 ? (
        <section className="discoverSection stackSm" aria-label={tr(lang, 'More markets', 'Περισσότερες αγορές')}>
          <div className="sectionHeaderInline">
            <h2>{tr(lang, 'More markets', 'Περισσότερες αγορές')}</h2>
            <p className="subtle">{tr(lang, 'A denser scan of the live board without turning into an odds wall.', 'Πιο πυκνή σάρωση του live ταμπλό χωρίς να μοιάζει με τοίχο αποδόσεων.')}</p>
          </div>
          <div className="compactMarketList">
            {compactMarkets.map((market) => (
              <CompactMarketRow key={market.id} market={market} lang={lang} />
            ))}
          </div>
        </section>
      ) : null}

      {gridMarkets.length === 0 && eventBoard.events.length === 0 ? (
        <div className="card stackSm">
          <p className="subtle">{tr(lang, 'No markets matched your current filters.', 'Δεν βρέθηκαν αγορές με τα τρέχοντα φίλτρα.')}</p>
        </div>
      ) : null}
    </>
  );
}
