-- 0012_mission_control_lockdown.sql
-- Revoke public read access now that Mission Control data is served through protected APIs.

drop policy if exists "mission_control_runtime_select_public" on public.mission_control_runtime;
drop policy if exists "mission_control_state_select_public" on public.mission_control_state;
