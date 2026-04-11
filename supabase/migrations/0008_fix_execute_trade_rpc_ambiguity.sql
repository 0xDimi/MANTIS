-- 0008_fix_execute_trade_rpc_ambiguity.sql
-- Fix PL/pgSQL ambiguity with output column names (yes_shares/no_shares)

create or replace function public.execute_alpha_trade(
  p_user_id uuid,
  p_market_id uuid,
  p_side trade_side,
  p_action trade_action,
  p_amount numeric(14,2),
  p_avg_price numeric(10,6),
  p_share_delta numeric(18,8),
  p_fee_amount numeric(14,2),
  p_total_amount numeric(14,2),
  p_post_yes_price numeric(10,6),
  p_post_no_price numeric(10,6),
  p_quote_hash text default null
)
returns table (
  trade_id uuid,
  wallet_balance numeric(14,2),
  yes_shares numeric(18,8),
  no_shares numeric(18,8)
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trade_id uuid;
  v_wallet wallet_accounts%rowtype;
  v_position positions%rowtype;
  v_market_status market_status;
  v_net_amount numeric(14,2);
  v_cost_released numeric(14,2);
  v_realized_delta numeric(14,2);
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  select status into v_market_status
  from markets
  where id = p_market_id
  for update;

  if not found then
    raise exception 'market not found';
  end if;

  if v_market_status <> 'open' then
    raise exception 'market is not open';
  end if;

  select * into v_wallet
  from wallet_accounts
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'wallet not found';
  end if;

  insert into positions (user_id, market_id)
  values (p_user_id, p_market_id)
  on conflict (user_id, market_id) do nothing;

  select * into v_position
  from positions
  where user_id = p_user_id and market_id = p_market_id
  for update;

  if p_action = 'buy' then
    if v_wallet.available_balance < p_total_amount then
      raise exception 'insufficient balance';
    end if;

    update wallet_accounts
    set
      available_balance = available_balance - p_total_amount,
      updated_at = now()
    where id = v_wallet.id
    returning * into v_wallet;

    if p_side = 'yes' then
      update positions as p
      set
        yes_shares = p.yes_shares + p_share_delta,
        yes_cost_basis = p.yes_cost_basis + p_total_amount,
        updated_at = now()
      where p.id = v_position.id
      returning p.* into v_position;
    else
      update positions as p
      set
        no_shares = p.no_shares + p_share_delta,
        no_cost_basis = p.no_cost_basis + p_total_amount,
        updated_at = now()
      where p.id = v_position.id
      returning p.* into v_position;
    end if;

    v_net_amount := -p_total_amount;
  else
    if p_side = 'yes' then
      if v_position.yes_shares < p_share_delta then
        raise exception 'insufficient yes shares';
      end if;

      v_cost_released := case
        when v_position.yes_shares > 0 then round((v_position.yes_cost_basis / v_position.yes_shares) * p_share_delta, 2)
        else 0
      end;
    else
      if v_position.no_shares < p_share_delta then
        raise exception 'insufficient no shares';
      end if;

      v_cost_released := case
        when v_position.no_shares > 0 then round((v_position.no_cost_basis / v_position.no_shares) * p_share_delta, 2)
        else 0
      end;
    end if;

    v_realized_delta := round(p_total_amount - v_cost_released, 2);

    update wallet_accounts
    set
      available_balance = available_balance + p_total_amount,
      realized_pnl = realized_pnl + v_realized_delta,
      updated_at = now()
    where id = v_wallet.id
    returning * into v_wallet;

    if p_side = 'yes' then
      update positions as p
      set
        yes_shares = p.yes_shares - p_share_delta,
        yes_cost_basis = greatest(p.yes_cost_basis - v_cost_released, 0),
        realized_pnl = p.realized_pnl + v_realized_delta,
        updated_at = now()
      where p.id = v_position.id
      returning p.* into v_position;
    else
      update positions as p
      set
        no_shares = p.no_shares - p_share_delta,
        no_cost_basis = greatest(p.no_cost_basis - v_cost_released, 0),
        realized_pnl = p.realized_pnl + v_realized_delta,
        updated_at = now()
      where p.id = v_position.id
      returning p.* into v_position;
    end if;

    v_net_amount := p_total_amount;
  end if;

  insert into trades (
    user_id,
    market_id,
    side,
    action,
    share_delta,
    avg_price,
    gross_amount,
    fee_amount,
    net_amount
  )
  values (
    p_user_id,
    p_market_id,
    p_side,
    p_action,
    p_share_delta,
    p_avg_price,
    p_amount,
    p_fee_amount,
    v_net_amount
  )
  returning id into v_trade_id;

  insert into ledger_entries (
    wallet_account_id,
    entry_type,
    amount,
    balance_after,
    trade_id,
    market_id,
    metadata_json
  )
  values (
    v_wallet.id,
    case when p_action = 'buy' then 'trade_buy'::entry_type else 'trade_sell'::entry_type end,
    v_net_amount,
    v_wallet.available_balance,
    v_trade_id,
    p_market_id,
    jsonb_build_object('quote_hash', p_quote_hash)
  );

  update market_state
  set
    yes_price = p_post_yes_price,
    no_price = p_post_no_price,
    q_yes = case
      when p_side = 'yes' and p_action = 'buy' then q_yes + p_share_delta
      when p_side = 'yes' and p_action = 'sell' then greatest(q_yes - p_share_delta, 0)
      else q_yes
    end,
    q_no = case
      when p_side = 'no' and p_action = 'buy' then q_no + p_share_delta
      when p_side = 'no' and p_action = 'sell' then greatest(q_no - p_share_delta, 0)
      else q_no
    end,
    volume_total = volume_total + p_amount,
    open_interest = case
      when p_action = 'buy' then open_interest + p_amount
      else greatest(open_interest - p_amount, 0)
    end,
    last_trade_at = now(),
    updated_at = now()
  where market_id = p_market_id;

  return query
  select
    v_trade_id,
    v_wallet.available_balance,
    v_position.yes_shares,
    v_position.no_shares;
end;
$$;
