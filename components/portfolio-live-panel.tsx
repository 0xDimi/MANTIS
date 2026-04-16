'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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

function fmtMoney(value: number) {
  return `€${value.toFixed(2)}`;
}

function fmtSignedMoney(value: number) {
  if (value > 0) return `+€${value.toFixed(2)}`;
  if (value < 0) return `-€${Math.abs(value).toFixed(2)}`;
  return '€0.00';
}

function fmtPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${Math.round(value * 100)}%`;
}

function fmtTime(value: string) {
  const parsed = new Date(value);

  if (!Number.isFinite(parsed.getTime())) return '—';

  return parsed.toLocaleString('en-GB', {
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

export function PortfolioLivePanel() {
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
    return <section className="card"><p className="subtle">Loading portfolio...</p></section>;
  }

  if (error) {
    return (
      <section className="card stackSm">
        <div className="notice noticeWarn">{error}</div>
        <p className="subtle">If this says auth required, sign in through /profile first.</p>
        <div className="buttonRow">
          <button className="button buttonGhost" type="button" onClick={refresh}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="stackMd portfolioSurface">
      <section className="metricsGrid">
        <article className="card stackSm">
          <p className="eyebrow">Available</p>
          <div className="metricValue">{portfolio?.wallet ? fmtMoney(portfolio.wallet.availableBalance) : '—'}</div>
          <p className="subtle">Wallet live balance ({portfolio?.wallet?.currency ?? 'PAPER_EUR'})</p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">Unrealized PnL</p>
          <div className="metricValue">{fmtSignedMoney(portfolio?.totals?.unrealizedPnl ?? 0)}</div>
          <p className="subtle">Marked from live market_state prices.</p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">Open positions</p>
          <div className="metricValue">{openPositions.length}</div>
          <p className="subtle">Auto-refresh every 10s.</p>
        </article>
      </section>

      <section className="card stackSm">
        <div className="statusRow statusRowStart">
          <div>
            <p className="eyebrow">Positions</p>
            <h3>Open exposure</h3>
          </div>
          <button className="button buttonGhost" type="button" onClick={refresh}>
            Refresh now
          </button>
        </div>

        {openPositions.length === 0 ? (
          <div className="panelBlock stackXs">
            <strong>No open positions yet.</strong>
            <p className="subtle">Build exposure from the Markets board, then this table will track live chance, mark, size, and P/L.</p>
            <Link className="button buttonGhost" href="/markets">
              Open markets
            </Link>
          </div>
        ) : null}

        {openPositions.length > 0 ? (
          <div className="portfolioTableWrap">
            <div className="portfolioTableHead">
              <span>Market</span>
              <span>Chance</span>
              <span>Avg entry</span>
              <span>Mark</span>
              <span>Size</span>
              <span>P/L</span>
              <span>State</span>
            </div>

            {openPositions.map((entry) => {
              const totalShares = entry.position.yesShares + entry.position.noShares;
              const costBasis = entry.position.yesCostBasis + entry.position.noCostBasis;
              const avgEntry = totalShares > 0 ? costBasis / totalShares : null;
              const mark = totalShares > 0 ? entry.position.marketValue / totalShares : null;
              const pnlClass = entry.position.unrealizedPnl >= 0 ? 'portfolioPnlUp' : 'portfolioPnlDown';

              return (
                <div className="portfolioTableRow" key={entry.marketId}>
                  <div className="portfolioMarketCol">
                    <strong>{entry.market?.question ?? entry.marketId}</strong>
                    <span>YES {entry.position.yesShares.toFixed(2)} · NO {entry.position.noShares.toFixed(2)}</span>
                  </div>
                  <span>{fmtPercent(entry.pricing?.yesPrice)}</span>
                  <span>{fmtPercent(avgEntry)}</span>
                  <span>{fmtPercent(mark)}</span>
                  <span>{fmtMoney(entry.position.marketValue)}</span>
                  <span className={pnlClass}>{fmtSignedMoney(entry.position.unrealizedPnl)}</span>
                  <span className={statusClass(entry.market?.status)}>{(entry.market?.status ?? 'open').toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        {settledPositions.length > 0 ? (
          <p className="subtle">
            Settled / resolved positions in history: <strong>{settledPositions.length}</strong>
          </p>
        ) : null}
      </section>

      <section className="card stackSm">
        <p className="eyebrow">Recent trades</p>
        <h3>Execution ledger</h3>

        {!(trades?.trades?.length) ? <p className="subtle">No recent trades.</p> : null}

        {trades?.trades?.length ? (
          <div className="portfolioTableWrap">
            <div className="portfolioTableHead portfolioLedgerHead">
              <span>Time</span>
              <span>Market</span>
              <span>Side</span>
              <span>Action</span>
              <span>Shares</span>
              <span>Avg</span>
              <span>Fee</span>
              <span>Net</span>
            </div>
            {trades.trades.map((trade) => (
              <div className="portfolioTableRow portfolioLedgerRow" key={trade.id}>
                <span>{fmtTime(trade.createdAt)}</span>
                <div className="portfolioMarketCol">
                  <strong>{trade.market?.question ?? 'Unknown market'}</strong>
                  <span>{trade.market?.category ?? 'n/a'}</span>
                </div>
                <span className={trade.side === 'yes' ? 'ticketSurfaceLiveYes' : 'ticketSurfaceLiveNo'}>{trade.side.toUpperCase()}</span>
                <span>{trade.action.toUpperCase()}</span>
                <span>{trade.shareDelta.toFixed(3)}</span>
                <span>{fmtPercent(trade.avgPrice)}</span>
                <span>{fmtMoney(trade.feeAmount)}</span>
                <span className={trade.netAmount >= 0 ? 'portfolioPnlUp' : 'portfolioPnlDown'}>{fmtSignedMoney(trade.netAmount)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
