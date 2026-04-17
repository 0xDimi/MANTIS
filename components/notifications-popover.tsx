'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatDateTime, formatRelativeClose } from '@/lib/format';
import { localizedMarketStatus, localizedQuestionFromSlug } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';
import type { NotificationRow } from '@/lib/notifications';

type NotificationsPopoverProps = {
  count: number;
  lang: UiLang;
  closingSoon: Array<NotificationRow & { kind: 'closing' }>;
  recentEvents: Array<NotificationRow & { kind: 'event' }>;
  error?: string | null;
};

function eventLabel(status: string, lang: UiLang) {
  if (status === 'closed') return tr(lang, 'Market closed', 'Η αγορά έκλεισε');
  if (status === 'resolved') return tr(lang, 'Resolution posted', 'Η επίλυση δημοσιεύτηκε');
  if (status === 'settled') return tr(lang, 'Settlement completed', 'Ο διακανονισμός ολοκληρώθηκε');
  return tr(lang, 'Market update', 'Ενημέρωση αγοράς');
}

function hrefFor(slug: string, lang: UiLang) {
  return `/markets/${slug}${lang === 'el' ? '?lang=el' : ''}`;
}

export function NotificationsPopover({ count, lang, closingSoon, recentEvents, error }: NotificationsPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div className="notifPopoverRoot" ref={rootRef}>
      <button
        className={open ? 'notifButton notifButtonActive' : 'notifButton'}
        type="button"
        aria-label={tr(lang, 'Notifications', 'Ειδοποιήσεις')}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">🔔</span>
        {count > 0 ? <span className="notifBadge">{Math.min(count, 99)}</span> : null}
      </button>

      {open ? (
        <section className="notifPopoverPanel" role="dialog" aria-label={tr(lang, 'Notifications', 'Ειδοποιήσεις')}>
          <header className="notifPopoverHeader">
            <h3>{tr(lang, 'Notifications', 'Ειδοποιήσεις')}</h3>
          </header>

          <div className="notifPopoverScroll">
            {error ? <div className="notice noticeWarn">{error}</div> : null}

            <div className="notifGroup">
              <p className="eyebrow">{tr(lang, 'Closing soon', 'Λήγουν σύντομα')}</p>
              {closingSoon.length > 0 ? (
                closingSoon.map((item) => (
                  <Link key={item.id} href={hrefFor(item.slug, lang)} className="notifRow" onClick={() => setOpen(false)}>
                    <div className="notifRowTop">
                      <strong>{localizedQuestionFromSlug(item.slug, item.question, lang)}</strong>
                      <span className="badgeNeutral">{formatRelativeClose(item.close_time, { calendarAfterDays: 7, lang })}</span>
                    </div>
                    <p>{tr(lang, 'Closes', 'Κλείνει')} {formatDateTime(item.close_time, lang)}</p>
                  </Link>
                ))
              ) : (
                <p className="subtle">{tr(lang, 'No markets closing in the next 6 hours.', 'Δεν υπάρχουν αγορές που λήγουν στις επόμενες 6 ώρες.')}</p>
              )}
            </div>

            <div className="notifGroup">
              <p className="eyebrow">{tr(lang, 'Recent updates', 'Πρόσφατες ενημερώσεις')}</p>
              {recentEvents.length > 0 ? (
                recentEvents.map((item) => (
                  <Link key={item.id} href={hrefFor(item.slug, lang)} className="notifRow" onClick={() => setOpen(false)}>
                    <div className="notifRowTop">
                      <strong>{eventLabel(item.status, lang)}</strong>
                      <span className="badgeNeutral">{localizedMarketStatus(item.status, lang, 'short')}</span>
                    </div>
                    <p>{localizedQuestionFromSlug(item.slug, item.question, lang)}</p>
                    <p>{tr(lang, 'Updated', 'Ενημερώθηκε')} {formatDateTime(item.updated_at ?? item.close_time, lang)}</p>
                  </Link>
                ))
              ) : (
                <p className="subtle">{tr(lang, 'No recent close, resolution, or settlement updates.', 'Δεν υπάρχουν πρόσφατα updates για κλείσιμο, επίλυση ή διακανονισμό.')}</p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
