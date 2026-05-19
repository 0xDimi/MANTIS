import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { MarketTrustTabs } from '@/components/market-trust-tabs';
import { MarketTrendPanel } from '@/components/market-trend-panel';
import { MarketQuotePreviewCard } from '@/components/market-quote-preview-card';
import { loadMarketDetail, loadMarketsBoard } from '@/lib/alpha-read-model';
import { formatDateTime, formatPercent, formatRelativeClose } from '@/lib/format';
import { localizeBoardMarketCopy, localizeMarketDetailCopy, localizedCategory, localizedMarketStatus } from '@/lib/market-copy';
import { resolveServerLang } from '@/lib/ui-lang-server';
import { tr } from '@/lib/ui-lang';

export default async function MarketDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string; side?: string; action?: string; amount?: string; sellPreset?: string }>;
}) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const lang = await resolveServerLang({ searchParam: query.lang });
  const [{ market: marketRaw, state, error }, board] = await Promise.all([
    loadMarketDetail(slug, { lang }),
    loadMarketsBoard({ scope: 'all', lang })
  ]);
  const market = marketRaw ? localizeMarketDetailCopy(marketRaw, lang) : null;
  const relatedMarkets = market
    ? (board.markets ?? [])
        .filter((item) => item.slug !== market.slug && item.category === market.category && item.status === 'open')
        .map((item) => localizeBoardMarketCopy(item, lang))
        .slice(0, 3)
    : [];

  return (
    <AlphaShell title={market?.question ?? tr(lang, 'Market', 'Αγορά')} lang={lang} showIntro={false}>
      <div className="buttonRow">
        <Link className="button buttonGhost" href={lang === 'el' ? '/markets?lang=el' : '/markets'}>
          {tr(lang, 'Back to markets', 'Επιστροφή στις αγορές')}
        </Link>
      </div>

      {error ? <div className="notice noticeError">{tr(lang, 'Market data unavailable', 'Τα δεδομένα αγοράς δεν είναι διαθέσιμα')}: {error}</div> : null}

      {market ? (
        <>
          <section className="marketHeroGrid">
            <article className="marketHeroMain">
              <p className="eyebrow">{localizedCategory(market.category, lang)}</p>
              <h1 className="marketTitle">{market.question}</h1>
              {market.description ? <p className="marketContextLine">{market.description}</p> : null}

              <section className="marketMetaStrip">
                <div className="marketMetaItem">
                  <span>{tr(lang, 'Trading closes', 'Λήξη διαπραγμάτευσης')}</span>
                  <strong>{formatDateTime(market.closeTime, lang)} ({formatRelativeClose(market.closeTime, { calendarAfterDays: 999, lang })})</strong>
                </div>
                <div className="marketMetaItem">
                  <span>{tr(lang, 'Resolution target', 'Στόχος επίλυσης')}</span>
                  <strong>{market.resolutionTime ? formatDateTime(market.resolutionTime, lang) : '—'}</strong>
                </div>
                <div className="marketMetaItem">
                  <span>{tr(lang, 'Primary source', 'Κύρια πηγή')}</span>
                  <strong>{market.sourcePrimary}</strong>
                </div>
                <div className="marketMetaItem">
                  <span>{tr(lang, 'Market status', 'Κατάσταση αγοράς')}</span>
                  <strong>{localizedMarketStatus(market.status, lang, 'long')}</strong>
                </div>
              </section>

              <section className="marketChartSurface">
                <MarketTrendPanel
                  slug={market.slug}
                  yesPrice={state?.yesPrice ?? 0.5}
                  volumeTotal={state?.volumeTotal ?? 0}
                  liquidity={market.liquidity}
                  participants={state?.participantsCount ?? 0}
                  lang={lang}
                  yesLabel={market.yesLabel}
                />
              </section>

              <Link className="button buttonGhost marketTicketJumpButton" href="#trade-ticket">
                {tr(lang, 'Open trade ticket', 'Μετάβαση στο δελτίο συναλλαγής')}
              </Link>

              {relatedMarkets.length > 0 ? (
                <section className="relatedMarketsRail" aria-label={tr(lang, 'Related markets', 'Σχετικές αγορές')}>
                  <p className="marketTrendLabel">{tr(lang, 'Related markets', 'Σχετικές αγορές')}</p>
                  <div className="relatedMarketsList">
                    {relatedMarkets.map((item) => (
                      <Link key={item.id} className="relatedMarketPill" href={`/markets/${item.slug}${lang === 'el' ? '?lang=el' : ''}`}>
                        <span>{item.question}</span>
                        <div className="relatedMarketMeta">
                          <strong>{formatPercent(item.state?.yesPrice ?? 0.5)}</strong>
                          <em>{tr(lang, 'Closes', 'Κλείνει')} {formatRelativeClose(item.closeTime, { lang })}</em>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </article>

            <aside className="marketTicketCard" id="trade-ticket">
              <MarketQuotePreviewCard
                marketId={market.id}
                marketSlug={market.slug}
                marketStatus={market.status}
                closeTime={market.closeTime}
                yesLabel={market.yesLabel}
                noLabel={market.noLabel}
                lang={lang}
                prefillAction={query.action}
                prefillSide={query.side}
                prefillAmount={query.amount}
                prefillSellPreset={query.sellPreset}
              />
            </aside>
          </section>

          <MarketTrustTabs
            lang={lang}
            closeTime={market.closeTime}
            resolutionTime={market.resolutionTime}
            sourcePrimary={market.sourcePrimary}
            sourceFallback={market.sourceFallback}
            voidRule={market.voidRule}
            description={market.description}
            resolution={market.resolution}
            settlement={market.settlement}
            status={market.status}
          />
        </>
      ) : (
        <section className="card stackSm">
          <h2>{tr(lang, 'Market not found', 'Η αγορά δεν βρέθηκε')}</h2>
        </section>
      )}
    </AlphaShell>
  );
}
