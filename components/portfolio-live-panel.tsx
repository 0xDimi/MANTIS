'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { localizedCategory, localizedMarketStatus, localizedOutcomeLabel, localizedQuestionFromSlug } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type PortfolioPayload = {
  wallet?: {
    currency: string;
    startingBalance: number;
    availableBalance: number;
    realizedPnl: number;
    updatedAt: string;
  } | null;
  totals?: {
    costBasis: number;
    marketValue: number;
    unrealizedPnl: number;
  };
  positions?: Array<{
    marketId: string;
    market: {
      slug: string;
      question: string;
      status: string;
      category: string;
    } | null;
    pricing?: {
      yesPrice: number;
      noPrice: number;
    } | null;
    position: {
      yesShares: number;
      noShares: number;
      yesCostBasis: number;
      noCostBasis: number;
      realizedPnl: number;
      unrealizedPnl: number;
      marketValue: number;
    };
  }>;
  history?: Array<{
    marketId: string;
    market: {
      slug: string;
      question: string;
      category: string;
      status: string;
    };
    positionSide: 'yes' | 'no' | 'mixed';
    resolutionOutcome: 'yes' | 'no' | 'void' | null;
    result: 'won' | 'lost' | 'void' | 'flat';
    realizedPnl: number;
    settledAt: string;
    yesSharesClosed: number;
    noSharesClosed: number;
    payoutAmount: number;
    refundAmount: number;
  }>;
  error?: string;
};

type TradeHistoryPayload = {
  count?: number;
  trades?: Array<{
    id: string;
    marketId: string;
    market: {
      slug: string;
      question: string;
      category: string;
      status: string;
    } | null;
    side: 'yes' | 'no';
    action: 'buy' | 'sell';
    shareDelta: number;
    avgPrice: number;
    grossAmount: number;
    feeAmount: number;
    netAmount: number;
    createdAt: string;
    resolution?: {
      outcome: 'yes' | 'no' | 'void';
      createdAt: string;
    } | null;
    settlement?: {
      createdAt: string;
      realizedDelta: number;
      payoutAmount: number;
      refundAmount: number;
    } | null;
  }>;
  error?: string;
};

type PortfolioTab = 'open' | 'history' | 'executions';

function fmtMoney(value: number, lang: UiLang) {
  return new Intl.NumberFormat(lang === 'el' ? 'el-GR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value);
}

function fmtSignedMoney(value: number, lang: UiLang) {
  const abs = fmtMoney(Math.abs(value), lang);
  if (value > 0) return `+${abs}`;
  if (value < 0) return `-${abs}`;
  return fmtMoney(0, lang);
}

function fmtPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${Math.round(value * 100)}%`;
}

function fmtTime(value: string, lang: UiLang) {
  const parsed = new Date(value);

  if (!Number.isFinite(parsed.getTime())) return '—';

  return parsed.toLocaleString(lang === 'el' ? 'el-GR' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function statusClass(status: string | undefined) {
  if (!status) return 'badgeNeutral';
  if (status === 'open') return 'badgeYes';
  if (status === 'paused' || status === 'closed') return 'badgeNeutral';
  return 'badgeNo';
}

function historyResultClass(result: 'won' | 'lost' | 'void' | 'flat') {
  if (result === 'won') return 'badgeYes';
  if (result === 'lost') return 'badgeNo';
  return 'badgeNeutral';
}

function historyResultLabel(result: 'won' | 'lost' | 'void' | 'flat', lang: UiLang) {
  if (result === 'won') return tr(lang, 'Won', 'Κέρδισε');
  if (result === 'lost') return tr(lang, 'Lost', 'Έχασε');
  if (result === 'void') return tr(lang, 'Void', 'Άκυρο');
  return tr(lang, 'Flat', 'Ουδέτερο');
}

function historySideLabel(side: 'yes' | 'no' | 'mixed', lang: UiLang) {
  if (side === 'yes') return localizedOutcomeLabel('yes', 'yes', lang);
  if (side === 'no') return localizedOutcomeLabel('no', 'no', lang);
  return tr(lang, 'Mixed', 'Μικτή');
}

function resolutionLabel(outcome: 'yes' | 'no' | 'void' | null, lang: UiLang) {
  if (outcome === 'yes') return localizedOutcomeLabel('yes', 'yes', lang);
  if (outcome === 'no') return localizedOutcomeLabel('no', 'no', lang);
  if (outcome === 'void') return tr(lang, 'Void', 'Άκυρο');
  return '—';
}

function actionLabel(action: 'buy' | 'sell', lang: UiLang) {
  return action === 'buy' ? tr(lang, 'Buy', 'Αγορά') : tr(lang, 'Sell', 'Πώληση');
}

function marketHref(slug: string, lang: UiLang, options?: { action?: 'buy' | 'sell'; side?: 'yes' | 'no'; sellPreset?: '25' | '50' | 'max' }) {
  const params = new URLSearchParams();

  if (lang === 'el') params.set('lang', 'el');
  if (options?.action) params.set('action', options.action);
  if (options?.side) params.set('side', options.side);
  if (options?.sellPreset) params.set('sellPreset', options.sellPreset);

  const query = params.toString();
  return `/markets/${slug}${query ? `?${query}` : ''}`;
}

export function PortfolioLivePanel({ lang = 'en' }: { lang?: UiLang }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryPayload | null>(null);
  const [activeTab, setActiveTab] = useState<PortfolioTab>('open');

  async function refresh() {
    try {
      const [portfolioRes, tradeHistoryRes] = await Promise.all([
        fetch('/api/portfolio/summary', { cache: 'no-store' }),
        fetch('/api/trades/history?limit=100', { cache: 'no-store' })
      ]);

      const portfolioPayload = (await portfolioRes.json()) as PortfolioPayload;
      const tradeHistoryPayload = (await tradeHistoryRes.json()) as TradeHistoryPayload;

      if (!portfolioRes.ok) {
        setPortfolio(null);
        setTradeHistory(null);
        setError(portfolioPayload.error ?? `portfolio request failed (${portfolioRes.status})`);
        return;
      }

      if (!tradeHistoryRes.ok) {
        setPortfolio(null);
        setTradeHistory(null);
        setError(tradeHistoryPayload.error ?? `trade history request failed (${tradeHistoryRes.status})`);
        return;
      }

      setPortfolio(portfolioPayload);
      setTradeHistory(tradeHistoryPayload);
      setError(null);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'portfolio refresh failed');
      setPortfolio(null);
      setTradeHistory(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!cancelled) {
        await refresh();
      }
    }

    run();
    const timer = setInterval(run, 10_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const openPositions = useMemo(
    () =>
      (portfolio?.positions ?? [])
        .filter((entry) => ['open', 'paused', 'closed'].includes(entry.market?.status ?? 'open'))
        .sort((a, b) => b.position.marketValue - a.position.marketValue),
    [portfolio?.positions]
  );

  const historyRows = useMemo(
    () => (portfolio?.history ?? []).slice().sort((a, b) => new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime()),
    [portfolio?.history]
  );

  const historyRealizedPnl = useMemo(
    () => historyRows.reduce((sum, entry) => sum + entry.realizedPnl, 0),
    [historyRows]
  );

  const executionRows = useMemo(
    () => (tradeHistory?.trades ?? []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tradeHistory?.trades]
  );

  const totalProfitLoss = (portfolio?.wallet?.realizedPnl ?? 0) + (portfolio?.totals?.unrealizedPnl ?? 0);

  if (loading) {
    return <section className="card"><p className="subtle">{tr(lang, 'Loading portfolio...', 'Φόρτωση χαρτοφυλακίου...')}</p></section>;
  }

  if (error) {
    return (
      <section className="card stackSm">
        <div className="notice noticeWarn">{error}</div>
        <p className="subtle">{tr(lang, 'If this says auth required, sign in through /access first.', 'Αν αναφέρει ότι απαιτείται σύνδεση, μπες πρώτα από το /access.')}</p>
        <div className="buttonRow">
          <button className="button buttonGhost" type="button" onClick={refresh}>
            {tr(lang, 'Retry', 'Επανάληψη')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="stackMd portfolioSurface">
      <section className="metricsGrid">
        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'Available', 'Διαθέσιμα')}</p>
          <div className="metricValue">{portfolio?.wallet ? fmtMoney(portfolio.wallet.availableBalance, lang) : '—'}</div>
          <p className="subtle">{tr(lang, 'Wallet live balance', 'Τρέχον υπόλοιπο πορτοφολιού')} ({portfolio?.wallet?.currency ?? 'PAPER_EUR'})</p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'Total Profit/Loss', 'Συνολικό Κέρδος/Ζημία')}</p>
          <div className="metricValue">{fmtSignedMoney(totalProfitLoss, lang)}</div>
          <p className="subtle">{tr(lang, 'All-in P/L across realized and open positions.', 'Συνολικό P/L από πραγματοποιημένες και ανοιχτές θέσεις.')}</p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'Realized PnL', 'Πραγματοποιημένο PnL')}</p>
          <div className="metricValue">{fmtSignedMoney(portfolio?.wallet?.realizedPnl ?? 0, lang)}</div>
          <p className="subtle">{tr(lang, 'Historical P/L already locked in from sells and settled markets.', 'Ιστορικό P/L που έχει ήδη κλειδώσει από πωλήσεις και διακανονισμένες αγορές.')}</p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'Unrealized PnL', 'Μη πραγματοποιημένο PnL')}</p>
          <div className="metricValue">{fmtSignedMoney(portfolio?.totals?.unrealizedPnl ?? 0, lang)}</div>
          <p className="subtle">{tr(lang, 'Floating P/L from open positions only.', 'Κυμαινόμενο P/L μόνο από ανοιχτές θέσεις.')}</p>
        </article>

      </section>

      <section className="card stackSm">
        <div className="statusRow statusRowStart">
          <div>
            <p className="eyebrow">{tr(lang, 'Portfolio view', 'Προβολή χαρτοφυλακίου')}</p>
            <h3>{activeTab === 'open' ? tr(lang, 'Open exposure', 'Ανοιχτή έκθεση') : activeTab === 'history' ? tr(lang, 'History', 'Ιστορικό') : tr(lang, 'Execution ledger', 'Ledger εκτελέσεων')}</h3>
          </div>
          <button className="button buttonGhost" type="button" onClick={refresh}>
            {tr(lang, 'Refresh now', 'Ανανέωση τώρα')}
          </button>
        </div>

        <div className="portfolioTabs" role="tablist" aria-label={tr(lang, 'Portfolio sections', 'Ενότητες χαρτοφυλακίου')}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'open'}
            className={activeTab === 'open' ? 'portfolioTab portfolioTabActive' : 'portfolioTab'}
            onClick={() => setActiveTab('open')}
          >
            {tr(lang, 'Open exposure', 'Ανοιχτή έκθεση')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            className={activeTab === 'history' ? 'portfolioTab portfolioTabActive' : 'portfolioTab'}
            onClick={() => setActiveTab('history')}
          >
            {tr(lang, 'History', 'Ιστορικό')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'executions'}
            className={activeTab === 'executions' ? 'portfolioTab portfolioTabActive' : 'portfolioTab'}
            onClick={() => setActiveTab('executions')}
          >
            {tr(lang, 'Execution ledger', 'Ledger εκτελέσεων')}
          </button>
        </div>

        {activeTab === 'open' ? (
          <>
            {openPositions.length === 0 ? (
              <div className="panelBlock stackXs">
                <strong>{tr(lang, 'No open positions yet.', 'Δεν υπάρχουν ανοιχτές θέσεις ακόμη.')}</strong>
                <p className="subtle">{tr(lang, 'Build exposure from Markets, then this table tracks live chance, mark, size, and P/L.', 'Άνοιξε θέσεις από τις Αγορές και εδώ θα παρακολουθείς πιθανότητα, αποτίμηση, μέγεθος και P/L.')}</p>
                <Link className="button buttonGhost" href={lang === 'el' ? '/markets?lang=el' : '/markets'}>
                  {tr(lang, 'Open markets', 'Άνοιγμα αγορών')}
                </Link>
              </div>
            ) : null}

            {openPositions.length > 0 ? (
              <div className="portfolioTableWrap" role="tabpanel">
                <div className="portfolioTableHead portfolioPositionsHead">
                  <span>{tr(lang, 'Market', 'Αγορά')}</span>
                  <span>{tr(lang, 'Chance', 'Πιθανότητα')}</span>
                  <span>{tr(lang, 'Avg entry', 'Μέση είσοδος')}</span>
                  <span>{tr(lang, 'Mark', 'Αποτίμηση')}</span>
                  <span>{tr(lang, 'Size', 'Μέγεθος')}</span>
                  <span>P/L</span>
                  <span>{tr(lang, 'State', 'Κατάσταση')}</span>
                  <span>{tr(lang, 'Actions', 'Ενέργειες')}</span>
                </div>

                {openPositions.map((entry) => {
                  const totalShares = entry.position.yesShares + entry.position.noShares;
                  const costBasis = entry.position.yesCostBasis + entry.position.noCostBasis;
                  const avgEntry = totalShares > 0 ? costBasis / totalShares : null;
                  const mark = totalShares > 0 ? entry.position.marketValue / totalShares : null;
                  const pnlClass = entry.position.unrealizedPnl >= 0 ? 'portfolioPnlUp' : 'portfolioPnlDown';
                  const marketSlug = entry.market?.slug ?? null;
                  const rowHref = marketSlug ? marketHref(marketSlug, lang) : null;
                  const yesLabel = localizedOutcomeLabel('yes', 'yes', lang);
                  const noLabel = localizedOutcomeLabel('no', 'no', lang);
                  const marketQuestion = marketSlug
                    ? localizedQuestionFromSlug(marketSlug, entry.market?.question ?? entry.marketId, lang)
                    : entry.market?.question ?? entry.marketId;

                  return (
                    <div
                      className={`portfolioTableRow portfolioPositionRow ${rowHref ? 'portfolioTableRowClickable' : ''}`}
                      key={entry.marketId}
                      role={rowHref ? 'button' : undefined}
                      tabIndex={rowHref ? 0 : undefined}
                      onClick={() => {
                        if (rowHref) router.push(rowHref);
                      }}
                      onKeyDown={(event) => {
                        if (!rowHref) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          router.push(rowHref);
                        }
                      }}
                    >
                      <div className="portfolioMarketCol">
                        <strong>{marketQuestion}</strong>
                        <span>{yesLabel} {entry.position.yesShares.toFixed(2)} · {noLabel} {entry.position.noShares.toFixed(2)}</span>
                      </div>
                      <span>{fmtPercent(entry.pricing?.yesPrice)}</span>
                      <span>{fmtPercent(avgEntry)}</span>
                      <span>{fmtPercent(mark)}</span>
                      <span>{fmtMoney(entry.position.marketValue, lang)}</span>
                      <span className={pnlClass}>{fmtSignedMoney(entry.position.unrealizedPnl, lang)}</span>
                      <span className={statusClass(entry.market?.status)}>{localizedMarketStatus(entry.market?.status ?? 'open', lang, 'short')}</span>
                      <div className="portfolioRowActions">
                        {marketSlug && entry.position.yesShares > 0 ? (
                          <button
                            type="button"
                            className="button buttonGhost portfolioRowAction"
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(marketHref(marketSlug, lang, { action: 'sell', side: 'yes', sellPreset: 'max' }));
                            }}
                          >
                            {tr(lang, 'Sell', 'Πώληση')} {yesLabel}
                          </button>
                        ) : null}
                        {marketSlug && entry.position.noShares > 0 ? (
                          <button
                            type="button"
                            className="button buttonGhost portfolioRowAction"
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(marketHref(marketSlug, lang, { action: 'sell', side: 'no', sellPreset: 'max' }));
                            }}
                          >
                            {tr(lang, 'Sell', 'Πώληση')} {noLabel}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}

        {activeTab === 'history' ? (
          <div className="stackSm" role="tabpanel">
            <p className="subtle">
              {tr(lang, 'Settled markets', 'Διακανονισμένες αγορές')}: <strong>{historyRows.length}</strong> · {tr(lang, 'Realized PnL', 'Πραγματοποιημένο PnL')}: <strong className={historyRealizedPnl >= 0 ? 'portfolioPnlUp' : 'portfolioPnlDown'}>{fmtSignedMoney(historyRealizedPnl, lang)}</strong>
            </p>

            {historyRows.length === 0 ? (
              <div className="panelBlock stackXs">
                <strong>{tr(lang, 'No settled history yet.', 'Δεν υπάρχει ακόμη διακανονισμένο ιστορικό.')}</strong>
                <p className="subtle">{tr(lang, 'Resolved markets you traded will appear here with win/loss status and realized PnL.', 'Οι επιλυμένες αγορές που έχεις παίξει θα εμφανίζονται εδώ με win/loss status και realized PnL.')}</p>
              </div>
            ) : null}

            {historyRows.length > 0 ? (
              <div className="portfolioTableWrap">
                <div className="portfolioTableHead portfolioHistoryHead">
                  <span>{tr(lang, 'Market', 'Αγορά')}</span>
                  <span>{tr(lang, 'Position', 'Θέση')}</span>
                  <span>{tr(lang, 'Outcome', 'Αποτέλεσμα')}</span>
                  <span>{tr(lang, 'Result', 'Έκβαση')}</span>
                  <span>{tr(lang, 'Realized P/L', 'Πραγματοποιημένο P/L')}</span>
                  <span>{tr(lang, 'Settled', 'Διακανονισμός')}</span>
                </div>

                {historyRows.map((entry) => {
                  const rowHref = entry.market.slug ? marketHref(entry.market.slug, lang) : null;
                  const marketQuestion = entry.market.slug
                    ? localizedQuestionFromSlug(entry.market.slug, entry.market.question, lang)
                    : entry.market.question;
                  const pnlClass = entry.realizedPnl >= 0 ? 'portfolioPnlUp' : 'portfolioPnlDown';
                  const sideLabel = historySideLabel(entry.positionSide, lang);
                  const exposureDetail = entry.positionSide === 'mixed'
                    ? `${localizedOutcomeLabel('yes', 'yes', lang)} ${entry.yesSharesClosed.toFixed(2)} · ${localizedOutcomeLabel('no', 'no', lang)} ${entry.noSharesClosed.toFixed(2)}`
                    : `${sideLabel} · ${Math.max(entry.yesSharesClosed, entry.noSharesClosed).toFixed(2)} ${tr(lang, 'shares', 'shares')}`;

                  return (
                    <div
                      className={`portfolioTableRow portfolioHistoryRow ${rowHref ? 'portfolioTableRowClickable' : ''}`}
                      key={entry.marketId}
                      role={rowHref ? 'button' : undefined}
                      tabIndex={rowHref ? 0 : undefined}
                      onClick={() => {
                        if (rowHref) router.push(rowHref);
                      }}
                      onKeyDown={(event) => {
                        if (!rowHref) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          router.push(rowHref);
                        }
                      }}
                    >
                      <div className="portfolioMarketCol">
                        <strong>{marketQuestion}</strong>
                        <span>{localizedCategory(entry.market.category, lang)}</span>
                      </div>
                      <div className="portfolioMarketCol">
                        <strong>{sideLabel}</strong>
                        <span>{exposureDetail}</span>
                      </div>
                      <span>{resolutionLabel(entry.resolutionOutcome, lang)}</span>
                      <span className={historyResultClass(entry.result)}>{historyResultLabel(entry.result, lang)}</span>
                      <span className={pnlClass}>{fmtSignedMoney(entry.realizedPnl, lang)}</span>
                      <span>{fmtTime(entry.settledAt, lang)}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'executions' ? (
          <div className="stackSm" role="tabpanel">
            <p className="subtle">
              {tr(lang, 'Executions', 'Εκτελέσεις')}: <strong>{executionRows.length}</strong> · {tr(lang, 'Closed-market result now shows in the ledger.', 'Το αποτέλεσμα των κλεισμένων αγορών φαίνεται πλέον στο ledger.')}
            </p>

            {executionRows.length === 0 ? (
              <div className="panelBlock stackXs">
                <strong>{tr(lang, 'No executions yet.', 'Δεν υπάρχουν ακόμη εκτελέσεις.')}</strong>
                <p className="subtle">{tr(lang, 'Every buy and sell will appear here with price, size, fees, and final market outcome once the market closes.', 'Κάθε αγορά και πώληση θα εμφανίζεται εδώ με τιμή, μέγεθος, χρεώσεις και το τελικό αποτέλεσμα όταν κλείσει η αγορά.')}</p>
              </div>
            ) : null}

            {executionRows.length > 0 ? (
              <div className="portfolioTableWrap">
                <div className="portfolioTableHead portfolioHistoryHead">
                  <span>{tr(lang, 'Market', 'Αγορά')}</span>
                  <span>{tr(lang, 'Execution', 'Εκτέλεση')}</span>
                  <span>{tr(lang, 'Price', 'Τιμή')}</span>
                  <span>{tr(lang, 'Cash flow', 'Ταμειακή ροή')}</span>
                  <span>{tr(lang, 'Closed result', 'Τελικό αποτέλεσμα')}</span>
                  <span>{tr(lang, 'Time', 'Χρόνος')}</span>
                </div>

                {executionRows.map((entry) => {
                  const market = entry.market;
                  const marketSlug = market?.slug ?? null;
                  const rowHref = marketSlug ? marketHref(marketSlug, lang) : null;
                  const marketQuestion = marketSlug
                    ? localizedQuestionFromSlug(marketSlug, market?.question ?? entry.marketId, lang)
                    : market?.question ?? entry.marketId;
                  const cashFlow = entry.action === 'buy' ? -Math.abs(entry.netAmount) : Math.abs(entry.netAmount);
                  const cashFlowClass = cashFlow >= 0 ? 'portfolioPnlUp' : 'portfolioPnlDown';
                  const settlementDeltaClass = (entry.settlement?.realizedDelta ?? 0) >= 0 ? 'portfolioPnlUp' : 'portfolioPnlDown';

                  return (
                    <div
                      className={`portfolioTableRow portfolioHistoryRow ${rowHref ? 'portfolioTableRowClickable' : ''}`}
                      key={entry.id}
                      role={rowHref ? 'button' : undefined}
                      tabIndex={rowHref ? 0 : undefined}
                      onClick={() => {
                        if (rowHref) router.push(rowHref);
                      }}
                      onKeyDown={(event) => {
                        if (!rowHref) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          router.push(rowHref);
                        }
                      }}
                    >
                      <div className="portfolioMarketCol">
                        <strong>{marketQuestion}</strong>
                        <span>{market ? localizedCategory(market.category, lang) : '—'}</span>
                      </div>
                      <div className="portfolioMarketCol">
                        <strong>{actionLabel(entry.action, lang)} {historySideLabel(entry.side, lang)}</strong>
                        <span>{entry.shareDelta.toFixed(4)} {tr(lang, 'shares', 'shares')} · {fmtMoney(entry.feeAmount, lang)} {tr(lang, 'fee', 'χρέωση')}</span>
                      </div>
                      <span>{fmtPercent(entry.avgPrice)}</span>
                      <span className={cashFlowClass}>{fmtSignedMoney(cashFlow, lang)}</span>
                      <div className="portfolioMarketCol">
                        <strong>{resolutionLabel(entry.resolution?.outcome ?? null, lang)}</strong>
                        <span>
                          {entry.settlement
                            ? <span className={settlementDeltaClass}>{fmtSignedMoney(entry.settlement.realizedDelta, lang)}</span>
                            : localizedMarketStatus(market?.status ?? 'open', lang, 'short')}
                        </span>
                      </div>
                      <span>{fmtTime(entry.createdAt, lang)}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </section>
  );
}
