insert into markets (
  slug,
  question,
  description,
  category,
  status,
  close_time,
  resolution_time,
  source_primary,
  source_fallback,
  void_rule,
  b_liquidity,
  fee_bps,
  yes_label,
  no_label
)
values (
  'gre-economy-cpi-above-5-may2026',
  'Will Greece annual CPI print above 5.0% for May 2026 at the June 10, 2026 ELSTAT release?',
  'Macro market on whether Greece annual CPI stays above the 5.0% threshold in the May 2026 ELSTAT print.',
  'economy',
  'open',
  '2026-06-10T08:55:00+00:00'::timestamptz,
  '2026-06-10T10:30:00+00:00'::timestamptz,
  'ELSTAT Consumer Price Index bulletin for May 2026',
  'Eurostat or TradingEconomics mirror only if it clearly reproduces the same final ELSTAT annual CPI print for May 2026',
  'Void if ELSTAT does not publish a comparable final annual CPI print for May 2026, or if the scheduled release is delayed without a clear final result in time for settlement.',
  120,
  50,
  'YES',
  'NO'
)
on conflict (slug) do update
set
  question = excluded.question,
  description = excluded.description,
  category = excluded.category,
  status = excluded.status,
  close_time = excluded.close_time,
  resolution_time = excluded.resolution_time,
  source_primary = excluded.source_primary,
  source_fallback = excluded.source_fallback,
  void_rule = excluded.void_rule,
  b_liquidity = excluded.b_liquidity,
  fee_bps = excluded.fee_bps,
  yes_label = excluded.yes_label,
  no_label = excluded.no_label,
  updated_at = timezone('utc', now());

insert into market_state (
  market_id,
  q_yes,
  q_no,
  yes_price,
  no_price,
  volume_total,
  open_interest,
  participants_count
)
select
  id,
  50,
  50,
  0.50,
  0.50,
  0,
  0,
  0
from markets
where slug = 'gre-economy-cpi-above-5-may2026'
  and not exists (
    select 1
    from market_state
    where market_state.market_id = markets.id
  );
