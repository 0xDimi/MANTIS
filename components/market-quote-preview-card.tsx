'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureEvent } from '@/lib/client-telemetry';
import { localizedMarketStatus, localizedOutcomeLabel } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type TradeInputMode = 'gross_cash' | 'total_cash' | 'shares';
type SellPreset = '25' | '50' | 'max';

type QuotePreviewPayload = {
  market?: {
    feeBps?: number;
  };
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
    payoutIfCorrectEur?: number;
  };
  tradeInput?: {
    inputMode: TradeInputMode;
    amountEur: number | null;
    shareAmount: number | null;
  };
  quoteHash?: string;
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
  prefillAction?: string;
  prefillSide?: string;
  prefillAmount?: string;
  prefillSellPreset?: string;
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

type MarketStatePayload = {
  state?: {
    yes_price: number;
    no_price: number;
    last_trade_at: string | null;
  } | null;
  error?: string;
};

function formatMoney(value: number, lang: UiLang) {
  return new Intl.NumberFormat(lang === 'el' ? 'el-GR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value);
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

function formatCloseCountdown(closeTime: string, nowMs: number, lang: UiLang) {
  const closeMs = new Date(closeTime).getTime();
  if (!Number.isFinite(closeMs)) return '—';

  const diffMs = closeMs - nowMs;
  if (diffMs <= 0) return tr(lang, 'Closed', 'Κλειστή');

  const diffMinutes = Math.ceil(diffMs / 60_000);
  if (diffMinutes < 60) {
    return lang === 'el' ? `σε ${Math.max(diffMinutes, 1)}λ` : `${Math.max(diffMinutes, 1)}m`;
  }

  const diffHours = Math.ceil(diffMinutes / 60);
  if (diffHours < 24) {
    return lang === 'el' ? `σε ${diffHours}ω` : `${diffHours}h`;
  }

  const diffDays = Math.ceil(diffHours / 24);
  if (diffDays <= 6) {
    return lang === 'el' ? `σε ${diffDays}η` : `${diffDays}d`;
  }

  return new Intl.DateTimeFormat(lang === 'el' ? 'el-GR' : 'en-GB', {
    day: '2-digit',
    month: 'short'
  }).format(new Date(closeMs));
}

function formatTime(value: string | null | undefined, lang: UiLang) {
  if (!value) return '—';

  const parsed = new Date(value);

  if (!Number.isFinite(parsed.getTime())) return '—';

  return parsed.toLocaleTimeString(lang === 'el' ? 'el-GR' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
}

function normalizePrefillSide(value: string | undefined): 'yes' | 'no' {
  return value === 'no' ? 'no' : 'yes';
}

function normalizePrefillAction(value: string | undefined): 'buy' | 'sell' {
  return value === 'sell' ? 'sell' : 'buy';
}

function normalizeSellPreset(value: string | undefined): SellPreset | null {
  if (value === '25' || value === '50' || value === 'max') return value;
  return null;
}

function normalizePrefillAmount(value: string | undefined) {
  const parsed = Number(value ?? '');
  if (!Number.isFinite(parsed) || parsed <= 0) return '10';
  return String(Math.round(parsed * 100) / 100);
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

function isQuoteFresh(quote: QuotePreviewPayload | null | undefined, nowMs: number) {
  if (!quote?.quote || !quote.quoteHash || !quote.expiresAt) return false;

  const expiresMs = new Date(quote.expiresAt).getTime();
  if (!Number.isFinite(expiresMs)) return false;

  return expiresMs > nowMs + 1_000;
}

function translateTradeError(rawMessage: string, lang: UiLang) {
  const message = rawMessage.toLowerCase();

  if (message.includes('quote request failed')) return tr(lang, 'Quote request failed.', 'Αποτυχία αιτήματος quote.');
  if (message.includes('execution failed')) return tr(lang, 'Execution failed.', 'Αποτυχία εκτέλεσης.');
  if (message.includes('state refresh failed')) return tr(lang, 'Live state refresh failed.', 'Αποτυχία ανανέωσης live κατάστασης.');
  if (message.includes('auth required')) return tr(lang, 'Sign in required for trading.', 'Απαιτείται σύνδεση για συναλλαγές.');
  if (message.includes('amounteur must be > 0')) return tr(lang, 'Enter an amount above 0.', 'Συμπλήρωσε ποσό πάνω από 0.');
  if (message.includes('shareamount must be > 0')) return tr(lang, 'Enter shares above 0.', 'Συμπλήρωσε μετοχές πάνω από 0.');
  if (message.includes('market not found')) return tr(lang, 'Market not found.', 'Η αγορά δεν βρέθηκε.');
  if (message.includes('market trading window has closed') || message.includes('market is closed') || message.includes('market is settled') || message.includes('market is resolved')) {
    return tr(lang, 'Market is not tradeable right now.', 'Η αγορά δεν είναι διαθέσιμη για συναλλαγές αυτή τη στιγμή.');
  }
  if (message.includes('quote expired') || message.includes('quote hash mismatch') || message.includes('fresh quote')) {
    return tr(lang, 'Re-quote needed before execution.', 'Απαιτείται νέο quote πριν την εκτέλεση.');
  }
  if (message.includes('insufficient') && message.includes('shares')) {
    return tr(lang, 'Insufficient shares for this sell order.', 'Μη επαρκείς μετοχές για αυτή την εντολή πώλησης.');
  }
  if (message.includes('insufficient') && message.includes('balance')) {
    return tr(lang, 'Insufficient balance.', 'Μη επαρκές υπόλοιπο.');
  }
  if (message.includes('exceeds max single trade')) {
    return tr(lang, 'Order exceeds max single trade size.', 'Η εντολή υπερβαίνει το μέγιστο μέγεθος ανά συναλλαγή.');
  }
  if (message.includes('max user exposure')) {
    return tr(lang, 'Order exceeds per-market exposure limit.', 'Η εντολή υπερβαίνει το όριο έκθεσης ανά αγορά.');
  }

  return rawMessage;
}

export function MarketQuotePreviewCard({ lang = 'en', ...props }: MarketQuotePreviewCardProps) {
  const initialSide = normalizePrefillSide(props.prefillSide);
  const initialAction = normalizePrefillAction(props.prefillAction);
  const initialSellPreset = normalizeSellPreset(props.prefillSellPreset);

  const [side, setSide] = useState<'yes' | 'no'>(initialSide);
  const [action, setAction] = useState<'buy' | 'sell'>(initialAction);
  const [amountEur, setAmountEur] = useState(normalizePrefillAmount(props.prefillAmount));
  const [sellPreset, setSellPreset] = useState<SellPreset | null>(initialAction === 'sell' ? initialSellPreset : null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuotePreviewPayload | null>(null);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [stateError, setStateError] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<{ yesPrice: number; noPrice: number; lastTradeAt: string | null } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletCurrency, setWalletCurrency] = useState<string>('PAPER_EUR');
  const [positionSnapshot, setPositionSnapshot] = useState<{ yesShares: number; noShares: number; marketValue: number; unrealizedPnl: number } | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const quoteRequestRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (action !== 'sell' && sellPreset) {
      setSellPreset(null);
    }
  }, [action, sellPreset]);

  const closeMs = useMemo(() => new Date(props.closeTime).getTime(), [props.closeTime]);

  const marketClosed = useMemo(() => {
    if (!Number.isFinite(closeMs)) return false;
    return closeMs <= nowMs;
  }, [closeMs, nowMs]);

  const closeCountdown = useMemo(() => {
    if (!Number.isFinite(closeMs)) return '—';
    return formatCloseCountdown(props.closeTime, nowMs, lang);
  }, [closeMs, nowMs, lang, props.closeTime]);

  const blockedMessage = marketBlockedMessage(props.marketStatus, marketClosed, lang);
  const msToClose = Number.isFinite(closeMs) ? closeMs - nowMs : Infinity;
  const closingSoon = msToClose > 0 && msToClose <= 2 * 60 * 60 * 1000;

  const yesDisplay = localizedOutcomeLabel(props.yesLabel, 'yes', lang);
  const noDisplay = localizedOutcomeLabel(props.noLabel, 'no', lang);

  const availableYesShares = Number(positionSnapshot?.yesShares ?? 0);
  const availableNoShares = Number(positionSnapshot?.noShares ?? 0);
  const availableShares = side === 'yes' ? availableYesShares : availableNoShares;

  const resolveSellShareAmount = useCallback(() => {
    if (action !== 'sell' || !sellPreset) return null;

    const baseShares = side === 'yes' ? availableYesShares : availableNoShares;

    if (!Number.isFinite(baseShares) || baseShares <= 0) return 0;

    if (sellPreset === 'max') return Number(baseShares.toFixed(8));
    if (sellPreset === '50') return Number((baseShares * 0.5).toFixed(8));

    return Number((baseShares * 0.25).toFixed(8));
  }, [action, sellPreset, side, availableYesShares, availableNoShares]);

  const refreshLiveState = useCallback(async () => {
    try {
      const response = await fetch(`/api/markets/${props.marketSlug}`, { cache: 'no-store' });
      const payload = (await response.json()) as MarketStatePayload;

      if (!response.ok) {
        const message = payload.error ?? `state refresh failed (${response.status})`;
        setStateError(translateTradeError(message, lang));
        return;
      }

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
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : 'state refresh failed';
      setStateError(translateTradeError(message, lang));
    }
  }, [lang, props.marketSlug]);

  const refreshPortfolioSnapshot = useCallback(async () => {
    try {
      const portfolioUrl = lang === 'el' ? '/api/portfolio/summary?lang=el' : '/api/portfolio/summary';
      const portfolioRes = await fetch(portfolioUrl, { cache: 'no-store' });
      const portfolio = (await portfolioRes.json()) as PortfolioSummaryPayload;

      if (portfolioRes.ok && portfolio.wallet) {
        setWalletBalance(Number(portfolio.wallet.availableBalance));
        setWalletCurrency(portfolio.wallet.currency);
      }

      if (portfolioRes.ok && Array.isArray(portfolio.positions)) {
        const marketPosition = portfolio.positions.find((item) => item.marketId === props.marketId);

        if (marketPosition) {
          setPositionSnapshot({
            yesShares: Number(marketPosition.position.yesShares ?? 0),
            noShares: Number(marketPosition.position.noShares ?? 0),
            marketValue: Number(marketPosition.position.marketValue ?? 0),
            unrealizedPnl: Number(marketPosition.position.unrealizedPnl ?? 0)
          });
        } else {
          setPositionSnapshot(null);
        }
      }
    } catch {
      // helper refresh, keep silent
    }
  }, [props.marketId]);

  useEffect(() => {
    void refreshLiveState();
    const timer = setInterval(() => {
      void refreshLiveState();
    }, 10_000);

    return () => clearInterval(timer);
  }, [refreshLiveState]);

  useEffect(() => {
    void refreshPortfolioSnapshot();
    const timer = setInterval(() => {
      void refreshPortfolioSnapshot();
    }, 10_000);

    return () => clearInterval(timer);
  }, [refreshPortfolioSnapshot]);

  const requestQuotePreview = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      const requestId = quoteRequestRef.current + 1;
      quoteRequestRef.current = requestId;

      if (!silent) {
        setError(null);
        setExecutionMessage(null);
      }

      let payloadBody: {
        marketId: string;
        side: 'yes' | 'no';
        action: 'buy' | 'sell';
        amountEur?: number;
        shareAmount?: number;
      } = {
        marketId: props.marketId,
        side,
        action
      };

      const presetShareAmount = resolveSellShareAmount();

      if (action === 'sell' && sellPreset) {
        if (!Number.isFinite(presetShareAmount) || (presetShareAmount ?? 0) <= 0) {
          setQuote(null);
          if (!silent) {
            setError(tr(lang, 'No shares available on this side to sell.', 'Δεν υπάρχουν διαθέσιμες μετοχές σε αυτή την πλευρά για πώληση.'));
          }
          return null;
        }

        payloadBody = {
          ...payloadBody,
          shareAmount: presetShareAmount ?? undefined
        };
      } else {
        const parsedAmount = Number(amountEur);

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
          setQuote(null);
          if (!silent) {
            setError(tr(lang, 'Enter a valid amount above 0.', 'Συμπλήρωσε έγκυρο ποσό πάνω από 0.'));
          }
          return null;
        }

        payloadBody = {
          ...payloadBody,
          amountEur: parsedAmount
        };
      }

      if (!silent) {
        captureEvent('quote requested', {
          marketId: props.marketId,
          marketSlug: props.marketSlug,
          action,
          side,
          inputMode: payloadBody.shareAmount != null ? 'shares' : 'gross_cash'
        });
      }

      setLoading(true);

      try {
        const response = await fetch('/api/quotes/preview', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payloadBody)
        });

        const payload = (await response.json()) as QuotePreviewPayload;

        if (requestId !== quoteRequestRef.current) {
          return null;
        }

        if (!response.ok) {
          setQuote(null);
          if (!silent) {
            const message = payload.error ?? `Quote request failed (${response.status})`;
            setError(translateTradeError(message, lang));
          }
          return null;
        }

        setQuote(payload);
        if (!silent) setError(null);
        return payload;
      } catch (requestError) {
        if (requestId === quoteRequestRef.current) {
          setQuote(null);
          if (!silent) {
            const message = requestError instanceof Error ? requestError.message : 'Quote request failed';
            setError(translateTradeError(message, lang));
          }
        }
        return null;
      } finally {
        if (requestId === quoteRequestRef.current) {
          setLoading(false);
        }
      }
    },
    [action, amountEur, lang, props.marketId, resolveSellShareAmount, sellPreset, side]
  );

  useEffect(() => {
    if (blockedMessage) {
      setQuote(null);
      return;
    }

    if (action === 'sell' && sellPreset && availableShares <= 0) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(() => {
      void requestQuotePreview({ silent: true });
    }, 320);

    return () => clearTimeout(timer);
  }, [action, amountEur, availableShares, blockedMessage, requestQuotePreview, sellPreset, side]);

  const executeTrade = useCallback(
    async (quotePayload?: QuotePreviewPayload | null) => {
      const activeQuote = quotePayload ?? quote;

      if (!activeQuote?.quoteHash || !activeQuote.expiresAt) {
        setExecutionMessage(tr(lang, 'Waiting for a fresh quote.', 'Αναμονή για νέο quote.'));
        return false;
      }

      const isFresh = isQuoteFresh(activeQuote, Date.now());
      if (!isFresh) {
        setExecutionMessage(tr(lang, 'Quote expired. Repricing now.', 'Το quote έληξε. Γίνεται νέα τιμολόγηση.'));
        return false;
      }

      setExecuting(true);
      setExecutionMessage(null);

      try {
        const executeBody: {
          marketId: string;
          side: 'yes' | 'no';
          action: 'buy' | 'sell';
          quoteHash: string;
          quoteExpiresAt: string;
          amountEur?: number;
          shareAmount?: number;
        } = {
          marketId: props.marketId,
          side,
          action,
          quoteHash: activeQuote.quoteHash,
          quoteExpiresAt: activeQuote.expiresAt
        };

        if (activeQuote.tradeInput?.inputMode === 'shares' && Number(activeQuote.tradeInput.shareAmount ?? 0) > 0) {
          executeBody.shareAmount = Number(activeQuote.tradeInput.shareAmount);
        } else {
          const requestedAmount = Number(activeQuote.tradeInput?.amountEur ?? amountEur);
          executeBody.amountEur = requestedAmount;
        }

        const response = await fetch('/api/trades/execute', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(executeBody)
        });

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          const message = payload.error ?? `Execution failed (${response.status})`;
          setExecutionMessage(message);
          captureEvent('trade failed', {
            marketId: props.marketId,
            marketSlug: props.marketSlug,
            action,
            side,
            status: response.status,
            message
          });

          if (response.status === 409) {
            void requestQuotePreview({ silent: true });
          }

          return false;
        }

        setExecutionMessage(tr(lang, 'Trade executed. Portfolio updated.', 'Η συναλλαγή εκτελέστηκε. Το χαρτοφυλάκιο ενημερώθηκε.'));
        captureEvent('trade executed', {
          marketId: props.marketId,
          marketSlug: props.marketSlug,
          action,
          side
        });
        await Promise.all([refreshPortfolioSnapshot(), refreshLiveState()]);
        void requestQuotePreview({ silent: true });

        return true;
      } catch (executeError) {
        const message = executeError instanceof Error ? executeError.message : 'Execution failed';
        setExecutionMessage(translateTradeError(message, lang));
        captureEvent('trade failed', {
          marketId: props.marketId,
          marketSlug: props.marketSlug,
          action,
          side,
          status: 'network',
          message
        });
        return false;
      } finally {
        setExecuting(false);
      }
    },
    [action, amountEur, lang, props.marketId, quote, refreshLiveState, refreshPortfolioSnapshot, requestQuotePreview, side]
  );

  async function handlePrimaryAction() {
    if (blockedMessage) return;

    setError(null);

    if (action === 'sell' && availableShares <= 0) {
      setError(tr(lang, 'No shares available on this side to sell.', 'Δεν υπάρχουν διαθέσιμες μετοχές σε αυτή την πλευρά για πώληση.'));
      return;
    }

    if (isQuoteFresh(quote, nowMs)) {
      await executeTrade();
      return;
    }

    const freshQuote = await requestQuotePreview({ silent: false });

    if (!freshQuote) return;
    if (!isQuoteFresh(freshQuote, Date.now())) {
      setError(tr(lang, 'Quote refresh required. Try again.', 'Απαιτείται ανανέωση quote. Δοκίμασε ξανά.'));
      return;
    }

    await executeTrade(freshQuote);
  }

  const liveYes = liveState?.yesPrice ?? 0.5;
  const liveNo = liveState?.noPrice ?? 1 - liveYes;
  const yesCents = Math.round(liveYes * 100);
  const noCents = Math.round(liveNo * 100);

  const quoteFresh = isQuoteFresh(quote, nowMs);
  const quoteExpired = Boolean(quote?.quote && !quoteFresh);

  const quoteAmount = quote?.quote?.amountEur ?? null;
  const quoteAvgPrice = quote?.quote?.averagePrice ?? null;
  const quotePossibleWin = quote?.quote?.toWinEur ?? null;

  const maxLoss = quote?.quote ? (action === 'buy' ? quote.quote.totalAmountEur : 0) : null;
  const totalReturnIfCorrect = quote?.quote
    ? Number(quote.quote.payoutIfCorrectEur ?? quote.quote.shareDelta)
    : null;

  const quoteStatusTone = quoteExpired ? 'quoteFreshness quoteFreshnessStale' : 'quoteFreshness quoteFreshnessLive';
  const quoteStatusText = quote?.expiresAt
    ? formatCountdown(new Date(quote.expiresAt).getTime() - nowMs, lang)
    : tr(lang, 'waiting', 'αναμονή');

  const intentLabel = `${action === 'buy' ? tr(lang, 'Buy', 'Αγορά') : tr(lang, 'Sell', 'Πώληση')} ${side === 'yes' ? yesDisplay : noDisplay}`;

  const ctaDisabled = Boolean(blockedMessage) || executing || loading || (action === 'sell' && availableShares <= 0);

  return (
    <article className="stackMd ticketSurfaceStack">
      <div className="ticketSurfaceHead ticketSurfaceHeadCompact">
        <span className="ticketSurfaceClose">{tr(lang, 'Close', 'Λήξη')} {closeCountdown}</span>
        <span className="ticketSurfaceStatus">{localizedMarketStatus(props.marketStatus, lang, 'short')}</span>
      </div>

      <div className="ticketSurfaceRail" aria-hidden="true">
        <span style={{ width: `${Math.round(liveYes * 100)}%` }} />
      </div>

      {blockedMessage ? <div className="notice noticeWarn">{blockedMessage}</div> : null}
      {!blockedMessage && closingSoon ? <div className="notice noticeWarn">{tr(lang, 'Closing soon. Quotes may refresh quickly.', 'Η λήξη πλησιάζει. Τα quote μπορεί να ανανεώνονται γρήγορα.')}</div> : null}

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
          <span className="ticketOrderType">{tr(lang, 'Market order', 'Εντολή αγοράς')}</span>
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
              {walletBalance != null ? <span className="ticketAmountBalance">{tr(lang, 'Balance', 'Υπόλοιπο')} {walletBalance.toFixed(2)} {walletCurrency}</span> : null}
            </div>
            <input
              className="ticketAmountInput"
              type="number"
              min="1"
              step="0.01"
              placeholder="0"
              value={amountEur}
              onChange={(event) => {
                setAmountEur(event.target.value);
                setSellPreset(null);
              }}
              disabled={Boolean(blockedMessage)}
            />
          </div>

          {action === 'buy' ? (
            <div className="ticketQuickAmounts">
              {[10, 25, 50, 100].map((value) => (
                <button
                  key={value}
                  className={amountEur === String(value) ? 'ticketQuickAmount ticketQuickAmountActive' : 'ticketQuickAmount'}
                  type="button"
                  onClick={() => {
                    setAmountEur(String(value));
                    setSellPreset(null);
                  }}
                  disabled={Boolean(blockedMessage)}
                >
                  €{value}
                </button>
              ))}

              {walletBalance && walletBalance > 0 ? (
                <button
                  className="ticketQuickAmount"
                  type="button"
                  onClick={() => {
                    setAmountEur(String(Math.max(1, Math.floor(walletBalance))));
                    setSellPreset(null);
                  }}
                  disabled={Boolean(blockedMessage)}
                >
                  {tr(lang, 'Max', 'Μέγιστο')}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="ticketQuickAmounts">
              {([
                { key: '25', label: '25%' },
                { key: '50', label: '50%' },
                { key: 'max', label: tr(lang, 'Max', 'Μέγιστο') }
              ] as Array<{ key: SellPreset; label: string }>).map((item) => (
                <button
                  key={item.key}
                  className={sellPreset === item.key ? 'ticketQuickAmount ticketQuickAmountActive' : 'ticketQuickAmount'}
                  type="button"
                  onClick={() => setSellPreset(item.key)}
                  disabled={Boolean(blockedMessage) || availableShares <= 0}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {action === 'sell' ? (
            <p className="subtle">
              {tr(lang, 'Available', 'Διαθέσιμα')} {side === 'yes' ? yesDisplay : noDisplay} {tr(lang, 'shares', 'μετοχές')}: {availableShares.toFixed(4)}
            </p>
          ) : null}
        </label>

        <div className="ticketPreviewPanel stackSm ticketSummaryPanel">
          <div className="ticketPreviewHead">
            <div>
              <div className="splitSectionLabel">{tr(lang, 'Order summary', 'Σύνοψη εντολής')}</div>
            </div>
            <span className={quoteStatusTone}>
              <span />
              {quoteStatusText}
            </span>
          </div>

          <div className="ticketSummaryPrimary">
            <div className="ticketPreviewMetric">
              <span>{tr(lang, 'Amount', 'Ποσό')}</span>
              <strong>{quoteAmount != null ? formatMoney(quoteAmount, lang) : '—'}</strong>
            </div>
            <div className="ticketPreviewMetric">
              <span>{tr(lang, 'Avg price', 'Μέση τιμή')}</span>
              <strong>{quoteAvgPrice != null ? formatPercent(quoteAvgPrice) : '—'}</strong>
            </div>
            <div className="ticketPreviewMetric">
              <span>{action === 'buy' ? tr(lang, 'Possible win', 'Πιθανό κέρδος') : tr(lang, 'Estimated proceeds', 'Εκτιμώμενα έσοδα')}</span>
              <strong>{quote?.quote ? formatMoney(action === 'buy' ? quotePossibleWin ?? 0 : quote.quote.totalAmountEur, lang) : '—'}</strong>
            </div>
          </div>

          <details className="ticketDetailsFold">
            <summary>{tr(lang, 'Trade details', 'Λεπτομέρειες συναλλαγής')}</summary>
            <div className="ticketSummarySecondary">
              <div className="ticketPreviewMetric">
                <span>{tr(lang, 'Estimated shares', 'Εκτιμώμενες μετοχές')}</span>
                <strong>{quote?.quote ? quote.quote.shareDelta.toFixed(4) : '—'}</strong>
              </div>
              <div className="ticketPreviewMetric">
                <span>{tr(lang, 'Fee', 'Χρέωση')}</span>
                <strong>{quote?.quote ? formatMoney(quote.quote.feeAmountEur, lang) : '—'}</strong>
              </div>
              <div className="ticketPreviewMetric">
                <span>{tr(lang, 'Price impact', 'Επίδραση τιμής')}</span>
                <strong>{quote?.quote ? formatPercent(quote.quote.impact) : '—'}</strong>
              </div>
              <div className="ticketPreviewMetric">
                <span>{tr(lang, 'Max loss', 'Μέγιστη απώλεια')}</span>
                <strong>{maxLoss != null ? formatMoney(maxLoss, lang) : '—'}</strong>
              </div>
              <div className="ticketPreviewMetric">
                <span>{tr(lang, 'Total return if correct', 'Συνολική επιστροφή αν επιβεβαιωθεί')}</span>
                <strong>{totalReturnIfCorrect != null ? formatMoney(totalReturnIfCorrect, lang) : '—'}</strong>
              </div>
              <div className="ticketPreviewMetric">
                <span>{tr(lang, 'Fee rate', 'Ποσοστό χρέωσης')}</span>
                <strong>{quote?.market?.feeBps != null ? `${(quote.market.feeBps / 100).toFixed(2)}%` : '—'}</strong>
              </div>
            </div>
          </details>
        </div>

        <button
          className={side === 'yes' ? 'ticketCta ticketCtaYes' : 'ticketCta ticketCtaNo'}
          type="button"
          onClick={handlePrimaryAction}
          disabled={ctaDisabled}
        >
          {executing
            ? tr(lang, 'Executing...', 'Εκτέλεση...')
            : loading
              ? tr(lang, 'Updating quote...', 'Ανανέωση quote...')
              : intentLabel}
        </button>
      </div>

      {error ? <div className="notice noticeError">{translateTradeError(error, lang)}</div> : null}
      {stateError ? <div className="notice noticeWarn">{stateError}</div> : null}
      {quoteExpired ? <div className="notice noticeWarn">{tr(lang, 'Quote expired or moved. Tap once to refresh and execute.', 'Το quote έληξε ή άλλαξε η αγορά. Πάτησε μία φορά για ανανέωση και εκτέλεση.')}</div> : null}

      {executionMessage ? (
        <div className={executionMessage.toLowerCase().includes('executed') || executionMessage.toLowerCase().includes('εκτελέ') ? 'notice noticeSuccess' : 'notice noticeWarn'}>
          {translateTradeError(executionMessage, lang)}
        </div>
      ) : null}

      {liveState ? (
        <div className="ticketLiveMeta">
          <span>{tr(lang, 'Last trade', 'Τελευταία συναλλαγή')}: {formatTime(liveState.lastTradeAt, lang)}</span>
        </div>
      ) : null}
    </article>
  );
}
