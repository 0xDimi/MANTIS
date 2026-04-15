import Link from 'next/link';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { appConfig } from '@/lib/app-config';
import { loadNotificationSummary } from '@/lib/notifications';
import { loadHeaderSummary } from '@/lib/header-summary';
import { tr, type UiLang } from '@/lib/ui-lang';
import { LanguageToggle } from '@/components/language-toggle';

const nav = [
  { href: '/', en: 'Home', el: 'Αρχική' },
  { href: '/portfolio', en: 'Portfolio', el: 'Χαρτοφυλάκιο' },
  { href: '/more', en: 'More', el: 'Περισσότερα' }
] as const;

function formatMoney(value: number | null) {
  if (value == null) return '—';
  return `€${value.toFixed(2)}`;
}

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
  const [{ count }, summary] = await Promise.all([loadNotificationSummary(), loadHeaderSummary()]);
  const homeHref = lang === 'el' ? '/?lang=el' : '/';
  const profileHref = lang === 'el' ? '/profile?lang=el' : '/profile';
  const notificationsHref = lang === 'el' ? '/notifications?lang=el' : '/notifications';

  return (
    <div className="shell">
      <header className="shellHeaderPolymarket">
        <Link className="brandLock brandLockLarge" href={homeHref}>
          <img className="brandWordmark" src="/brand/mantis/logo/mantis-logo-primary-wordmark.png" alt={appConfig.codename} />
        </Link>

        <form className="headerSearch" action="/markets" method="get">
          {lang === 'el' ? <input type="hidden" name="lang" value="el" /> : null}
          <input
            className="headerSearchInput"
            type="search"
            name="q"
            placeholder={tr(lang, 'Search markets...', 'Αναζήτηση αγορών...')}
            aria-label={tr(lang, 'Search markets', 'Αναζήτηση αγορών')}
          />
        </form>

        <div className="headerRightGroup">
          <Link className="miniStat" href={lang === 'el' ? '/portfolio?lang=el' : '/portfolio'}>
            <span className="miniStatLabel">{tr(lang, 'Portfolio', 'Χαρτοφυλάκιο')}</span>
            <strong className="miniStatValue">{formatMoney(summary.portfolio)}</strong>
          </Link>

          <Link className="miniStat" href={lang === 'el' ? '/portfolio?lang=el' : '/portfolio'}>
            <span className="miniStatLabel">{tr(lang, 'Cash', 'Μετρητά')}</span>
            <strong className="miniStatValue">{formatMoney(summary.cash)}</strong>
          </Link>

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

          <Link className="notifButton" href={notificationsHref} aria-label="Notifications">
            <span aria-hidden="true">🔔</span>
            {count > 0 ? <span className="notifBadge">{Math.min(count, 99)}</span> : null}
          </Link>

          <Link className="profileButton" href={profileHref} aria-label="Profile">
            <span>◉</span>
          </Link>
        </div>
      </header>

      <p className="brandTagInline">{tr(lang, 'Here, your opinion has value', 'Εδώ, η άποψή σου έχει αξία')}</p>

      <section className="pageIntro pageIntroCompact">
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
