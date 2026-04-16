import Link from 'next/link';
import { loadMarketsBoard } from '@/lib/alpha-read-model';
import { tr, type UiLang } from '@/lib/ui-lang';
import { MarketCard } from '@/components/market-card';
import { FeaturedMarketsCarousel } from '@/components/featured-markets-carousel';
import { getDesignSampleMarkets } from '@/lib/design-sample-markets';

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

function labelize(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1));
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

function isInternalMarket(slug: string, question: string) {
  const target = `${slug} ${question}`.toLowerCase();
  return /(smoke|qa|test|sim|internal|ops|lifecycle|admin[-_]?)/.test(target);
}

export async function DiscoverBoard({ lang, view, category, query }: DiscoverBoardProps) {
  const { markets, error } = await loadMarketsBoard({ scope: 'all' });
  const userMarkets = markets.filter((market) => !isInternalMarket(market.slug, market.question));
  const mergedMarkets = userMarkets.length >= 10 ? userMarkets : [...userMarkets, ...getDesignSampleMarkets()];
  const normalizedView = normalizeView(view);
  const sorted = sortMarkets(mergedMarkets, normalizedView);
  const activeMarkets = sorted.filter((market) => market.status === 'open' || market.status === 'paused');
  const fallbackActiveMarkets = getDesignSampleMarkets();
  const curatedBase = normalizedView === 'trending'
    ? (activeMarkets.length > 0 ? activeMarkets : fallbackActiveMarkets)
    : sorted;
  const normalizedQuery = (query ?? '').trim().toLowerCase();
  const categoryFiltered = category ? curatedBase.filter((market) => market.category === category) : curatedBase;
  const filtered = normalizedQuery
    ? categoryFiltered.filter((market) => `${market.question} ${market.category}`.toLowerCase().includes(normalizedQuery))
    : categoryFiltered;
  const featuredPool = [...curatedBase].sort((a, b) => statusPriority(a.status) - statusPriority(b.status));
  const featured = featuredPool.slice(0, 2);
  const featuredIds = new Set(featured.map((market) => market.id));
  const gridMarkets = filtered.filter((market) => !featuredIds.has(market.id));
  const categories = Array.from(new Set(mergedMarkets.map((market) => market.category)));

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

      <FeaturedMarketsCarousel markets={featured} lang={lang} />

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
            {labelize(item)}
          </Link>
        ))}
      </section>

      {normalizedQuery ? (
        <p className="subtle searchResultHint">
          {tr(lang, 'Results for', 'Αποτελέσματα για')} <strong>{query}</strong>
        </p>
      ) : null}

      <section className="marketList" aria-label={tr(lang, 'Market list', 'Λίστα αγορών')}>
        {gridMarkets.map((market) => (
          <MarketCard key={market.id} market={market} lang={lang} />
        ))}

        {gridMarkets.length === 0 ? (
          <div className="card stackSm">
            <p className="subtle">{tr(lang, 'No additional markets matched your filters.', 'Δεν βρέθηκαν επιπλέον αγορές με αυτά τα φίλτρα.')}</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
