import Link from 'next/link';
import { Suspense } from 'react';
import { appConfig } from '@/lib/app-config';
import { tr, type UiLang } from '@/lib/ui-lang';
import { LanguageToggle } from '@/components/language-toggle';
import { NotificationsPopover } from '@/components/notifications-popover';
import { HeaderAccountMenu } from '@/components/header-account-menu';
import { PrimaryNav } from '@/components/primary-nav';
import type { NotificationRow } from '@/lib/notifications';

type HeaderSummary = {
  authenticated: boolean;
  cash: number | null;
  portfolio: number | null;
  viewer: {
    id: string | null;
    displayName: string | null;
    email: string | null;
    initials: string;
  };
};

function formatMoney(value: number | null, lang: UiLang) {
  if (value == null) return '—';
  return new Intl.NumberFormat(lang === 'el' ? 'el-GR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value);
}

export function MantisHeader({
  lang,
  summary,
  notifications
}: {
  lang: UiLang;
  summary: HeaderSummary;
  notifications: {
    closingSoon: Array<NotificationRow & { kind: 'closing' }>;
    recentEvents: Array<NotificationRow & { kind: 'event' }>;
    error?: string | null;
  };
}) {
  const homeHref = lang === 'el' ? '/?lang=el' : '/';
  const portfolioHref = lang === 'el' ? '/portfolio?lang=el' : '/portfolio';
  const profileHref = lang === 'el' ? '/profile?lang=el' : '/profile';
  const signInHref = lang === 'el' ? '/access?lang=el' : '/access';
  const notificationsHref = lang === 'el' ? '/notifications?lang=el' : '/notifications';

  return (
    <header className="mantisHeader">
      <div className="mantisHeaderTop">
        <Link className="brandLock brandLockLarge" href={homeHref}>
          <img className="brandWordmark" src="/brand/mantis/logo/mantis-logo-primary-wordmark.png" alt={appConfig.codename} />
        </Link>

        <form className="headerSearch" action="/markets" method="get">
          {lang === 'el' ? <input type="hidden" name="lang" value="el" /> : null}
          <label className="headerSearchShell">
            <input
              className="headerSearchInput"
              type="search"
              name="q"
              placeholder={tr(lang, 'Search markets, teams, events, or sources', 'Αναζήτηση αγορών, ομάδων, γεγονότων ή πηγών')}
              aria-label={tr(lang, 'Search markets, teams, events, or sources', 'Αναζήτηση αγορών, ομάδων, γεγονότων ή πηγών')}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="headerSearchHint" aria-hidden="true">
              ↵
            </span>
          </label>
        </form>
      </div>

      <div className="mantisHeaderBottom">
        <PrimaryNav lang={lang} />

        <div className="headerTerminalStrip" aria-label={tr(lang, 'Portfolio summary', 'Σύνοψη χαρτοφυλακίου')}>
          <Link className="terminalStat" href={portfolioHref}>
            <span className="terminalStatLabel">{tr(lang, 'Portfolio', 'Χαρτοφυλάκιο')}</span>
            <strong className="terminalStatValue mantis-number">{formatMoney(summary.portfolio, lang)}</strong>
          </Link>

          <Link className="terminalStat" href={portfolioHref}>
            <span className="terminalStatLabel">{tr(lang, 'Cash', 'Μετρητά')}</span>
            <strong className="terminalStatValue mantis-number">{formatMoney(summary.cash, lang)}</strong>
          </Link>
        </div>

        <div className="headerControlCluster">
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
      </div>
    </header>
  );
}
