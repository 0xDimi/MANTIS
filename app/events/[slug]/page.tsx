import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { MarketQuotePreviewCard } from '@/components/market-quote-preview-card';
import { loadEventDetail } from '@/lib/alpha-read-model';
import { formatCompact, formatDateTime, formatPercent, formatRelativeClose } from '@/lib/format';
import { localizedCategory, localizedMarketStatus, localizedOutcomeLabel } from '@/lib/market-copy';
import { resolveServerLang } from '@/lib/ui-lang-server';
import { tr } from '@/lib/ui-lang';

function childHref(eventSlug: string, childMarketId: string, lang: 'en' | 'el') {
  const params = new URLSearchParams({ child: childMarketId });
  if (lang === 'el') params.set('lang', 'el');
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
            <p className="eyebrow">{localizedCategory(eventDetail.event.category, lang)}</p>
            <h1 className="marketTitle">{eventDetail.event.title}</h1>
            {eventDetail.event.subtitle ? <p className="marketContextLine">{eventDetail.event.subtitle}</p> : null}

            <div className="notice eventEducationNotice">
              <strong>{tr(lang, 'Multiple markets can resolve YES.', 'Περισσότερες από μία αγορές μπορούν να κλείσουν στο ΝΑΙ.')}</strong>{' '}
              {tr(
                lang,
                'Each row is a separate YES/NO market with its own price.',
                'Κάθε γραμμή είναι ξεχωριστή αγορά ΝΑΙ/ΟΧΙ με δική της τιμή.'
              )}
            </div>

            <section className="marketMetaStrip">
              <div className="marketMetaItem">
                <span>{tr(lang, 'Trading closes', 'Λήξη διαπραγμάτευσης')}</span>
                <strong>{formatDateTime(eventDetail.event.closeTime, lang)} ({formatRelativeClose(eventDetail.event.closeTime, { lang })})</strong>
              </div>
              <div className="marketMetaItem">
                <span>{tr(lang, 'Event status', 'Κατάσταση γεγονότος')}</span>
                <strong>{localizedMarketStatus(eventDetail.event.status, lang, 'long')}</strong>
              </div>
              <div className="marketMetaItem">
                <span>{tr(lang, 'Child markets', 'Επιμέρους αγορές')}</span>
                <strong>{eventDetail.aggregate.childCount}</strong>
              </div>
              <div className="marketMetaItem">
                <span>{tr(lang, 'Expected YES count', 'Αναμενόμενα ΝΑΙ')}</span>
                <strong>{eventDetail.aggregate.expectedYesCount.toFixed(2)}</strong>
              </div>
            </section>

            <section className="eventOutcomeTable" aria-label={tr(lang, 'Event markets', 'Αγορές γεγονότος')}>
              {eventDetail.children.map((child) => {
                const selected = selectedChild?.marketId === child.marketId;
                return (
                  <Link
                    className={selected ? 'eventOutcomeRow eventOutcomeRowSelected' : 'eventOutcomeRow'}
                    href={childHref(eventDetail.event.slug, child.marketId, lang)}
                    key={child.outcomeId}
                  >
                    <div className="eventOutcomeCopy">
                      <strong>{child.label}</strong>
                      <span>{child.childQuestion}</span>
                    </div>
                    <div className="eventOutcomeStats">
                      <strong>{formatPercent(child.yesPrice)} {tr(lang, 'YES', 'ΝΑΙ')}</strong>
                      <span>{formatPercent(child.noPrice)} {tr(lang, 'NO', 'ΟΧΙ')}</span>
                    </div>
                    <div className="eventOutcomeMeta">
                      <span>{localizedMarketStatus(child.status, lang)}</span>
                      {child.volumeTotal > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(child.volumeTotal, lang)}</span> : null}
                    </div>
                  </Link>
                );
              })}
            </section>

            <section className="card eventRulesPanel">
              <p className="eyebrow">{tr(lang, 'Rules', 'Κανόνες')}</p>
              <h2>{tr(lang, 'How this grouped event resolves', 'Πώς επιλύεται αυτό το γεγονός')}</h2>
              {eventDetail.event.description ? <p>{eventDetail.event.description}</p> : null}
              <div className="marketMetaStrip">
                <div className="marketMetaItem">
                  <span>{tr(lang, 'Primary source', 'Κύρια πηγή')}</span>
                  <strong>{eventDetail.event.sourcePrimary}</strong>
                </div>
                <div className="marketMetaItem">
                  <span>{tr(lang, 'Resolution rule', 'Κανόνας επίλυσης')}</span>
                  <strong>{eventDetail.event.resolutionRule}</strong>
                </div>
                <div className="marketMetaItem">
                  <span>{tr(lang, 'Void rule', 'Κανόνας ακύρωσης')}</span>
                  <strong>{eventDetail.event.voidRule}</strong>
                </div>
              </div>
            </section>
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
