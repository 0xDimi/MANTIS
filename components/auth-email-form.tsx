'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { captureEvent } from '@/lib/client-telemetry';
import { resolvePublicAppUrl } from '@/lib/env-clean';
import { tr, type UiLang } from '@/lib/ui-lang';

export function AuthEmailForm({
  nextPath,
  lang = 'en',
  title = 'Sign in to trade',
  description = 'Use your invited email. We will send a magic link and keep the wallet server-side.'
}: {
  nextPath: string;
  lang?: UiLang;
  title?: string;
  description?: string;
}) {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const origin = window.location.origin;
      const appUrl = resolvePublicAppUrl(origin);
      const redirectTarget = `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      captureEvent('signup started', {
        redirectTarget,
        nextPath
      });

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTarget
        }
      });

      if (error) {
        throw error;
      }

      setMessage(tr(lang, 'Magic link sent. Open it from the same browser to continue.', 'Το magic link στάλθηκε. Άνοιξέ το από τον ίδιο browser για συνέχεια.'));
    } catch (err) {
      setError(err instanceof Error ? err.message : tr(lang, 'Unable to send sign-in link', 'Δεν ήταν δυνατή η αποστολή του συνδέσμου σύνδεσης'));
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="card stackSm">
      <div>
        <p className="eyebrow">{tr(lang, 'Access', 'Πρόσβαση')}</p>
        <h3>{title}</h3>
        <p className="subtle">{description}</p>
      </div>
      <form className="stackSm" onSubmit={handleSubmit}>
        <label className="fieldLabel" htmlFor="email">
          {tr(lang, 'Invited email', 'Email πρόσκλησης')}
        </label>
        <input
          id="email"
          className="input"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button className="button buttonPrimary" disabled={pending} type="submit">
          {pending ? tr(lang, 'Sending link…', 'Αποστολή συνδέσμου…') : tr(lang, 'Email magic link', 'Αποστολή magic link')}
        </button>
      </form>
      {message ? <div className="notice noticeSuccess">{message}</div> : null}
      {error ? <div className="notice noticeError">{error}</div> : null}
    </article>
  );
}
