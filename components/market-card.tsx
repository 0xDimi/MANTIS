import Link from 'next/link';
import { MarketCardIcon } from '@/components/market-card-icon';
import { ProbabilityRail } from '@/components/probability-rail';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeClose, formatRelativeTime } from '@/lib/format';
import { localizedCategory, localizedOutcomeLabel } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type MarketCardProps = {
  market: BoardMarket;
  lang: UiLang;
};

function marketHref(slug: string, lang: UiLang, side?: 'yes' | 'no') {
  const params = new URLSearchParams();
  if (lang === 'el') params.set('lang', 'el');
  if (side) params.set('side', side);

  const query = params.toString();
  return `/markets/${slug}${query ? `?${query}` : ''}`;
}

export function MarketCard({ market, lang }: MarketCardProps) {
  const yesProb = market.state?.yesPrice ?? 0.5;
  const noProb = market.state?.noPrice ?? 1 - yesProb;
  const yesCents = Math.round(yesProb * 100);
  const noCents = Math.round(noProb * 100);
  const href = marketHref(market.slug, lang);
  const isMuted = market.status !== 'open';
  const volume = market.state?.volumeTotal ?? 0;
  const yesLabel = localizedOutcomeLabel('yes', 'yes', lang);
  const noLabel = localizedOutcomeLabel('no', 'no', lang);

  return (
    <article className={`card marketListCard marketCardPoly${isMuted ? ' marketCardMuted' : ''}`}>
      <Link className="marketCardHitArea" href={href} aria-label={market.question} />

      <div className="marketCardContent">
        <div className="marketCardHeader">
          <MarketCardIcon item={market} size={44} />
          <div className="marketCardHeading">
            <h3 className="marketQuestion">
              <Link className="marketTitleLink" href={href}>{market.question}</Link>
            </h3>
            <div className="marketCardInlineMeta">
              <span className="marketCardInlineLabel">{localizedCategory(market.category, lang)}</span>
            </div>
          </div>
        </div>

        <div className="marketBottomRow marketBottomRowTight">
          <div className="probabilityPrimary">{formatPercent(yesProb)}</div>
          <div className="buttonRow marketCardActionRow">
            <Link className="button buttonYes marketMiniButton" href={marketHref(market.slug, lang, 'yes')}>
              <span>{yesLabel}</span>
              <strong>{yesCents}¢</strong>
            </Link>
            <Link className="button buttonNo marketMiniButton" href={marketHref(market.slug, lang, 'no')}>
              <span>{noLabel}</span>
              <strong>{noCents}¢</strong>
            </Link>
          </div>
        </div>

        <ProbabilityRail
          yesProbability={yesProb}
          volume={volume}
          status={market.status}
          showTicks
          size="sm"
          locale={lang}
          className="marketCardRail"
        />

        <div className="marketMiniMeta">
          {volume > 0 ? <span className="marketMiniMetaStrong">{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(volume, lang)}</span> : null}
          <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeClose(market.closeTime, { lang })}</span>
          {market.state?.lastTradeAt ? <span>{tr(lang, 'Last trade', 'Τελευταία συναλλαγή')} {formatRelativeTime(market.state.lastTradeAt, lang)}</span> : null}
        </div>
      </div>
    </article>
  );
}
