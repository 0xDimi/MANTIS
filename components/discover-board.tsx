import Link from 'next/link';
import { loadMarketsBoard } from '@/lib/alpha-read-model';
import { tr, type UiLang } from '@/lib/ui-lang';
import { MarketCard } from '@/components/market-card';

type DiscoverView = 'trending' | 'new' | 'liquid' | 'ending';

type DiscoverBoardProps = {
  lang: UiLang;
  view: DiscoverView;
  category: string | null;
  showBrand?: boolean;
};

function normalizeView(value: string | null | undefined): DiscoverView {
  if (value === 'new' || value === 'liquid' || value === 'ending') {
    return value;
  }

  return 'trending';
}

function labelize(value: string) {
  return value.replace(/[-_]/g, ' ');
}

function hrefWith(lang: UiLang, view: DiscoverView, category: string | null) {
  const params = new URLSearchParams();

  if (lang === 'el') params.set('lang', 'el');
  if (view !== 'trending') params.set('view', view);
  if (category) params.set('cat', category);

  const query = params.toString();
  return query ? `?${query}` : '';
}

function sortMarkets(markets: Awaited<ReturnType<typeof loadMarketsBoard>>['markets'], view: DiscoverView) {
  const list = [...markets];

  if (view === 'ending') {
    return list.sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());
  }

  if (view === 'liquid') {
    return list.sort((a, b) => (b.liquidity ?? 0) - (a.liquidity ?? 0));
  }

  if (view === 'new') {
    return list.sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());
  }

  return list.sort((a, b) => (b.state?.volumeTotal ?? 0) - (a.state?.volumeTotal ?? 0));
}

export async function DiscoverBoard({ lang, view, category, showBrand = false }: DiscoverBoardProps) {
  const { markets, error } = await loadMarketsBoard();
  const openMarkets = markets.filter((market) => market.status === 'open');
  const sorted = sortMarkets(openMarkets, normalizeView(view));
  const filtered = category ? sorted.filter((market) => market.category === category) : sorted;
  const featured = sorted.slice(0, 2);
  const categories = Array.from(new Set(openMarkets.map((market) => market.category)));

  const tabs: Array<{ key: DiscoverView; en: string; el: string }> = [
    { key: 'trending', en: 'Trending', el: 'Τάση' },
    { key: 'new', en: 'New', el: 'Νέα' },
    { key: 'liquid', en: 'Liquid', el: 'Ρευστότητα' },
    { key: 'ending', en: 'Ending Soon', el: 'Λήγουν Σύντομα' }
  ];

  return (
    <>
      {error ? <div className="notice noticeError">{tr(lang, 'Live board unavailable', 'Το live board δεν είναι διαθέσιμο')}.</div> : null}

      {showBrand ? (
        <section className="homeBrand" aria-label="MANTIS brand">
          <img className="homeBrandLogo" src="/brand/mantis/logo/mantis-logo-primary-wordmark.png" alt="MANTIS" />
        </section>
      ) : null}

      <section className="shelfTabs" aria-label={tr(lang, 'Market views', 'Προβολές αγοράς')}>
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            className={view === tab.key ? 'shelfTab shelfTabActive' : 'shelfTab'}
            href={hrefWith(lang, tab.key, category)}
          >
            {lang === 'el' ? tab.el : tab.en}
          </Link>
        ))}
      </section>

      <section className="featuredSwipe" aria-label={tr(lang, 'Featured markets', 'Προβεβλημένες αγορές')}>
        {featured.map((market) => (
          <MarketCard key={market.id} market={market} featured lang={lang} />
        ))}
      </section>

      <section className="categoryStrip" aria-label={tr(lang, 'Categories', 'Κατηγορίες')}>
        <Link className={!category ? 'categoryPill categoryPillActive' : 'categoryPill'} href={hrefWith(lang, view, null)}>
          {tr(lang, 'All', 'Όλες')}
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            className={category === item ? 'categoryPill categoryPillActive' : 'categoryPill'}
            href={hrefWith(lang, view, item)}
          >
            {labelize(item)}
          </Link>
        ))}
      </section>

      <section className="marketList" aria-label={tr(lang, 'Market list', 'Λίστα αγορών')}>
        {filtered.map((market) => (
          <MarketCard key={market.id} market={market} lang={lang} />
        ))}

        {filtered.length === 0 ? (
          <div className="card stackSm">
            <p className="subtle">{tr(lang, 'No open markets right now.', 'Δεν υπάρχουν ανοιχτές αγορές αυτή τη στιγμή.')}</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
