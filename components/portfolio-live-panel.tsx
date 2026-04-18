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
  error?: string;
};

type TradesPayload = {
  trades?: Array<{
    id: string;
    market: {
      slug: string;
      question: string;
      category: string;
    } | null;
    side: 'yes' | 'no';
    action: 'buy' | 'sell';
    shareDelta: number;
    avgPrice: number;
    grossAmount: number;
    feeAmount: number;
    netAmount: number;
    createdAt: string;
  }>;
  error?: string;
};

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
  const [trades, setTrades] = useState<TradesPayload | null>(null);

  async function refresh() {
    try {
      const [portfolioRes, tradesRes] = await Promise.all([
        fetch('/api/portfolio/summary', { cache: 'no-store' }),
        fetch('/api/trades/history?limit=16', { cache: 'no-store' })
      ]);

      const portfolioPayload = (await portfolioRes.json()) as PortfolioPayload;
      const tradesPayload = (await tradesRes.json()) as TradesPayload;

      if (!portfolioRes.ok) {
        setPortfolio(null);
        setTrades(null);
        setError(portfolioPayload.error ?? `portfolio request failed (${portfolioRes.status})`);
        return;
      }

      if (!tradesRes.ok) {
        setPortfolio(portfolioPayload);
        setTrades(null);
        setError(tradesPayload.error ?? `trades request failed (${tradesRes.status})`);
        return;
      }

      setPortfolio(portfolioPayload);
      setTrades(tradesPayload);
      setError(null);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'portfolio refresh failed');
      setPortfolio(null);
      setTrades(null);
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

  const settledPositions = useMemo(
    () =>
      (portfolio?.positions ?? []).filter((entry) => ['settled', 'resolved', 'void'].includes(entry.market?.status ?? '')),
    [portfolio?.positions]
  );

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
          <p className="eyebrow">{tr(lang, 'Unrealized PnL', 'Μη πραγματοποιημένο PnL')}</p>
          <div className="metricValue">{fmtSignedMoney(portfolio?.totals?.unrealizedPnl ?? 0, lang)}</div>
          <p className="subtle">{tr(lang, 'Marked from live market prices.', 'Αποτίμηση με βάση τις ζωντανές τιμές αγοράς.')}</p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'Open positions', 'Ανοιχτές θέσεις')}</p>
          <div className="metricValue">{openPositions.length}</div>
          <p className="subtle">{tr(lang, 'Auto-refresh every 10s.', 'Αυτόματη ανανέωση κάθε 10δ.')}</p>
        </article>
      </section>

      <section className="card stackSm">
        <div className="statusRow statusRowStart">
          <div>
            <p className="eyebrow">{tr(lang, 'Positions', 'Θέσεις')}</p>
            <h3>{tr(lang, 'Open exposure', 'Ανοιχτή έκθεση')}</h3>
          </div>
          <button className="button buttonGhost" type="button" onClick={refresh}>
            {tr(lang, 'Refresh now', 'Ανανέωση τώρα')}
          </button>
        </div>

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
          <div className="portfolioTableWrap">
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

        {settledPositions.length > 0 ? (
          <p className="subtle">
            {tr(lang, 'Settled or resolved positions in history', 'Θέσεις που έχουν διακανονιστεί ή επιλυθεί στο ιστορικό')}: <strong>{settledPositions.length}</strong>
          </p>
        ) : null}
      </section>

      <section className="card stackSm">
        <p className="eyebrow">{tr(lang, 'Recent trades', 'Πρόσφατες συναλλαγές')}</p>
        <h3>{tr(lang, 'Execution ledger', 'Ιστορικό εκτέλεσης')}</h3>

        {!(trades?.trades?.length) ? <p className="subtle">{tr(lang, 'No recent trades.', 'Δεν υπάρχουν πρόσφατες συναλλαγές.')}</p> : null}

        {trades?.trades?.length ? (
          <div className="portfolioTableWrap">
            <div className="portfolioTableHead portfolioLedgerHead">
              <span>{tr(lang, 'Time', 'Ώρα')}</span>
              <span>{tr(lang, 'Market', 'Αγορά')}</span>
              <span>{tr(lang, 'Side', 'Πλευρά')}</span>
              <span>{tr(lang, 'Action', 'Ενέργεια')}</span>
              <span>{tr(lang, 'Shares', 'Μετοχές')}</span>
              <span>Avg</span>
              <span>{tr(lang, 'Fee', 'Χρέωση')}</span>
              <span>{tr(lang, 'Net', 'Καθαρό')}</span>
            </div>
            {trades.trades.map((trade) => (
              <div className="portfolioTableRow portfolioLedgerRow" key={trade.id}>
                <span>{fmtTime(trade.createdAt, lang)}</span>
                <div className="portfolioMarketCol">
                  <strong>{trade.market?.slug ? localizedQuestionFromSlug(trade.market.slug, trade.market.question, lang) : trade.market?.question ?? tr(lang, 'Unknown market', 'Άγνωστη αγορά')}</strong>
                  <span>{trade.market?.category ? localizedCategory(trade.market.category, lang) : tr(lang, 'n/a', '—')}</span>
                </div>
                <span className={trade.side === 'yes' ? 'ticketSurfaceLiveYes' : 'ticketSurfaceLiveNo'}>{localizedOutcomeLabel(trade.side, trade.side, lang)}</span>
                <span>{trade.action === 'buy' ? tr(lang, 'Buy', 'Αγορά') : tr(lang, 'Sell', 'Πώληση')}</span>
                <span>{trade.shareDelta.toFixed(3)}</span>
                <span>{fmtPercent(trade.avgPrice)}</span>
                <span>{fmtMoney(trade.feeAmount, lang)}</span>
                <span className={trade.netAmount >= 0 ? 'portfolioPnlUp' : 'portfolioPnlDown'}>{fmtSignedMoney(trade.netAmount, lang)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
