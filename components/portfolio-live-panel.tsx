'use client';

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
  if (value > 0) {
    return `+€${value.toFixed(2)}`;
  }

  if (value < 0) {
    return `-€${Math.abs(value).toFixed(2)}`;
  }

  return '€0.00';
}

function fmtTime(value: string) {
  const parsed = new Date(value);

  if (!Number.isFinite(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
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
        fetch('/api/trades/history?limit=10', { cache: 'no-store' })
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

  const positionCount = useMemo(() => portfolio?.positions?.length ?? 0, [portfolio?.positions]);

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
    <section className="stackMd">
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
          <div className="metricValue">{positionCount}</div>
          <p className="subtle">Auto-refresh every 10s.</p>
        </article>
      </section>

      <section className="twoColGrid">
        <article className="card stackSm">
          <div className="statusRow statusRowStart">
            <div>
              <p className="eyebrow">Positions</p>
              <h3>Live exposure</h3>
            </div>
            <button className="button buttonGhost" type="button" onClick={refresh}>
              Refresh now
            </button>
          </div>

          {positionCount === 0 ? <p className="subtle">No open positions yet.</p> : null}

          {(portfolio?.positions ?? []).map((entry) => (
            <div className="panelBlock" key={entry.marketId}>
              <div className="splitSectionLabel">{entry.market?.question ?? entry.marketId}</div>
              <p className="subtle">
                YES {entry.position.yesShares.toFixed(4)} · NO {entry.position.noShares.toFixed(4)} · Value {fmtMoney(entry.position.marketValue)} · Unrealized {fmtSignedMoney(entry.position.unrealizedPnl)}
              </p>
            </div>
          ))}
        </article>

        <article className="card stackSm">
          <p className="eyebrow">Recent trades</p>
          <h3>Execution + ledger reflection</h3>

          {!(trades?.trades?.length) ? <p className="subtle">No recent trades.</p> : null}

          {(trades?.trades ?? []).map((trade) => (
            <div className="panelBlock" key={trade.id}>
              <div className="splitSectionLabel">{trade.action.toUpperCase()} {trade.side.toUpperCase()} · {fmtMoney(trade.grossAmount)}</div>
              <p className="subtle">
                {trade.market?.question ?? 'Unknown market'} · shares {trade.shareDelta.toFixed(4)} · fee {fmtMoney(trade.feeAmount)} · net {fmtSignedMoney(trade.netAmount)} · {fmtTime(trade.createdAt)}
              </p>
            </div>
          ))}
        </article>
      </section>
    </section>
  );
}
