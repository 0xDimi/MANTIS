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

function formatCountdown(ms: number, lang: UiLang) {
  if (ms <= 0) return tr(lang, 'expired', 'έληξε');

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

function marketBlockedMessage(status: string, marketClosed: boolean, lang: UiLang) {
  if (marketClosed || status === 'closed') return tr(lang, 'Trading is closed for this market.', 'Η διαπραγμάτευση έχει κλείσει για αυτή την αγορά.');
  if (status === 'paused') return tr(lang, 'Trading is paused. Check back shortly.', 'Η διαπραγμάτευση είναι σε παύση. Δοκίμασε ξανά σύντομα.');
  if (status === 'draft') return tr(lang, 'Market is preparing. Trading opens soon.', 'Η αγορά προετοιμάζεται. Η διαπραγμάτευση ανοίγει σύντομα.');
  if (status === 'resolved') return tr(lang, 'Market is resolved and no longer tradeable.', 'Η αγορά επιλύθηκε και δεν είναι πλέον διαθέσιμη για συναλλαγή.');
  if (status === 'settled') return tr(lang, 'Market is settled. Trading is complete.', 'Η αγορά έχει διακανονιστεί. Η διαπραγμάτευση ολοκληρώθηκε.');
  if (status === 'void') return tr(lang, 'Market is voided.', 'Η αγορά είναι ακυρωμένη.');
  return null;
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

  const closeMs = useMemo(() => new Date(props.closeTime).getTime(), [props.closeTime]);

  const marketClosed = useMemo(() => {
    if (!Number.isFinite(closeMs)) return false;
    return closeMs <= nowMs;
  }, [closeMs, nowMs]);

  const closeCountdown = useMemo(() => {
    if (!Number.isFinite(closeMs)) return '—';
    return closeMs <= nowMs ? tr(lang, 'Closed', 'Κλειστή') : formatCountdown(closeMs - nowMs, lang);
  }, [closeMs, nowMs, lang]);

  const quoteExpiryText = useMemo(() => {
    if (!quote?.expiresAt) return null;

    const expiresMs = new Date(quote.expiresAt).getTime();
    if (!Number.isFinite(expiresMs)) return tr(lang, 'invalid', 'μη έγκυρο');

    return formatCountdown(expiresMs - nowMs, lang);
  }, [quote?.expiresAt, nowMs, lang]);

  const blockedMessage = marketBlockedMessage(props.marketStatus, marketClosed, lang);
  const msToClose = Number.isFinite(closeMs) ? closeMs - nowMs : Infinity;
  const closingSoon = msToClose > 0 && msToClose <= 2 * 60 * 60 * 1000;

  async function requestQuotePreview() {
    setLoading(true);
    setError(null);
    setExecutionMessage(null);

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
      // non-fatal helper refresh
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

  const quoteReady = Boolean(quote?.quote && quoteExpiryText !== tr(lang, 'expired', 'έληξε'));
  const quoteExpired = Boolean(quote?.quote && quoteExpiryText === tr(lang, 'expired', 'έληξε'));
  const failedTrade = Boolean(executionMessage && executionMessage.toLowerCase().includes('failed'));
  const successTrade = Boolean(executionMessage && executionMessage.toLowerCase().includes('executed'));
  const claimAvailable = props.marketStatus === 'settled' && hasOpenPosition;

  const liveYes = liveState?.yesPrice ?? 0.5;
  const liveNo = liveState?.noPrice ?? 0.5;
  const yesCents = Math.round(liveYes * 100);
  const noCents = Math.round(liveNo * 100);
  const yesDisplay = normalizeOutcomeLabel(props.yesLabel, 'yes');
  const noDisplay = normalizeOutcomeLabel(props.noLabel, 'no');
  const quoteExposure = quote?.quote ? quote.quote.shareDelta * quote.quote.averagePrice : 0;
  const quoteMaxLoss = quote?.quote ? Math.max(quote.quote.totalAmountEur, quote.quote.amountEur) : 0;
  const walletNumber = walletBalance ? Number(walletBalance.split(' ')[0]) : null;
  const intentLabel = `${action === 'buy' ? tr(lang, 'Buy', 'Αγορά') : tr(lang, 'Sell', 'Πώληση')} ${side === 'yes' ? yesDisplay : noDisplay}`;

  const previewStats = quote?.quote
    ? [
        { label: tr(lang, 'Avg price', 'Μέση τιμή'), value: formatPercent(quote.quote.averagePrice) },
        { label: tr(lang, 'Estimated shares', 'Εκτιμώμενες μετοχές'), value: quote.quote.shareDelta.toFixed(4) },
        { label: tr(lang, 'Exposure', 'Έκθεση'), value: formatMoney(quoteExposure) },
        { label: tr(lang, 'Fee', 'Χρέωση'), value: formatMoney(quote.quote.feeAmountEur) },
        { label: tr(lang, 'Price impact', 'Επίδραση τιμής'), value: formatPercent(quote.quote.impact) },
        { label: tr(lang, 'Max loss', 'Μέγιστη απώλεια'), value: formatMoney(quoteMaxLoss) },
        { label: tr(lang, 'Payout if correct', 'Πληρωμή αν επαληθευτεί'), value: formatMoney(quote.quote.toWinEur) }
      ]
    : [];

  const quoteFreshTone = quoteExpired ? 'quoteFreshness quoteFreshnessStale' : 'quoteFreshness quoteFreshnessLive';

  return (
    <article className="stackMd ticketSurfaceStack">
      <div className="ticketSurfaceHead">
        <div className="stackXs">
          <span className="ticketSurfaceEyebrow">MANTIS</span>
          <strong className="ticketSurfaceTitle">{tr(lang, 'Trade ticket', 'Δελτίο συναλλαγής')}</strong>
          <span className="ticketSurfaceHint">{tr(lang, 'Set intent first, then preview execution.', 'Όρισε πρόθεση και μετά δες προεπισκόπηση εκτέλεσης.')}</span>
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

      {blockedMessage ? <div className="notice noticeWarn">{blockedMessage}</div> : null}
      {!blockedMessage && closingSoon ? <div className="notice noticeWarn">{tr(lang, 'Closing soon. Quotes may expire quickly.', 'Η λήξη πλησιάζει. Τα quote μπορεί να λήγουν γρήγορα.')}</div> : null}

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
            <span className="ticketSideLabel">{yesDisplay}</span>
            <span className="ticketSidePrice">{yesCents}¢</span>
          </button>
          <button
            className={side === 'no' ? 'ticketSideButton ticketSideButtonNoActive' : 'ticketSideButton'}
            type="button"
            onClick={() => setSide('no')}
          >
            <span className="ticketSideLabel">{noDisplay}</span>
            <span className="ticketSidePrice">{noCents}¢</span>
          </button>
        </div>

        <label className="ticketAmountBlock stackXs">
          <div className="ticketAmountRow">
            <div className="ticketAmountCopy stackXs">
              <span className="fieldLabel ticketAmountLabel">{tr(lang, 'Amount', 'Ποσό')}</span>
              {walletBalance ? <span className="ticketAmountBalance">{tr(lang, 'Balance', 'Υπόλοιπο')} {walletBalance}</span> : null}
            </div>
            <input
              className="ticketAmountInput"
              type="number"
              min="1"
              step="1"
              placeholder="0"
              value={amountEur}
              onChange={(event) => setAmountEur(event.target.value)}
              disabled={loading || Boolean(blockedMessage)}
            />
          </div>

          <div className="ticketQuickAmounts">
            {[10, 25, 50, 100].map((value) => (
              <button
                key={value}
                className={amountEur === String(value) ? 'ticketQuickAmount ticketQuickAmountActive' : 'ticketQuickAmount'}
                type="button"
                onClick={() => setAmountEur(String(value))}
                disabled={loading || Boolean(blockedMessage)}
              >
                €{value}
              </button>
            ))}

            {walletNumber && walletNumber > 0 ? (
              <button
                className="ticketQuickAmount"
                type="button"
                onClick={() => setAmountEur(String(Math.max(1, Math.floor(walletNumber))))}
                disabled={loading || Boolean(blockedMessage)}
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
          disabled={loading || Boolean(blockedMessage)}
        >
          {loading ? tr(lang, 'Requesting quote...', 'Ζητείται quote...') : `${tr(lang, 'Preview', 'Προεπισκόπηση')} · ${intentLabel}`}
        </button>
      </div>

      {error ? <div className="notice noticeError">{error}</div> : null}
      {stateError ? <div className="notice noticeWarn">{stateError}</div> : null}

      {liveState ? (
        <div className="ticketLiveMeta">
          <span>{tr(lang, 'Last trade', 'Τελευταία συναλλαγή')}: {formatTime(liveState.lastTradeAt)}</span>
          <span>{tr(lang, 'Status', 'Κατάσταση')}: {props.marketStatus.toUpperCase()}</span>
        </div>
      ) : null}

      {quote?.quote ? (
        <div className="ticketPreviewPanel stackSm">
          <div className="ticketPreviewHead">
            <div>
              <div className="splitSectionLabel">{tr(lang, 'Quote preview', 'Προεπισκόπηση quote')}</div>
              <p className="subtle">
                Hash: <code>{quote.quoteHash?.slice(0, 12)}...</code>
              </p>
            </div>
            <span className={quoteFreshTone}>
              <span />
              {tr(lang, 'Refresh in', 'Ανανέωση σε')} {quoteExpiryText ?? '—'}
            </span>
          </div>

          <div className="ticketPreviewMetrics">
            {previewStats.map((item) => (
              <div key={item.label} className="ticketPreviewMetric">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <button
            className={side === 'yes' ? 'ticketCta ticketCtaYes ticketCtaConfirm' : 'ticketCta ticketCtaNo ticketCtaConfirm'}
            type="button"
            onClick={executeTrade}
            disabled={executing || quoteExpired || Boolean(blockedMessage)}
          >
            {executing ? tr(lang, 'Executing...', 'Εκτέλεση...') : `${tr(lang, 'Confirm', 'Επιβεβαίωση')} · ${intentLabel}`}
          </button>

          {executionMessage ? (
            <div className={successTrade ? 'notice noticeSuccess' : failedTrade ? 'notice noticeError' : 'notice noticeWarn'}>{executionMessage}</div>
          ) : null}

          {claimAvailable ? <p className="subtle">{tr(lang, 'Settlement is available for your open position.', 'Ο διακανονισμός είναι διαθέσιμος για την ανοικτή θέση σου.')}</p> : null}
          {walletBalance ? <p className="subtle">{tr(lang, 'Wallet', 'Πορτοφόλι')}: {walletBalance}</p> : null}
          {positionSnapshot ? <p className="subtle">{tr(lang, 'Position', 'Θέση')}: {positionSnapshot}</p> : null}
          {lastTradeSnapshot ? <p className="subtle">{tr(lang, 'Latest trade', 'Τελευταία συναλλαγή')}: {lastTradeSnapshot}</p> : null}
        </div>
      ) : null}

      {(quoteReady || loading || executing) ? (
        <div className="stateChips">
          {quoteReady ? <span className="stateChip stateChipYes">{tr(lang, 'Quote ready', 'Quote έτοιμο')}</span> : null}
          {loading ? <span className="stateChip stateChipFocus">{tr(lang, 'Pricing request in progress', 'Εκτέλεση υπολογισμού τιμής')}</span> : null}
          {executing ? <span className="stateChip stateChipFocus">{tr(lang, 'Execution in progress', 'Εκτέλεση σε εξέλιξη')}</span> : null}
        </div>
      ) : null}
    </article>
  );
}
