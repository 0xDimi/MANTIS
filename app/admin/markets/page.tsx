import { AlphaShell } from '@/components/alpha-shell';
import { AdminMarketLifecyclePanel } from '@/components/admin-market-lifecycle-panel';
import { requireAdminAccess } from '@/lib/admin-access';

export const dynamic = 'force-dynamic';

export default async function AdminMarketsPage() {
  const access = await requireAdminAccess();

  if (!access.ok) {
    return (
      <AlphaShell title="Admin markets" eyebrow="Week 5 lifecycle controls now live behind admin access.">
        <section className="card stackSm">
          <p className="eyebrow">Access required</p>
          <h2>Admin lifecycle console unavailable</h2>
          <div className="notice noticeError">{access.error}</div>
          <p className="subtle">Only admin and super_admin profiles can use the rebuilt lifecycle controls.</p>
        </section>
      </AlphaShell>
    );
  }

  const { data: markets, error } = await access.supabase
    .from('markets')
    .select('id,slug,question,category,status,close_time,resolution_time')
    .order('close_time', { ascending: true });

  const marketRows = ((markets as any[]) ?? []).map((market) => ({
    id: market.id,
    slug: market.slug,
    question: market.question,
    category: market.category,
    status: market.status,
    closeTime: market.close_time,
    resolutionTime: market.resolution_time
  }));

  return (
    <AlphaShell title="Admin markets" eyebrow="Practical lifecycle controls are now wired on rebuilt routes with server-side admin validation and audit-safe writes.">
      {error ? <div className="notice noticeError">Unable to load lifecycle board: {error.message}</div> : null}
      <AdminMarketLifecyclePanel markets={marketRows} />
    </AlphaShell>
  );
}
