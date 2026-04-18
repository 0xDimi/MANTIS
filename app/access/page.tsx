import { redirect } from 'next/navigation';
import { AlphaShell } from '@/components/alpha-shell';
import { AuthEmailForm } from '@/components/auth-email-form';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { resolveServerLang } from '@/lib/ui-lang-server';
import { tr } from '@/lib/ui-lang';

async function getCurrentUserId() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export default async function AccessPage({
  searchParams
}: {
  searchParams?: Promise<{ auth?: string; message?: string; lang?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const lang = await resolveServerLang({ searchParam: params.lang });
  const userId = await getCurrentUserId();

  if (userId) {
    redirect(lang === 'el' ? '/?lang=el' : '/');
  }

  return (
    <AlphaShell
      title={tr(lang, 'Access', 'Πρόσβαση')}
      eyebrow={tr(lang, 'Sign in with your invited email', 'Σύνδεση με το email πρόσκλησης')}
      lang={lang}
    >
      <section className="accountAccessShell stackMd">
        {params.auth === 'ok' ? <div className="notice noticeSuccess noticeStrong">{tr(lang, 'Magic link accepted. You are now signed in.', 'Το magic link έγινε αποδεκτό. Έχεις συνδεθεί.')}</div> : null}
        {params.auth === 'failed' ? <div className="notice noticeError">{params.message ?? tr(lang, 'Sign-in failed.', 'Αποτυχία σύνδεσης.')}</div> : null}
        {params.auth === 'missing-code' ? <div className="notice noticeWarn">{tr(lang, 'Magic link was missing a valid auth code.', 'Το magic link δεν είχε έγκυρο κωδικό αυθεντικοποίησης.')}</div> : null}

        <AuthEmailForm
          nextPath={lang === 'el' ? '/?lang=el' : '/'}
          lang={lang}
          title={tr(lang, 'Sign in to MANTIS', 'Σύνδεση στο MANTIS')}
          description={tr(
            lang,
            'We will email a secure magic link to your invited address.',
            'Θα στείλουμε ασφαλές magic link στο email πρόσκλησης.'
          )}
        />
      </section>
    </AlphaShell>
  );
}
