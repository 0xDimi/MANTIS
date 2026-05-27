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
  'gre-sports-zambidis-mayweather-win-jun27-2026',
  'Will Mike Zambidis be officially declared the winner against Floyd Mayweather on June 27, 2026?',
  'Sports market on whether Mike Zambidis is officially declared the winner of the scheduled Floyd Mayweather vs. Mike Zambidis exhibition boxing bout in Athens, Greece.',
  'sports',
  'open',
  '2026-06-27T16:55:00+00:00'::timestamptz,
  '2026-06-27T22:30:00+00:00'::timestamptz,
  'Official event, promoter, broadcast, or commission-style result announcement for Floyd Mayweather vs. Mike Zambidis on June 27, 2026',
  'Tapology, BoxRec if listed, Associated Press/AFP/Reuters, ESPN, BBC Sport, Sporting News, or another reputable combat-sports report that clearly states the official result',
  'YES only if Mike Zambidis is officially declared the winner by decision, KO/TKO, DQ, retirement, or another official winning method. NO if Floyd Mayweather is declared winner, if the bout is officially a draw/no contest, or if the exhibition ends with no official winner declared. Void if the bout is cancelled, not held by July 31, 2026, the named opponent changes, or rules change materially away from a boxing/exhibition boxing bout before it starts.',
  115,
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
where slug = 'gre-sports-zambidis-mayweather-win-jun27-2026'
  and not exists (
    select 1
    from market_state
    where market_state.market_id = markets.id
  );
