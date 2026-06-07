import { AlphaShell } from '@/components/alpha-shell';
import { DiscoverBoard } from '@/components/discover-board';
import { FirstLoginOnboardingModal } from '@/components/first-login-onboarding-modal';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';
import { tr } from '@/lib/ui-lang';

async function loadOnboardingContext() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { userId: null as string | null, walletVisible: false };
    }

    const { data: wallet } = await supabase
      .from('wallet_accounts')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    return {
      userId: user.id,
      walletVisible: Boolean(wallet)
    };
  } catch {
    return { userId: null as string | null, walletVisible: false };
  }
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string; view?: string; cat?: string; q?: string; auth?: string; invite?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const lang = await resolveServerLang({ searchParam: params.lang });
  const view = (params.view as 'trending' | 'new' | 'liquid' | 'ending' | undefined) ?? 'trending';
  const onboardingContext = await loadOnboardingContext();

  return (
    <AlphaShell title={tr(lang, 'Discover', 'Ανακάλυψη')} lang={lang} showIntro={false}>
      {onboardingContext.userId ? (
        <FirstLoginOnboardingModal
          lang={lang}
          userId={onboardingContext.userId}
          authStatus={params.auth}
          inviteOpened={params.invite === '1'}
          showOnboarding={params.auth === 'ok'}
          walletVisible={onboardingContext.walletVisible}
        />
      ) : null}
      <DiscoverBoard lang={lang} view={view} category={params.cat ?? null} query={params.q ?? null} basePath="/" />
    </AlphaShell>
  );
}
