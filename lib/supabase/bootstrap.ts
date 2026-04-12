import { getSupabaseAdminClient } from '@/lib/supabase/admin';

type BootstrapUser = {
  id: string;
  user_metadata?: Record<string, unknown> | null;
};

function pickString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export async function ensureViewerBootstrap(user: BootstrapUser) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const admin = getSupabaseAdminClient();
  const metadata = user.user_metadata ?? {};
  const displayName = pickString(metadata.full_name) ?? pickString(metadata.name);
  const avatarUrl = pickString(metadata.avatar_url);

  const profileInsert = {
    user_id: user.id,
    display_name: displayName,
    avatar_url: avatarUrl,
    role: 'tester',
    locale: 'en'
  } as any;

  const walletInsert = {
    user_id: user.id,
    currency: 'PAPER_EUR',
    starting_balance: 1000,
    available_balance: 1000,
    realized_pnl: 0
  } as any;

  const [{ error: profileError }, { error: walletError }] = await Promise.all([
    admin.from('profiles').upsert(profileInsert, { onConflict: 'user_id', ignoreDuplicates: true }),
    admin.from('wallet_accounts').upsert(walletInsert, { onConflict: 'user_id', ignoreDuplicates: true })
  ]);

  const error = profileError?.message ?? walletError?.message;

  if (error) {
    throw new Error(error);
  }
}
