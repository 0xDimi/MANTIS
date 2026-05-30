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
values
  (
    'gre-markets-athex-general-index-2415-jun12-2026',
    'Will the Athens Stock Exchange General Index close above 2,415 points by Friday, June 12, 2026?',
    'Market on whether the Athens Stock Exchange General Index records an official closing value strictly above 2,415.00 points on any trading day through the Friday, June 12, 2026 session.',
    'economy',
    'open',
    '2026-06-12T14:20:00+00:00'::timestamptz,
    '2026-06-12T18:00:00+00:00'::timestamptz,
    'ATHEXGroup / Athens Exchange official end-of-day closing prices for indices, General Index',
    'ATHEXGroup official daily market bulletin, or a reputable financial news mirror reproducing the same official ATHEX closing value only if the official closing-prices page is unavailable',
    'YES if the official ATHEX General Index closing value is strictly above 2,415.00 points on any trading day through the June 12, 2026 session. NO if no such official close occurs. Void only if ATHEX does not publish a comparable official General Index close for the critical window.',
    120,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-gas-unleaded-above-213-jun04-2026',
    'Will Greece Euro-super 95 retail price be above €2.13/L in the June 4, 2026 EC Weekly Oil Bulletin?',
    'Consumer fuel-price market tied to the European Commission Weekly Oil Bulletin row for Greece and Euro-super 95 with taxes.',
    'gas',
    'open',
    '2026-06-04T08:55:00+00:00'::timestamptz,
    '2026-06-04T12:00:00+00:00'::timestamptz,
    'European Commission Weekly Oil Bulletin, Prices with taxes latest prices xlsx, Greece row, Euro-super 95 column',
    'data.europa.eu Oil Bulletin dataset mirror only if it clearly reproduces the same Commission weekly price for Greece Euro-super 95 with taxes',
    'YES if the June 4, 2026 EC Weekly Oil Bulletin reports Greece Euro-super 95 with taxes strictly above 2,130 EUR per 1000L. NO if it is 2,130 EUR per 1000L or below. Void if the Commission does not publish a comparable with-taxes Greece Euro-super 95 value for the eligible bulletin in time for settlement.',
    105,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-economy-unemployment-below-95-may2026',
    'Will Greece seasonally adjusted unemployment print below 9.5% for May 2026 in the July 1, 2026 ELSTAT release?',
    'Macro market on whether Greece seasonally adjusted unemployment moves below the 9.5% threshold in the May 2026 ELSTAT monthly labour force release.',
    'economy',
    'open',
    '2026-07-01T08:55:00+00:00'::timestamptz,
    '2026-07-01T10:30:00+00:00'::timestamptz,
    'ELSTAT Labour Force Survey monthly estimates release for May 2026',
    'Eurostat or TradingEconomics mirror only if it clearly reproduces the same final ELSTAT seasonally adjusted unemployment rate for May 2026',
    'YES if the ELSTAT May 2026 monthly labour force release reports the seasonally adjusted unemployment rate strictly below 9.5%. NO if it is 9.5% or higher. Void if ELSTAT does not publish a comparable final seasonally adjusted unemployment rate for May 2026 in time for settlement.',
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
where slug in (
  'gre-markets-athex-general-index-2415-jun12-2026',
  'gre-gas-unleaded-above-213-jun04-2026',
  'gre-economy-unemployment-below-95-may2026'
)
  and not exists (
    select 1
    from market_state
    where market_state.market_id = markets.id
  );
