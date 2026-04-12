import { NextResponse } from 'next/server';
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
      redirectUrl.searchParams.set('auth', 'failed');
      redirectUrl.searchParams.set('message', error.message);
      return NextResponse.redirect(redirectUrl);
    }

    redirectUrl.searchParams.set('auth', 'ok');
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    redirectUrl.searchParams.set('auth', 'failed');
    redirectUrl.searchParams.set('message', error instanceof Error ? error.message : 'unknown');
    return NextResponse.redirect(redirectUrl);
  }
}
