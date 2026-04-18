import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { parseUiLang } from '@/lib/env-clean';
import { getSupabaseServerClient } from '@/lib/supabase/server';

function normalizeNextPath(input: string | null) {
  if (!input || !input.startsWith('/')) {
    return '/';
  }

  return input;
}

type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';

function parseEmailOtpType(input: string | null): EmailOtpType | null {
  if (!input) {
    return null;
  }

  const allowedTypes: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'];
  return allowedTypes.includes(input as EmailOtpType) ? (input as EmailOtpType) : null;
}

function redirectWithAuthFailure(redirectUrl: URL, message: string) {
  Sentry.captureException(new Error(message), {
    tags: { route: 'auth/callback' }
  });

  redirectUrl.searchParams.set('auth', 'failed');
  redirectUrl.searchParams.set('message', message);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const otpType = parseEmailOtpType(url.searchParams.get('type'));
  const nextPath = normalizeNextPath(url.searchParams.get('next'));
  const redirectUrl = new URL(nextPath, url.origin);

  try {
    const supabase = await getSupabaseServerClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return redirectWithAuthFailure(redirectUrl, error.message);
      }
    } else if (tokenHash && otpType) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType
      });

      if (error) {
        return redirectWithAuthFailure(redirectUrl, error.message);
      }
    } else {
      const {
        data: { user: existingUser }
      } = await supabase.auth.getUser();

      if (!existingUser) {
        redirectUrl.searchParams.set('auth', 'missing-code');
        return NextResponse.redirect(redirectUrl);
      }
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
