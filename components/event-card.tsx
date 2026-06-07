import Link from 'next/link';
import { MarketCardIcon } from '@/components/market-card-icon';
import type { EventCardRead } from '@/lib/event-read-model';
import { formatCompact, formatRelativeClose } from '@/lib/format';
import { localizedCategory } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type EventCardProps = {
  event: EventCardRead;
  lang: UiLang;
};

function eventHref(slug: string, lang: UiLang) {
  return `/events/${slug}${lang === 'el' ? '?lang=el' : ''}`;
}

function eventChildHref(eventSlug: string, childMarketId: string, lang: UiLang, side?: 'yes' | 'no') {
  const params = new URLSearchParams();
  params.set('child', childMarketId);
  if (lang === 'el') params.set('lang', 'el');
  if (side) params.set('side', side);

  const query = params.toString();
  return `/events/${eventSlug}?${query}`;
}

export function EventCard({ event, lang }: EventCardProps) {
  const href = eventHref(event.slug, lang);
  const visibleChildren = event.topChildren.slice(0, 2);

  return (
    <article className="card marketListCard marketCardPoly eventMarketCard">
      <Link className="marketCardHitArea" href={href} aria-label={event.title} />

      <div className="marketCardContent">
        <div className="marketCardHeader">
          <MarketCardIcon item={event} size={44} />
          <div className="marketCardHeading">
            <h3 className="marketQuestion">
              <Link className="marketTitleLink" href={href}>{event.title}</Link>
            </h3>
            <div className="marketCardInlineMeta">
              <span className="marketCardInlineLabel">{localizedCategory(event.category, lang)}</span>
            </div>
          </div>
        </div>

        <div className="eventMarketRows">
          {visibleChildren.map((child) => (
            <div className="eventMarketRow" key={child.marketId}>
              <Link className="eventMarketLabel" href={eventChildHref(event.slug, child.marketId, lang)}>
                <span className="eventMarketLabelText">{child.label}</span>
                <span
                  className="eventMarketOddsLine"
                  style={{ width: `${Math.max(12, Math.round(child.yesPrice * 100))}%` }}
                />
              </Link>
              <div className="buttonRow eventMarketActions">
                <Link className="button buttonYes eventMarketButton" href={eventChildHref(event.slug, child.marketId, lang, 'yes')}>
                  <span>{tr(lang, 'Yes', 'Ναι')}</span>
                  <strong>{Math.round(child.yesPrice * 100)}¢</strong>
                </Link>
                <Link className="button buttonNo eventMarketButton" href={eventChildHref(event.slug, child.marketId, lang, 'no')}>
                  <span>{tr(lang, 'No', 'Όχι')}</span>
                  <strong>{Math.round(child.noPrice * 100)}¢</strong>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="marketMiniMeta">
          {event.childCount > visibleChildren.length ? (
            <span className="marketMiniMetaStrong">
              {tr(lang, `+${event.childCount - visibleChildren.length} more outcomes`, `+${event.childCount - visibleChildren.length} ακόμα εκβάσεις`)}
            </span>
          ) : null}
          {event.volumeTotal > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(event.volumeTotal, lang)}</span> : null}
          <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeClose(event.closeTime, { lang })}</span>
        </div>
      </div>
    </article>
  );
}
