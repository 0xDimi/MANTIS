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

function normalizeOutcomeLabel(label: string | undefined, fallback: 'yes' | 'no') {
  const baseline = fallback === 'yes' ? 'Yes' : 'No';
  const value = (label ?? '').trim();

  if (!value) return baseline;
  if (value.toLowerCase() === fallback) return baseline;

  return value;
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

  const closeCountdown = useMemo(() => {
    const closeMs = new Date(props.closeTime).getTime();
    if (!Number.isFinite(closeMs)) return '—';
    return closeMs <= nowMs ? tr(lang, 'Closed', 'Κλειστή') : formatCountdown(closeMs - nowMs);
  }, [props.closeTime, nowMs, lang]);

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
  const liveYes = liveState?.yesPrice ?? 0.5;
  const liveNo = liveState?.noPrice ?? 0.5;
  const yesCents = Math.round(liveYes * 100);
  const noCents = Math.round(liveNo * 100);
  const yesDisplay = normalizeOutcomeLabel(props.yesLabel, 'yes');
  const noDisplay = normalizeOutcomeLabel(props.noLabel, 'no');
  const quoteExposure = quote?.quote ? quote.quote.shareDelta * quote.quote.averagePrice : 0;
  const quoteMaxLoss = quote?.quote ? Math.max(quote.quote.totalAmountEur, quote.quote.amountEur) : 0;
  const walletNumber = walletBalance ? Number(walletBalance.split(' ')[0]) : null;
  const mainCtaLabel = `${action === 'buy' ? tr(lang, 'Buy', 'Αγορά') : tr(lang, 'Sell', 'Πώληση')} ${side === 'yes' ? yesDisplay : noDisplay}`;

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
    <article className="stackMd ticketSurfaceStack">
      <div className="ticketSurfaceHead">
        <div className="stackXs">
          <span className="ticketSurfaceEyebrow">MANTIS</span>
          <strong className="ticketSurfaceTitle">{tr(lang, 'Trade ticket', 'Δελτίο συναλλαγής')}</strong>
          <span className="ticketSurfaceHint">{tr(lang, 'Choose side, size, then preview quote', 'Επίλεξε πλευρά, ποσό και μετά προεπισκόπηση quote')}</span>
        </div>
        <div className="ticketSurfaceLive">
          <span className="ticketSurfaceLiveYes">YES {formatPercent(liveYes)}</span>
          <span className="ticketSurfaceLiveNo">NO {formatPercent(liveNo)}</span>
          <span className="ticketSurfaceClose">{tr(lang, 'Close', 'Λήξη')} {closeCountdown}</span>
        </div>
      </div>

      <div className="ticketSurfaceRail" aria-hidden="true">
        <span style={{ width: `${Math.round(liveYes * 100)}%` }} />
      </div>

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
        <div className="ticketTopTabs">
          <div className="ticketActionTabs" role="tablist" aria-label={tr(lang, 'Action', 'Ενέργεια')}>
            <button
              className={action === 'buy' ? 'ticketActionTab ticketActionTabActive' : 'ticketActionTab'}
              type="button"
              onClick={() => setAction('buy')}
            >
              {tr(lang, 'Buy', 'Αγορά')}
            </button>
            <button
              className={action === 'sell' ? 'ticketActionTab ticketActionTabActive' : 'ticketActionTab'}
              type="button"
              onClick={() => setAction('sell')}
            >
              {tr(lang, 'Sell', 'Πώληση')}
            </button>
          </div>
          <span className="ticketOrderType">{tr(lang, 'Market', 'Αγορά')}</span>
        </div>

        <div className="ticketSideGrid">
          <button
            className={side === 'yes' ? 'ticketSideButton ticketSideButtonYesActive' : 'ticketSideButton'}
            type="button"
            onClick={() => setSide('yes')}
          >
            {yesDisplay} {yesCents}¢
          </button>
          <button
            className={side === 'no' ? 'ticketSideButton ticketSideButtonNoActive' : 'ticketSideButton'}
            type="button"
            onClick={() => setSide('no')}
          >
            {noDisplay} {noCents}¢
          </button>
        </div>

        <label className="stackXs ticketAmountBlock">
          <span className="fieldLabel">{tr(lang, 'Amount', 'Ποσό')}</span>
          {walletBalance ? <span className="ticketAmountBalance">{tr(lang, 'Balance', 'Υπόλοιπο')} {walletBalance}</span> : null}
          <input
            className="input"
            type="number"
            min="1"
            step="1"
            value={amountEur}
            onChange={(event) => setAmountEur(event.target.value)}
            disabled={loading || props.marketStatus !== 'open' || marketClosed}
          />

          <div className="ticketQuickAmounts">
            {[10, 25, 50, 100].map((value) => (
              <button
                key={value}
                className={amountEur === String(value) ? 'ticketQuickAmount ticketQuickAmountActive' : 'ticketQuickAmount'}
                type="button"
                onClick={() => setAmountEur(String(value))}
                disabled={loading || props.marketStatus !== 'open' || marketClosed}
              >
                €{value}
              </button>
            ))}

            {walletNumber && walletNumber > 0 ? (
              <button
                className="ticketQuickAmount"
                type="button"
                onClick={() => setAmountEur(String(Math.max(1, Math.floor(walletNumber))))}
                disabled={loading || props.marketStatus !== 'open' || marketClosed}
              >
                {tr(lang, 'Max', 'Μέγιστο')}
              </button>
            ) : null}
          </div>
        </label>

        <button
          className={side === 'yes' ? 'ticketCta ticketCtaYes' : 'ticketCta ticketCtaNo'}
          type="button"
          onClick={requestQuotePreview}
          disabled={loading || props.marketStatus !== 'open' || marketClosed}
        >
          {loading ? tr(lang, 'Requesting quote...', 'Ζητείται quote...') : `${tr(lang, 'Preview', 'Προεπισκόπηση')} · ${mainCtaLabel}`}
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
          <div className="statusRow statusRowStart ticketQuoteHead">
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

          <div className="metricGridCompact ticketQuoteGrid">
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Stake', 'Κεφάλαιο')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quote.quote.amountEur)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Avg price', 'Μέση τιμή')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatPercent(quote.quote.averagePrice)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Exposure', 'Έκθεση')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quoteExposure)}</div>
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
              <div className="metricTileLabel">{tr(lang, 'Max loss', 'Μέγιστη απώλεια')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quoteMaxLoss)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Max payout', 'Μέγιστη πληρωμή')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatMoney(quote.quote.toWinEur)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Post YES', 'Μετά YES')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatPercent(quote.quote.postYesPrice)}</div>
            </div>
            <div className="metricTile">
              <div className="metricTileLabel">{tr(lang, 'Post NO', 'Μετά NO')}</div>
              <div className="metricTileValue metricTileValueSmall">{formatPercent(quote.quote.postNoPrice)}</div>
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
