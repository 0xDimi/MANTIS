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
  marketStatus: string;
  closeTime: string;
  yesLabel: string;
  noLabel: string;
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

export function MarketQuotePreviewCard(props: MarketQuotePreviewCardProps) {
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [amountEur, setAmountEur] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuotePreviewPayload | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!quote?.expiresAt) {
      return;
    }

    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [quote?.expiresAt]);

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
        </div>
      ) : null}
    </article>
  );
}
