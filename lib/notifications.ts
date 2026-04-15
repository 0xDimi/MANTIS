import { getSupabaseServerClient } from '@/lib/supabase/server';

export type NotificationRow = {
  id: string;
  slug: string;
  question: string;
  status: string;
  close_time: string;
  updated_at?: string;
};

export async function loadNotificationSummary() {
  try {
    const supabase = await getSupabaseServerClient();
    const now = new Date();
    const in6h = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [closingSoonRes, recentEventsRes] = await Promise.all([
      supabase
        .from('markets')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .gte('close_time', now.toISOString())
        .lte('close_time', in6h.toISOString()),
      supabase
        .from('markets')
        .select('id', { count: 'exact', head: true })
        .in('status', ['closed', 'resolved', 'settled'])
        .gte('updated_at', since24h.toISOString())
    ]);

    return {
      count: Number(closingSoonRes.count ?? 0) + Number(recentEventsRes.count ?? 0)
    };
  } catch {
    return { count: 0 };
  }
}

export async function loadNotificationsFeed() {
  try {
    const supabase = await getSupabaseServerClient();
    const now = new Date();
    const in6h = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [closingSoonRes, recentEventsRes] = await Promise.all([
      supabase
        .from('markets')
        .select('id,slug,question,status,close_time,updated_at')
        .eq('status', 'open')
        .gte('close_time', now.toISOString())
        .lte('close_time', in6h.toISOString())
        .order('close_time', { ascending: true })
        .limit(8),
      supabase
        .from('markets')
        .select('id,slug,question,status,close_time,updated_at')
        .in('status', ['closed', 'resolved', 'settled'])
        .gte('updated_at', since24h.toISOString())
        .order('updated_at', { ascending: false })
        .limit(12)
    ]);

    return {
      closingSoon: ((closingSoonRes.data ?? []) as NotificationRow[]).map((row) => ({
        ...row,
        kind: 'closing' as const
      })),
      recentEvents: ((recentEventsRes.data ?? []) as NotificationRow[]).map((row) => ({
        ...row,
        kind: 'event' as const
      })),
      error: closingSoonRes.error?.message ?? recentEventsRes.error?.message ?? null
    };
  } catch (error) {
    return {
      closingSoon: [] as Array<NotificationRow & { kind: 'closing' }>,
      recentEvents: [] as Array<NotificationRow & { kind: 'event' }>,
      error: error instanceof Error ? error.message : 'unknown error'
    };
  }
}
