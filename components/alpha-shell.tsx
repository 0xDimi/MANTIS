import Link from 'next/link';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { appConfig } from '@/lib/app-config';
import { loadNotificationSummary } from '@/lib/notifications';
import { tr, type UiLang } from '@/lib/ui-lang';
import { LanguageToggle } from '@/components/language-toggle';

const nav = [
  { href: '/', en: 'Home', el: 'Αρχική' },
  { href: '/portfolio', en: 'Portfolio', el: 'Χαρτοφυλάκιο' },
  { href: '/more', en: 'More', el: 'Περισσότερα' }
] as const;

export async function AlphaShell({
  title,
  eyebrow,
  lang = 'en',
  children
}: {
  title: string;
  eyebrow?: string;
  lang?: UiLang;
  children: ReactNode;
}) {
  const { count } = await loadNotificationSummary();
  const homeHref = lang === 'el' ? '/?lang=el' : '/';

  return (
    <div className="shell">
      <header className="shellHeader">
        <Link className="brandLock" href={homeHref}>
          <img className="brandIcon" src="/brand/mantis/logo/mantis-logo-icon-white-on-black.png" alt={appConfig.codename} />
          <div>
            <div className="brandWord">{appConfig.codename}</div>
            <p className="brandTag">{tr(lang, 'Here, your opinion has value', 'Εδώ, η άποψή σου έχει αξία')}</p>
          </div>
        </Link>

        <div className="headerActions">
          <Suspense
            fallback={
              <div className="langToggle" role="group" aria-label="Language">
                <span className="langToggleItem langToggleItemActive">EN</span>
                <span className="langToggleItem">ΕΛ</span>
              </div>
            }
          >
            <LanguageToggle />
          </Suspense>
          <Link className="notifButton" href={lang === 'el' ? '/notifications?lang=el' : '/notifications'} aria-label="Notifications">
            <span aria-hidden="true">🔔</span>
            {count > 0 ? <span className="notifBadge">{Math.min(count, 99)}</span> : null}
          </Link>
        </div>
      </header>

      <section className="pageIntro">
        <h1>{title}</h1>
        {eyebrow ? <p className="subtle">{eyebrow}</p> : null}
      </section>

      {children}

      <nav className="bottomDock" aria-label="Primary">
        <div className="bottomDockInner">
          {nav.map((item) => {
            const href = lang === 'el' ? `${item.href}?lang=el` : item.href;
            return (
              <Link key={item.href} className="bottomDockLink" href={href}>
                {lang === 'el' ? item.el : item.en}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
