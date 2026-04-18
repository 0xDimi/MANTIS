import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { ensureViewerBootstrap } from '@/lib/supabase/bootstrap';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function readViewerBootstrap(supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>, userId: string) {
  const [{ data: profile, error: profileError }, { data: wallet, error: walletError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id,user_id,display_name,username,role,locale,created_at')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('wallet_accounts')
      .select('id,user_id,currency,starting_balance,available_balance,realized_pnl,updated_at')
      .eq('user_id', userId)
      .maybeSingle()
  ]);

  return {
    profile,
    wallet,
    error: profileError?.message ?? walletError?.message ?? null
  };
}

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    Sentry.setUser({ id: user.id });

    let { profile, wallet, error: bootstrapError } = await readViewerBootstrap(supabase, user.id);

    if (!bootstrapError && (!profile || !wallet)) {
      await ensureViewerBootstrap(user);
      ({ profile, wallet, error: bootstrapError } = await readViewerBootstrap(supabase, user.id));
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          profile,
          wallet
        },
        bootstrapError
      },
      { status: 200 }
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { route: 'api/me' }
    });

    return NextResponse.json(
      {
        error: 'me API unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
