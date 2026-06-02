begin;

with june_event as (
  select id
  from public.market_events
  where slug = 'gre-june-2026-outcomes-grouped'
),
june_children as (
  select o.child_market_id
  from public.market_event_outcomes o
  join june_event on june_event.id = o.event_id
  where o.child_market_id is not null
)
update public.market_events
set
  status = 'archived',
  updated_at = timezone('utc', now())
where id in (select id from june_event);

with june_event as (
  select id
  from public.market_events
  where slug = 'gre-june-2026-outcomes-grouped'
)
update public.market_event_outcomes
set
  is_active = false,
  updated_at = timezone('utc', now())
where event_id in (select id from june_event);

with june_event as (
  select id
  from public.market_events
  where slug = 'gre-june-2026-outcomes-grouped'
),
june_children as (
  select o.child_market_id
  from public.market_event_outcomes o
  join june_event on june_event.id = o.event_id
  where o.child_market_id is not null
)
update public.markets
set
  event_id = null,
  outcome_key = null,
  outcome_label = null,
  event_display_order = null,
  is_event_child = false,
  hide_no_on_event_surface = false,
  parent_lifecycle_locked = false,
  child_resolution_policy = 'standalone',
  updated_at = timezone('utc', now())
where id in (select child_market_id from june_children);

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
values
  (
    'gre-sports-olympiacos-uefa-league-phase-2026-27',
    'Will Olympiacos reach a 2026/27 UEFA league phase?',
    'Football market on whether Olympiacos will appear in the 2026/27 league phase of the UEFA Champions League, Europa League, or Conference League.',
    'sports',
    'open',
    '2026-08-18T16:00:00+00:00'::timestamptz,
    '2026-08-28T15:00:00+00:00'::timestamptz,
    'UEFA official draws, match results, and confirmed league-phase lineups for the 2026/27 Champions League, Europa League, and Conference League',
    'Olympiacos official announcements only if they clearly confirm league-phase participation and match UEFA listings',
    'YES if Olympiacos is officially listed by UEFA in the league phase of any 2026/27 UEFA men''s club competition. NO otherwise. Void only if UEFA materially changes the competition format so league-phase participation cannot be determined clearly.',
    110,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-sports-panathinaikos-uefa-league-phase-2026-27',
    'Will Panathinaikos reach a 2026/27 UEFA league phase?',
    'Football market on whether Panathinaikos will appear in the 2026/27 league phase of the UEFA Champions League, Europa League, or Conference League.',
    'sports',
    'open',
    '2026-08-18T16:00:00+00:00'::timestamptz,
    '2026-08-28T15:00:00+00:00'::timestamptz,
    'UEFA official draws, match results, and confirmed league-phase lineups for the 2026/27 Champions League, Europa League, and Conference League',
    'Panathinaikos official announcements only if they clearly confirm league-phase participation and match UEFA listings',
    'YES if Panathinaikos is officially listed by UEFA in the league phase of any 2026/27 UEFA men''s club competition. NO otherwise. Void only if UEFA materially changes the competition format so league-phase participation cannot be determined clearly.',
    110,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-sports-paok-uefa-league-phase-2026-27',
    'Will PAOK reach a 2026/27 UEFA league phase?',
    'Football market on whether PAOK will appear in the 2026/27 league phase of the UEFA Champions League, Europa League, or Conference League.',
    'sports',
    'open',
    '2026-08-18T16:00:00+00:00'::timestamptz,
    '2026-08-28T15:00:00+00:00'::timestamptz,
    'UEFA official draws, match results, and confirmed league-phase lineups for the 2026/27 Champions League, Europa League, and Conference League',
    'PAOK official announcements only if they clearly confirm league-phase participation and match UEFA listings',
    'YES if PAOK is officially listed by UEFA in the league phase of any 2026/27 UEFA men''s club competition. NO otherwise. Void only if UEFA materially changes the competition format so league-phase participation cannot be determined clearly.',
    110,
    50,
    'YES',
    'NO'
  ),
  (
    'gre-sports-aek-uefa-league-phase-2026-27',
    'Will AEK reach a 2026/27 UEFA league phase?',
    'Football market on whether AEK will appear in the 2026/27 league phase of the UEFA Champions League, Europa League, or Conference League.',
    'sports',
    'open',
    '2026-08-18T16:00:00+00:00'::timestamptz,
    '2026-08-28T15:00:00+00:00'::timestamptz,
    'UEFA official draws, match results, and confirmed league-phase lineups for the 2026/27 Champions League, Europa League, and Conference League',
    'AEK official announcements only if they clearly confirm league-phase participation and match UEFA listings',
    'YES if AEK is officially listed by UEFA in the league phase of any 2026/27 UEFA men''s club competition. NO otherwise. Void only if UEFA materially changes the competition format so league-phase participation cannot be determined clearly.',
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
  m.id,
  50,
  50,
  0.50,
  0.50,
  0,
  0,
  0
from public.markets m
where m.slug in (
  'gre-sports-olympiacos-uefa-league-phase-2026-27',
  'gre-sports-panathinaikos-uefa-league-phase-2026-27',
  'gre-sports-paok-uefa-league-phase-2026-27',
  'gre-sports-aek-uefa-league-phase-2026-27'
)
on conflict (market_id) do nothing;

with event_upsert as (
  insert into public.market_events (
    slug,
    title,
    subtitle,
    description,
    category,
    tags,
    status,
    close_time,
    determination_time,
    determination_window,
    source_primary,
    source_fallback,
    resolution_rule,
    void_rule,
    event_loss_budget,
    max_child_count,
    max_user_event_exposure,
    max_trade_amount,
    price_display_policy
  )
  values (
    'gre-football-greek-clubs-uefa-league-phase-2026-27',
    'Which Greek clubs will reach a 2026/27 UEFA league phase?',
    'Independent YES/NO rows for the biggest Greek clubs. More than one can resolve YES.',
    'This grouped football event tracks whether Olympiacos, Panathinaikos, PAOK, and AEK will appear in a 2026/27 UEFA league phase. Each child market resolves independently, so multiple clubs can qualify.',
    'sports',
    array['greece', 'football', 'uefa', '2026-27', 'grouped-binary'],
    'open',
    '2026-08-18T16:00:00+00:00'::timestamptz,
    '2026-08-28T15:00:00+00:00'::timestamptz,
    'Trading stays open until the UEFA play-off window begins. Final settlement follows the final 2026/27 UEFA league-phase draw confirmations.',
    'UEFA official draws, match results, and confirmed league-phase lineups for the 2026/27 Champions League, Europa League, and Conference League',
    'Club official announcements only if they clearly confirm league-phase participation and match UEFA listings',
    'Each child market resolves independently. YES if that club is officially listed by UEFA in the league phase of the 2026/27 Champions League, Europa League, or Conference League. NO otherwise.',
    'Void only if UEFA materially changes the competition format so league-phase participation cannot be determined clearly for the affected club.',
    600,
    4,
    300,
    60,
    'show_child_yes_prices_with_multiple_yes_explanation'
  )
  on conflict (slug) do update
  set
    title = excluded.title,
    subtitle = excluded.subtitle,
    description = excluded.description,
    category = excluded.category,
    tags = excluded.tags,
    status = excluded.status,
    close_time = excluded.close_time,
    determination_time = excluded.determination_time,
    determination_window = excluded.determination_window,
    source_primary = excluded.source_primary,
    source_fallback = excluded.source_fallback,
    resolution_rule = excluded.resolution_rule,
    void_rule = excluded.void_rule,
    event_loss_budget = excluded.event_loss_budget,
    max_child_count = excluded.max_child_count,
    max_user_event_exposure = excluded.max_user_event_exposure,
    max_trade_amount = excluded.max_trade_amount,
    price_display_policy = excluded.price_display_policy,
    updated_at = timezone('utc', now())
  returning id
)
insert into public.market_event_localizations (
  event_id,
  locale,
  title,
  subtitle,
  description,
  source_primary,
  source_fallback,
  resolution_rule,
  void_rule,
  education_copy
)
select
  event_upsert.id,
  copy.locale,
  copy.title,
  copy.subtitle,
  copy.description,
  copy.source_primary,
  copy.source_fallback,
  copy.resolution_rule,
  copy.void_rule,
  copy.education_copy
from event_upsert
cross join (
  values
    (
      'en',
      'Which Greek clubs will reach a 2026/27 UEFA league phase?',
      'Independent YES/NO rows for the biggest Greek clubs. More than one can resolve YES.',
      'This grouped football event tracks whether Olympiacos, Panathinaikos, PAOK, and AEK will appear in a 2026/27 UEFA league phase. Each child market resolves independently, so multiple clubs can qualify.',
      'UEFA official draws, match results, and confirmed league-phase lineups for the 2026/27 Champions League, Europa League, and Conference League',
      'Club official announcements only if they clearly confirm league-phase participation and match UEFA listings',
      'Each child market resolves independently. YES if that club is officially listed by UEFA in the league phase of the 2026/27 Champions League, Europa League, or Conference League. NO otherwise.',
      'Void only if UEFA materially changes the competition format so league-phase participation cannot be determined clearly for the affected club.',
      'Multiple markets can resolve YES. Each row is a separate YES/NO market with its own price.'
    ),
    (
      'el',
      'Ποιες ελληνικές ομάδες θα μπουν σε league phase της UEFA το 2026/27;',
      'Ανεξάρτητες αγορές ΝΑΙ/ΟΧΙ για τους μεγαλύτερους ελληνικούς συλλόγους. Περισσότερες από μία μπορούν να κλείσουν στο ΝΑΙ.',
      'Αυτό το ομαδοποιημένο ποδοσφαιρικό γεγονός παρακολουθεί αν ο Ολυμπιακός, ο Παναθηναϊκός, ο ΠΑΟΚ και η ΑΕΚ θα βρεθούν σε league phase διοργάνωσης UEFA το 2026/27. Κάθε επιμέρους αγορά επιλύεται ανεξάρτητα, άρα μπορούν να προκριθούν περισσότερες από μία ομάδες.',
      'Επίσημες κληρώσεις, αποτελέσματα και τελικές λίστες league phase της UEFA για Champions League, Europa League και Conference League 2026/27',
      'Επίσημες ανακοινώσεις συλλόγων μόνο αν επιβεβαιώνουν καθαρά συμμετοχή σε league phase και συμφωνούν με τις λίστες της UEFA',
      'Κάθε επιμέρους αγορά επιλύεται ανεξάρτητα. ΝΑΙ αν η αντίστοιχη ομάδα εμφανίζεται επίσημα από την UEFA σε league phase του Champions League, Europa League ή Conference League 2026/27. ΟΧΙ διαφορετικά.',
      'Ακυρώνεται μόνο αν η UEFA αλλάξει ουσιωδώς τη μορφή των διοργανώσεων ώστε να μην μπορεί να προσδιοριστεί καθαρά η συμμετοχή της συγκεκριμένης ομάδας σε league phase.',
      'Περισσότερες από μία αγορές μπορούν να κλείσουν στο ΝΑΙ. Κάθε γραμμή είναι ξεχωριστή αγορά ΝΑΙ/ΟΧΙ με δική της τιμή.'
    )
) as copy(locale, title, subtitle, description, source_primary, source_fallback, resolution_rule, void_rule, education_copy)
on conflict (event_id, locale) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  source_primary = excluded.source_primary,
  source_fallback = excluded.source_fallback,
  resolution_rule = excluded.resolution_rule,
  void_rule = excluded.void_rule,
  education_copy = excluded.education_copy,
  updated_at = timezone('utc', now());

with event_row as (
  select id
  from public.market_events
  where slug = 'gre-football-greek-clubs-uefa-league-phase-2026-27'
),
outcome_seed as (
  select *
  from (
    values
      (
        'olympiacos',
        'Olympiacos',
        'Olympiacos',
        'Will Olympiacos reach a 2026/27 UEFA league phase?',
        'gre-sports-olympiacos-uefa-league-phase-2026-27',
        1,
        0.50,
        'Ολυμπιακός',
        'Ολυμπιακός',
        'Θα μπει ο Ολυμπιακός σε league phase διοργάνωσης UEFA το 2026/27;'
      ),
      (
        'panathinaikos',
        'Panathinaikos',
        'Panathinaikos',
        'Will Panathinaikos reach a 2026/27 UEFA league phase?',
        'gre-sports-panathinaikos-uefa-league-phase-2026-27',
        2,
        0.50,
        'Παναθηναϊκός',
        'Παναθηναϊκός',
        'Θα μπει ο Παναθηναϊκός σε league phase διοργάνωσης UEFA το 2026/27;'
      ),
      (
        'paok',
        'PAOK',
        'PAOK',
        'Will PAOK reach a 2026/27 UEFA league phase?',
        'gre-sports-paok-uefa-league-phase-2026-27',
        3,
        0.50,
        'ΠΑΟΚ',
        'ΠΑΟΚ',
        'Θα μπει ο ΠΑΟΚ σε league phase διοργάνωσης UEFA το 2026/27;'
      ),
      (
        'aek',
        'AEK',
        'AEK',
        'Will AEK reach a 2026/27 UEFA league phase?',
        'gre-sports-aek-uefa-league-phase-2026-27',
        4,
        0.50,
        'ΑΕΚ',
        'ΑΕΚ',
        'Θα μπει η ΑΕΚ σε league phase διοργάνωσης UEFA το 2026/27;'
      )
  ) as seed(outcome_key, outcome_label, outcome_short_label, outcome_description, market_slug, display_order, initial_probability, outcome_label_el, outcome_short_label_el, child_question_el)
),
upserted_outcomes as (
  insert into public.market_event_outcomes (
    event_id,
    child_market_id,
    outcome_key,
    outcome_label,
    outcome_short_label,
    outcome_description,
    display_order,
    is_active,
    initial_probability
  )
  select
    event_row.id,
    markets.id,
    outcome_seed.outcome_key,
    outcome_seed.outcome_label,
    outcome_seed.outcome_short_label,
    outcome_seed.outcome_description,
    outcome_seed.display_order,
    true,
    outcome_seed.initial_probability
  from event_row
  join outcome_seed on true
  join public.markets on markets.slug = outcome_seed.market_slug
  on conflict (event_id, outcome_key) do update
  set
    child_market_id = excluded.child_market_id,
    outcome_label = excluded.outcome_label,
    outcome_short_label = excluded.outcome_short_label,
    outcome_description = excluded.outcome_description,
    display_order = excluded.display_order,
    is_active = excluded.is_active,
    initial_probability = excluded.initial_probability,
    updated_at = timezone('utc', now())
  returning id, event_id, child_market_id, outcome_key
),
localized_seed as (
  select
    upserted_outcomes.id as outcome_id,
    outcome_seed.outcome_key,
    outcome_seed.outcome_label,
    outcome_seed.outcome_short_label,
    outcome_seed.outcome_description,
    outcome_seed.outcome_label_el,
    outcome_seed.outcome_short_label_el,
    outcome_seed.child_question_el
  from upserted_outcomes
  join outcome_seed on outcome_seed.outcome_key = upserted_outcomes.outcome_key
)
insert into public.market_event_outcome_localizations (
  outcome_id,
  locale,
  outcome_label,
  outcome_short_label,
  outcome_description,
  child_question
)
select
  localized_seed.outcome_id,
  copy.locale,
  copy.outcome_label,
  copy.outcome_short_label,
  copy.outcome_description,
  copy.child_question
from localized_seed
cross join lateral (
  values
    (
      'en',
      localized_seed.outcome_label,
      localized_seed.outcome_short_label,
      localized_seed.outcome_description,
      localized_seed.outcome_description
    ),
    (
      'el',
      localized_seed.outcome_label_el,
      localized_seed.outcome_short_label_el,
      localized_seed.child_question_el,
      localized_seed.child_question_el
    )
) as copy(locale, outcome_label, outcome_short_label, outcome_description, child_question)
on conflict (outcome_id, locale) do update
set
  outcome_label = excluded.outcome_label,
  outcome_short_label = excluded.outcome_short_label,
  outcome_description = excluded.outcome_description,
  child_question = excluded.child_question,
  updated_at = timezone('utc', now());

with event_row as (
  select id
  from public.market_events
  where slug = 'gre-football-greek-clubs-uefa-league-phase-2026-27'
),
child_rows as (
  select
    market_event_outcomes.child_market_id,
    market_event_outcomes.outcome_key,
    market_event_outcomes.outcome_label,
    market_event_outcomes.display_order,
    market_event_outcomes.initial_probability
  from public.market_event_outcomes
  join event_row on event_row.id = market_event_outcomes.event_id
  where market_event_outcomes.is_active = true
)
update public.markets
set
  event_id = event_row.id,
  outcome_key = child_rows.outcome_key,
  outcome_label = child_rows.outcome_label,
  event_display_order = child_rows.display_order,
  is_event_child = true,
  hide_no_on_event_surface = false,
  parent_lifecycle_locked = false,
  child_resolution_policy = 'child_independent',
  updated_at = timezone('utc', now())
from event_row, child_rows
where markets.id = child_rows.child_market_id;

with event_row as (
  select id
  from public.market_events
  where slug = 'gre-football-greek-clubs-uefa-league-phase-2026-27'
),
child_rows as (
  select
    market_event_outcomes.child_market_id,
    market_event_outcomes.initial_probability
  from public.market_event_outcomes
  join event_row on event_row.id = market_event_outcomes.event_id
  where market_event_outcomes.is_active = true
)
update public.market_state
set
  initial_probability = child_rows.initial_probability,
  virtual_q_yes = 0,
  virtual_q_no = 0,
  user_q_yes = q_yes,
  user_q_no = q_no,
  state_version = greatest(state_version, 1),
  updated_at = timezone('utc', now())
from child_rows
where market_state.market_id = child_rows.child_market_id;

commit;
