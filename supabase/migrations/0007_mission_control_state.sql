-- 0007_mission_control_state.sql
-- Persistent mission-control state storage for hosted dashboard

create table if not exists public.mission_control_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.mission_control_state enable row level security;

drop policy if exists "mission_control_state_select_public" on public.mission_control_state;
create policy "mission_control_state_select_public"
on public.mission_control_state
for select
using (true);
