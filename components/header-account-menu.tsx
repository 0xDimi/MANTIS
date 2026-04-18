'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { captureEvent } from '@/lib/client-telemetry';
import { tr, type UiLang } from '@/lib/ui-lang';

type HeaderAccountMenuProps = {
  lang: UiLang;
  profileHref: string;
  signInHref: string;
  notificationsHref: string;
  initials: string;
  displayName?: string | null;
  email?: string | null;
  authenticated: boolean;
};

export function HeaderAccountMenu({
  lang,
  profileHref,
  signInHref,
  notificationsHref,
  initials,
  displayName,
  email,
  authenticated
}: HeaderAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [pendingSignOut, setPendingSignOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  async function signOut() {
    setPendingSignOut(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      captureEvent('logout', {
        source: 'header_account_menu',
        nextPath: signInHref
      });

      window.location.assign(signInHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr(lang, 'Unable to sign out', 'Αδυναμία αποσύνδεσης'));
      setPendingSignOut(false);
    }
  }

  const menuTitle = displayName || email || tr(lang, 'Account', 'Λογαριασμός');

  return (
    <div className="accountMenuRoot" ref={rootRef}>
      <button
        className={open ? 'profileButton profileButtonActive' : 'profileButton'}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={tr(lang, 'Account menu', 'Μενού λογαριασμού')}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="profileAvatarCircle" aria-hidden="true">
          <svg className="profileAvatarIcon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="3.75" stroke="currentColor" strokeWidth="1.8" />
            <path d="M5 19.5C6.7 16.4 9.15 14.9 12 14.9C14.85 14.9 17.3 16.4 19 19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <span className="profileButtonCaret" aria-hidden="true">⌄</span>
      </button>

      {open ? (
        <div className="accountMenuPanel" role="menu">
          <div className="accountMenuHeader">
            <strong>{menuTitle}</strong>
            {displayName && email ? <span>{email}</span> : null}
          </div>

          <div className="accountMenuList">
            <Link className="accountMenuItem" href={profileHref} role="menuitem" onClick={() => setOpen(false)}>
              {tr(lang, 'Profile', 'Προφίλ')}
            </Link>
            <Link className="accountMenuItem" href={`${profileHref}#language`} role="menuitem" onClick={() => setOpen(false)}>
              {tr(lang, 'Language', 'Γλώσσα')}
            </Link>
            <Link className="accountMenuItem" href={notificationsHref} role="menuitem" onClick={() => setOpen(false)}>
              {tr(lang, 'Notifications', 'Ειδοποιήσεις')}
            </Link>

            {authenticated ? (
              <button className="accountMenuItem accountMenuDanger" type="button" onClick={signOut} disabled={pendingSignOut}>
                {pendingSignOut ? tr(lang, 'Signing out…', 'Αποσύνδεση…') : tr(lang, 'Sign out', 'Αποσύνδεση')}
              </button>
            ) : (
              <Link className="accountMenuItem" href={signInHref} role="menuitem" onClick={() => setOpen(false)}>
                {tr(lang, 'Sign in', 'Σύνδεση')}
              </Link>
            )}
          </div>

          {error ? <p className="accountMenuError">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
