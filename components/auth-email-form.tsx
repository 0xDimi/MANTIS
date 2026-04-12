'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function AuthEmailForm({
  nextPath,
  title = 'Sign in to trade',
  description = 'Use your invited email. We will send a magic link and keep the wallet server-side.'
}: {
  nextPath: string;
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
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? origin).replace(/\/$/, '');
      const redirectTarget = `${appUrl}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTarget
        }
      });

      if (error) {
        throw error;
      }

      setMessage('Magic link sent. Open it from the same browser to continue.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send sign-in link');
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="card stackSm">
      <div>
        <p className="eyebrow">Access</p>
        <h3>{title}</h3>
        <p className="subtle">{description}</p>
      </div>
      <form className="stackSm" onSubmit={handleSubmit}>
        <label className="fieldLabel" htmlFor="email">
          Invited email
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
          {pending ? 'Sending link…' : 'Email magic link'}
        </button>
      </form>
      {message ? <div className="notice noticeSuccess">{message}</div> : null}
      {error ? <div className="notice noticeError">{error}</div> : null}
    </article>
  );
}
