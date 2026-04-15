import Link from 'next/link';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeHours } from '@/lib/format';
import { tr, type UiLang } from '@/lib/ui-lang';

type FeaturedMarketCardProps = {
  market: BoardMarket;
  lang: UiLang;
  lead?: boolean;
};

function labelize(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1));
}

function statusTone(status: string) {
  if (status === 'open') return 'badgeYes';
  if (status === 'resolved' || status === 'settled') return 'badgeNeutral';
  return 'badgeNo';
}

function statusLabel(status: string, lang: UiLang) {
  switch (status) {
    case 'open':
      return tr(lang, 'Open', 'Ανοιχτή');
    case 'draft':
      return tr(lang, 'Draft', 'Πρόχειρη');
    case 'resolved':
      return tr(lang, 'Resolved', 'Επιλυμένη');
    case 'settled':
      return tr(lang, 'Settled', 'Διακανονισμένη');
    case 'void':
      return 'VOID';
    case 'closed':
      return tr(lang, 'Closed', 'Κλειστή');
    case 'paused':
      return tr(lang, 'Paused', 'Σε παύση');
    default:
      return labelize(status);
  }
}

function marketHref(slug: string, lang: UiLang, side?: 'yes' | 'no') {
  const params = new URLSearchParams();
  if (lang === 'el') params.set('lang', 'el');
  if (side) params.set('side', side);

  const query = params.toString();
  return `/markets/${slug}${query ? `?${query}` : ''}`;
}

export function FeaturedMarketCard({ market, lang, lead = false }: FeaturedMarketCardProps) {
  const yesProb = market.state?.yesPrice ?? 0.5;
  const noProb = market.state?.noPrice ?? 1 - yesProb;
  const yesCents = Math.round(yesProb * 100);
  const noCents = Math.round(noProb * 100);
  const href = marketHref(market.slug, lang);
  const volume = market.state?.volumeTotal ?? 0;

  return (
    <article className={`card featuredDistinctCard${lead ? ' featuredDistinctLead' : ''}`}>
      <Link className="marketCardHitArea" href={href} aria-label={market.question} />

      <div className="featuredDistinctShell">
        <div className="featuredDistinctTop">
          <span className="marketCategory">{labelize(market.category)}</span>
          <span className={statusTone(market.status)}>{statusLabel(market.status, lang)}</span>
        </div>

        <h2 className="featuredDistinctTitle">
          <Link className="marketTitleLink" href={href}>{market.question}</Link>
        </h2>

        <div className="featuredDistinctSignal">
          <div className="featuredDistinctForecast">
            <span className="featuredDistinctForecastLabel">{tr(lang, 'Forecast', 'Πρόβλεψη')}</span>
            <strong className="featuredDistinctForecastValue">{formatPercent(yesProb)}</strong>
          </div>
          <div className="featuredDistinctTrack" aria-hidden="true">
            <span style={{ width: `${Math.round(yesProb * 100)}%` }} />
          </div>
        </div>

        <p className="featuredDistinctMeta">
          {volume > 0 ? `${tr(lang, 'Vol', 'Όγκος')} €${formatCompact(volume)}` : tr(lang, 'New market', 'Νέα αγορά')}
          {' · '}
          {tr(lang, 'Close', 'Λήξη')} {formatRelativeHours(market.closeTime)}
          {market.state?.lastTradeAt ? ` · ${tr(lang, 'Trade', 'Συναλλαγή')} ${formatRelativeHours(market.state.lastTradeAt)}` : ''}
        </p>

        <div className="featuredDistinctActions">
          <Link className="button buttonYes featuredActionBtn" href={marketHref(market.slug, lang, 'yes')}>
            <span>YES</span>
            <strong>{yesCents}¢</strong>
          </Link>
          <Link className="button buttonNo featuredActionBtn" href={marketHref(market.slug, lang, 'no')}>
            <span>NO</span>
            <strong>{noCents}¢</strong>
          </Link>
        </div>
      </div>

      <span className="featuredMantisMark" aria-hidden="true">MANTIS</span>
    </article>
  );
}
