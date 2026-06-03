import Link from 'next/link';
import { marketHref } from '@/components/market-card-shared';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeClose, formatRelativeTime } from '@/lib/format';
import { tr, type UiLang } from '@/lib/ui-lang';

type MarketPulsePanelProps = {
  markets: BoardMarket[];
  lang: UiLang;
};

type PulseItem = {
  id: string;
  kind: 'active' | 'fresh' | 'ending';
  market: BoardMarket;
};

function uniqPulse(items: PulseItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.market.id)) return false;
    seen.add(item.market.id);
    return true;
  });
}

function buildPulseItems(markets: BoardMarket[]) {
  const active = markets.filter((market) => market.status === 'open' || market.status === 'paused');
  const byVolume = [...active].sort((a, b) => (b.state?.volumeTotal ?? 0) - (a.state?.volumeTotal ?? 0))[0];
  const byTrade = [...active]
    .filter((market) => market.state?.lastTradeAt)
    .sort((a, b) => new Date(b.state?.lastTradeAt ?? 0).getTime() - new Date(a.state?.lastTradeAt ?? 0).getTime())[0];
  const byClose = [...active].sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime())[0];

  return uniqPulse(
    [
      byVolume ? { id: `active-${byVolume.id}`, kind: 'active', market: byVolume } : null,
      byTrade ? { id: `fresh-${byTrade.id}`, kind: 'fresh', market: byTrade } : null,
      byClose ? { id: `ending-${byClose.id}`, kind: 'ending', market: byClose } : null
    ].filter((item): item is PulseItem => Boolean(item))
  );
}

function pulseLabel(kind: PulseItem['kind'], lang: UiLang) {
  if (kind === 'active') return tr(lang, 'Most active', 'Πιο ενεργή');
  if (kind === 'fresh') return tr(lang, 'Fresh trade', 'Νέα συναλλαγή');
  return tr(lang, 'Closing soon', 'Λήγει σύντομα');
}

function pulseMeta(item: PulseItem, lang: UiLang) {
  if (item.kind === 'active') {
    return tr(lang, `Vol €${formatCompact(item.market.state?.volumeTotal ?? 0, lang)}`, `Όγκος €${formatCompact(item.market.state?.volumeTotal ?? 0, lang)}`);
  }

  if (item.kind === 'fresh' && item.market.state?.lastTradeAt) {
    return tr(
      lang,
      `Trade ${formatRelativeTime(item.market.state.lastTradeAt, lang)}`,
      `Συναλλαγή ${formatRelativeTime(item.market.state.lastTradeAt, lang)}`
    );
  }

  return tr(lang, `Close ${formatRelativeClose(item.market.closeTime, { lang })}`, `Λήξη ${formatRelativeClose(item.market.closeTime, { lang })}`);
}

export function MarketPulsePanel({ markets, lang }: MarketPulsePanelProps) {
  const items = buildPulseItems(markets);

  if (items.length === 0) return null;

  return (
    <aside className="card marketPulsePanel" aria-label={tr(lang, 'Market pulse', 'Παλμός αγοράς')}>
      <div className="marketPulseHead">
        <span className="marketPulseEyebrow">{tr(lang, 'Moving now', 'Κινείται τώρα')}</span>
        <strong>{tr(lang, 'Board pulse', 'Παλμός ταμπλό')}</strong>
      </div>

      <div className="marketPulseList">
        {items.map((item) => {
          const href = marketHref(item.market.slug, lang);
          const yesProb = item.market.state?.yesPrice ?? 0.5;

          return (
            <Link key={item.id} className="marketPulseRow" href={href}>
              <div className="marketPulseCopy">
                <span className="marketPulseKind">{pulseLabel(item.kind, lang)}</span>
                <strong className={lang === 'el' ? 'marketTitleGreek' : undefined}>{item.market.question}</strong>
                <small>{pulseMeta(item, lang)}</small>
              </div>
              <div className="marketPulseSignal">
                <span className="mantis-number">{formatPercent(yesProb)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
