-- 0015_fix_admin_resolution_market_id_ambiguity.sql
-- Fix PL/pgSQL ambiguity in admin resolution function where output-column variables shadow table columns.

create or replace function public.admin_record_market_resolution(
  p_admin_user_id uuid,
  p_market_id uuid,
  p_outcome resolution_outcome,
  p_evidence_summary text,
  p_evidence_url text default null
)
returns table (
  resolution_id uuid,
  market_id uuid,
  previous_status market_status,
  current_status market_status,
  outcome resolution_outcome,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_market markets%rowtype;
  v_updated markets%rowtype;
  v_resolution resolutions%rowtype;
  v_target_status market_status;
  v_evidence_summary text := trim(coalesce(p_evidence_summary, ''));
  v_evidence_url text := nullif(trim(coalesce(p_evidence_url, '')), '');
begin
  if length(v_evidence_summary) < 12 then
    raise exception 'evidenceSummary must be at least 12 characters';
  end if;

  select *
  into v_market
  from public.markets m
  where m.id = p_market_id
  for update;

  if not found then
    raise exception 'market not found';
  end if;

  if v_market.status <> 'closed' then
    raise exception 'market must be closed before resolution';
  end if;

  if exists (
    select 1
    from public.resolutions r
    where r.market_id = p_market_id
  ) then
    raise exception 'market already resolved';
  end if;

  v_target_status := case when p_outcome = 'void' then 'void'::market_status else 'resolved'::market_status end;

  insert into public.resolutions (
    market_id,
    outcome,
    evidence_summary,
    evidence_url,
    resolved_by
  )
  values (
    p_market_id,
    p_outcome,
    v_evidence_summary,
    v_evidence_url,
    p_admin_user_id
  )
  returning * into v_resolution;

  update public.markets
  set status = v_target_status,
      updated_at = now()
  where id = p_market_id
  returning * into v_updated;

  insert into public.admin_audit_logs (
    admin_user_id,
    action,
    entity_type,
    entity_id,
    before_json,
    after_json
  )
  values (
    p_admin_user_id,
    'market.resolution_recorded',
    'market',
    p_market_id::text,
    jsonb_build_object(
      'status', v_market.status,
      'resolution', null
    ),
    jsonb_build_object(
      'status', v_updated.status,
      'resolution_id', v_resolution.id,
      'outcome', v_resolution.outcome,
      'evidence_summary', v_resolution.evidence_summary,
      'evidence_url', v_resolution.evidence_url
    )
  );

  return query
  select v_resolution.id, v_updated.id, v_market.status, v_updated.status, v_resolution.outcome, v_resolution.created_at;
end;
$$;

revoke all on function public.admin_record_market_resolution(uuid, uuid, resolution_outcome, text, text) from public;
grant execute on function public.admin_record_market_resolution(uuid, uuid, resolution_outcome, text, text) to service_role;
grant execute on function public.admin_record_market_resolution(uuid, uuid, resolution_outcome, text, text) to postgres;
