-- 0018_profile_update_guardrails.sql
-- Week 6 readiness hardening: prevent authenticated users from self-promoting via profile writes

create or replace function public.guard_profile_self_writes()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.user_id := auth.uid();
    new.role := 'tester';
    return new;
  end if;

  if new.user_id <> old.user_id then
    raise exception 'user_id is immutable';
  end if;

  if new.role <> old.role then
    raise exception 'role cannot be changed by current session';
  end if;

  if new.created_at <> old.created_at then
    raise exception 'created_at is immutable';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_profile_self_writes on public.profiles;

create trigger profiles_guard_profile_self_writes
before insert or update on public.profiles
for each row execute function public.guard_profile_self_writes();
