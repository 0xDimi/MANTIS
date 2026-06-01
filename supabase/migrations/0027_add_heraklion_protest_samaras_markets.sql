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
    'gre-social-heraklion-airport-protest-jun24-2026',
    'Will the June 24 Heraklion airport protest happen?',
    'Event market on whether tourism and food-service workers hold or bring a June 24, 2026 protest action to Heraklion International Airport as part of the announced nationwide strike.',
    'social',
    'open',
    '2026-06-24T06:55:00+00:00'::timestamptz,
    '2026-06-24T18:00:00+00:00'::timestamptz,
    'Public statement or post-event update from the Heraklion Hotel Employees Union, POEET, Heraklion Labour Center, Heraklion airport authority, or relevant local authorities confirming whether the airport protest occurred',
    'Reputable Greek national or Crete local media coverage with clear dated reporting, photos, or video of a June 24, 2026 protest at or directly outside Heraklion International Airport',
    'YES if, on June 24, 2026, a worker protest, rally, blockade attempt, or motorized demonstration connected to the food/tourism strike is held at, reaches, or gathers directly outside Heraklion International Airport. NO if no such airport protest occurs on that date, including if the strike is cancelled, postponed, or the action happens only at non-airport locations. Void only if reliable public evidence is unavailable or materially contradictory after the resolution window.',
    105,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-politics-samaras-new-party-before-jun30-2026',
    'Will Antonis Samaras announce a new political party before June 30, 2026?',
    'Politics event market on whether former Greek prime minister Antonis Samaras publicly announces the formation or launch of a new political party before June 30, 2026.',
    'politics',
    'open',
    '2026-06-29T20:55:00+00:00'::timestamptz,
    '2026-06-30T09:00:00+00:00'::timestamptz,
    'Official public statement by Antonis Samaras, an official new-party channel, or formal party-registration record showing that Samaras announced a new political party before 2026-06-30 00:00 Europe/Athens',
    'ANA-MPA, Reuters, Associated Press, eKathimerini, To Vima, Proto Thema, Skai, or another reputable Greek national outlet reporting a direct public announcement by Samaras or his official representatives',
    'YES only if Antonis Samaras publicly announces the formation, name, or launch of a new political party before 2026-06-30 00:00 Europe/Athens. NO if there are only rumors, polling references, exploratory contacts, manifesto-style speeches, support for another party, or an announcement on/after June 30. Void only if public evidence is materially contradictory and cannot establish whether a qualifying announcement occurred before the deadline.',
    110,
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
  'gre-social-heraklion-airport-protest-jun24-2026',
  'gre-politics-samaras-new-party-before-jun30-2026'
)
  and not exists (
    select 1
    from market_state
    where market_state.market_id = markets.id
  );
