-- 0006_mission_control_runtime.sql
-- Live telemetry snapshot table for mission-control dashboard

create table if not exists public.mission_control_runtime (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mission_control_runtime enable row level security;

drop policy if exists "mission_control_runtime_select_public" on public.mission_control_runtime;
create policy "mission_control_runtime_select_public"
on public.mission_control_runtime
for select
using (true);
