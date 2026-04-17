import Link from 'next/link';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeClose, formatRelativeTime } from '@/lib/format';
import { localizedCategory, localizedMarketStatus, localizedOutcomeLabel } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type MarketCardProps = {
  market: BoardMarket;
  lang: UiLang;
};

function statusTone(status: string) {
  if (status === 'open') return 'badgeYes';
  if (status === 'resolved' || status === 'settled') return 'badgeNeutral';
  return 'badgeNo';
}

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
        <div className="marketMetaRow marketMetaRowTight">
          <span className="marketCategory">{localizedCategory(market.category, lang)}</span>
          <span className={statusTone(market.status)}>{localizedMarketStatus(market.status, lang)}</span>
        </div>

        <h3 className="marketQuestion">
          <Link className="marketTitleLink" href={href}>{market.question}</Link>
        </h3>

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

        <div className="marketMiniMeta">
          {volume > 0 ? <span className="marketMiniMetaStrong">{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(volume, lang)}</span> : null}
          <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeClose(market.closeTime, { lang })}</span>
          {market.state?.lastTradeAt ? <span>{tr(lang, 'Last trade', 'Τελευταία συναλλαγή')} {formatRelativeTime(market.state.lastTradeAt, lang)}</span> : null}
        </div>
      </div>
    </article>
  );
}
