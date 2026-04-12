-- 0012_refresh_launch_markets_simple_no_crypto.sql
-- Refresh alpha launch slate to simpler markets and remove crypto/sports for initial launch.

insert into markets (
  slug, question, description, category, status, close_time, resolution_time,
  source_primary, source_fallback, void_rule, b_liquidity, fee_bps, yes_label, no_label
)
values
  ('gre-politics-cabinet-reshuffle-announced', 'Will the Greek government announce a cabinet reshuffle before month-end?', 'Simple politics headline market.', 'politics', 'open', now() + interval '18 days', now() + interval '19 days', 'Government Gazette or Prime Minister office announcement', 'Parliament press room archive', 'Void if no official announcement is published by close.', 110, 200, 'YES', 'NO'),
  ('gre-politics-opposition-leadership-change', 'Will any major opposition party announce a leadership change this month?', 'Simple party leadership event market.', 'politics', 'open', now() + interval '20 days', now() + interval '21 days', 'Official party announcement', 'Tier-1 Greek media confirmation', 'Void if reports conflict and no official statement confirms.', 100, 200, 'YES', 'NO'),
  ('gre-economy-inflation-below-2', 'Will annual CPI print below 2.0% at the next ELSTAT release?', 'Headline inflation market.', 'economy', 'open', now() + interval '21 days', now() + interval '22 days', 'ELSTAT CPI bulletin', 'Eurostat CPI mirror', 'Void if ELSTAT withholds or materially revises without final print.', 130, 200, 'YES', 'NO'),
  ('gre-economy-unemployment-rate-down', 'Will the unemployment rate be lower than last month at the next official release?', 'Labor market direction market.', 'economy', 'open', now() + interval '24 days', now() + interval '25 days', 'ELSTAT labor force release', 'Eurostat labor dashboard', 'Void if release is skipped or not comparable month-over-month.', 120, 200, 'YES', 'NO'),
  ('gre-economy-banks-deposit-growth', 'Will total household deposits in Greek banks increase versus the previous month?', 'Bank deposits trend market.', 'economy', 'open', now() + interval '26 days', now() + interval '27 days', 'Bank of Greece monetary statistics', 'ECB data portal mirror', 'Void if monthly bank deposit series is not published.', 115, 200, 'YES', 'NO'),
  ('gre-tourism-arrivals-up', 'Will monthly tourism arrivals exceed the same month last year?', 'Tourism momentum market.', 'economy', 'open', now() + interval '16 days', now() + interval '17 days', 'ELSTAT tourism release', 'Ministry of Tourism release', 'Void if no comparable year-over-year series is published.', 110, 200, 'YES', 'NO'),
  ('gre-energy-power-demand-peak', 'Will Greece daily power demand hit a new monthly high before this market closes?', 'Power demand monitor market.', 'economy', 'open', now() + interval '12 days', now() + interval '13 days', 'IPTO official demand dashboard', 'Energy regulator bulletin', 'Void if power-demand data outage exceeds 48h around close.', 95, 200, 'YES', 'NO'),
  ('gre-weather-athens-heatwave', 'Will Athens record an official heatwave event before month-end?', 'Athens weather event market.', 'weather', 'open', now() + interval '12 days', now() + interval '13 days', 'HNMS official weather bulletin', 'Civil protection summary', 'Void if official heatwave criteria are changed mid-window.', 90, 200, 'YES', 'NO'),
  ('gre-weather-thessaloniki-heavy-rain', 'Will Thessaloniki record a daily rainfall total above 30mm before month-end?', 'Thessaloniki heavy-rain event market.', 'weather', 'open', now() + interval '15 days', now() + interval '16 days', 'HNMS station records', 'Civil protection weather report', 'Void if station coverage is unavailable for more than 24h on trigger days.', 85, 200, 'YES', 'NO'),
  ('gre-culture-film-award-win', 'Will a Greek production win a major international festival award this cycle?', 'Culture headline market.', 'culture', 'open', now() + interval '27 days', now() + interval '28 days', 'Festival official winners page', 'Producer official release', 'Void if award category is canceled or materially redefined.', 90, 200, 'YES', 'NO'),
  ('gre-social-streaming-topshow', 'Will a Greek-produced series enter a top regional streaming chart this month?', 'Entertainment trend market.', 'culture', 'open', now() + interval '20 days', now() + interval '21 days', 'Platform official regional chart page', 'Studio public chart release', 'Void if chart publication is discontinued.', 80, 200, 'YES', 'NO'),
  ('gre-tech-ai-startup-round', 'Will a Greece-based AI startup announce a funding round above €5m this quarter?', 'Tech funding headline market.', 'technology', 'open', now() + interval '35 days', now() + interval '36 days', 'Company press release and filing record', 'Tier-1 media confirmation', 'Void if amount cannot be verified from primary source.', 100, 200, 'YES', 'NO')
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

update markets
set status = 'draft', updated_at = timezone('utc', now())
where slug in (
  'gre-politics-election-seat-majority',
  'gre-banks-npl-ratio-down',
  'gre-sports-olympiacos-title',
  'gre-sports-euroleague-final4',
  'gre-crypto-eurc-volume-up'
)
and status = 'open';

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
  m.id,
  50,
  50,
  0.50,
  0.50,
  0,
  0,
  0
from markets m
where m.slug in (
  'gre-politics-cabinet-reshuffle-announced',
  'gre-politics-opposition-leadership-change',
  'gre-economy-inflation-below-2',
  'gre-economy-unemployment-rate-down',
  'gre-economy-banks-deposit-growth',
  'gre-tourism-arrivals-up',
  'gre-energy-power-demand-peak',
  'gre-weather-athens-heatwave',
  'gre-weather-thessaloniki-heavy-rain',
  'gre-culture-film-award-win',
  'gre-social-streaming-topshow',
  'gre-tech-ai-startup-round'
)
on conflict (market_id) do nothing;
