import { ensureViewerBootstrap } from '@/lib/supabase/bootstrap';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type AdminAccessResult =
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>;
      user: { id: string; email?: string | null };
      profile: { id: string; role: string; display_name?: string | null };
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export async function requireAdminAccess(): Promise<AdminAccessResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      status: 401,
      error: 'admin auth required'
    };
  }

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id,role,display_name')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!profileError && !profile) {
    await ensureViewerBootstrap(user);

    const refresh = await supabase.from('profiles').select('id,role,display_name').eq('user_id', user.id).limit(1).maybeSingle();
    profile = refresh.data;
    profileError = refresh.error;
  }

  if (profileError) {
    return {
      ok: false,
      status: 500,
      error: profileError.message
    };
  }

  const profileRow = (profile as any) ?? null;

  if (!profileRow || (profileRow.role !== 'admin' && profileRow.role !== 'super_admin')) {
    return {
      ok: false,
      status: 403,
      error: 'admin role required'
    };
  }

  return {
    ok: true,
    supabase,
    user: {
      id: user.id,
      email: user.email
    },
    profile: profileRow
  };
}
