-- 0019_wire_launch_markets_wave1.sql
-- Lock Wave 1 launch markets (12 total) and pin the launch slate for discover/featured wiring.

insert into markets (
  slug, question, description, category, status, close_time, resolution_time,
  source_primary, source_fallback, void_rule, b_liquidity, fee_bps, yes_label, no_label
)
values
  (
    'gre-politics-cabinet-reshuffle-announced',
    'Will the Greek government announce a cabinet reshuffle before month-end?',
    'Headline politics market with clear official resolution criteria.',
    'politics',
    'open',
    now() + interval '12 days',
    now() + interval '13 days',
    'Government Gazette or Prime Minister office announcement',
    'Parliament press room archive',
    'Void if no official announcement is published by close.',
    110,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-politics-tsipras-new-party-may15',
    'Will Alexis Tsipras announce his new party by May 15, 2026?',
    'Politics timeline market focused on a specific public announcement deadline.',
    'politics',
    'open',
    now() + interval '27 days',
    now() + interval '28 days',
    'Official statement from Alexis Tsipras or official party launch announcement',
    'Tier-1 Greek media reporting with direct public statement citation',
    'Void if no explicit public announcement is made by close.',
    105,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-economy-inflation-below-2',
    'Will annual CPI print below 2.0% at the next ELSTAT release?',
    'Headline inflation market.',
    'economy',
    'open',
    now() + interval '21 days',
    now() + interval '22 days',
    'ELSTAT CPI bulletin',
    'Eurostat CPI mirror',
    'Void if ELSTAT withholds or materially revises without final print.',
    130,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-economy-unemployment-rate-down',
    'Will the unemployment rate be lower than last month at the next official release?',
    'Labor market direction market.',
    'economy',
    'open',
    now() + interval '24 days',
    now() + interval '25 days',
    'ELSTAT labor force release',
    'Eurostat labor dashboard',
    'Void if release is skipped or not comparable month-over-month.',
    120,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-economy-eu-unemployment-last',
    'Will Greece rank last in the next Eurostat unemployment table (EU-27)?',
    'Cross-country economy market based on the next comparable EU-27 unemployment ranking.',
    'economy',
    'open',
    now() + interval '26 days',
    now() + interval '27 days',
    'Eurostat unemployment table (EU-27)',
    'ELSTAT / TradingEconomics mirror with identical ranking',
    'Void if no comparable EU-27 ranking table is published by close.',
    115,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-gas-unleaded-above-2-monthend',
    'Will Greece average Euro-super 95 stay above €2.00/L on the last EC Weekly Oil Bulletin print before month-end?',
    'Consumer price market tied to official weekly EC fuel pricing.',
    'gas',
    'open',
    now() + interval '12 days',
    now() + interval '13 days',
    'European Commission Weekly Oil Bulletin (eurosuper 95, Greece)',
    'data.europa.eu Oil Bulletin dataset mirror',
    'Void if the expected final weekly bulletin before month-end is not published.',
    100,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-sports-euroleague-final4',
    'Will a Greek team reach the EuroLeague Final Four?',
    'Top-level basketball competition qualification market.',
    'sports',
    'open',
    now() + interval '20 days',
    now() + interval '21 days',
    'EuroLeague official competition results page',
    'Club official announcements + EuroLeague bracket confirmation',
    'Void if competition format is materially altered and Final Four qualification cannot be determined.',
    105,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-sports-aek-superleague-title',
    'Will AEK F.C. win the Super League title this season?',
    'Domestic football title market.',
    'sports',
    'open',
    now() + interval '34 days',
    now() + interval '35 days',
    'Super League Greece official standings and title announcement',
    'HFF records with final title confirmation',
    'Void if the season is terminated without an official champion declaration.',
    110,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-weather-athens-30c-before-may15',
    'Will Athens hit a temperature of 30 degrees Celsius before May 15, 2026?',
    'Weather trigger market based on official Athens station highs.',
    'weather',
    'open',
    now() + interval '27 days',
    now() + interval '28 days',
    'HNMS/EMY official Athens station daily maximum temperature record',
    'Meteo.gr Athens historical station report',
    'Void if official station data is unavailable for a critical part of the observation window.',
    95,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-social-adonis-posts-over-300-monthend',
    'Will Adonis Georgiadis post more than 300 times on X before month-end?',
    'Social activity market counting original posts only.',
    'social',
    'open',
    now() + interval '12 days',
    now() + interval '13 days',
    'X advanced search count for from:AdonisGeorgiadi since:<month-start> until:<next-month-start> -is:retweet',
    'Direct profile post timeline count from @AdonisGeorgiadi',
    'Void if X data is unavailable for >24h around close or count cannot be verified.',
    90,
    50,
    'YES',
    'NO'
  ),
  (
    'global-us-iran-final-agreement-apr30',
    'Will the US and Iran reach a final agreement before April 30, 2026?',
    'Global geopolitics market with strict bilateral confirmation criteria.',
    'global',
    'open',
    now() + interval '12 days',
    now() + interval '13 days',
    'Official US government and Iranian government public statements',
    'Reuters/AP reports explicitly confirming bilateral final agreement',
    'Void if there is no explicit bilateral final agreement confirmation by close.',
    100,
    50,
    'YES',
    'NO'
  ),
  (
    'crypto-btc-close-above-80k',
    'Will BTC close above $80,000 (UTC daily close) before month-end?',
    'Crypto level market using UTC daily close reference.',
    'crypto',
    'open',
    now() + interval '12 days',
    now() + interval '13 days',
    'Coinbase BTC-USD UTC daily close',
    'Binance and Kraken UTC daily close cross-check',
    'Void if a reliable UTC daily close cannot be verified from primary/fallback sources.',
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

update markets
set status = 'draft', updated_at = timezone('utc', now())
where status = 'open'
  and category not in ('ops', 'operations')
  and slug !~* '(smoke|qa|test|sim|internal|lifecycle|admin[-_]?)'
  and slug not in (
    'gre-politics-cabinet-reshuffle-announced',
    'gre-politics-tsipras-new-party-may15',
    'gre-economy-inflation-below-2',
    'gre-economy-unemployment-rate-down',
    'gre-economy-eu-unemployment-last',
    'gre-gas-unleaded-above-2-monthend',
    'gre-sports-euroleague-final4',
    'gre-sports-aek-superleague-title',
    'gre-weather-athens-30c-before-may15',
    'gre-social-adonis-posts-over-300-monthend',
    'global-us-iran-final-agreement-apr30',
    'crypto-btc-close-above-80k'
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
  'gre-politics-tsipras-new-party-may15',
  'gre-economy-inflation-below-2',
  'gre-economy-unemployment-rate-down',
  'gre-economy-eu-unemployment-last',
  'gre-gas-unleaded-above-2-monthend',
  'gre-sports-euroleague-final4',
  'gre-sports-aek-superleague-title',
  'gre-weather-athens-30c-before-may15',
  'gre-social-adonis-posts-over-300-monthend',
  'global-us-iran-final-agreement-apr30',
  'crypto-btc-close-above-80k'
)
on conflict (market_id) do nothing;
