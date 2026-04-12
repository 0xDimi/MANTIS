import Link from 'next/link';
import type { ReactNode } from 'react';
import { appConfig } from '@/lib/app-config';

const nav = [
  { href: '/', label: 'Overview' },
  { href: '/profile', label: 'Access' },
  { href: '/markets', label: 'Markets' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/rules', label: 'Rules' },
  { href: '/admin', label: 'Admin' }
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
          <p className="eyebrow">{appConfig.codename} · operational alpha</p>
          <h1>{title}</h1>
          {eyebrow ? <p className="subtle">{eyebrow}</p> : null}
        </div>
        <div className="topbarMeta">
          <span className="pill">{appConfig.environment}</span>
          <span className="pill pillStrong">{appConfig.version}</span>
        </div>
      </header>

      <nav className="navRow" aria-label="Primary">
        {nav.map((item) => (
          <Link key={item.href} className="navLink" href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
