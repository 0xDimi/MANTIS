import Link from 'next/link';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeHours } from '@/lib/format';
import { tr, type UiLang } from '@/lib/ui-lang';

export type DiscoverMarket = BoardMarket & { previewOnly?: boolean };

type MarketCardProps = {
  market: DiscoverMarket;
  lang: UiLang;
  featured?: boolean;
};

function labelize(value: string) {
  return value.replace(/[-_]/g, ' ');
}

export function MarketCard({ market, lang, featured = false }: MarketCardProps) {
  const yesProb = market.state?.yesPrice ?? 0.5;
  const yesNoSpread = Math.abs((market.state?.yesPrice ?? 0.5) - (market.state?.noPrice ?? 0.5));
  const marketHref = `/markets/${market.slug}${lang === 'el' ? '?lang=el' : ''}`;

  if (featured) {
    return (
      <article className="card featuredCard">
        <div className="featuredTopRow">
          <p className="eyebrow">{labelize(market.category)}</p>
          <span className="featuredChance">{formatPercent(yesProb)}</span>
        </div>

        <h2 className="marketQuestion">{market.question}</h2>

        <div className="marketMiniMeta">
          <span>
            {tr(lang, 'Volume', 'Όγκος')} {formatCompact(market.state?.volumeTotal ?? 0)}
          </span>
          <span>
            {tr(lang, 'Closes', 'Κλείνει')} {formatRelativeHours(market.closeTime)}
          </span>
        </div>

        {market.previewOnly ? (
          <span className="button buttonGhost">{tr(lang, 'Design preview', 'Προεπισκόπηση σχεδίασης')}</span>
        ) : (
          <Link className="button buttonPrimary" href={marketHref}>
            {tr(lang, 'Open market', 'Άνοιγμα αγοράς')}
          </Link>
        )}
      </article>
    );
  }

  const body = (
    <>
      <div className="marketMetaRow">
        <span className="marketCategory">{labelize(market.category)}</span>
        <span className="marketClose">{formatRelativeHours(market.closeTime)}</span>
      </div>

      <h3 className="marketQuestion">{market.question}</h3>

      <div className="marketBottomRow">
        <div className="probabilityPrimary">{formatPercent(yesProb)}</div>
        <div className="marketMiniMeta">
          <span>
            {tr(lang, 'Vol', 'Όγκος')} {formatCompact(market.state?.volumeTotal ?? 0)}
          </span>
          <span>
            {tr(lang, 'Move', 'Κίνηση')} {formatPercent(yesNoSpread)}
          </span>
          {market.previewOnly ? <span>{tr(lang, 'Preview only', 'Μόνο προεπισκόπηση')}</span> : null}
        </div>
      </div>
    </>
  );

  if (market.previewOnly) {
    return <article className="card marketListCard">{body}</article>;
  }

  return (
    <Link className="card marketListCard" href={marketHref}>
      {body}
    </Link>
  );
}
