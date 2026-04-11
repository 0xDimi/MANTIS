import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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

    await Promise.all([
      supabase.from('profiles').upsert(
        {
          user_id: user.id,
          display_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          role: 'tester',
          locale: 'en'
        } as any,
        { onConflict: 'user_id', ignoreDuplicates: false }
      ),
      supabase.from('wallet_accounts').upsert(
        {
          user_id: user.id,
          currency: 'PAPER_EUR',
          starting_balance: 1000,
          available_balance: 1000,
          realized_pnl: 0
        } as any,
        { onConflict: 'user_id', ignoreDuplicates: false }
      )
    ]);

    const [{ data: profile }, { data: wallet }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id,user_id,display_name,username,role,locale,created_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('wallet_accounts')
        .select('id,user_id,currency,starting_balance,available_balance,realized_pnl,updated_at')
        .eq('user_id', user.id)
        .maybeSingle()
    ]);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          profile,
          wallet
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'me API unavailable',
        detail: error instanceof Error ? error.message : 'unknown'
      },
      { status: 500 }
    );
  }
}
