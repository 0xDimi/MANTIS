begin;

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
    'gre-june-2026-outcomes-grouped',
    'Which June 2026 Greece outcomes will happen?',
    'A grouped YES/NO event made of independent Greek markets. More than one can resolve YES.',
    'This grouped event collects four already-live June 2026 Greece markets. Each child market keeps its own source, deadline, and resolution rule.',
    'social',
    array['greece', 'june-2026', 'grouped-binary'],
    'open',
    '2026-06-29T20:55:00+00:00'::timestamptz,
    '2026-06-30T09:00:00+00:00'::timestamptz,
    'Child market deadlines vary; the parent remains open until the latest child market closes.',
    'Each child market primary source listed on its underlying market page',
    'Each child market fallback source listed on its underlying market page',
    'Each child market resolves independently under its own rule. Multiple child markets can resolve YES, and all child markets can resolve YES or NO.',
    'A source issue voids only the affected child market unless the issue affects the whole event surface.',
    600,
    4,
    250,
    50,
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
      'Which June 2026 Greece outcomes will happen?',
      'A grouped YES/NO event made of independent Greek markets. More than one can resolve YES.',
      'This grouped event collects four already-live June 2026 Greece markets. Each child market keeps its own source, deadline, and resolution rule.',
      'Each child market primary source listed on its underlying market page',
      'Each child market fallback source listed on its underlying market page',
      'Each child market resolves independently under its own rule. Multiple child markets can resolve YES, and all child markets can resolve YES or NO.',
      'A source issue voids only the affected child market unless the issue affects the whole event surface.',
      'Multiple markets can resolve YES. Each row is a separate YES/NO market with its own price.'
    ),
    (
      'el',
      'Ποια γεγονότα της Ελλάδας τον Ιούνιο 2026 θα συμβούν;',
      'Ομαδοποιημένο γεγονός ΝΑΙ/ΟΧΙ με ανεξάρτητες ελληνικές αγορές. Περισσότερες από μία μπορούν να κλείσουν στο ΝΑΙ.',
      'Αυτό το ομαδοποιημένο γεγονός συγκεντρώνει τέσσερις ήδη ενεργές ελληνικές αγορές για τον Ιούνιο 2026. Κάθε επιμέρους αγορά κρατά τη δική της πηγή, προθεσμία και κανόνα επίλυσης.',
      'Η κύρια πηγή κάθε επιμέρους αγοράς αναφέρεται στη σελίδα της αντίστοιχης αγοράς',
      'Η εφεδρική πηγή κάθε επιμέρους αγοράς αναφέρεται στη σελίδα της αντίστοιχης αγοράς',
      'Κάθε επιμέρους αγορά επιλύεται ανεξάρτητα με τον δικό της κανόνα. Περισσότερες από μία επιμέρους αγορές μπορούν να κλείσουν στο ΝΑΙ, και όλες μπορούν να κλείσουν στο ΝΑΙ ή στο ΟΧΙ.',
      'Πρόβλημα πηγής ακυρώνει μόνο την επηρεαζόμενη επιμέρους αγορά, εκτός αν επηρεάζει όλο το ομαδοποιημένο γεγονός.',
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
  where slug = 'gre-june-2026-outcomes-grouped'
),
outcome_seed as (
  select *
  from (
    values
      (
        'athens_33c',
        'Athens above 33°C',
        'Athens 33°C',
        'Will Athens maximum temperature exceed 33°C by June 15?',
        'gre-weather-athens-33c-by-jun15-2026',
        1,
        0.50,
        'Η Αθήνα πάνω από 33°C',
        'Αθήνα 33°C',
        'Θα ξεπεράσει η μέγιστη θερμοκρασία στην Αθήνα τους 33°C έως τις 15 Ιουνίου;'
      ),
      (
        'athex_2415',
        'ATHEX General Index above 2,415',
        'ATHEX 2,415',
        'Will the Athens Stock Exchange General Index close above 2,415 by June 12?',
        'gre-markets-athex-general-index-2415-jun12-2026',
        2,
        0.50,
        'Γενικός Δείκτης ΧΑ πάνω από 2.415',
        'ΧΑ 2.415',
        'Θα κλείσει ο Γενικός Δείκτης του Χρηματιστηρίου Αθηνών πάνω από τις 2.415 μονάδες έως τις 12 Ιουνίου;'
      ),
      (
        'heraklion_airport_protest',
        'Heraklion airport protest',
        'Heraklion protest',
        'Will the June 24 Heraklion airport protest happen?',
        'gre-social-heraklion-airport-protest-jun24-2026',
        3,
        0.50,
        'Διαμαρτυρία στο αεροδρόμιο Ηρακλείου',
        'Ηράκλειο διαμαρτυρία',
        'Θα γίνει η διαμαρτυρία στο αεροδρόμιο Ηρακλείου στις 24 Ιουνίου;'
      ),
      (
        'samaras_new_party',
        'Samaras new party announcement',
        'Samaras party',
        'Will Antonis Samaras announce a new political party before June 30?',
        'gre-politics-samaras-new-party-before-jun30-2026',
        4,
        0.50,
        'Ανακοίνωση νέου κόμματος από Σαμαρά',
        'Σαμαράς κόμμα',
        'Θα ανακοινώσει ο Αντώνης Σαμαράς νέο πολιτικό κόμμα πριν τις 30 Ιουνίου;'
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
  where slug = 'gre-june-2026-outcomes-grouped'
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
  where slug = 'gre-june-2026-outcomes-grouped'
),
child_rows as (
  select
    market_event_outcomes.child_market_id,
    market_event_outcomes.initial_probability
  from public.market_event_outcomes
  join event_row on event_row.id = market_event_outcomes.event_id
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
