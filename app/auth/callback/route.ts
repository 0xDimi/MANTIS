import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { parseUiLang } from '@/lib/env-clean';
import { getSupabaseServerClient } from '@/lib/supabase/server';

function normalizeNextPath(input: string | null) {
  if (!input || !input.startsWith('/')) {
    return '/profile';
  }

  return input;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextPath = normalizeNextPath(url.searchParams.get('next'));
  const redirectUrl = new URL(nextPath, url.origin);

  if (!code) {
    redirectUrl.searchParams.set('auth', 'missing-code');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      Sentry.captureException(new Error(error.message), {
        tags: { route: 'auth/callback' }
      });

      redirectUrl.searchParams.set('auth', 'failed');
      redirectUrl.searchParams.set('message', error.message);
      return NextResponse.redirect(redirectUrl);
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    let preferredLang: 'en' | 'el' | null = null;

    if (user) {
      Sentry.setUser({ id: user.id });

      const { data: profile } = await supabase
        .from('profiles')
        .select('locale')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      preferredLang = parseUiLang((profile as { locale?: string | null } | null)?.locale ?? null);
    }

    if (!redirectUrl.searchParams.get('lang') && preferredLang === 'el') {
      redirectUrl.searchParams.set('lang', 'el');
    }

    redirectUrl.searchParams.set('auth', 'ok');
    const response = NextResponse.redirect(redirectUrl);

    if (preferredLang) {
      response.cookies.set('mantis_lang', preferredLang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }

    return response;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: 'auth/callback' }
    });

    redirectUrl.searchParams.set('auth', 'failed');
    redirectUrl.searchParams.set('message', error instanceof Error ? error.message : 'unknown');
    return NextResponse.redirect(redirectUrl);
  }
}
