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
    case 'resolved':
    case 'settled':
      return 'badgeYes';
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
    <AlphaShell title={tr(lang, 'Market detail', 'Λεπτομέρειες αγοράς')} eyebrow={tr(lang, 'Forecast clarity with explicit trust hooks', 'Καθαρή πρόβλεψη με ρητές δικλίδες εμπιστοσύνης')} lang={lang}>
      <div className="buttonRow">
        <Link className="button buttonGhost" href={lang === 'el' ? '/markets?lang=el' : '/markets'}>
          {tr(lang, 'Back to markets', 'Επιστροφή στις αγορές')}
        </Link>
      </div>

      {error ? <div className="notice noticeError">{tr(lang, 'Contract data unavailable', 'Τα δεδομένα της αγοράς δεν είναι διαθέσιμα')}: {error}</div> : null}

      {market ? (
        <>
          <section className="card stackMd">
            <div className="detailTitleRow">
              <div>
                <p className="eyebrow">{labelize(market.category)}</p>
                <h2>{market.question}</h2>
              </div>
              <span className={statusClass(market.status)}>{market.status}</span>
            </div>

            <div className="metricGridCompact">
              <div className="metricTile">
                <div className="metricTileLabel">{tr(lang, 'Forecast', 'Πρόβλεψη')}</div>
                <div className="metricTileValue">{formatPercent(state?.yesPrice ?? 0.5)}</div>
              </div>
              <div className="metricTile">
                <div className="metricTileLabel">{tr(lang, 'Volume', 'Όγκος')}</div>
                <div className="metricTileValue">€{formatCompact(state?.volumeTotal ?? 0)}</div>
              </div>
              <div className="metricTile">
                <div className="metricTileLabel">{tr(lang, 'Close time', 'Χρόνος λήξης')}</div>
                <div className="metricTileValue metricTileValueSmall">
                  {formatDateTime(market.closeTime)} ({formatRelativeHours(market.closeTime)})
                </div>
              </div>
              <div className="metricTile">
                <div className="metricTileLabel">{tr(lang, 'Source', 'Πηγή')}</div>
                <div className="metricTileValue metricTileValueSmall">{market.sourcePrimary}</div>
              </div>
            </div>

            <div className="buttonRow">
              <a className="button buttonGhost" href="#trade-ticket">
                {tr(lang, 'Trade ticket', 'Εισιτήριο συναλλαγής')}
              </a>
              <a className="button buttonGhost" href="#rules-layer">
                {tr(lang, 'Rules and source', 'Κανόνες και πηγή')}
              </a>
            </div>

            {state ? (
              <ProbabilitySplit
                yesValue={state.yesPrice}
                noValue={state.noPrice}
                yesLabel={market.yesLabel}
                noLabel={market.noLabel}
                formatValue={formatPercent}
              />
            ) : null}
          </section>

          <section className="twoColGrid">
            <article id="trade-ticket" className="card stackMd">
              <div>
                <p className="eyebrow">{tr(lang, 'Decision surface', 'Επιφάνεια απόφασης')}</p>
                <h3>{tr(lang, 'Trade this market', 'Συναλλαγή σε αυτή την αγορά')}</h3>
              </div>

              <MarketQuotePreviewCard
                marketId={market.id}
                marketSlug={market.slug}
                marketStatus={market.status}
                closeTime={market.closeTime}
                yesLabel={market.yesLabel}
                noLabel={market.noLabel}
                lang={lang}
              />
            </article>

            <article id="rules-layer" className="card stackMd">
              <div>
                <p className="eyebrow">{tr(lang, 'Trust layer', 'Επίπεδο εμπιστοσύνης')}</p>
                <h3>{tr(lang, 'Rules and resolution', 'Κανόνες και επίλυση')}</h3>
              </div>

              <div className="panelBlock">
                <div className="splitSectionLabel">{tr(lang, 'Primary source', 'Κύρια πηγή')}</div>
                <p className="panelText">{market.sourcePrimary}</p>
              </div>

              <div className="panelBlock">
                <div className="splitSectionLabel">{tr(lang, 'Fallback source', 'Εναλλακτική πηγή')}</div>
                <p className="panelText">{market.sourceFallback ?? tr(lang, 'No fallback source', 'Δεν υπάρχει εναλλακτική πηγή')}</p>
              </div>

              <div className="panelBlock">
                <div className="splitSectionLabel">{tr(lang, 'Void rule', 'Κανόνας VOID')}</div>
                <p className="panelText">{market.voidRule}</p>
              </div>

              {market.resolution ? (
                <div className="panelBlock">
                  <div className="splitSectionLabel">{tr(lang, 'Resolution', 'Επίλυση')}</div>
                  <p className="panelText">
                    {tr(lang, 'Outcome', 'Αποτέλεσμα')}: {market.resolution.outcome.toUpperCase()} · {formatDateTime(market.resolution.createdAt)}
                  </p>
                  <p className="panelText">{market.resolution.evidenceSummary}</p>
                </div>
              ) : null}

              {market.settlement ? (
                <div className="panelBlock">
                  <div className="splitSectionLabel">{tr(lang, 'Settlement', 'Διακανονισμός')}</div>
                  <p className="panelText">
                    {tr(lang, 'Payout', 'Πληρωμή')} €{formatCompact(market.settlement.totalPayout)} · {tr(lang, 'Refund', 'Επιστροφή')} €{formatCompact(market.settlement.totalRefund)}
                  </p>
                </div>
              ) : null}
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
