import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-access';
import { assertLifecycleTransition, parseLifecycleTargetStatus } from '@/lib/admin-market-ops';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function mapLifecycleRpcStatus(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('market not found')) {
    return 404;
  }

  if (
    normalized.includes('already') ||
    normalized.includes('transition from') ||
    normalized.includes('only reopen before close_time') ||
    normalized.includes('only supports draft/open/paused/closed')
  ) {
    return 409;
  }

  return 500;
}

export async function POST(request: Request, { params }: { params: Promise<{ marketId: string }> }) {
  const access = await requireAdminAccess();

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const { marketId } = await params;
    const body = await request.json().catch(() => ({}));
    const targetStatus = parseLifecycleTargetStatus((body as { targetStatus?: unknown }).targetStatus);

    const { data: market, error: marketError } = await access.supabase
      .from('markets')
      .select('id,question,status,close_time')
      .eq('id', marketId)
      .limit(1)
      .maybeSingle();

    if (marketError) {
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: 'market not found' }, { status: 404 });
    }

    const marketRow = market as any;

    assertLifecycleTransition({
      currentStatus: marketRow.status,
      targetStatus,
      closeTime: marketRow.close_time
    });

    const admin = getSupabaseAdminClient();
    const { data, error } = await (admin as any).rpc('admin_transition_market_status', {
      p_admin_user_id: access.user.id,
      p_market_id: marketId,
      p_target_status: targetStatus
    });

    if (error) {
      return NextResponse.json(
        {
          error: 'market lifecycle update failed',
          detail: error.message
        },
        { status: mapLifecycleRpcStatus(error.message ?? '') }
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json(
      {
        status: 'ok',
        market: {
          id: marketRow.id,
          question: marketRow.question,
          previousStatus: result?.previous_status ?? marketRow.status,
          status: result?.current_status ?? targetStatus,
          updatedAt: result?.updated_at ?? new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'market lifecycle update failed'
      },
      { status: 400 }
    );
  }
}
