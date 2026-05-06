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
select
  'gre-sports-euroleague-final',
  'Will a Greek team reach the EuroLeague Final?',
  'Successor sports market covering whether a Greek club reaches the EuroLeague championship game.',
  'sports',
  'open',
  '2026-05-22T14:30:00+00:00'::timestamptz,
  '2026-05-22T18:30:00+00:00'::timestamptz,
  'EuroLeague official Final Four game result / bracket update',
  'Official Greek-club match report confirming qualification to the EuroLeague Final',
  'Void if no Greek team qualifies for the Final Four or if the semifinal involving the Greek team is not completed officially on schedule.',
  105,
  50,
  'YES',
  'NO'
where not exists (
  select 1 from markets where slug = 'gre-sports-euroleague-final'
);

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
where slug = 'gre-sports-euroleague-final'
  and not exists (
    select 1
    from market_state
    where market_state.market_id = markets.id
  );
