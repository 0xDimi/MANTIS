export const DISCOVER_BOARD_SCOPE = 'open' as const;

export function isInternalMarket(slug: string, question: string) {
  const target = `${slug} ${question}`.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  return /\b(smoke|qa|test|sim|internal|ops|lifecycle|admin)\b/.test(target);
}
