'use client';

import { useEffect, useMemo, useState } from 'react';

type QuotePreviewPayload = {
  quote?: {
    amountEur: number;
    feeAmountEur: number;
    totalAmountEur: number;
    shareDelta: number;
    averagePrice: number;
    postYesPrice: number;
    postNoPrice: number;
    impact: number;
    toWinEur: number;
  };
  quoteHash?: string;
  issuedAt?: string;
  expiresAt?: string;
  error?: string;
};

type MarketQuotePreviewCardProps = {
  marketId: string;
  marketSlug: string;
  marketStatus: string;
  closeTime: string;
  yesLabel: string;
  noLabel: string;
};

type PortfolioSummaryPayload = {
  wallet?: {
    availableBalance: number;
    currency: string;
  } | null;
  positions?: Array<{
    marketId: string;
    position: {
      yesShares: number;
      noShares: number;
      marketValue: number;
      unrealizedPnl: number;
    };
  }>;
  error?: string;
};

type TradeHistoryPayload = {
  trades?: Array<{
    id: string;
    marketId: string;
    side: 'yes' | 'no';
    action: 'buy' | 'sell';
    grossAmount: number;
    createdAt: string;
  }>;
  error?: string;
};

type MarketStatePayload = {
  state?: {
    yes_price: number;
    no_price: number;
    last_trade_at: string | null;
  } | null;
  error?: string;
};

function formatMoney(value: number) {
  return `€${value.toFixed(2)}`;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatCountdown(ms: number) {
  if (ms <= 0) {
    return 'expired';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);

  if (!Number.isFinite(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function MarketQuotePreviewCard(props: MarketQuotePreviewCardProps) {
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [amountEur, setAmountEur] = useState('10');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuotePreviewPayload | null>(null);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [stateError, setStateError] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<{ yesPrice: number; noPrice: number; lastTradeAt: string | null } | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [positionSnapshot, setPositionSnapshot] = useState<string | null>(null);
  const [lastTradeSnapshot, setLastTradeSnapshot] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!quote?.expiresAt) {
      return;
    }

    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [quote?.expiresAt]);

  useEffect(() => {
    let cancelled = false;

    async function refreshLiveState() {
      try {
        const response = await fetch(`/api/markets/${props.marketSlug}`, { cache: 'no-store' });
        const payload = (await response.json()) as MarketStatePayload;

        if (!response.ok) {
          if (!cancelled) {
            setStateError(payload.error ?? `state refresh failed (${response.status})`);
          }

          return;
        }

        if (!cancelled) {
          setStateError(null);
          setLiveState(
            payload.state
              ? {
                  yesPrice: Number(payload.state.yes_price ?? 0),
                  noPrice: Number(payload.state.no_price ?? 0),
                  lastTradeAt: payload.state.last_trade_at ?? null
                }
              : null
          );
        }
      } catch (refreshError) {
        if (!cancelled) {
          setStateError(refreshError instanceof Error ? refreshError.message : 'state refresh failed');
        }
      }
    }

    refreshLiveState();
    const timer = setInterval(refreshLiveState, 10_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [props.marketSlug]);

  const marketClosed = useMemo(() => {
    const closeMs = new Date(props.closeTime).getTime();
    return Number.isFinite(closeMs) ? closeMs <= nowMs : false;
  }, [props.closeTime, nowMs]);

  const quoteExpiryText = useMemo(() => {
    if (!quote?.expiresAt) {
      return null;
    }

    const expiresMs = new Date(quote.expiresAt).getTime();

    if (!Number.isFinite(expiresMs)) {
      return 'invalid expiry';
    }

    return formatCountdown(expiresMs - nowMs);
  }, [quote?.expiresAt, nowMs]);

  async function requestQuotePreview() {
    setLoading(true);
    setError(null);

    const parsedAmount = Number(amountEur);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setLoading(false);
      setError('Enter a valid amount above 0.');
      return;
    }

    try {
      const response = await fetch('/api/quotes/preview', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          marketId: props.marketId,
          side,
          action,
          amountEur: parsedAmount
        })
      });

      const payload = (await response.json()) as QuotePreviewPayload;

      if (!response.ok) {
        setQuote(null);
        setError(payload.error ?? `Quote preview failed (${response.status})`);
        return;
      }

      setQuote(payload);
    } catch (requestError) {
      setQuote(null);
      setError(requestError instanceof Error ? requestError.message : 'Quote preview request failed');
    } finally {
      setLoading(false);
    }
  }

  async function refreshPortfolioSnapshots() {
    try {
      const [portfolioRes, historyRes] = await Promise.all([
        fetch('/api/portfolio/summary', { cache: 'no-store' }),
        fetch('/api/trades/history?limit=5', { cache: 'no-store' })
      ]);

      const portfolio = (await portfolioRes.json()) as PortfolioSummaryPayload;
      const history = (await historyRes.json()) as TradeHistoryPayload;

      if (portfolioRes.ok && portfolio.wallet) {
        setWalletBalance(`${portfolio.wallet.availableBalance.toFixed(2)} ${portfolio.wallet.currency}`);
      }

      if (portfolioRes.ok && Array.isArray(portfolio.positions)) {
        const marketPosition = portfolio.positions.find((item) => item.marketId === props.marketId);

        if (marketPosition) {
          setPositionSnapshot(
            `YES ${marketPosition.position.yesShares.toFixed(4)} · NO ${marketPosition.position.noShares.toFixed(4)} · MV €${marketPosition.position.marketValue.toFixed(2)}`
          );
        }
      }

      if (historyRes.ok && Array.isArray(history.trades)) {
        const lastMarketTrade = history.trades.find((trade) => trade.marketId === props.marketId);

        if (lastMarketTrade) {
          setLastTradeSnapshot(
            `${lastMarketTrade.action.toUpperCase()} ${lastMarketTrade.side.toUpperCase()} €${lastMarketTrade.grossAmount.toFixed(2)} @ ${formatTime(lastMarketTrade.createdAt)}`
          );
        }
      }
    } catch {
      // non-fatal snapshot helper
    }
  }

  async function executeTrade() {
    if (!quote?.quoteHash || !quote.expiresAt) {
      setExecutionMessage('Request a fresh quote first.');
      return;
    }

    setExecuting(true);
    setExecutionMessage(null);

    const parsedAmount = Number(amountEur);

    try {
      const response = await fetch('/api/trades/execute', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          marketId: props.marketId,
          side,
          action,
          amountEur: parsedAmount,
          quoteHash: quote.quoteHash,
          quoteExpiresAt: quote.expiresAt
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setExecutionMessage(payload.error ?? `Execution failed (${response.status})`);
        return;
      }

      setExecutionMessage('Trade executed. Portfolio and state snapshots updated.');
      await Promise.all([refreshPortfolioSnapshots(), Promise.resolve()]);
      const stateRes = await fetch(`/api/markets/${props.marketSlug}`, { cache: 'no-store' });
      const statePayload = (await stateRes.json()) as MarketStatePayload;

      if (stateRes.ok && statePayload.state) {
        setLiveState({
          yesPrice: Number(statePayload.state.yes_price ?? 0),
          noPrice: Number(statePayload.state.no_price ?? 0),
          lastTradeAt: statePayload.state.last_trade_at ?? null
        });
      }
    } catch (executeError) {
      setExecutionMessage(executeError instanceof Error ? executeError.message : 'Execution failed');
    } finally {
      setExecuting(false);
    }
  }

  return (
    <article className="card stackMd">
      <div>
        <p className="eyebrow">Week 3 quote preview</p>
        <h3>Rebuilt preview + expiry interaction</h3>
        <p className="subtle">This interaction hits <code>POST /api/quotes/preview</code> directly on the rebuilt route.</p>
      </div>

      {props.marketStatus !== 'open' || marketClosed ? (
        <div className="notice noticeWarn">Market is not tradeable right now, quote preview is disabled.</div>
      ) : null}

      <div className="routeGrid">
        <label className="stackXs">
          <span className="fieldLabel">Side</span>
          <select className="select" value={side} onChange={(event) => setSide(event.target.value as 'yes' | 'no')}>
            <option value="yes">YES ({props.yesLabel})</option>
            <option value="no">NO ({props.noLabel})</option>
          </select>
        </label>

        <label className="stackXs">
          <span className="fieldLabel">Action</span>
          <select className="select" value={action} onChange={(event) => setAction(event.target.value as 'buy' | 'sell')}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>
      </div>

      <label className="stackXs">
        <span className="fieldLabel">{action === 'buy' ? 'Budget (€ total)' : 'Target payout (€ gross)'}</span>
        <input
          className="input"
          type="number"
          min="1"
          step="1"
          value={amountEur}
          onChange={(event) => setAmountEur(event.target.value)}
          disabled={loading || props.marketStatus !== 'open' || marketClosed}
        />
      </label>

      <div className="buttonRow">
        <button
          className="button buttonPrimary"
          type="button"
          onClick={requestQuotePreview}
          disabled={loading || props.marketStatus !== 'open' || marketClosed}
        >
          {loading ? 'Requesting quote...' : 'Get quote preview'}
        </button>
      </div>

      {error ? <div className="notice noticeError">{error}</div> : null}

      <div className="card stackSm">
        <div className="splitSectionLabel">Live state pulse (10s)</div>
        {stateError ? <div className="notice noticeWarn">{stateError}</div> : null}
        {liveState ? (
          <div className="metricGridCompact">
            <div className="metricTile">
              <div className="metricTileLabel">YES</div>
              <div className="metricTileValue metricTileValueSmall">{formatPercent(liveState.yesPrice)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">NO</div>
              <div className="metricTileValue metricTileValueSmall">{formatPercent(liveState.noPrice)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">Last trade</div>
              <div className="metricTileValue metricTileValueSmall">{formatTime(liveState.lastTradeAt)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">Updated</div>
              <div className="metricTileValue metricTileValueSmall">{formatTime(new Date().toISOString())}</div>
            </div>
          </div>
        ) : (
          <p className="subtle">Waiting for market_state.</p>
        )}
      </div>

      {quote?.quote ? (
        <div className="stackSm">
          <div className="statusRow statusRowStart">
            <div>
              <div className="splitSectionLabel">Quote summary</div>
              <p className="subtle">
                Hash: <code>{quote.quoteHash?.slice(0, 12)}...</code>
              </p>
            </div>
            <span className={quoteExpiryText === 'expired' ? 'badgeNo' : 'badgeNeutral'}>
              Expires in {quoteExpiryText ?? '—'}
            </span>
          </div>

          <div className="metricGridCompact">
            <div className="metricTile">
              <div className="metricTileLabel">Gross amount</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quote.quote.amountEur)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">Fee</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quote.quote.feeAmountEur)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">Total</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quote.quote.totalAmountEur)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">Shares delta</div>
              <div className="metricTileValue metricTileValueSmall">{quote.quote.shareDelta.toFixed(4)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">Average price</div>
              <div className="metricTileValue metricTileValueSmall">{formatPercent(quote.quote.averagePrice)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">Price impact</div>
              <div className="metricTileValue metricTileValueSmall">{formatPercent(quote.quote.impact)}</div>
            </div>
          </div>

          <div className="notice noticeSuccess">
            Post-trade midpoint: YES {formatPercent(quote.quote.postYesPrice)} · NO {formatPercent(quote.quote.postNoPrice)}
          </div>

          <div className="buttonRow">
            <button className="button buttonPrimary" type="button" onClick={executeTrade} disabled={executing || quoteExpiryText === 'expired'}>
              {executing ? 'Executing...' : 'Execute trade'}
            </button>
          </div>

          {executionMessage ? <div className="notice noticeSuccess">{executionMessage}</div> : null}
          {walletBalance ? <p className="subtle">Wallet: {walletBalance}</p> : null}
          {positionSnapshot ? <p className="subtle">Position: {positionSnapshot}</p> : null}
          {lastTradeSnapshot ? <p className="subtle">Latest trade: {lastTradeSnapshot}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
