import { createHash } from 'node:crypto';

type QuoteHashInput = {
  marketId: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  inputMode: 'gross_cash' | 'total_cash' | 'shares';
  amountEur?: number | null;
  shareAmount?: number | null;
  expectedQYes: number;
  expectedQNo: number;
  averagePrice: number;
  shareDelta: number;
  postYesPrice: number;
  expiresAtIso: string;
};

export function buildQuoteHash(input: QuoteHashInput) {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex').slice(0, 32);
}
