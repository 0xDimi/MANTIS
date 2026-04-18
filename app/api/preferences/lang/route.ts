import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { parseUiLang } from '@/lib/env-clean';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type LangBody = {
  lang?: string;
};

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  try {
    const body = (await request.json()) as LangBody;
    const lang = parseUiLang(body.lang);

    if (!lang) {
      return NextResponse.json({ error: 'lang must be en or el' }, { status: 400 });
    }

    response.cookies.set('mantis_lang', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (!authError && user) {
      Sentry.setUser({ id: user.id });
      const { error } = await (supabase.from('profiles') as any).update({ locale: lang }).eq('user_id', user.id);

      if (error) {
        Sentry.captureException(new Error(error.message), {
          tags: { route: 'api/preferences/lang' },
          extra: { lang }
        });
      }
    }

    return response;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: 'api/preferences/lang' }
    });

    return NextResponse.json(
      {
        error: 'language update unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
