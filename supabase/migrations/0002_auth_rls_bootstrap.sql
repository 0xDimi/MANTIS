-- 0002_auth_rls_bootstrap.sql
-- Week 1: auth bootstrap + first RLS policies

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url, role, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    'tester',
    'en'
  )
  on conflict (user_id) do nothing;

  insert into public.wallet_accounts (user_id, currency, starting_balance, available_balance, realized_pnl)
  values (new.id, 'PAPER_EUR', 1000, 1000, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- profiles: user can read/write own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- wallet: user can read own paper wallet
drop policy if exists "wallet_select_own" on public.wallet_accounts;
create policy "wallet_select_own"
on public.wallet_accounts
for select
using (auth.uid() = user_id);

-- market catalog is public-read in alpha
drop policy if exists "markets_select_public" on public.markets;
create policy "markets_select_public"
on public.markets
for select
using (true);

drop policy if exists "market_state_select_public" on public.market_state;
create policy "market_state_select_public"
on public.market_state
for select
using (true);
