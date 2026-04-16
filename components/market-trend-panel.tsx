import { formatCompact, formatPercent } from '@/lib/format';
import { tr, type UiLang } from '@/lib/ui-lang';

type MarketTrendPanelProps = {
  slug: string;
  yesPrice: number;
  noPrice: number;
  volumeTotal: number;
  liquidity: number;
  participants: number;
  lang: UiLang;
};

function hashSeed(value: string) {
  let seed = 0;

  for (let i = 0; i < value.length; i += 1) {
    seed = (seed * 31 + value.charCodeAt(i)) % 9973;
  }

  return seed;
}

function buildSeries(seed: number, anchor: number, points = 18) {
  const series: number[] = [];
  let current = Math.max(0.12, Math.min(0.88, anchor - 0.12));

  for (let index = 0; index < points; index += 1) {
    const wiggle = (((seed + index * 17) % 11) - 5) * 0.0075;
    const drift = (anchor - current) * 0.25;
    current = Math.max(0.08, Math.min(0.92, current + wiggle + drift));
    series.push(current);
  }

  series[series.length - 1] = anchor;
  return series;
}

function toPath(values: number[]) {
  if (!values.length) return '';

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = (1 - value) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function MarketTrendPanel({ slug, yesPrice, noPrice, volumeTotal, liquidity, participants, lang }: MarketTrendPanelProps) {
  const seed = hashSeed(slug);
  const series = buildSeries(seed, Math.max(0.08, Math.min(0.92, yesPrice || 0.5)));
  const changePp = (series[series.length - 1] - series[0]) * 100;
  const changeLabel = `${changePp >= 0 ? '+' : ''}${changePp.toFixed(1)}pp`;

  return (
    <section className="marketTrendPanel">
      <div className="marketTrendHead">
        <div>
          <p className="marketTrendLabel">{tr(lang, 'Live YES chance', 'Ζωντανή πιθανότητα YES')}</p>
          <p className="marketTrendValue">{formatPercent(yesPrice)}</p>
        </div>
        <div className={changePp >= 0 ? 'marketTrendDelta marketTrendDeltaUp' : 'marketTrendDelta marketTrendDeltaDown'}>{changeLabel}</div>
      </div>

      <div className="marketTrendLine" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mantisTrend" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(34,197,94,0.88)" />
              <stop offset="100%" stopColor="rgba(124,92,255,0.78)" />
            </linearGradient>
          </defs>
          <path d={toPath(series)} stroke="url(#mantisTrend)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
        <div className="marketTrendAxisY">
          <span>80%</span>
          <span>50%</span>
          <span>20%</span>
        </div>
        <div className="marketTrendAxisX">
          <span>{tr(lang, '24h ago', '24ω πριν')}</span>
          <span>{tr(lang, 'Now', 'Τώρα')}</span>
        </div>
      </div>

      <div className="marketTrendMeta">
        <span>{tr(lang, 'NO chance', 'Πιθανότητα NO')} {formatPercent(noPrice)}</span>
        <span>{tr(lang, 'Volume', 'Όγκος')} €{formatCompact(volumeTotal)}</span>
        <span>{tr(lang, 'Liquidity', 'Ρευστότητα')} €{formatCompact(liquidity)}</span>
        <span>{tr(lang, 'Participants', 'Συμμετέχοντες')} {participants}</span>
      </div>
    </section>
  );
}
