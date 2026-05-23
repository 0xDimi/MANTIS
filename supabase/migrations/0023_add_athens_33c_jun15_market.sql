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
  'gre-weather-athens-33c-by-jun15-2026',
  'Will the maximum air temperature in Athens exceed 33°C through June 15, 2026?',
  'Weather market on whether the official daily maximum air temperature in Athens exceeds 33.0°C at any point through the end of June 15, 2026.',
  'weather',
  'open',
  '2026-06-15T20:59:00+00:00'::timestamptz,
  '2026-06-16T09:00:00+00:00'::timestamptz,
  'National Observatory of Athens / meteo.gr station ATHENS - CENTER daily maximum air temperature',
  'HNMS/EMY official Athens station daily maximum temperature only if the meteo.gr station data for the critical window is unavailable',
  'YES if the official daily maximum air temperature at the defined Athens station is strictly above 33.0°C at any time through 2026-06-15 23:59 Europe/Athens. NO if it never exceeds 33.0°C. Void if comparable official maximum-temperature data for Athens is unavailable from both defined sources for the critical window.',
  100,
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
where slug = 'gre-weather-athens-33c-by-jun15-2026'
  and not exists (
    select 1
    from market_state
    where market_state.market_id = markets.id
  );
