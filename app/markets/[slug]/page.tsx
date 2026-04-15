import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { MarketQuotePreviewCard } from '@/components/market-quote-preview-card';
import { ProbabilitySplit } from '@/components/probability-split';
import { loadMarketDetail } from '@/lib/alpha-read-model';
import { formatCompact, formatDateTime, formatPercent, formatRelativeHours } from '@/lib/format';
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
  return value.replace(/[-_]/g, ' ');
}

export default async function MarketDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const lang = normalizeLang(query.lang);
  const { market, state, error } = await loadMarketDetail(slug);

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

              <div className="marketSummaryRow">
                <span className="summaryPill">{tr(lang, 'Chance', 'Πιθανότητα')} {formatPercent(state?.yesPrice ?? 0.5)}</span>
                {Number(state?.volumeTotal ?? 0) > 0 ? (
                  <span className="summaryPill">{tr(lang, 'Volume', 'Όγκος')} €{formatCompact(state?.volumeTotal ?? 0)}</span>
                ) : (
                  <span className="summaryPill">{tr(lang, 'New market', 'Νέα αγορά')}</span>
                )}
                <span className="summaryPill">{tr(lang, 'Close', 'Λήξη')} {formatRelativeHours(market.closeTime)}</span>
                <span className="summaryPill">{tr(lang, 'Source', 'Πηγή')} {market.sourcePrimary}</span>
                <span className={statusClass(market.status)}>{market.status}</span>
              </div>

              <section className="marketChartSurface">
                <ProbabilitySplit
                  yesValue={state?.yesPrice ?? 0.5}
                  noValue={state?.noPrice ?? 0.5}
                  yesLabel={market.yesLabel}
                  noLabel={market.noLabel}
                  formatValue={formatPercent}
                />

                <div className="marketTrendLine" aria-hidden="true" />

                <div className="marketMetaFoot">
                  <span>{tr(lang, 'Closes', 'Κλείνει')} {formatDateTime(market.closeTime)}</span>
                  <span>{tr(lang, 'Resolution target', 'Στόχος επίλυσης')} {formatDateTime(market.resolutionTime)}</span>
                </div>
              </section>
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
              />
            </aside>
          </section>

          <section className="marketInfoStack" id="rules-layer">
            <article className="marketInfoSection">
              <h3>{tr(lang, 'Rules', 'Κανόνες')}</h3>
              <p>{market.voidRule}</p>
            </article>

            <article className="marketInfoSection">
              <h3>{tr(lang, 'Sources', 'Πηγές')}</h3>
              <p>{market.sourcePrimary}</p>
              <p>{market.sourceFallback ?? tr(lang, 'No fallback source provided.', 'Δεν υπάρχει εναλλακτική πηγή.')}</p>
            </article>

            {market.resolution ? (
              <article className="marketInfoSection">
                <h3>{tr(lang, 'Resolution', 'Επίλυση')}</h3>
                <p>{tr(lang, 'Outcome', 'Αποτέλεσμα')}: {market.resolution.outcome.toUpperCase()}</p>
                <p>{market.resolution.evidenceSummary}</p>
                <p>{formatDateTime(market.resolution.createdAt)}</p>
              </article>
            ) : null}

            {market.settlement ? (
              <article className="marketInfoSection">
                <h3>{tr(lang, 'Settlement', 'Διακανονισμός')}</h3>
                <p>
                  {tr(lang, 'Payout', 'Πληρωμή')} €{formatCompact(market.settlement.totalPayout)} · {tr(lang, 'Refund', 'Επιστροφή')} €{formatCompact(market.settlement.totalRefund)}
                </p>
              </article>
            ) : null}
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
