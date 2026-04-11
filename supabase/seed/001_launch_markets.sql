-- 001_launch_markets.sql
-- Initial 12-market candidate seed for alpha
-- Final launch set will be refreshed to 12-15 markets close to alpha go-live

insert into markets (
  slug, question, description, category, status, close_time, resolution_time,
  source_primary, source_fallback, void_rule, b_liquidity, fee_bps, yes_label, no_label
)
values
  ('gre-politics-election-seat-majority', 'Will the incumbent bloc keep parliamentary majority after the next national election?', 'Greek politics flagship contract.', 'politics', 'open', now() + interval '14 days', now() + interval '15 days', 'Official Ministry of Interior election results', 'Parliament publication archive', 'Void if official result is delayed beyond 7 days.', 180, 200, 'YES', 'NO'),
  ('gre-economy-inflation-below-2', 'Will annual CPI print below 2.0% by the next release window?', 'Macro inflation contract.', 'economy', 'open', now() + interval '21 days', now() + interval '22 days', 'ELSTAT CPI bulletin', 'Eurostat CPI mirror', 'Void if official release is revised without final confirmation.', 130, 200, 'YES', 'NO'),
  ('gre-banks-npl-ratio-down', 'Will aggregate Greek bank NPL ratio decline versus last quarter?', 'Banking health contract.', 'economy', 'open', now() + interval '18 days', now() + interval '19 days', 'Bank of Greece financial stability report', 'ECB supervisory dashboard', 'Void if required report period is skipped.', 120, 200, 'YES', 'NO'),
  ('gre-tourism-arrivals-up', 'Will monthly tourism arrivals exceed the same month last year?', 'Tourism momentum contract.', 'economy', 'open', now() + interval '16 days', now() + interval '17 days', 'Hellenic Statistical Authority tourism release', 'Ministry of Tourism release', 'Void if no comparable year-over-year series is published.', 110, 200, 'YES', 'NO'),
  ('gre-energy-power-demand-peak', 'Will peak daily power demand exceed 2025 seasonal high this month?', 'Energy demand contract.', 'economy', 'open', now() + interval '10 days', now() + interval '11 days', 'IPTO official demand dashboard', 'Energy regulator bulletin', 'Void if data outage exceeds 48h around close.', 95, 200, 'YES', 'NO'),
  ('gre-sports-olympiacos-title', 'Will Olympiacos finish this season with the domestic title?', 'Sports flagship contract.', 'sports', 'open', now() + interval '25 days', now() + interval '26 days', 'League official standings', 'Federation confirmation', 'Void if competition format changes materially.', 140, 200, 'YES', 'NO'),
  ('gre-sports-euroleague-final4', 'Will a Greek team reach EuroLeague Final Four this season?', 'Euroleague outcome contract.', 'sports', 'open', now() + interval '30 days', now() + interval '31 days', 'EuroLeague official competition page', 'Club official statement', 'Void if tournament schedule is formally cancelled.', 125, 200, 'YES', 'NO'),
  ('gre-culture-film-award-win', 'Will a Greek production win a major international festival award this cycle?', 'Culture signal contract.', 'culture', 'open', now() + interval '27 days', now() + interval '28 days', 'Festival official winners page', 'Producer official release', 'Void if award category gets split or redefined post-close.', 90, 200, 'YES', 'NO'),
  ('gre-weather-athens-heatwave', 'Will Athens record an official heatwave event before month-end?', 'Weather contract for board engagement.', 'weather', 'open', now() + interval '12 days', now() + interval '13 days', 'HNMS official weather bulletin', 'Civil protection summary', 'Void if heatwave definition changes mid-window.', 85, 200, 'YES', 'NO'),
  ('gre-social-streaming-topshow', 'Will a Greek-produced series enter top regional streaming chart this month?', 'Social/culture demand contract.', 'culture', 'open', now() + interval '20 days', now() + interval '21 days', 'Platform official regional chart page', 'Studio public chart release', 'Void if chart publication is discontinued.', 80, 200, 'YES', 'NO'),
  ('gre-crypto-eurc-volume-up', 'Will EUR stablecoin spot volume on major venues rise versus the prior month?', 'Crypto market structure contract.', 'crypto', 'open', now() + interval '22 days', now() + interval '23 days', 'Exchange published monthly volume dashboards', 'Public market data aggregators', 'Void if source methodology changes materially during the window.', 115, 200, 'YES', 'NO'),
  ('gre-tech-ai-startup-round', 'Will a Greece-based AI startup announce a funding round above €5m this quarter?', 'Tech momentum contract.', 'technology', 'open', now() + interval '35 days', now() + interval '36 days', 'Company press release and filing record', 'Tier-1 media confirmation', 'Void if amount cannot be verified from primary source.', 100, 200, 'YES', 'NO')
on conflict (slug) do nothing;

insert into market_state (market_id, q_yes, q_no, yes_price, no_price, volume_total, open_interest, participants_count)
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
  'gre-politics-election-seat-majority',
  'gre-economy-inflation-below-2',
  'gre-banks-npl-ratio-down',
  'gre-tourism-arrivals-up',
  'gre-energy-power-demand-peak',
  'gre-sports-olympiacos-title',
  'gre-sports-euroleague-final4',
  'gre-culture-film-award-win',
  'gre-weather-athens-heatwave',
  'gre-social-streaming-topshow',
  'gre-crypto-eurc-volume-up',
  'gre-tech-ai-startup-round'
)
on conflict (market_id) do nothing;
