import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { formatDateTime, formatRelativeClose } from '@/lib/format';
import { loadNotificationsFeed } from '@/lib/notifications';
import { normalizeLang, tr, type UiLang } from '@/lib/ui-lang';

function eventLabel(status: string, lang: UiLang) {
  if (status === 'closed') return tr(lang, 'Market closed', 'Η αγορά έκλεισε');
  if (status === 'resolved') return tr(lang, 'Resolution posted', 'Η επίλυση δημοσιεύτηκε');
  if (status === 'settled') return tr(lang, 'Settlement completed', 'Ο διακανονισμός ολοκληρώθηκε');

  return tr(lang, 'Market update', 'Ενημέρωση αγοράς');
}

export default async function NotificationsPage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const lang = normalizeLang(params.lang);
  const { closingSoon, recentEvents, error } = await loadNotificationsFeed();

  return (
    <AlphaShell title={tr(lang, 'Notifications', 'Ειδοποιήσεις')} eyebrow={tr(lang, 'Reminders and market lifecycle updates', 'Υπενθυμίσεις και ενημερώσεις κύκλου ζωής αγορών')} lang={lang}>
      {error ? <div className="notice noticeWarn">{tr(lang, 'Notification feed partially unavailable', 'Το feed ειδοποιήσεων είναι μερικώς μη διαθέσιμο')}: {error}</div> : null}

      <section className="stackMd">
        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'Closing soon', 'Λήγουν σύντομα')}</p>
          <div className="stackSm">
            {closingSoon.map((item) => (
              <Link key={item.id} href={`/markets/${item.slug}${lang === 'el' ? '?lang=el' : ''}`} className="panelBlock">
                <div className="statusRow statusRowStart">
                  <strong>{item.question}</strong>
                  <span className="badgeNeutral">{formatRelativeClose(item.close_time, { calendarAfterDays: 7 })}</span>
                </div>
                <p className="subtle">{tr(lang, 'Closes', 'Κλείνει')} {formatDateTime(item.close_time)}</p>
              </Link>
            ))}
            {closingSoon.length === 0 ? <p className="subtle">{tr(lang, 'No markets closing in the next 6 hours.', 'Δεν υπάρχουν αγορές που λήγουν στις επόμενες 6 ώρες.')}</p> : null}
          </div>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'Recent updates', 'Πρόσφατες ενημερώσεις')}</p>
          <div className="stackSm">
            {recentEvents.map((item) => (
              <Link key={item.id} href={`/markets/${item.slug}${lang === 'el' ? '?lang=el' : ''}`} className="panelBlock">
                <div className="statusRow statusRowStart">
                  <strong>{eventLabel(item.status, lang)}</strong>
                  <span className="badgeNeutral">{item.status}</span>
                </div>
                <p className="panelText">{item.question}</p>
                <p className="subtle">{tr(lang, 'Updated', 'Ενημερώθηκε')} {formatDateTime(item.updated_at ?? item.close_time)}</p>
              </Link>
            ))}
            {recentEvents.length === 0 ? <p className="subtle">{tr(lang, 'No recent close, resolution, or settlement updates.', 'Δεν υπάρχουν πρόσφατα updates για κλείσιμο, επίλυση ή διακανονισμό.')}</p> : null}
          </div>
        </article>
      </section>
    </AlphaShell>
  );
}
