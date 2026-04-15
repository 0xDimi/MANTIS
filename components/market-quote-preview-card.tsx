'use client';

import { useEffect, useMemo, useState } from 'react';
import { tr, type UiLang } from '@/lib/ui-lang';

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
  lang?: UiLang;
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
  if (ms <= 0) return 'expired';

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function formatTime(value: string | null | undefined) {
  if (!value) return '—';

  const parsed = new Date(value);

  if (!Number.isFinite(parsed.getTime())) return '—';

  return parsed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function MarketQuotePreviewCard({ lang = 'en', ...props }: MarketQuotePreviewCardProps) {
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
  const [hasOpenPosition, setHasOpenPosition] = useState(false);
  const [lastTradeSnapshot, setLastTradeSnapshot] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!quote?.expiresAt) return;

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
          if (!cancelled) setStateError(payload.error ?? `state refresh failed (${response.status})`);
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
    if (!quote?.expiresAt) return null;

    const expiresMs = new Date(quote.expiresAt).getTime();
    if (!Number.isFinite(expiresMs)) return 'invalid expiry';

    return formatCountdown(expiresMs - nowMs);
  }, [quote?.expiresAt, nowMs]);

  async function requestQuotePreview() {
    setLoading(true);
    setError(null);

    const parsedAmount = Number(amountEur);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setLoading(false);
      setError(tr(lang, 'Enter a valid amount above 0.', 'Συμπλήρωσε έγκυρο ποσό πάνω από 0.'));
      return;
    }

    try {
      const response = await fetch('/api/quotes/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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
          const yesShares = Number(marketPosition.position.yesShares ?? 0);
          const noShares = Number(marketPosition.position.noShares ?? 0);
          setHasOpenPosition(yesShares > 0 || noShares > 0);

          setPositionSnapshot(
            `YES ${yesShares.toFixed(4)} · NO ${noShares.toFixed(4)} · MV €${Number(marketPosition.position.marketValue ?? 0).toFixed(2)}`
          );
        } else {
          setHasOpenPosition(false);
          setPositionSnapshot(null);
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
      setExecutionMessage(tr(lang, 'Request a fresh quote first.', 'Ζήτησε νέο quote πρώτα.'));
      return;
    }

    setExecuting(true);
    setExecutionMessage(null);

    const parsedAmount = Number(amountEur);

    try {
      const response = await fetch('/api/trades/execute', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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

      setExecutionMessage(tr(lang, 'Trade executed. Portfolio updated.', 'Η συναλλαγή εκτελέστηκε. Το χαρτοφυλάκιο ενημερώθηκε.'));
      await refreshPortfolioSnapshots();

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

  const quoteReady = Boolean(quote?.quote && quoteExpiryText !== 'expired');
  const requoteNeeded = Boolean(quote?.quote && quoteExpiryText === 'expired');
  const failedTrade = Boolean(executionMessage && executionMessage.toLowerCase().includes('failed'));
  const successTrade = Boolean(executionMessage && executionMessage.toLowerCase().includes('executed'));
  const claimAvailable = props.marketStatus === 'settled' && hasOpenPosition;
  const claimed = props.marketStatus === 'settled' && !hasOpenPosition && Boolean(lastTradeSnapshot);

  const stateChips: Array<{ label: string; tone?: 'yes' | 'no' | 'focus' }> = [];

  if (quoteReady) stateChips.push({ label: tr(lang, 'Quote ready', 'Quote έτοιμο'), tone: 'focus' });
  if (loading) stateChips.push({ label: tr(lang, 'Quoting', 'Υπολογισμός quote'), tone: 'focus' });
  if (executing) stateChips.push({ label: action === 'buy' ? tr(lang, 'Buying', 'Αγορά') : tr(lang, 'Selling', 'Πώληση'), tone: 'focus' });
  if (successTrade) stateChips.push({ label: tr(lang, 'Trade success', 'Επιτυχής συναλλαγή'), tone: 'yes' });
  if (requoteNeeded) stateChips.push({ label: tr(lang, 'Requote needed', 'Απαιτείται νέο quote'), tone: 'no' });
  if (failedTrade) stateChips.push({ label: tr(lang, 'Trade failed', 'Αποτυχία συναλλαγής'), tone: 'no' });
  if (claimAvailable) stateChips.push({ label: tr(lang, 'Claim available', 'Διαθέσιμη είσπραξη'), tone: 'yes' });
  if (claimed) stateChips.push({ label: tr(lang, 'Claimed', 'Εισπραγμένο'), tone: 'yes' });
  if (props.marketStatus === 'settled') stateChips.push({ label: tr(lang, 'Settled', 'Settled'), tone: 'yes' });
  if (props.marketStatus === 'void') stateChips.push({ label: 'VOID', tone: 'no' });

  return (
    <article className="stackMd">
      {(props.marketStatus !== 'open' || marketClosed) && (
        <div className="notice noticeWarn">{tr(lang, 'Market is not tradeable right now.', 'Η αγορά δεν είναι διαθέσιμη για συναλλαγή τώρα.')}</div>
      )}

      <div className="stateChips">
        {stateChips.map((chip) => (
          <span
            key={chip.label}
            className={
              chip.tone === 'yes'
                ? 'stateChip stateChipYes'
                : chip.tone === 'no'
                  ? 'stateChip stateChipNo'
                  : chip.tone === 'focus'
                    ? 'stateChip stateChipFocus'
                    : 'stateChip'
            }
          >
            {chip.label}
          </span>
        ))}
      </div>

      <div className="ticketShell stackMd">
        <div className="stackSm">
          <span className="fieldLabel">{tr(lang, 'Action', 'Ενέργεια')}</span>
          <div className="segmentRow">
            <button
              className={action === 'buy' ? 'segmentButton segmentButtonActive' : 'segmentButton'}
              type="button"
              onClick={() => setAction('buy')}
            >
              {tr(lang, 'Buy', 'Αγορά')}
            </button>
            <button
              className={action === 'sell' ? 'segmentButton segmentButtonActive' : 'segmentButton'}
              type="button"
              onClick={() => setAction('sell')}
            >
              {tr(lang, 'Sell', 'Πώληση')}
            </button>
          </div>
        </div>

        <div className="stackSm">
          <span className="fieldLabel">{tr(lang, 'Direction', 'Κατεύθυνση')}</span>
          <div className="segmentRow">
            <button
              className={side === 'yes' ? 'segmentButton buttonYes' : 'segmentButton'}
              type="button"
              onClick={() => setSide('yes')}
            >
              YES ({props.yesLabel})
            </button>
            <button
              className={side === 'no' ? 'segmentButton buttonNo' : 'segmentButton'}
              type="button"
              onClick={() => setSide('no')}
            >
              NO ({props.noLabel})
            </button>
          </div>
        </div>

        <label className="stackXs">
          <span className="fieldLabel">{action === 'buy' ? tr(lang, 'Budget (€ total)', 'Ποσό (€ σύνολο)') : tr(lang, 'Target payout (€ gross)', 'Στόχος πληρωμής (€ μικτό)')}</span>
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

        <button
          className={side === 'yes' ? 'ticketCta ticketCtaYes' : 'ticketCta ticketCtaNo'}
          type="button"
          onClick={requestQuotePreview}
          disabled={loading || props.marketStatus !== 'open' || marketClosed}
        >
          {loading ? tr(lang, 'Requesting quote...', 'Ζητείται quote...') : tr(lang, 'Get quote preview', 'Λήψη προεπισκόπησης quote')}
        </button>
      </div>

      {error ? <div className="notice noticeError">{error}</div> : null}
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
            <div className="metricTileLabel">{tr(lang, 'Last trade', 'Τελευταία συναλλαγή')}</div>
            <div className="metricTileValue metricTileValueSmall">{formatTime(liveState.lastTradeAt)}</div>
          </div>
          <div className="metricTile">
            <div className="metricTileLabel">{tr(lang, 'Status', 'Κατάσταση')}</div>
            <div className="metricTileValue metricTileValueSmall">{props.marketStatus.toUpperCase()}</div>
          </div>
        </div>
      ) : null}

      {quote?.quote ? (
        <div className="stackSm">
          <div className="statusRow statusRowStart">
            <div>
              <div className="splitSectionLabel">{tr(lang, 'Quote summary', 'Σύνοψη quote')}</div>
              <p className="subtle">
                Hash: <code>{quote.quoteHash?.slice(0, 12)}...</code>
              </p>
            </div>
            <span className={quoteExpiryText === 'expired' ? 'badgeNo' : 'badgeNeutral'}>
              {tr(lang, 'Expires in', 'Λήγει σε')} {quoteExpiryText ?? '—'}
            </span>
          </div>

          <div className="metricGridCompact">
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Estimate', 'Εκτίμηση')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quote.quote.amountEur)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Avg price', 'Μέση τιμή')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatPercent(quote.quote.averagePrice)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Fee', 'Χρέωση')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quote.quote.feeAmountEur)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Price impact', 'Επίδραση τιμής')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatPercent(quote.quote.impact)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Shares', 'Μετοχές')}</div>
              <div className="metricTileValue metricTileValueSmall">{quote.quote.shareDelta.toFixed(4)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Max payout', 'Μέγιστη πληρωμή')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quote.quote.toWinEur)}</div>
            </div>
          </div>

          <button
            className={side === 'yes' ? 'ticketCta ticketCtaYes' : 'ticketCta ticketCtaNo'}
            type="button"
            onClick={executeTrade}
            disabled={executing || quoteExpiryText === 'expired'}
          >
            {executing ? tr(lang, 'Executing...', 'Εκτέλεση...') : tr(lang, 'Confirm trade', 'Επιβεβαίωση συναλλαγής')}
          </button>

          {executionMessage ? (
            <div className={executionMessage.toLowerCase().includes('executed') ? 'notice noticeSuccess' : 'notice noticeError'}>
              {executionMessage}
            </div>
          ) : null}
          {walletBalance ? <p className="subtle">{tr(lang, 'Wallet', 'Πορτοφόλι')}: {walletBalance}</p> : null}
          {positionSnapshot ? <p className="subtle">{tr(lang, 'Position', 'Θέση')}: {positionSnapshot}</p> : null}
          {lastTradeSnapshot ? <p className="subtle">{tr(lang, 'Latest trade', 'Τελευταία συναλλαγή')}: {lastTradeSnapshot}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
