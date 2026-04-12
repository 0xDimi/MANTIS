-- 0016_week5_settlement_engine.sql
-- Week 5: one-shot settlement write path, payout/refund ledger reflection, and settled-state audit trail.

create table if not exists public.market_settlements (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null unique references public.markets(id) on delete cascade,
  resolution_id uuid not null unique references public.resolutions(id) on delete cascade,
  settled_by uuid not null,
  outcome resolution_outcome not null,
  affected_accounts integer not null default 0,
  total_payout numeric(14,2) not null default 0,
  total_refund numeric(14,2) not null default 0,
  total_realized_pnl numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.market_settlement_entries (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references public.market_settlements(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade,
  user_id uuid not null,
  wallet_account_id uuid not null references public.wallet_accounts(id) on delete cascade,
  ledger_entry_id uuid references public.ledger_entries(id) on delete set null,
  payout_amount numeric(14,2) not null default 0,
  refund_amount numeric(14,2) not null default 0,
  realized_delta numeric(14,2) not null default 0,
  yes_shares_closed numeric(18,8) not null default 0,
  no_shares_closed numeric(18,8) not null default 0,
  yes_cost_basis_closed numeric(14,2) not null default 0,
  no_cost_basis_closed numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (settlement_id, user_id)
);

create index if not exists idx_market_settlements_market_created on public.market_settlements(market_id, created_at desc);
create index if not exists idx_market_settlement_entries_market_created on public.market_settlement_entries(market_id, created_at desc);
create index if not exists idx_market_settlement_entries_user_created on public.market_settlement_entries(user_id, created_at desc);

alter table public.market_settlements enable row level security;
alter table public.market_settlement_entries enable row level security;

drop policy if exists "market_settlements_select_public" on public.market_settlements;
create policy "market_settlements_select_public"
on public.market_settlements
for select
using (true);

drop policy if exists "market_settlement_entries_select_own" on public.market_settlement_entries;
create policy "market_settlement_entries_select_own"
on public.market_settlement_entries
for select
using (auth.uid() = user_id);

create or replace function public.admin_settle_market(
  p_admin_user_id uuid,
  p_market_id uuid
)
returns table (
  settlement_id uuid,
  market_id uuid,
  previous_status market_status,
  current_status market_status,
  outcome resolution_outcome,
  affected_accounts integer,
  total_payout numeric(14,2),
  total_refund numeric(14,2),
  total_realized_pnl numeric(14,2),
  settled_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_market markets%rowtype;
  v_updated_market markets%rowtype;
  v_resolution resolutions%rowtype;
  v_existing_settlement market_settlements%rowtype;
  v_settlement market_settlements%rowtype;
  v_position positions%rowtype;
  v_wallet wallet_accounts%rowtype;
  v_ledger_id uuid;
  v_previous_status market_status;
  v_yes_shares numeric(18,8);
  v_no_shares numeric(18,8);
  v_yes_cost_basis numeric(14,2);
  v_no_cost_basis numeric(14,2);
  v_total_cost_basis numeric(14,2);
  v_payout_amount numeric(14,2);
  v_refund_amount numeric(14,2);
  v_wallet_delta numeric(14,2);
  v_realized_delta numeric(14,2);
  v_affected_accounts integer := 0;
  v_total_payout numeric(14,2) := 0;
  v_total_refund numeric(14,2) := 0;
  v_total_realized_pnl numeric(14,2) := 0;
  v_entry_type entry_type;
  v_final_yes_price numeric(10,6);
  v_final_no_price numeric(10,6);
begin
  select *
  into v_market
  from public.markets m
  where m.id = p_market_id
  for update;

  if not found then
    raise exception 'market not found';
  end if;

  v_previous_status := v_market.status;

  select *
  into v_existing_settlement
  from public.market_settlements s
  where s.market_id = p_market_id
  limit 1;

  if found then
    if v_market.status <> 'settled' then
      raise exception 'settlement record exists but market status is %', v_market.status;
    end if;

    return query
    select
      v_existing_settlement.id,
      v_existing_settlement.market_id,
      'settled'::market_status,
      'settled'::market_status,
      v_existing_settlement.outcome,
      v_existing_settlement.affected_accounts,
      v_existing_settlement.total_payout,
      v_existing_settlement.total_refund,
      v_existing_settlement.total_realized_pnl,
      v_existing_settlement.created_at;
    return;
  end if;

  if v_market.status not in ('resolved', 'void') then
    raise exception 'market must be resolved or void before settlement';
  end if;

  select *
  into v_resolution
  from public.resolutions r
  where r.market_id = p_market_id
  limit 1;

  if not found then
    raise exception 'market resolution missing';
  end if;

  if v_market.status = 'void' and v_resolution.outcome <> 'void' then
    raise exception 'void market requires a void resolution';
  end if;

  if v_market.status = 'resolved' and v_resolution.outcome = 'void' then
    raise exception 'resolved market requires a yes or no resolution';
  end if;

  insert into public.market_settlements (
    market_id,
    resolution_id,
    settled_by,
    outcome
  )
  values (
    p_market_id,
    v_resolution.id,
    p_admin_user_id,
    v_resolution.outcome
  )
  returning * into v_settlement;

  for v_position in
    select *
    from public.positions p
    where p.market_id = p_market_id
      and (
        coalesce(p.yes_shares, 0) > 0
        or coalesce(p.no_shares, 0) > 0
        or coalesce(p.yes_cost_basis, 0) > 0
        or coalesce(p.no_cost_basis, 0) > 0
      )
    order by p.user_id
    for update
  loop
    select *
    into v_wallet
    from public.wallet_accounts w
    where w.user_id = v_position.user_id
    for update;

    if not found then
      raise exception 'wallet not found for user %', v_position.user_id;
    end if;

    v_yes_shares := coalesce(v_position.yes_shares, 0);
    v_no_shares := coalesce(v_position.no_shares, 0);
    v_yes_cost_basis := round(coalesce(v_position.yes_cost_basis, 0), 2);
    v_no_cost_basis := round(coalesce(v_position.no_cost_basis, 0), 2);
    v_total_cost_basis := round(v_yes_cost_basis + v_no_cost_basis, 2);

    if v_resolution.outcome = 'void' then
      v_payout_amount := 0;
      v_refund_amount := v_total_cost_basis;
      v_wallet_delta := v_refund_amount;
      v_realized_delta := 0;
      v_entry_type := 'void_refund'::entry_type;
    elsif v_resolution.outcome = 'yes' then
      v_payout_amount := round(v_yes_shares, 2);
      v_refund_amount := 0;
      v_wallet_delta := v_payout_amount;
      v_realized_delta := round(v_wallet_delta - v_total_cost_basis, 2);
      v_entry_type := 'settlement'::entry_type;
    else
      v_payout_amount := round(v_no_shares, 2);
      v_refund_amount := 0;
      v_wallet_delta := v_payout_amount;
      v_realized_delta := round(v_wallet_delta - v_total_cost_basis, 2);
      v_entry_type := 'settlement'::entry_type;
    end if;

    update public.wallet_accounts
    set
      available_balance = available_balance + v_wallet_delta,
      realized_pnl = realized_pnl + v_realized_delta,
      updated_at = now()
    where id = v_wallet.id
    returning * into v_wallet;

    update public.positions as p
    set
      yes_shares = 0,
      no_shares = 0,
      yes_cost_basis = 0,
      no_cost_basis = 0,
      realized_pnl = p.realized_pnl + v_realized_delta,
      updated_at = now()
    where p.id = v_position.id
    returning p.* into v_position;

    insert into public.ledger_entries (
      wallet_account_id,
      entry_type,
      amount,
      balance_after,
      market_id,
      metadata_json
    )
    values (
      v_wallet.id,
      v_entry_type,
      v_wallet_delta,
      v_wallet.available_balance,
      p_market_id,
      jsonb_build_object(
        'settlement_id', v_settlement.id,
        'resolution_id', v_resolution.id,
        'outcome', v_resolution.outcome,
        'payout_amount', v_payout_amount,
        'refund_amount', v_refund_amount,
        'realized_delta', v_realized_delta,
        'yes_shares_closed', v_yes_shares,
        'no_shares_closed', v_no_shares,
        'yes_cost_basis_closed', v_yes_cost_basis,
        'no_cost_basis_closed', v_no_cost_basis
      )
    )
    returning id into v_ledger_id;

    insert into public.market_settlement_entries (
      settlement_id,
      market_id,
      user_id,
      wallet_account_id,
      ledger_entry_id,
      payout_amount,
      refund_amount,
      realized_delta,
      yes_shares_closed,
      no_shares_closed,
      yes_cost_basis_closed,
      no_cost_basis_closed
    )
    values (
      v_settlement.id,
      p_market_id,
      v_position.user_id,
      v_wallet.id,
      v_ledger_id,
      v_payout_amount,
      v_refund_amount,
      v_realized_delta,
      v_yes_shares,
      v_no_shares,
      v_yes_cost_basis,
      v_no_cost_basis
    );

    v_affected_accounts := v_affected_accounts + 1;
    v_total_payout := round(v_total_payout + v_payout_amount, 2);
    v_total_refund := round(v_total_refund + v_refund_amount, 2);
    v_total_realized_pnl := round(v_total_realized_pnl + v_realized_delta, 2);
  end loop;

  update public.market_settlements
  set
    affected_accounts = v_affected_accounts,
    total_payout = v_total_payout,
    total_refund = v_total_refund,
    total_realized_pnl = v_total_realized_pnl
  where id = v_settlement.id
  returning * into v_settlement;

  if v_resolution.outcome = 'yes' then
    v_final_yes_price := 1;
    v_final_no_price := 0;
  elsif v_resolution.outcome = 'no' then
    v_final_yes_price := 0;
    v_final_no_price := 1;
  else
    v_final_yes_price := 0.5;
    v_final_no_price := 0.5;
  end if;

  update public.markets
  set
    status = 'settled',
    updated_at = now()
  where id = p_market_id
  returning * into v_updated_market;

  update public.market_state
  set
    yes_price = v_final_yes_price,
    no_price = v_final_no_price,
    open_interest = 0,
    updated_at = now()
  where market_id = p_market_id;

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
    'market.settlement_executed',
    'market',
    p_market_id::text,
    jsonb_build_object(
      'status', v_previous_status,
      'outcome', v_resolution.outcome
    ),
    jsonb_build_object(
      'status', v_updated_market.status,
      'settlement_id', v_settlement.id,
      'affected_accounts', v_settlement.affected_accounts,
      'total_payout', v_settlement.total_payout,
      'total_refund', v_settlement.total_refund,
      'total_realized_pnl', v_settlement.total_realized_pnl
    )
  );

  return query
  select
    v_settlement.id,
    v_updated_market.id,
    v_previous_status,
    v_updated_market.status,
    v_settlement.outcome,
    v_settlement.affected_accounts,
    v_settlement.total_payout,
    v_settlement.total_refund,
    v_settlement.total_realized_pnl,
    v_settlement.created_at;
end;
$$;

revoke all on function public.admin_settle_market(uuid, uuid) from public, anon, authenticated;
grant execute on function public.admin_settle_market(uuid, uuid) to service_role;
grant execute on function public.admin_settle_market(uuid, uuid) to postgres;
