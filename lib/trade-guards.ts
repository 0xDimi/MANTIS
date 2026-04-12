import { alphaGuardrails } from '@/lib/alpha-guardrails';
import type { TradeAction, TradeInputMode, TradeSide } from '@/lib/amm-v0';

export class TradeRequestError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'TradeRequestError';
    this.statusCode = statusCode;
  }
}

export function parseTradeSide(value: unknown): TradeSide {
  if (value === 'yes' || value === 'no') {
    return value;
  }

  throw new TradeRequestError('side must be yes or no', 400);
}

export function parseTradeAction(value: unknown, fallback: TradeAction = 'buy'): TradeAction {
  if (value == null) {
    return fallback;
  }

  if (value === 'buy' || value === 'sell') {
    return value;
  }

  throw new TradeRequestError('action must be buy or sell', 400);
}

export function resolveTradeInputMode(action: TradeAction, shareAmount: unknown): TradeInputMode {
  if (action === 'buy') {
    return 'total_cash';
  }

  return shareAmount == null ? 'gross_cash' : 'shares';
}

function parseCloseTime(closeTime: string | null | undefined) {
  if (!closeTime) {
    return null;
  }

  const parsed = new Date(closeTime);

  if (!Number.isFinite(parsed.getTime())) {
    throw new TradeRequestError('market close_time is invalid', 500);
  }

  return parsed;
}

export function assertMarketOpenForTrading(input: { status: string; closeTime?: string | null; now?: Date }) {
  const now = input.now ?? new Date();

  if (input.status !== 'open') {
    throw new TradeRequestError(`market is ${input.status}, not open`, 409);
  }

  const closeTime = parseCloseTime(input.closeTime);

  if (closeTime && closeTime.getTime() <= now.getTime()) {
    throw new TradeRequestError('market trading window has closed', 409);
  }

  return closeTime;
}

export function resolveQuoteExpiry(input: { closeTime?: string | null; now?: Date; ttlSeconds?: number }) {
  const now = input.now ?? new Date();
  const ttlSeconds = input.ttlSeconds ?? alphaGuardrails.quoteTtlSeconds;

  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    throw new TradeRequestError('quote ttl is invalid', 500);
  }

  const ttlExpiryMs = now.getTime() + ttlSeconds * 1000;
  const closeTime = parseCloseTime(input.closeTime);
  const expiresAtMs = closeTime ? Math.min(ttlExpiryMs, closeTime.getTime()) : ttlExpiryMs;

  if (expiresAtMs <= now.getTime()) {
    throw new TradeRequestError('market trading window has closed', 409);
  }

  return new Date(expiresAtMs);
}

export function evaluateUserTradeLimits(input: {
  action: TradeAction;
  side: TradeSide;
  shareDelta: number;
  totalAmountEur: number;
  currentExposureEur?: number;
  availableShares?: number | null;
  maxUserExposureEur?: number;
}) {
  const openExposureEur = Number(input.currentExposureEur ?? 0);
  const maxUserExposureEur = Number(input.maxUserExposureEur ?? alphaGuardrails.maxUserExposurePerMarketEur);
  const availableShares = input.action === 'sell' ? Number(input.availableShares ?? 0) : null;
  const exposureAfterEur = input.action === 'buy' ? openExposureEur + input.totalAmountEur : null;

  if (input.action === 'buy' && exposureAfterEur !== null && exposureAfterEur > maxUserExposureEur) {
    throw new TradeRequestError(`trade exceeds max user exposure per market (${maxUserExposureEur})`, 400);
  }

  if (input.action === 'sell' && availableShares !== null && availableShares + 1e-8 < input.shareDelta) {
    throw new TradeRequestError(`insufficient ${input.side} shares for requested sell size`, 400);
  }

  return {
    openExposureEur,
    exposureAfterEur,
    availableShares
  };
}
