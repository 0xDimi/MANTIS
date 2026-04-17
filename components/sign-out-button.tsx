'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { tr, type UiLang } from '@/lib/ui-lang';

export function SignOutButton({ nextPath = '/', lang = 'en' }: { nextPath?: string; lang?: UiLang }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.assign(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr(lang, 'Unable to sign out', 'Αδυναμία αποσύνδεσης'));
      setPending(false);
    }
  }

  return (
    <div className="stackXs">
      <button className="button buttonGhost" disabled={pending} onClick={handleClick} type="button">
        {pending ? tr(lang, 'Signing out…', 'Αποσύνδεση…') : tr(lang, 'Sign out', 'Αποσύνδεση')}
      </button>
      {error ? <div className="notice noticeError">{error}</div> : null}
    </div>
  );
}
