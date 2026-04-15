import Link from 'next/link';
import type { ReactNode } from 'react';
import { appConfig } from '@/lib/app-config';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/more', label: 'More' }
];

export function AlphaShell({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{appConfig.codename}</p>
          <h1>{title}</h1>
          {eyebrow ? <p className="subtle">{eyebrow}</p> : null}
        </div>
        <div className="topbarMeta" />
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
