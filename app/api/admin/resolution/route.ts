import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-access';
import {
  assertResolutionAllowed,
  deriveResolutionStatus,
  parseResolutionOutcome,
  validateEvidenceSummary,
  validateEvidenceUrl
} from '@/lib/admin-market-ops';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function mapResolutionRpcStatus(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('market not found')) {
    return 404;
  }

  if (normalized.includes('already resolved') || normalized.includes('must be closed') || normalized.includes('at least 12 characters')) {
    return 409;
  }

  return 500;
}

type ResolutionBody = {
  marketId?: unknown;
  outcome?: unknown;
  evidenceSummary?: unknown;
  evidenceUrl?: unknown;
};

export async function POST(request: Request) {
  const access = await requireAdminAccess();

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as ResolutionBody;
    const marketId = typeof body.marketId === 'string' ? body.marketId : '';
    const outcome = parseResolutionOutcome(body.outcome);
    const evidenceSummary = validateEvidenceSummary(body.evidenceSummary);
    const evidenceUrl = validateEvidenceUrl(body.evidenceUrl);

    if (!marketId) {
      return NextResponse.json({ error: 'marketId is required' }, { status: 400 });
    }

    const [{ data: market, error: marketError }, { data: resolution, error: resolutionError }] = await Promise.all([
      access.supabase.from('markets').select('id,question,status').eq('id', marketId).limit(1).maybeSingle(),
      access.supabase.from('resolutions').select('id,outcome').eq('market_id', marketId).limit(1).maybeSingle()
    ]);

    if (marketError) {
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (resolutionError) {
      return NextResponse.json({ error: resolutionError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: 'market not found' }, { status: 404 });
    }

    const marketRow = market as any;
    const resolutionRow = (resolution as any) ?? null;

    assertResolutionAllowed({
      marketStatus: marketRow.status,
      outcome,
      existingOutcome: resolutionRow?.outcome ?? null
    });

    if (resolutionRow) {
      return NextResponse.json({ error: `market already resolved as ${resolutionRow.outcome}` }, { status: 409 });
    }

    const admin = getSupabaseAdminClient();
    const { data, error } = await (admin as any).rpc('admin_record_market_resolution', {
      p_admin_user_id: access.user.id,
      p_market_id: marketId,
      p_outcome: outcome,
      p_evidence_summary: evidenceSummary,
      p_evidence_url: evidenceUrl
    });

    if (error) {
      return NextResponse.json(
        {
          error: 'market resolution write failed',
          detail: error.message
        },
        { status: mapResolutionRpcStatus(error.message ?? '') }
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json(
      {
        status: 'ok',
        resolution: {
          id: result?.resolution_id ?? null,
          marketId,
          question: marketRow.question,
          outcome,
          marketStatus: result?.current_status ?? deriveResolutionStatus(outcome),
          createdAt: result?.created_at ?? new Date().toISOString(),
          evidenceSummary,
          evidenceUrl
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'market resolution write failed'
      },
      { status: 400 }
    );
  }
}
