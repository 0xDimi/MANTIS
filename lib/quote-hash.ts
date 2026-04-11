import { createHash } from 'node:crypto';

type QuoteHashInput = {
  marketId: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  amountEur: number;
  averagePrice: number;
  shareDelta: number;
  postYesPrice: number;
  expiresAtIso: string;
};

export function buildQuoteHash(input: QuoteHashInput) {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex').slice(0, 32);
}

