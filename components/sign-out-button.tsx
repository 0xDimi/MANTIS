'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function SignOutButton({ nextPath = '/' }: { nextPath?: string }) {
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
      setError(err instanceof Error ? err.message : 'Unable to sign out');
      setPending(false);
    }
  }

  return (
    <div className="stackXs">
      <button className="button buttonGhost" disabled={pending} onClick={handleClick} type="button">
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
      {error ? <div className="notice noticeError">{error}</div> : null}
    </div>
  );
}
