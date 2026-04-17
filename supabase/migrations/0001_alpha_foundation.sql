-- 0001_alpha_foundation.sql
-- Week 1 foundation schema for xyz Labs operational alpha

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_role') then
    create type profile_role as enum ('tester', 'admin', 'super_admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'market_status') then
    create type market_status as enum ('draft', 'open', 'paused', 'closed', 'resolved', 'settled', 'void');
  end if;
  if not exists (select 1 from pg_type where typname = 'entry_type') then
    create type entry_type as enum ('seed', 'trade_buy', 'trade_sell', 'settlement', 'void_refund', 'manual_adjustment');
  end if;
  if not exists (select 1 from pg_type where typname = 'trade_side') then
    create type trade_side as enum ('yes', 'no');
  end if;
  if not exists (select 1 from pg_type where typname = 'trade_action') then
    create type trade_action as enum ('buy', 'sell');
  end if;
  if not exists (select 1 from pg_type where typname = 'resolution_outcome') then
    create type resolution_outcome as enum ('yes', 'no', 'void');
  end if;
end $$;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  display_name text,
  username text unique,
  avatar_url text,
  role profile_role not null default 'tester',
  locale text default 'en',
  created_at timestamptz not null default now()
);

create table if not exists wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  currency text not null default 'PAPER_EUR',
  starting_balance numeric(14,2) not null default 1000,
  available_balance numeric(14,2) not null default 1000,
  realized_pnl numeric(14,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists markets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  question text not null,
  description text,
  category text not null,
  status market_status not null default 'draft',
  close_time timestamptz not null,
  resolution_time timestamptz,
  source_primary text not null,
  source_fallback text,
  void_rule text not null,
  b_liquidity numeric(18,6) not null default 100,
  fee_bps integer not null default 75,
  yes_label text not null default 'YES',
  no_label text not null default 'NO',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market_state (
  market_id uuid primary key references markets(id) on delete cascade,
  q_yes numeric(18,8) not null default 0,
  q_no numeric(18,8) not null default 0,
  yes_price numeric(10,6) not null default 0.5,
  no_price numeric(10,6) not null default 0.5,
  last_trade_at timestamptz,
  volume_total numeric(18,2) not null default 0,
  open_interest numeric(18,2) not null default 0,
  participants_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  market_id uuid not null references markets(id) on delete cascade,
  side trade_side not null,
  action trade_action not null,
  stake_amount numeric(14,2) not null,
  share_delta numeric(18,8) not null,
  avg_price numeric(10,6) not null,
  fee_amount numeric(14,2) not null,
  total_amount numeric(14,2) not null,
  expires_at timestamptz not null,
  quote_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  market_id uuid not null references markets(id) on delete cascade,
  quote_id uuid references quotes(id) on delete set null,
  side trade_side not null,
  action trade_action not null,
  share_delta numeric(18,8) not null,
  avg_price numeric(10,6) not null,
  gross_amount numeric(14,2) not null,
  fee_amount numeric(14,2) not null,
  net_amount numeric(14,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  market_id uuid not null references markets(id) on delete cascade,
  yes_shares numeric(18,8) not null default 0,
  no_shares numeric(18,8) not null default 0,
  yes_cost_basis numeric(14,2) not null default 0,
  no_cost_basis numeric(14,2) not null default 0,
  realized_pnl numeric(14,2) not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, market_id)
);

create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  wallet_account_id uuid not null references wallet_accounts(id) on delete cascade,
  entry_type entry_type not null,
  amount numeric(14,2) not null,
  balance_after numeric(14,2) not null,
  trade_id uuid references trades(id) on delete set null,
  market_id uuid references markets(id) on delete set null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists resolutions (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null unique references markets(id) on delete cascade,
  outcome resolution_outcome not null,
  evidence_summary text not null,
  evidence_url text,
  resolved_by uuid not null,
  approved_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_markets_status_close on markets(status, close_time);
create index if not exists idx_trades_market_created on trades(market_id, created_at desc);
create index if not exists idx_trades_user_created on trades(user_id, created_at desc);
create index if not exists idx_quotes_market_created on quotes(market_id, created_at desc);
create index if not exists idx_ledger_wallet_created on ledger_entries(wallet_account_id, created_at desc);
create index if not exists idx_admin_audit_created on admin_audit_logs(created_at desc);

alter table profiles enable row level security;
alter table wallet_accounts enable row level security;
alter table markets enable row level security;
alter table market_state enable row level security;
alter table quotes enable row level security;
alter table trades enable row level security;
alter table positions enable row level security;
alter table ledger_entries enable row level security;
alter table resolutions enable row level security;
alter table admin_audit_logs enable row level security;

-- Policies will be added in the next migration once auth and role flow is wired.
