import { AlphaShell } from '@/components/alpha-shell';
import { AdminResolutionPanel } from '@/components/admin-resolution-panel';
import { requireAdminAccess } from '@/lib/admin-access';

export const dynamic = 'force-dynamic';

function isMissingSettlementTableError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes('market_settlements') && normalized.includes('does not exist');
}

function queueRank(status: string) {
  switch (status) {
    case 'closed':
      return 0;
    case 'resolved':
      return 1;
    case 'void':
      return 2;
    case 'settled':
      return 3;
    default:
      return 4;
  }
}

export default async function AdminResolutionPage() {
  const access = await requireAdminAccess();

  if (!access.ok) {
    return (
      <AlphaShell title="Admin resolution" eyebrow="Week 5 resolution queue is now gated behind admin access.">
        <section className="card stackSm">
          <p className="eyebrow">Access required</p>
          <h2>Admin resolution queue unavailable</h2>
          <div className="notice noticeError">{access.error}</div>
          <p className="subtle">Only admin and super_admin profiles can record YES, NO, or VOID outcomes.</p>
        </section>
      </AlphaShell>
    );
  }

  const [{ data: markets, error: marketsError }, { data: resolutions, error: resolutionsError }, { data: settlements, error: settlementsError }] =
    await Promise.all([
      access.supabase
        .from('markets')
        .select('id,slug,question,status,close_time,resolution_time')
        .in('status', ['closed', 'resolved', 'void', 'settled'])
        .order('close_time', { ascending: true }),
      access.supabase.from('resolutions').select('id,market_id,outcome,evidence_summary,evidence_url,created_at'),
      access.supabase
        .from('market_settlements')
        .select('id,market_id,outcome,affected_accounts,total_payout,total_refund,total_realized_pnl,created_at')
    ]);

  const resolutionRows = (resolutions as any[]) ?? [];
  const settlementRows = settlementsError && isMissingSettlementTableError(settlementsError.message ?? '') ? [] : ((settlements as any[]) ?? []);
  const marketRows = (markets as any[]) ?? [];

  const resolutionByMarketId = new Map(
    resolutionRows.map((resolution) => [
      resolution.market_id,
      {
        id: resolution.id,
        outcome: resolution.outcome,
        evidenceSummary: resolution.evidence_summary,
        evidenceUrl: resolution.evidence_url,
        createdAt: resolution.created_at
      }
    ])
  );

  const settlementByMarketId = new Map(
    settlementRows.map((settlement) => [
      settlement.market_id,
      {
        id: settlement.id,
        outcome: settlement.outcome,
        affectedAccounts: Number(settlement.affected_accounts ?? 0),
        totalPayout: Number(settlement.total_payout ?? 0),
        totalRefund: Number(settlement.total_refund ?? 0),
        totalRealizedPnl: Number(settlement.total_realized_pnl ?? 0),
        createdAt: settlement.created_at
      }
    ])
  );

  const records = marketRows
    .map((market) => ({
      id: market.id,
      slug: market.slug,
      question: market.question,
      status: market.status,
      closeTime: market.close_time,
      resolutionTime: market.resolution_time,
      resolution: resolutionByMarketId.get(market.id) ?? null,
      settlement: settlementByMarketId.get(market.id) ?? null
    }))
    .sort((left, right) => {
      const rankDiff = queueRank(left.status) - queueRank(right.status);
      if (rankDiff !== 0) return rankDiff;
      return new Date(left.closeTime).getTime() - new Date(right.closeTime).getTime();
    });

  return (
    <AlphaShell title="Admin resolution" eyebrow="Week 5 closeout now covers resolution capture plus one-shot settlement execution with payout and void-refund readback.">
      {marketsError ? <div className="notice noticeError">Unable to load resolution queue: {marketsError.message}</div> : null}
      {resolutionsError ? <div className="notice noticeError">Unable to load resolution history: {resolutionsError.message}</div> : null}
      {settlementsError && !isMissingSettlementTableError(settlementsError.message ?? '') ? (
        <div className="notice noticeError">Unable to load settlement history: {settlementsError.message}</div>
      ) : null}
      <AdminResolutionPanel markets={records} />
    </AlphaShell>
  );
}
