import Link from 'next/link';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeHours } from '@/lib/format';
import { tr, type UiLang } from '@/lib/ui-lang';

type MarketCardProps = {
  market: BoardMarket;
  lang: UiLang;
  featured?: boolean;
};

function labelize(value: string) {
  return value.replace(/[-_]/g, ' ');
}

function statusTone(status: string) {
  if (status === 'open') return 'badgeYes';
  if (status === 'resolved' || status === 'settled') return 'badgeNeutral';
  return 'badgeNo';
}

export function MarketCard({ market, lang, featured = false }: MarketCardProps) {
  const yesProb = market.state?.yesPrice ?? 0.5;
  const href = `/markets/${market.slug}${lang === 'el' ? '?lang=el' : ''}`;

  if (featured) {
    return (
      <article className="card featuredCard featuredCardLarge">
        <div className="featuredTopRow">
          <div className="stackXs">
            <p className="eyebrow">{labelize(market.category)}</p>
            <h2 className="marketQuestion">{market.question}</h2>
          </div>
          <span className="featuredChance">{formatPercent(yesProb)}</span>
        </div>

        <div className="featuredDetailRow">
          {(market.state?.volumeTotal ?? 0) > 0 ? <span>{tr(lang, 'Volume', 'Όγκος')} {formatCompact(market.state?.volumeTotal ?? 0)}</span> : <span>{tr(lang, 'New market', 'Νέα αγορά')}</span>}
          <span>{tr(lang, 'Closes', 'Κλείνει')} {formatRelativeHours(market.closeTime)}</span>
          <span className={statusTone(market.status)}>{market.status}</span>
        </div>

        <div className="buttonRow">
          <Link className="button buttonYes" href={href}>YES</Link>
          <Link className="button buttonNo" href={href}>NO</Link>
        </div>
      </article>
    );
  }

  return (
    <article className="card marketListCard marketCardPoly">
      <div className="marketMetaRow">
        <span className="marketCategory">{labelize(market.category)}</span>
        <span className={statusTone(market.status)}>{market.status}</span>
      </div>

      <h3 className="marketQuestion">
        <Link href={href}>{market.question}</Link>
      </h3>

      <div className="marketBottomRow marketBottomRowTight">
        <div className="probabilityPrimary">{formatPercent(yesProb)}</div>
        <div className="buttonRow marketCardActionRow">
          <Link className="button buttonYes marketMiniButton" href={href}>
            Yes
          </Link>
          <Link className="button buttonNo marketMiniButton" href={href}>
            No
          </Link>
        </div>
      </div>

      <div className="marketMiniMeta">
        {(market.state?.volumeTotal ?? 0) > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} {formatCompact(market.state?.volumeTotal ?? 0)}</span> : <span>{tr(lang, 'New market', 'Νέα αγορά')}</span>}
        <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeHours(market.closeTime)}</span>
      </div>
    </article>
  );
}
