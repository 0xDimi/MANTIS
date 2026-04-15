import type { BoardMarket } from '@/lib/alpha-read-model';

type SampleMarket = BoardMarket & { previewOnly: true };

const sampleQuestions = [
  { category: 'macro', question: 'Will ECB cut rates by at least 25 bps before 31 Jul 2026?' },
  { category: 'sports', question: 'Will Panathinaikos finish above Olympiacos in the regular season?' },
  { category: 'tech', question: 'Will Apple announce an on-device LLM feature set this quarter?' },
  { category: 'crypto', question: 'Will Ethereum close above $4,000 by 30 Sep 2026?' },
  { category: 'greece', question: 'Will Athens record at least one 40°C day this summer?' },
  { category: 'energy', question: 'Will Brent crude settle above $95 before 01 Oct 2026?' },
  { category: 'politics', question: 'Will the next Greek election be called before Dec 2026?' },
  { category: 'travel', question: 'Will Santorini airport passenger traffic grow YoY this August?' },
  { category: 'ai', question: 'Will an open model top the benchmark leaderboard this quarter?' },
  { category: 'finance', question: 'Will EUR/USD trade above 1.14 before year-end?' },
  { category: 'climate', question: 'Will Thessaloniki monthly rainfall exceed 90mm next month?' },
  { category: 'culture', question: 'Will a Greek-produced film win a major EU festival award this year?' }
] as const;

function pseudo(index: number) {
  const base = (index * 37 + 13) % 100;
  return Math.max(0.18, Math.min(0.82, base / 100));
}

export function getDesignSampleMarkets(): SampleMarket[] {
  const now = Date.now();

  return sampleQuestions.map((item, index) => {
    const yesPrice = Number(pseudo(index).toFixed(2));
    const noPrice = Number((1 - yesPrice).toFixed(2));

    return {
      id: `sample-${index + 1}`,
      slug: `sample-${index + 1}`,
      question: item.question,
      category: item.category,
      status: 'open',
      feeBps: 50,
      liquidity: 1200 + index * 230,
      closeTime: new Date(now + (index + 2) * 36 * 60 * 60 * 1000).toISOString(),
      state: {
        yesPrice,
        noPrice,
        volumeTotal: 1600 + index * 420,
        participantsCount: 24 + index * 3,
        lastTradeAt: new Date(now - (index + 1) * 27 * 60 * 1000).toISOString()
      },
      previewOnly: true
    };
  });
}
