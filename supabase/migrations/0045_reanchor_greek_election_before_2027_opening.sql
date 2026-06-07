-- Re-anchor the untouched Greek election market from neutral discovery-mode seed
-- to the operator-approved 30/70 public-lean opener.

update public.market_state
set
  q_yes = 0,
  q_no = 105.912233,
  yes_price = 0.30,
  no_price = 0.70,
  updated_at = timezone('utc', now())
where market_id = (
  select id
  from public.markets
  where slug = 'gre-politics-election-before-2027'
)
  and coalesce(volume_total, 0) = 0
  and coalesce(open_interest, 0) = 0
  and coalesce(participants_count, 0) = 0
  and last_trade_at is null;

update public.markets
set updated_at = timezone('utc', now())
where slug = 'gre-politics-election-before-2027';
