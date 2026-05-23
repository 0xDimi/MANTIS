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
  'gre-markets-athex-general-index-2300-may29-2026',
  'Will the Athens Stock Exchange General Index close above 2,300 points by Friday, May 29, 2026?',
  'Market on whether the Athens Stock Exchange General Index records an official closing value strictly above 2,300.00 points on any trading day through the Friday, May 29, 2026 session.',
  'economy',
  'open',
  '2026-05-29T14:20:00+00:00'::timestamptz,
  '2026-05-29T18:00:00+00:00'::timestamptz,
  'ATHEXGroup / Athens Exchange official end-of-day closing prices for indices, General Index',
  'ATHEXGroup official daily market bulletin, or a reputable financial news mirror reproducing the same official ATHEX closing value only if the official closing-prices page is unavailable',
  'YES if the official ATHEX General Index closing value is strictly above 2,300.00 points on any trading day through the May 29, 2026 session. NO if no such official close occurs. Void only if ATHEX does not publish a comparable official General Index close for the critical window.',
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
where slug = 'gre-markets-athex-general-index-2300-may29-2026'
  and not exists (
    select 1
    from market_state
    where market_state.market_id = markets.id
  );
