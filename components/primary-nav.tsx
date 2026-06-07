'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tr, type UiLang } from '@/lib/ui-lang';

type NavItem = {
  href: string;
  en: string;
  el: string;
  matches: string[];
};

const navItems: NavItem[] = [
  { href: '/markets', en: 'Markets', el: 'Αγορές', matches: ['/', '/markets', '/events'] },
  { href: '/portfolio', en: 'Portfolio', el: 'Χαρτοφυλάκιο', matches: ['/portfolio'] },
  { href: '/more', en: 'More', el: 'Περισσότερα', matches: ['/more', '/notifications', '/rules', '/profile', '/access'] }
];

function matchesPath(pathname: string, matches: string[]) {
  return matches.some((match) => {
    if (match === '/') return pathname === '/';
    return pathname === match || pathname.startsWith(`${match}/`);
  });
}

function buildHref(href: string, lang: UiLang) {
  return lang === 'el' ? `${href}?lang=el` : href;
}

export function PrimaryNav({ lang }: { lang: UiLang }) {
  const pathname = usePathname() || '/';

  return (
    <>
      <nav className="headerNav" aria-label={tr(lang, 'Primary navigation', 'Κύρια πλοήγηση')}>
        {navItems.map((item) => {
          const active = matchesPath(pathname, item.matches);
          return (
            <Link
              key={item.href}
              className={active ? 'headerNavLink headerNavLinkActive' : 'headerNavLink'}
              href={buildHref(item.href, lang)}
              aria-current={active ? 'page' : undefined}
            >
              {lang === 'el' ? item.el : item.en}
            </Link>
          );
        })}
      </nav>

      <nav className="bottomDock" aria-label={tr(lang, 'Primary navigation', 'Κύρια πλοήγηση')}>
        <div className="bottomDockInner">
          {navItems.map((item) => {
            const active = matchesPath(pathname, item.matches);
            return (
              <Link
                key={item.href}
                className={active ? 'bottomDockLink bottomDockLinkActive' : 'bottomDockLink'}
                href={buildHref(item.href, lang)}
                aria-current={active ? 'page' : undefined}
              >
                {lang === 'el' ? item.el : item.en}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
