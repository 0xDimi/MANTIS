import Link from 'next/link';
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

function priceCents(value: number) {
  return `${Math.round(value * 100)}¢`;
}

export function EventCard({ event, lang }: EventCardProps) {
  const href = eventHref(event.slug, lang);

  return (
    <article className="card marketListCard eventCard">
      <Link className="marketCardHitArea" href={href} aria-label={event.title} />

      <div className="marketCardContent">
        <div className="marketMetaRow marketMetaRowTight">
          <span className="marketCategory">{localizedCategory(event.category, lang)}</span>
          <span className="badgeNeutral">{tr(lang, 'Grouped YES/NO', 'Ομαδοποιημένο ΝΑΙ/ΟΧΙ')}</span>
          <span className={event.status === 'open' ? 'badgeYes' : 'badgeNo'}>{localizedMarketStatus(event.status, lang)}</span>
        </div>

        <h3 className="marketQuestion">
          <Link className="marketTitleLink" href={href}>{event.title}</Link>
        </h3>

        {event.subtitle ? <p className="subtle eventCardSubtitle">{event.subtitle}</p> : null}

        <div className="eventOutcomePreview">
          {event.topChildren.slice(0, 4).map((child) => (
            <div className="eventOutcomePreviewRow" key={child.marketId}>
              <span>{child.label}</span>
              <strong>{priceCents(child.yesPrice)} {tr(lang, 'YES', 'ΝΑΙ')}</strong>
            </div>
          ))}
          {event.childCount > event.topChildren.length ? (
            <div className="eventOutcomePreviewRow eventOutcomePreviewMore">
              <span>{tr(lang, `+${event.childCount - event.topChildren.length} more`, `+${event.childCount - event.topChildren.length} ακόμα`)}</span>
            </div>
          ) : null}
        </div>

        <div className="marketMiniMeta">
          <span>{tr(lang, 'Multiple can resolve YES', 'Πολλά μπορούν να κλείσουν ΝΑΙ')}</span>
          <span>{event.childCount} {tr(lang, 'markets', 'αγορές')}</span>
          {event.volumeTotal > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(event.volumeTotal, lang)}</span> : null}
          <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeClose(event.closeTime, { lang })}</span>
        </div>
      </div>
    </article>
  );
}
