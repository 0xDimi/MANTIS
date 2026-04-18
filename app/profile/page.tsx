import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FirstLoginOnboardingModal } from '@/components/first-login-onboarding-modal';
import { SignOutButton } from '@/components/sign-out-button';
import { AlphaShell } from '@/components/alpha-shell';
import { formatDateTime, formatEur } from '@/lib/format';
import { ensureViewerBootstrap } from '@/lib/supabase/bootstrap';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';
import { tr } from '@/lib/ui-lang';

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

function getInitials(nameOrEmail: string | null | undefined) {
  const source = (nameOrEmail ?? 'ME').trim();
  return (
    source
      .split(/\s+|@|\.|_|-/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'ME'
  );
}

export default async function ProfilePage({
  searchParams
}: {
  searchParams?: Promise<{ auth?: string; message?: string; lang?: string; invite?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const viewer = await loadViewerAccess();
  const lang = await resolveServerLang({
    searchParam: params.lang,
    profileLocale: viewer.profile?.locale ?? null
  });

  if (!viewer.user) {
    const query = new URLSearchParams();
    if (lang === 'el') query.set('lang', 'el');
    if (params.auth) query.set('auth', params.auth);
    if (params.message) query.set('message', params.message);
    if (params.invite) query.set('invite', params.invite);

    const queryString = query.toString();
    redirect(queryString ? `/access?${queryString}` : '/access');
  }

  const profileName = viewer.profile?.display_name ?? viewer.profile?.username ?? viewer.user?.email ?? tr(lang, 'Account owner', 'Κάτοχος λογαριασμού');
  const initials = getInitials(profileName);

  return (
    <AlphaShell
      title={tr(lang, 'Account', 'Λογαριασμός')}
      eyebrow={tr(lang, 'Identity, wallet, preferences, and session security', 'Ταυτότητα, πορτοφόλι, προτιμήσεις και ασφάλεια συνεδρίας')}
      lang={lang}
    >
      {params.auth === 'ok' ? <div className="notice noticeSuccess noticeStrong">{tr(lang, 'Magic link accepted. You are now signed in.', 'Το magic link έγινε αποδεκτό. Έχεις συνδεθεί.')}</div> : null}
      {params.auth === 'failed' ? <div className="notice noticeError">{params.message ?? tr(lang, 'Sign-in failed.', 'Αποτυχία σύνδεσης.')}</div> : null}
      {params.auth === 'missing-code' ? <div className="notice noticeWarn">{tr(lang, 'Magic link was missing a valid auth code.', 'Το magic link δεν είχε έγκυρο κωδικό αυθεντικοποίησης.')}</div> : null}

      <section className="stackMd accountPageShell">
        <FirstLoginOnboardingModal
          lang={lang}
          userId={viewer.user.id}
          authStatus={params.auth}
          inviteOpened={params.invite === '1'}
          showOnboarding={params.auth === 'ok'}
          walletVisible={Boolean(viewer.wallet)}
        />

        <article className="card accountIdentityCard">
          <div className="accountIdentityAvatar">{initials}</div>
          <div className="stackXs">
            <p className="eyebrow">{tr(lang, 'Account identity', 'Ταυτότητα λογαριασμού')}</p>
            <h2 className="accountIdentityName">{profileName}</h2>
            <p className="subtle">{viewer.user.email}</p>
          </div>
        </article>

        <section className="metricsGrid accountMetricsGrid">
          <article className="card stackSm">
            <p className="eyebrow">{tr(lang, 'Wallet balance', 'Υπόλοιπο πορτοφολιού')}</p>
            <div className="metricValue">{viewer.wallet ? formatEur(Number(viewer.wallet.available_balance ?? 0), lang) : '—'}</div>
            <p className="subtle">{tr(lang, 'Available to trade now', 'Διαθέσιμο για συναλλαγές τώρα')}</p>
          </article>

          <article className="card stackSm">
            <p className="eyebrow">{tr(lang, 'Realized PnL', 'Πραγματοποιημένο PnL')}</p>
            <div className="metricValue">{viewer.wallet ? formatEur(Number(viewer.wallet.realized_pnl ?? 0), lang) : '—'}</div>
            <p className="subtle">{tr(lang, 'Closed outcomes and settled markets', 'Κλεισμένα αποτελέσματα και διακανονισμένες αγορές')}</p>
          </article>

          <article className="card stackSm">
            <p className="eyebrow">{tr(lang, 'Role', 'Ρόλος')}</p>
            <div className="accountRolePill badgeNeutral">{viewer.profile?.role?.toUpperCase() ?? 'USER'}</div>
            <p className="subtle">{tr(lang, 'Session updated', 'Ενημέρωση συνεδρίας')} {formatDateTime(viewer.wallet?.updated_at ?? viewer.profile?.created_at, lang)}</p>
          </article>
        </section>

        <section className="twoColGrid accountSettingsGrid">
          <article className="card stackSm" id="language">
            <p className="eyebrow">{tr(lang, 'Language', 'Γλώσσα')}</p>
            <h3>{tr(lang, 'Interface language', 'Γλώσσα διεπαφής')}</h3>
            <div className="buttonRow">
              <Link className={lang === 'en' ? 'button buttonPrimary' : 'button buttonGhost'} href="/profile">
                English
              </Link>
              <Link className={lang === 'el' ? 'button buttonPrimary' : 'button buttonGhost'} href="/profile?lang=el">
                Ελληνικά
              </Link>
            </div>
            <p className="subtle">{tr(lang, 'Profile locale record', 'Καταγεγραμμένη γλώσσα προφίλ')}: {viewer.profile?.locale ?? tr(lang, 'Not set', 'Δεν έχει οριστεί')}</p>
          </article>

          <article className="card stackSm" id="notifications">
            <p className="eyebrow">{tr(lang, 'Notifications', 'Ειδοποιήσεις')}</p>
            <h3>{tr(lang, 'Market alerts', 'Ειδοποιήσεις αγοράς')}</h3>
            <div className="statusList">
              <div className="statusRow">
                <span>{tr(lang, 'Closing soon reminders', 'Υπενθυμίσεις λήξης')}</span>
                <span className="badgeYes">{tr(lang, 'Enabled', 'Ενεργό')}</span>
              </div>
              <div className="statusRow">
                <span>{tr(lang, 'Resolution updates', 'Ενημερώσεις επίλυσης')}</span>
                <span className="badgeYes">{tr(lang, 'Enabled', 'Ενεργό')}</span>
              </div>
              <div className="statusRow">
                <span>{tr(lang, 'Settlement notices', 'Ειδοποιήσεις διακανονισμού')}</span>
                <span className="badgeNeutral">{tr(lang, 'In-app', 'Μέσα στην εφαρμογή')}</span>
              </div>
            </div>
            <Link className="button buttonGhost" href={lang === 'el' ? '/notifications?lang=el' : '/notifications'}>
              {tr(lang, 'Open notification center', 'Άνοιγμα κέντρου ειδοποιήσεων')}
            </Link>
          </article>

          <article className="card stackSm">
            <p className="eyebrow">{tr(lang, 'Session & security', 'Συνεδρία και ασφάλεια')}</p>
            <h3>{tr(lang, 'Access method', 'Μέθοδος πρόσβασης')}</h3>
            <div className="statusList">
              <div className="statusRow">
                <span>{tr(lang, 'Sign-in mode', 'Τρόπος σύνδεσης')}</span>
                <span className="badgeNeutral">{tr(lang, 'Magic link', 'Magic link')}</span>
              </div>
              <div className="statusRow">
                <span>{tr(lang, 'Account created', 'Δημιουργία λογαριασμού')}</span>
                <span className="badgeNeutral">{formatDateTime(viewer.profile?.created_at, lang)}</span>
              </div>
              <div className="statusRow">
                <span>{tr(lang, 'Wallet currency', 'Νόμισμα πορτοφολιού')}</span>
                <span className="badgeNeutral">{viewer.wallet?.currency ?? 'EUR'}</span>
              </div>
            </div>
            <SignOutButton nextPath={lang === 'el' ? '/access?lang=el' : '/access'} lang={lang} />
          </article>

          <article className="card stackSm">
            <p className="eyebrow">{tr(lang, 'Account details', 'Στοιχεία λογαριασμού')}</p>
            <h3>{tr(lang, 'Identity record', 'Εγγραφή ταυτότητας')}</h3>
            <div className="statusList">
              <div className="statusRow">
                <span>{tr(lang, 'Display name', 'Όνομα εμφάνισης')}</span>
                <span className="badgeNeutral">{viewer.profile?.display_name ?? tr(lang, 'Not set', 'Δεν έχει οριστεί')}</span>
              </div>
              <div className="statusRow">
                <span>{tr(lang, 'Username', 'Όνομα χρήστη')}</span>
                <span className="badgeNeutral">{viewer.profile?.username ?? tr(lang, 'Not set', 'Δεν έχει οριστεί')}</span>
              </div>
              <div className="statusRow">
                <span>{tr(lang, 'Invited email', 'Email πρόσκλησης')}</span>
                <span className="badgeNeutral">{viewer.user.email ?? '—'}</span>
              </div>
            </div>
          </article>
        </section>

        {viewer.error ? <div className="notice noticeWarn">{viewer.error}</div> : null}
      </section>
    </AlphaShell>
  );
}
