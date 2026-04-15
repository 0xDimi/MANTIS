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

export function MarketCard({ market, lang, featured = false }: MarketCardProps) {
  const yesProb = market.state?.yesPrice ?? 0.5;
  const noProb = market.state?.noPrice ?? 1 - yesProb;
  const yesCents = Math.round(yesProb * 100);
  const noCents = Math.round(noProb * 100);
  const href = marketHref(market.slug, lang);
  const isMuted = market.status !== 'open';
  const volume = market.state?.volumeTotal ?? 0;

  if (featured) {
    return (
      <article className={`card featuredCard featuredCardLead${isMuted ? ' marketCardMuted' : ''}`}>
        <Link className="marketCardHitArea" href={href} aria-label={market.question} />

        <div className="marketCardContent">
          <div className="featuredTopRow">
            <span className="marketCategory">{labelize(market.category)}</span>
            <span className={statusTone(market.status)}>{statusLabel(market.status, lang)}</span>
          </div>

          <h2 className="marketQuestion marketQuestionLead">
            <Link className="marketTitleLink" href={href}>
              {market.question}
            </Link>
          </h2>

          <div className="featuredBottomRow">
            <div className="probabilityPrimary probabilityPrimaryLead">{formatPercent(yesProb)}</div>
            <div className="buttonRow marketCardActionRow">
              <Link className="button buttonYes marketMiniButton" href={marketHref(market.slug, lang, 'yes')}>
                <span>YES</span>
                <strong>{yesCents}¢</strong>
              </Link>
              <Link className="button buttonNo marketMiniButton" href={marketHref(market.slug, lang, 'no')}>
                <span>NO</span>
                <strong>{noCents}¢</strong>
              </Link>
            </div>
          </div>

          <div className="marketMiniMeta">
            {volume > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(volume)}</span> : <span>{tr(lang, 'New market', 'Νέα αγορά')}</span>}
            <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeHours(market.closeTime)}</span>
            {market.state?.lastTradeAt ? <span>{tr(lang, 'Trade', 'Συναλλαγή')} {formatRelativeHours(market.state.lastTradeAt)}</span> : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`card marketListCard marketCardPoly${isMuted ? ' marketCardMuted' : ''}`}>
      <Link className="marketCardHitArea" href={href} aria-label={market.question} />

      <div className="marketCardContent">
        <div className="marketMetaRow">
          <span className="marketCategory">{labelize(market.category)}</span>
          <span className={statusTone(market.status)}>{statusLabel(market.status, lang)}</span>
        </div>

        <h3 className="marketQuestion">
          <Link className="marketTitleLink" href={href}>{market.question}</Link>
        </h3>

        <div className="marketBottomRow marketBottomRowTight">
          <div className="probabilityPrimary">{formatPercent(yesProb)}</div>
          <div className="buttonRow marketCardActionRow">
            <Link className="button buttonYes marketMiniButton" href={marketHref(market.slug, lang, 'yes')}>
              <span>YES</span>
              <strong>{yesCents}¢</strong>
            </Link>
            <Link className="button buttonNo marketMiniButton" href={marketHref(market.slug, lang, 'no')}>
              <span>NO</span>
              <strong>{noCents}¢</strong>
            </Link>
          </div>
        </div>

        <div className="marketMiniMeta">
          {volume > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(volume)}</span> : <span>{tr(lang, 'New market', 'Νέα αγορά')}</span>}
          <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeHours(market.closeTime)}</span>
          {market.state?.lastTradeAt ? <span>{tr(lang, 'Trade', 'Συναλλαγή')} {formatRelativeHours(market.state.lastTradeAt)}</span> : null}
        </div>
      </div>
    </article>
  );
}
