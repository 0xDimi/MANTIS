import Link from 'next/link';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { appConfig } from '@/lib/app-config';
import { loadNotificationsFeed } from '@/lib/notifications';
import { loadHeaderSummary } from '@/lib/header-summary';
import { tr, type UiLang } from '@/lib/ui-lang';
import { LanguageToggle } from '@/components/language-toggle';
import { NotificationsPopover } from '@/components/notifications-popover';
import { HeaderAccountMenu } from '@/components/header-account-menu';

const nav = [
  { href: '/', en: 'Home', el: 'Αρχική' },
  { href: '/portfolio', en: 'Portfolio', el: 'Χαρτοφυλάκιο' },
  { href: '/more', en: 'More', el: 'Περισσότερα' }
] as const;

function formatMoney(value: number | null, lang: UiLang) {
  if (value == null) return '—';
  return new Intl.NumberFormat(lang === 'el' ? 'el-GR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value);
}

export async function AlphaShell({
  title,
  eyebrow,
  lang = 'en',
  showIntro = true,
  children
}: {
  title: string;
  eyebrow?: string;
  lang?: UiLang;
  showIntro?: boolean;
  children: ReactNode;
}) {
  const [summary, notifications] = await Promise.all([loadHeaderSummary(), loadNotificationsFeed()]);
  const homeHref = lang === 'el' ? '/?lang=el' : '/';
  const profileHref = lang === 'el' ? '/profile?lang=el' : '/profile';
  const signInHref = lang === 'el' ? '/access?lang=el' : '/access';
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
            <strong className="miniStatValue">{formatMoney(summary.portfolio, lang)}</strong>
          </Link>

          <Link className="miniStat" href={lang === 'el' ? '/portfolio?lang=el' : '/portfolio'}>
            <span className="miniStatLabel">{tr(lang, 'Cash', 'Μετρητά')}</span>
            <strong className="miniStatValue">{formatMoney(summary.cash, lang)}</strong>
          </Link>

          <Suspense
            fallback={
              <div className="langToggle" role="group" aria-label={tr(lang, 'Language', 'Γλώσσα')}>
                <span className="langToggleItem langToggleItemActive">EN</span>
                <span className="langToggleItem">ΕΛ</span>
              </div>
            }
          >
            <LanguageToggle />
          </Suspense>

          <NotificationsPopover
            viewerId={summary.viewer.id}
            lang={lang}
            closingSoon={notifications.closingSoon}
            recentEvents={notifications.recentEvents}
            error={notifications.error}
          />

          <HeaderAccountMenu
            lang={lang}
            profileHref={profileHref}
            signInHref={signInHref}
            notificationsHref={notificationsHref}
            initials={summary.viewer.initials}
            displayName={summary.viewer.displayName}
            email={summary.viewer.email}
            authenticated={summary.authenticated}
          />
        </div>
      </header>

      {showIntro ? (
        <section className="pageIntro pageIntroCompact">
          <h1>{title}</h1>
          {eyebrow ? <p className="subtle">{eyebrow}</p> : null}
        </section>
      ) : null}

      {children}

      <nav className="bottomDock" aria-label={tr(lang, 'Primary', 'Κύρια πλοήγηση')}>
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
