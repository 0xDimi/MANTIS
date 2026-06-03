import Link from 'next/link';
import { statusTone } from '@/components/market-card-shared';
import type { EventCardRead } from '@/lib/event-read-model';
import { formatCompact, formatRelativeClose } from '@/lib/format';
import { localizedCategory, localizedMarketStatus } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type EventCardProps = {
  event: EventCardRead;
  lang: UiLang;
};

function eventHref(slug: string, lang: UiLang) {
  return `/events/${slug}${lang === 'el' ? '?lang=el' : ''}`;
}

export function EventCard({ event, lang }: EventCardProps) {
  const href = eventHref(event.slug, lang);
  const visibleChildren = event.topChildren.slice(0, 3);

  return (
    <article className="card marketListCard marketCardPoly eventMarketCard groupedEventCard">
      <Link className="marketCardHitArea" href={href} aria-label={event.title} />

      <div className="marketCardContent">
        <div className="marketMetaRow marketMetaRowTight">
          <span className="marketCategory">{localizedCategory(event.category, lang)}</span>
          <span className={statusTone(event.status)}>{localizedMarketStatus(event.status, lang)}</span>
          <span className="groupedEventBadge">{tr(lang, 'Independent cluster', 'Ανεξάρτητο cluster')}</span>
        </div>

        <h3 className={`marketQuestion groupedEventTitle${lang === 'el' ? ' marketTitleGreek' : ''}`}>
          <Link className="marketTitleLink" href={href}>{event.title}</Link>
        </h3>

        <p className="groupedEventHint">
          {tr(
            lang,
            'Each row is a separate YES/NO market. Multiple rows can resolve YES.',
            'Κάθε γραμμή είναι ξεχωριστή αγορά ΝΑΙ/ΟΧΙ. Πολλαπλές γραμμές μπορούν να κλείσουν στο ΝΑΙ.'
          )}
        </p>

        <div className="eventMarketRows">
          {visibleChildren.map((child) => (
            <div className="eventMarketRow eventMarketRowLink" key={child.marketId}>
              <div className="eventMarketRowCopy">
                <strong className="eventMarketLabel">{child.label}</strong>
                <small className="eventMarketRowMeta">
                  {tr(lang, 'YES', 'ΝΑΙ')} {Math.round(child.yesPrice * 100)}¢ · {tr(lang, 'NO', 'ΟΧΙ')} {Math.round(child.noPrice * 100)}¢
                </small>
              </div>
              <div className="marketPricePair eventMarketPricePair" aria-hidden="true">
                <span className="marketPriceChip marketPriceChipYes">
                  <em>{tr(lang, 'YES', 'ΝΑΙ')}</em>
                  <strong className="mantis-number">{Math.round(child.yesPrice * 100)}¢</strong>
                </span>
                <span className="marketPriceChip marketPriceChipNo">
                  <em>{tr(lang, 'NO', 'ΟΧΙ')}</em>
                  <strong className="mantis-number">{Math.round(child.noPrice * 100)}¢</strong>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="marketMiniMeta groupedEventMeta">
          {event.childCount > visibleChildren.length ? (
            <span className="marketMiniMetaStrong">
              {tr(lang, `+${event.childCount - visibleChildren.length} more markets`, `+${event.childCount - visibleChildren.length} ακόμα αγορές`)}
            </span>
          ) : null}
          {event.volumeTotal > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(event.volumeTotal, lang)}</span> : null}
          <span>{tr(lang, 'Live rows', 'Live γραμμές')} {event.activeChildCount}/{event.childCount}</span>
          <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeClose(event.closeTime, { lang })}</span>
        </div>

        <div className="groupedEventFoot">
          <span>{tr(lang, 'Open cluster', 'Άνοιγμα cluster')}</span>
        </div>
      </div>
    </article>
  );
}
