import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { MarketTrendPanel } from '@/components/market-trend-panel';
import { MarketQuotePreviewCard } from '@/components/market-quote-preview-card';
import { ProbabilitySplit } from '@/components/probability-split';
import { loadMarketDetail, loadMarketsBoard } from '@/lib/alpha-read-model';
import { formatCompact, formatDateTime, formatPercent, formatRelativeClose } from '@/lib/format';
import { normalizeLang, tr } from '@/lib/ui-lang';

function statusClass(status: string) {
  switch (status) {
    case 'open':
      return 'badgeYes';
    case 'resolved':
    case 'settled':
      return 'badgeNeutral';
    case 'paused':
    case 'closed':
    case 'void':
      return 'badgeNo';
    default:
      return 'badgeNeutral';
  }
}

function labelize(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1));
}

function marketStatusCopy(status: string, lang: 'en' | 'el') {
  switch (status) {
    case 'open':
      return tr(lang, 'Open for trading', 'Ανοικτή για συναλλαγή');
    case 'draft':
      return tr(lang, 'Preparing market', 'Προετοιμασία αγοράς');
    case 'paused':
      return tr(lang, 'Temporarily paused', 'Προσωρινά σε παύση');
    case 'closed':
      return tr(lang, 'Trading closed', 'Η διαπραγμάτευση έκλεισε');
    case 'resolved':
      return tr(lang, 'Resolved', 'Επιλυμένη');
    case 'settled':
      return tr(lang, 'Settled', 'Διακανονισμένη');
    case 'void':
      return tr(lang, 'Voided', 'Ακυρωμένη');
    default:
      return labelize(status);
  }
}

export default async function MarketDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string; side?: string; action?: string; amount?: string; sellPreset?: string }>;
}) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const lang = normalizeLang(query.lang);
  const [{ market, state, error }, board] = await Promise.all([
    loadMarketDetail(slug),
    loadMarketsBoard({ scope: 'all' })
  ]);
  const relatedMarkets = market
    ? (board.markets ?? [])
        .filter((item) => item.slug !== market.slug && item.category === market.category && item.status === 'open')
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
              <p className="eyebrow">{labelize(market.category)}</p>
              <h1 className="marketTitle">{market.question}</h1>
              {market.description ? <p className="marketContextLine">{market.description}</p> : null}

              <div className="marketSignalBand">
                <div className="marketSignalPrimary">
                  <span>{tr(lang, 'Live chance', 'Ζωντανή πιθανότητα')}</span>
                  <strong>{formatPercent(state?.yesPrice ?? 0.5)}</strong>
                  <em>YES</em>
                </div>
                <div className="marketSignalList">
                  <div className="marketSignalRow">
                    <span>{tr(lang, 'Trading closes', 'Λήξη διαπραγμάτευσης')}</span>
                    <strong>{formatDateTime(market.closeTime)} ({formatRelativeClose(market.closeTime, { calendarAfterDays: 999 })})</strong>
                  </div>
                  <div className="marketSignalRow">
                    <span>{tr(lang, 'Resolution target', 'Στόχος επίλυσης')}</span>
                    <strong>{market.resolutionTime ? formatDateTime(market.resolutionTime) : '—'}</strong>
                  </div>
                  <div className="marketSignalRow">
                    <span>{tr(lang, 'Primary source', 'Κύρια πηγή')}</span>
                    <strong>{market.sourcePrimary}</strong>
                  </div>
                  <div className="marketSignalRow">
                    <span>{tr(lang, 'Market status', 'Κατάσταση αγοράς')}</span>
                    <strong className={statusClass(market.status)}>{marketStatusCopy(market.status, lang)}</strong>
                  </div>
                </div>
              </div>

              <div className="marketActionStrip">
                <span>{tr(lang, 'Review the trend, then execute from the ticket.', 'Δες την τάση και εκτέλεσε από το ticket.')}</span>
                <Link className="button buttonGhost" href="#trade-ticket">
                  {tr(lang, 'Open trade ticket', 'Άνοιγμα trade ticket')}
                </Link>
              </div>

              <section className="marketChartSurface">
                <ProbabilitySplit
                  yesValue={state?.yesPrice ?? 0.5}
                  noValue={state?.noPrice ?? 0.5}
                  yesLabel={market.yesLabel}
                  noLabel={market.noLabel}
                  formatValue={formatPercent}
                />

                <MarketTrendPanel
                  slug={market.slug}
                  yesPrice={state?.yesPrice ?? 0.5}
                  noPrice={state?.noPrice ?? 0.5}
                  volumeTotal={state?.volumeTotal ?? 0}
                  liquidity={market.liquidity}
                  participants={state?.participantsCount ?? 0}
                  lang={lang}
                />

                <div className="marketMetaFoot">
                  <span>{tr(lang, 'Closes', 'Κλείνει')} {formatDateTime(market.closeTime)}</span>
                  <span>{tr(lang, 'Resolution target', 'Στόχος επίλυσης')} {market.resolutionTime ? formatDateTime(market.resolutionTime) : '—'}</span>
                </div>
              </section>

              {relatedMarkets.length > 0 ? (
                <section className="relatedMarketsRail" aria-label={tr(lang, 'Related markets', 'Σχετικές αγορές')}>
                  <p className="marketTrendLabel">{tr(lang, 'Related markets', 'Σχετικές αγορές')}</p>
                  <div className="relatedMarketsList">
                    {relatedMarkets.map((item) => (
                      <Link key={item.id} className="relatedMarketPill" href={`/markets/${item.slug}${lang === 'el' ? '?lang=el' : ''}`}>
                        <span>{item.question}</span>
                        <div className="relatedMarketMeta">
                          <strong>{formatPercent(item.state?.yesPrice ?? 0.5)}</strong>
                          <em>{tr(lang, 'Closes', 'Κλείνει')} {formatRelativeClose(item.closeTime)}</em>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </article>

            <aside className="card marketTicketCard" id="trade-ticket">
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

          <section className="marketInfoStack" id="rules-layer">
            <article className="marketInfoSection">
              <h3>{tr(lang, 'Resolution framework', 'Πλαίσιο επίλυσης')}</h3>
              <p>{tr(lang, 'Primary source', 'Κύρια πηγή')}: {market.sourcePrimary}</p>
              {market.sourceFallback ? <p>{tr(lang, 'Fallback source', 'Εναλλακτική πηγή')}: {market.sourceFallback}</p> : null}
              <p>{tr(lang, 'Trading closes', 'Λήξη διαπραγμάτευσης')}: {formatDateTime(market.closeTime)}</p>
              <p>{tr(lang, 'Resolution target', 'Στόχος επίλυσης')}: {market.resolutionTime ? formatDateTime(market.resolutionTime) : '—'}</p>
            </article>

            <article className="marketInfoSection">
              <h3>{tr(lang, 'Rules and void conditions', 'Κανόνες και όροι ακύρωσης')}</h3>
              <p>{market.voidRule}</p>
            </article>

            <article className="marketInfoSection">
              <h3>{tr(lang, 'Why this market matters', 'Γιατί έχει σημασία αυτή η αγορά')}</h3>
              <p>{market.description ?? tr(lang, 'This market tracks a live public outcome with measurable data updates until close.', 'Αυτή η αγορά παρακολουθεί ένα δημόσιο αποτέλεσμα με μετρήσιμες ενημερώσεις μέχρι τη λήξη.')}</p>
            </article>

            {market.resolution ? (
              <article className="marketInfoSection">
                <h3>{tr(lang, 'Resolution record', 'Αρχείο επίλυσης')}</h3>
                <p>{tr(lang, 'Outcome', 'Αποτέλεσμα')}: {market.resolution.outcome.toUpperCase()}</p>
                <p>{market.resolution.evidenceSummary}</p>
                <p>{formatDateTime(market.resolution.createdAt)}</p>
              </article>
            ) : null}

            {market.settlement ? (
              <article className="marketInfoSection">
                <h3>{tr(lang, 'Settlement record', 'Αρχείο διακανονισμού')}</h3>
                <p>
                  {tr(lang, 'Payout', 'Πληρωμή')} €{formatCompact(market.settlement.totalPayout)} · {tr(lang, 'Refund', 'Επιστροφή')} €{formatCompact(market.settlement.totalRefund)}
                </p>
              </article>
            ) : null}

            <article className="marketInfoSection">
              <h3>{tr(lang, 'Source reference', 'Αναφορά πηγών')}</h3>
              <p>{market.sourcePrimary}</p>
              <p>{market.sourceFallback ?? tr(lang, 'No fallback source provided.', 'Δεν υπάρχει εναλλακτική πηγή.')}</p>
            </article>
          </section>
        </>
      ) : (
        <section className="card stackSm">
          <h2>{tr(lang, 'Market not found', 'Η αγορά δεν βρέθηκε')}</h2>
        </section>
      )}
    </AlphaShell>
  );
}
