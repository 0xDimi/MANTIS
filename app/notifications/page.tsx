import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { formatDateTime, formatRelativeHours } from '@/lib/format';
import { loadNotificationsFeed } from '@/lib/notifications';

function eventLabel(status: string) {
  if (status === 'closed') return 'Market closed';
  if (status === 'resolved') return 'Resolution posted';
  if (status === 'settled') return 'Settlement completed';

  return 'Market update';
}

export default async function NotificationsPage() {
  const { closingSoon, recentEvents, error } = await loadNotificationsFeed();

  return (
    <AlphaShell title="Notifications" eyebrow="Reminders and market lifecycle updates">
      {error ? <div className="notice noticeWarn">Notification feed partially unavailable: {error}</div> : null}

      <section className="stackMd">
        <article className="card stackSm">
          <p className="eyebrow">Closing soon</p>
          <div className="stackSm">
            {closingSoon.map((item) => (
              <Link key={item.id} href={`/markets/${item.slug}`} className="panelBlock">
                <div className="statusRow statusRowStart">
                  <strong>{item.question}</strong>
                  <span className="badgeNeutral">{formatRelativeHours(item.close_time)}</span>
                </div>
                <p className="subtle">Closes {formatDateTime(item.close_time)}</p>
              </Link>
            ))}
            {closingSoon.length === 0 ? <p className="subtle">No markets closing in the next 6 hours.</p> : null}
          </div>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">Recent updates</p>
          <div className="stackSm">
            {recentEvents.map((item) => (
              <Link key={item.id} href={`/markets/${item.slug}`} className="panelBlock">
                <div className="statusRow statusRowStart">
                  <strong>{eventLabel(item.status)}</strong>
                  <span className="badgeNeutral">{item.status}</span>
                </div>
                <p className="panelText">{item.question}</p>
                <p className="subtle">Updated {formatDateTime(item.updated_at ?? item.close_time)}</p>
              </Link>
            ))}
            {recentEvents.length === 0 ? <p className="subtle">No recent close, resolution, or settlement updates.</p> : null}
          </div>
        </article>
      </section>
    </AlphaShell>
  );
}
