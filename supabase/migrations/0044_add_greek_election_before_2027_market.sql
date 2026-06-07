insert into public.markets (
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
  'gre-politics-election-before-2027',
  'Greek election before 2027?',
  'Greek politics market on whether Greece will hold a national parliamentary election before January 1, 2027.',
  'politics',
  'open',
  '2026-12-31T21:59:00+00:00'::timestamptz,
  '2027-01-02T12:00:00+00:00'::timestamptz,
  'Official Greek Ministry of Interior national election results page, presidential dissolution decree, or other official state publication confirming that a parliamentary election was held before the deadline',
  'Reuters, Associated Press, or other major Greek national media only if they clearly report that Greece held a national parliamentary election before the deadline and the report can be tied to official election administration',
  'YES if Greece holds a national parliamentary election at any time before 2027-01-01 00:00 in Athens. NO if no such election is held before that deadline. Snap elections, early elections, and regularly scheduled national parliamentary elections all count. European Parliament elections, local elections, party leadership votes, cabinet reshuffles, confidence votes, or mere election announcements do not count. Void only if official public records are materially conflicting or unavailable after the resolution window.',
  125,
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

insert into public.market_state (
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
from public.markets
where slug = 'gre-politics-election-before-2027'
  and not exists (
    select 1
    from public.market_state
    where market_state.market_id = markets.id
  );
