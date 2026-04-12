import { AuthEmailForm } from '@/components/auth-email-form';
import { SignOutButton } from '@/components/sign-out-button';
import { AlphaShell } from '@/components/alpha-shell';
import { formatDateTime, formatEur } from '@/lib/format';
import { ensureViewerBootstrap } from '@/lib/supabase/bootstrap';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type ViewerAccess = {
  user: {
    id: string;
    email: string | null | undefined;
  } | null;
  profile: {
    display_name: string | null;
    username: string | null;
    role: string;
    locale: string | null;
    created_at: string;
  } | null;
  wallet: {
    currency: string;
    starting_balance: number;
    available_balance: number;
    realized_pnl: number;
    updated_at: string;
  } | null;
  error: string | null;
};

async function readViewerBootstrap(supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>, userId: string) {
  const [{ data: profile, error: profileError }, { data: wallet, error: walletError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name,username,role,locale,created_at')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('wallet_accounts')
      .select('currency,starting_balance,available_balance,realized_pnl,updated_at')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
  ]);

  return {
    profile: (profile as ViewerAccess['profile']) ?? null,
    wallet: (wallet as ViewerAccess['wallet']) ?? null,
    error: profileError?.message ?? walletError?.message ?? null
  };
}

async function loadViewerAccess(): Promise<ViewerAccess> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      return { user: null, profile: null, wallet: null, error: authError.message };
    }

    if (!user) {
      return { user: null, profile: null, wallet: null, error: null };
    }

    let { profile, wallet, error } = await readViewerBootstrap(supabase, user.id);

    if (!error && (!profile || !wallet)) {
      try {
        await ensureViewerBootstrap(user);
        ({ profile, wallet, error } = await readViewerBootstrap(supabase, user.id));
      } catch (bootstrapError) {
        error = bootstrapError instanceof Error ? bootstrapError.message : 'viewer bootstrap failed';
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email
      },
      profile,
      wallet,
      error
    };
  } catch (error) {
    return {
      user: null,
      profile: null,
      wallet: null,
      error: error instanceof Error ? error.message : 'unknown error'
    };
  }
}

export default async function ProfilePage({
  searchParams
}: {
  searchParams?: Promise<{ auth?: string; message?: string }>;
}) {
  const viewer = await loadViewerAccess();
  const params = (await searchParams) ?? {};

  return (
    <AlphaShell title="Access foundation" eyebrow="Week 1 only: sign-in, session handling, and wallet visibility.">
      {params.auth === 'ok' ? <div className="notice noticeSuccess">Magic link accepted. Session is now live.</div> : null}
      {params.auth === 'failed' ? <div className="notice noticeError">{params.message ?? 'Sign-in failed.'}</div> : null}
      {params.auth === 'missing-code' ? <div className="notice noticeWarn">Magic link was missing a valid auth code.</div> : null}

      <section className="heroGrid">
        <article className="card stackSm">
          <p className="eyebrow">Access mode</p>
          <h2>Email invite + auth</h2>
          <p className="subtle">
            This is the active build lane. Trading, markets, and portfolio surfaces stay behind this foundation until Week 1 is
            fully closed.
          </p>
          <div className="statusList">
            <div className="statusRow">
              <span>Session callback</span>
              <span className="badgeYes">Next route</span>
            </div>
            <div className="statusRow">
              <span>Auth client</span>
              <span className="badgeYes">Supabase SSR</span>
            </div>
            <div className="statusRow">
              <span>Wallet visibility</span>
              <span className="badgeNeutral">server read</span>
            </div>
          </div>
        </article>

        {viewer.user ? (
          <article className="card stackSm">
            <p className="eyebrow">Signed in</p>
            <h3>{viewer.profile?.display_name ?? viewer.user.email ?? 'Tester session'}</h3>
            <p className="subtle">{viewer.user.email}</p>
            <div className="statusList">
              <div className="statusRow">
                <span>role</span>
                <span className="badgeNeutral">{viewer.profile?.role ?? 'tester'}</span>
              </div>
              <div className="statusRow">
                <span>wallet</span>
                <span className="badgeNeutral">
                  {viewer.wallet ? `${formatEur(Number(viewer.wallet.available_balance ?? 0))} available` : 'pending'}
                </span>
              </div>
              <div className="statusRow">
                <span>updated</span>
                <span className="badgeNeutral">{formatDateTime(viewer.wallet?.updated_at ?? viewer.profile?.created_at)}</span>
              </div>
            </div>
            <SignOutButton nextPath="/profile" />
          </article>
        ) : (
          <AuthEmailForm nextPath="/profile" />
        )}
      </section>

      <section className="routeGrid">
        <article className="card stackSm">
          <p className="eyebrow">Week 1 completion criteria</p>
          <ul>
            <li>Invite-based sign-in works end to end.</li>
            <li>Session lands back in the Next app, not the static prototype.</li>
            <li>Tester can see profile and default paper wallet from server state.</li>
            <li>Legacy demo remains unchanged and reference-only.</li>
          </ul>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">Current session state</p>
          {viewer.error ? <div className="notice noticeError">{viewer.error}</div> : null}
          {!viewer.user ? <p className="subtle">No active tester session yet.</p> : null}
          {viewer.user && !viewer.wallet ? (
            <div className="notice noticeWarn">Wallet record missing. Auth works, but bootstrap data still needs verification.</div>
          ) : null}
          {viewer.user && viewer.wallet ? (
            <div className="notice noticeSuccess">
              Starting balance {formatEur(Number(viewer.wallet.starting_balance ?? 0))}, available{' '}
              {formatEur(Number(viewer.wallet.available_balance ?? 0))}.
            </div>
          ) : null}
        </article>
      </section>
    </AlphaShell>
  );
}
