import Link from 'next/link';
import type { ReactNode } from 'react';
import { appConfig } from '@/lib/app-config';
import { loadNotificationSummary } from '@/lib/notifications';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/more', label: 'More' }
];

export async function AlphaShell({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  const { count } = await loadNotificationSummary();

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{appConfig.codename}</p>
          <h1>{title}</h1>
          {eyebrow ? <p className="subtle">{eyebrow}</p> : null}
        </div>
        <div className="topbarMeta">
          <Link className="notifButton" href="/notifications" aria-label="Notifications">
            <span aria-hidden="true">🔔</span>
            {count > 0 ? <span className="notifBadge">{Math.min(count, 99)}</span> : null}
          </Link>
        </div>
      </header>

      {children}

      <nav className="bottomDock" aria-label="Primary">
        <div className="bottomDockInner">
          {nav.map((item) => (
            <Link key={item.href} className="bottomDockLink" href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
