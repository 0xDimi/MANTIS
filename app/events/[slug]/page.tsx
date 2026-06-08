import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { EventTrustPanel } from '@/components/event-trust-panel';
import { MarketCardIcon } from '@/components/market-card-icon';
import { MarketQuotePreviewCard } from '@/components/market-quote-preview-card';
import { loadEventDetail } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent } from '@/lib/format';
import { localizedCategory, localizedOutcomeLabel } from '@/lib/market-copy';
import { resolveServerLang } from '@/lib/ui-lang-server';
import { tr } from '@/lib/ui-lang';

function childHref(eventSlug: string, childMarketId: string, lang: 'en' | 'el', side?: 'yes' | 'no') {
  const params = new URLSearchParams({ child: childMarketId });
  if (lang === 'el') params.set('lang', 'el');
  if (side) params.set('side', side);
  return `/events/${eventSlug}?${params.toString()}`;
}

export default async function EventDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string; child?: string; side?: string; action?: string; amount?: string; sellPreset?: string }>;
}) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const lang = await resolveServerLang({ searchParam: query.lang });
  const { eventDetail, error } = await loadEventDetail(slug, { lang });
  const selectedChild =
    eventDetail?.children.find((child) => child.marketId === query.child) ??
    eventDetail?.children.find((child) => child.status === 'open') ??
    eventDetail?.children[0] ??
    null;

  return (
    <AlphaShell title={eventDetail?.event.title ?? tr(lang, 'Grouped event', 'Ομαδοποιημένο γεγονός')} lang={lang} showIntro={false}>
      <div className="buttonRow">
        <Link className="button buttonGhost" href={lang === 'el' ? '/markets?lang=el' : '/markets'}>
          {tr(lang, 'Back to markets', 'Επιστροφή στις αγορές')}
        </Link>
      </div>

      {error ? <div className="notice noticeError">{tr(lang, 'Event data unavailable', 'Τα δεδομένα γεγονότος δεν είναι διαθέσιμα')}: {error}</div> : null}

      {eventDetail ? (
        <section className="eventDetailGrid">
          <article className="marketHeroMain eventDetailMain">
            <header className="detailHeroHeader">
              <MarketCardIcon item={eventDetail.event} size={60} className="detailHeroIcon" />
              <div className="detailHeroHeaderCopy">
                <p className="eyebrow">{localizedCategory(eventDetail.event.category, lang)}</p>
                <h1 className="marketTitle">{eventDetail.event.title}</h1>
                {eventDetail.event.subtitle ? <p className="marketContextLine">{eventDetail.event.subtitle}</p> : null}
              </div>
            </header>

            <div className="detailHeroBody">
              <section className="eventOutcomeTable" aria-label={tr(lang, 'Event markets', 'Αγορές γεγονότος')}>
                {eventDetail.children.map((child) => {
                  const selected = selectedChild?.marketId === child.marketId;
                  return (
                    <div
                      className={selected ? 'eventOutcomeRow eventOutcomeRowSelected' : 'eventOutcomeRow'}
                      key={child.outcomeId}
                    >
                      <div className="eventOutcomeCopy">
                        <Link className="eventOutcomeTitleLink" href={childHref(eventDetail.event.slug, child.marketId, lang)}>
                          {child.label}
                        </Link>
                        <span>
                          {lang === 'el'
                            ? `${tr(lang, 'Όγκος', 'Όγκος')} €${formatCompact(child.volumeTotal, lang)}`
                            : `€${formatCompact(child.volumeTotal, lang)} ${tr(lang, 'Vol.', 'Όγκος')}`}
                        </span>
                      </div>

                      <div className="eventOutcomeChance">
                        <strong>{formatPercent(child.yesPrice)}</strong>
                      </div>

                      <div className="buttonRow eventOutcomeTradeButtons">
                        <Link className="button buttonYes eventMarketButton eventOutcomeTradeButton" href={childHref(eventDetail.event.slug, child.marketId, lang, 'yes')}>
                          <span>{tr(lang, 'Yes', 'Ναι')}</span>
                          <strong>{Math.round(child.yesPrice * 100)}¢</strong>
                        </Link>
                        <Link className="button buttonNo eventMarketButton eventOutcomeTradeButton" href={childHref(eventDetail.event.slug, child.marketId, lang, 'no')}>
                          <span>{tr(lang, 'No', 'Όχι')}</span>
                          <strong>{Math.round(child.noPrice * 100)}¢</strong>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </section>

              <EventTrustPanel
                lang={lang}
                closeTime={eventDetail.event.closeTime}
                determinationTime={eventDetail.event.determinationTime}
                sourcePrimary={eventDetail.event.sourcePrimary}
                sourceFallback={eventDetail.event.sourceFallback}
                resolutionRule={eventDetail.event.resolutionRule}
                voidRule={eventDetail.event.voidRule}
                status={eventDetail.event.status}
                childCount={eventDetail.aggregate.childCount}
                updatedAt={eventDetail.serverTime}
              />
            </div>
          </article>

          <aside className="marketTicketCard eventTicketCard" id="trade-ticket">
            {selectedChild ? (
              <>
                <div className="eventSelectedChild">
                  <span>{tr(lang, 'Selected market', 'Επιλεγμένη αγορά')}</span>
                  <strong>{selectedChild.label}</strong>
                  <p>{tr(lang, 'Part of', 'Μέρος του')}: {eventDetail.event.title}</p>
                </div>
                <MarketQuotePreviewCard
                  marketId={selectedChild.marketId}
                  marketSlug={selectedChild.slug}
                  marketStatus={selectedChild.status}
                  closeTime={selectedChild.closeTime}
                  yesLabel={localizedOutcomeLabel('yes', 'yes', lang)}
                  noLabel={localizedOutcomeLabel('no', 'no', lang)}
                  lang={lang}
                  prefillAction={query.action}
                  prefillSide={query.side}
                  prefillAmount={query.amount}
                  prefillSellPreset={query.sellPreset}
                />
              </>
            ) : (
              <div className="notice">{tr(lang, 'No tradable child markets found.', 'Δεν βρέθηκαν επιμέρους αγορές για συναλλαγή.')}</div>
            )}
          </aside>
        </section>
      ) : (
        <section className="card stackSm">
          <h2>{tr(lang, 'Grouped event not found', 'Το ομαδοποιημένο γεγονός δεν βρέθηκε')}</h2>
        </section>
      )}
    </AlphaShell>
  );
}
