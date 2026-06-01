-- MANTIS Grouped Binary Events v1 — Independent Clusters
-- Draft Supabase/Postgres migration
-- Date: 2026-05-28
-- Intent: additive migration that supports parent events grouping independent binary child markets.
-- Notes:
--   1. Existing standalone binary markets remain unaffected.
--   2. If the previous GBE migration already ran, this migration adds/adjusts fields for independent clusters.
--   3. Write APIs must pass profile.id for admin/operator FK fields, not auth.users.id.
--   4. Localized public copy is stored in event/outcome localization tables, not hard-coded by slug.
--   5. Child initial probabilities must seed q_yes/q_no directly for the current AMM.

begin;

-- Parent event container.
create table if not exists public.market_events (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  category text not null,
  tags text[] not null default '{}',

  event_type text not null default 'grouped_binary'
    check (event_type in ('grouped_binary')),

  outcome_structure text not null default 'independent_cluster'
    check (outcome_structure in (
      'independent_cluster',
      'mutually_exclusive_non_exhaustive',
      'mutually_exclusive_exhaustive',
      'exactly_k_of_n'
    )),

  resolution_mode text not null default 'child_independent'
    check (resolution_mode in (
      'child_independent',
      'single_winner_parent',
      'exactly_k_parent'
    )),

  status text not null default 'draft'
    check (status in (
      'draft',
      'review',
      'approved',
      'open',
      'paused',
      'closed',
      'under_review',
      'resolved',
      'settled',
      'void',
      'archived'
    )),

  close_time timestamptz not null,
  determination_time timestamptz,
  determination_window text,

  source_primary text not null,
  source_fallback text,
  source_notes text,
  resolution_rule text not null,
  void_rule text not null,

  -- Compatibility with older grouped event draft.
  -- For v1 independent clusters these must be false.
  is_mutually_exclusive boolean not null default false,
  is_exhaustive boolean not null default false,
  requires_other_outcome boolean not null default false,

  outcome_edit_policy text not null default 'frozen_after_open'
    check (outcome_edit_policy in (
      'editable_until_open',
      'frozen_after_open',
      'frozen_after_first_trade'
    )),

  price_display_policy text not null default 'show_child_yes_prices'
    check (price_display_policy in (
      'show_child_yes_prices',
      'show_child_yes_prices_with_multiple_yes_explanation'
    )),

  event_loss_budget numeric not null default 400,
  max_child_count int not null default 8,
  max_user_event_exposure numeric not null default 250,
  max_trade_amount numeric not null default 50,

  -- Future use only; must be null for v1 independent clusters.
  target_yes_count numeric,

  created_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  published_by uuid references public.profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  published_at timestamptz,
  closed_at timestamptz,
  resolved_at timestamptz,
  settled_at timestamptz,

  constraint market_events_independent_cluster_shape check (
    outcome_structure <> 'independent_cluster'
    or (
      resolution_mode = 'child_independent'
      and is_mutually_exclusive = false
      and is_exhaustive = false
      and requires_other_outcome = false
      and target_yes_count is null
    )
  )
);

-- Localized parent event copy. English may be duplicated here for a uniform read model.
create table if not exists public.market_event_localizations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.market_events(id) on delete cascade,
  locale text not null check (locale in ('en', 'el')),
  title text not null,
  subtitle text,
  description text,
  source_primary text not null,
  source_fallback text,
  source_notes text,
  resolution_rule text not null,
  void_rule text not null,
  education_copy text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, locale)
);

create index if not exists market_events_status_close_idx
  on public.market_events(status, close_time);

create index if not exists market_events_category_status_idx
  on public.market_events(category, status);

create index if not exists market_events_structure_idx
  on public.market_events(outcome_structure, resolution_mode);

-- Child outcome rows linked to existing binary markets.
create table if not exists public.market_event_outcomes (
  id uuid primary key default gen_random_uuid(),

  event_id uuid not null references public.market_events(id) on delete cascade,
  child_market_id uuid unique references public.markets(id) on delete restrict,

  outcome_key text not null,
  outcome_label text not null,
  outcome_short_label text,
  outcome_description text,

  display_order int not null,
  is_active boolean not null default true,

  initial_probability numeric not null
    check (initial_probability > 0 and initial_probability < 1),

  child_loss_budget numeric,

  source_primary_override text,
  source_fallback_override text,
  resolution_rule_override text,
  void_rule_override text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(event_id, outcome_key),
  unique(event_id, display_order),
  unique(event_id, child_market_id)
);

create index if not exists market_event_outcomes_event_order_idx
  on public.market_event_outcomes(event_id, display_order);

-- Localized child row copy and child-specific rule copy.
create table if not exists public.market_event_outcome_localizations (
  id uuid primary key default gen_random_uuid(),
  outcome_id uuid not null references public.market_event_outcomes(id) on delete cascade,
  locale text not null check (locale in ('en', 'el')),
  outcome_label text not null,
  outcome_short_label text,
  outcome_description text,
  child_question text not null,
  source_primary_override text,
  source_fallback_override text,
  resolution_rule_override text,
  void_rule_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(outcome_id, locale)
);

-- Link existing markets to parent events.
alter table public.markets
  add column if not exists event_id uuid references public.market_events(id),
  add column if not exists outcome_key text,
  add column if not exists outcome_label text,
  add column if not exists event_display_order int,
  add column if not exists is_event_child boolean not null default false,
  add column if not exists hide_no_on_event_surface boolean not null default false,
  add column if not exists parent_lifecycle_locked boolean not null default false,
  add column if not exists child_resolution_policy text default 'standalone'
    check (child_resolution_policy in ('standalone', 'child_independent', 'parent_only'));

create index if not exists markets_event_id_idx
  on public.markets(event_id, event_display_order);

create unique index if not exists markets_event_outcome_key_unique_idx
  on public.markets(event_id, outcome_key)
  where event_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'markets_event_child_shape'
      and conrelid = 'public.markets'::regclass
  ) then
    alter table public.markets
      add constraint markets_event_child_shape check (
        (
          is_event_child = false
          and event_id is null
          and outcome_key is null
          and event_display_order is null
          and child_resolution_policy = 'standalone'
        )
        or (
          is_event_child = true
          and event_id is not null
          and outcome_key is not null
          and event_display_order is not null
          and child_resolution_policy = 'child_independent'
        )
      ) not valid;
  end if;
end $$;

-- Optional AMM anchoring support.
-- Current MANTIS quotes price from q_yes/q_no. The seeding path must convert the
-- desired initial_probability into q values before opening the market:
--   q_yes = greatest(ln(p / (1 - p)) * b_liquidity, 0)
--   q_no  = greatest(-ln(p / (1 - p)) * b_liquidity, 0)
-- virtual_q_* columns are metadata only until the quote engine explicitly reads them.
alter table public.market_state
  add column if not exists virtual_q_yes numeric not null default 0,
  add column if not exists virtual_q_no numeric not null default 0,
  add column if not exists user_q_yes numeric not null default 0,
  add column if not exists user_q_no numeric not null default 0,
  add column if not exists initial_probability numeric,
  add column if not exists state_version bigint not null default 1,
  add column if not exists state_hash text;

-- Batch resolution for child-independent events.
create table if not exists public.event_resolution_batches (
  id uuid primary key default gen_random_uuid(),

  event_id uuid not null references public.market_events(id),
  batch_type text not null
    check (batch_type in ('child_results', 'void_all')),

  status text not null default 'proposed'
    check (status in ('proposed', 'approved', 'applied', 'settled', 'rejected', 'reversed')),

  source_used text not null,
  evidence_url text,
  evidence_summary text not null,
  admin_notes text,

  proposed_by uuid not null references public.profiles(id),
  approved_by uuid references public.profiles(id),

  proposed_at timestamptz not null default now(),
  approved_at timestamptz,
  applied_at timestamptz,
  settled_at timestamptz
);

create index if not exists event_resolution_batches_event_idx
  on public.event_resolution_batches(event_id, status);

create table if not exists public.event_resolution_batch_children (
  id uuid primary key default gen_random_uuid(),

  batch_id uuid not null references public.event_resolution_batches(id) on delete cascade,
  event_id uuid not null references public.market_events(id),
  child_market_id uuid not null references public.markets(id),

  outcome_key text not null,
  child_resolution_outcome text not null
    check (child_resolution_outcome in ('yes', 'no', 'void')),

  child_evidence_url text,
  child_evidence_summary text,

  child_resolution_id uuid references public.resolutions(id),
  settlement_status text not null default 'pending'
    check (settlement_status in ('pending', 'resolved', 'settled', 'failed')),

  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(batch_id, child_market_id),
  constraint event_resolution_batch_children_child_belongs_to_event
    foreign key (event_id, child_market_id)
    references public.market_event_outcomes(event_id, child_market_id)
);

create index if not exists event_resolution_batch_children_event_idx
  on public.event_resolution_batch_children(event_id);

create index if not exists event_resolution_batch_children_child_idx
  on public.event_resolution_batch_children(child_market_id);

-- Event risk snapshots. This replaces price-sum monitoring for v1 independent clusters.
create table if not exists public.event_risk_snapshots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.market_events(id),
  snapshot_at timestamptz not null default now(),

  active_child_count int not null,
  expected_yes_count numeric not null default 0,
  avg_yes_price numeric not null default 0,
  min_yes_price numeric not null default 0,
  max_yes_price numeric not null default 0,

  sum_child_volume numeric not null default 0,
  total_event_open_interest numeric not null default 0,

  worst_case_gross_payout numeric not null default 0,
  worst_case_net_exposure numeric not null default 0,
  largest_child_gross_payout numeric not null default 0,
  largest_user_event_exposure numeric not null default 0,

  metadata_json jsonb not null default '{}'
);

create index if not exists event_risk_snapshots_event_time_idx
  on public.event_risk_snapshots(event_id, snapshot_at desc);

-- RLS follows the existing alpha pattern: public read for public event surfaces,
-- no direct client writes, and service-role/admin routes own all mutations.
alter table public.market_events enable row level security;
alter table public.market_event_localizations enable row level security;
alter table public.market_event_outcomes enable row level security;
alter table public.market_event_outcome_localizations enable row level security;
alter table public.event_resolution_batches enable row level security;
alter table public.event_resolution_batch_children enable row level security;
alter table public.event_risk_snapshots enable row level security;

drop policy if exists "market_events_select_public" on public.market_events;
create policy "market_events_select_public"
on public.market_events
for select
using (status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void'));

drop policy if exists "market_event_localizations_select_public" on public.market_event_localizations;
create policy "market_event_localizations_select_public"
on public.market_event_localizations
for select
using (
  exists (
    select 1 from public.market_events e
    where e.id = event_id
      and e.status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void')
  )
);

drop policy if exists "market_event_outcomes_select_public" on public.market_event_outcomes;
create policy "market_event_outcomes_select_public"
on public.market_event_outcomes
for select
using (
  exists (
    select 1 from public.market_events e
    where e.id = event_id
      and e.status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void')
  )
);

drop policy if exists "market_event_outcome_localizations_select_public" on public.market_event_outcome_localizations;
create policy "market_event_outcome_localizations_select_public"
on public.market_event_outcome_localizations
for select
using (
  exists (
    select 1
    from public.market_event_outcomes o
    join public.market_events e on e.id = o.event_id
    where o.id = outcome_id
      and e.status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void')
  )
);

drop policy if exists "event_risk_snapshots_select_public" on public.event_risk_snapshots;
create policy "event_risk_snapshots_select_public"
on public.event_risk_snapshots
for select
using (
  exists (
    select 1 from public.market_events e
    where e.id = event_id
      and e.status in ('open', 'closed', 'under_review', 'resolved', 'settled', 'void')
  )
);

-- Optional: event-level audit action names are stored in existing admin_audit_logs.
-- No schema change required if admin_audit_logs.action is text.

-- If an old GBE migration already added price-sum columns, keep them but make them irrelevant for independent clusters.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='market_events' and column_name='price_sum_warning_low'
  ) then
    update public.market_events
      set is_mutually_exclusive = false,
          is_exhaustive = false,
          requires_other_outcome = false,
          outcome_structure = 'independent_cluster',
          resolution_mode = 'child_independent'
      where outcome_structure is null
         or outcome_structure = 'independent_cluster';
  end if;
end $$;

commit;
