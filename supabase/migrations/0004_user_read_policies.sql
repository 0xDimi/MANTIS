-- 0004_user_read_policies.sql
-- Week 3: user-facing read policies for portfolio/trade history endpoints

drop policy if exists "positions_select_own" on public.positions;
create policy "positions_select_own"
on public.positions
for select
using (auth.uid() = user_id);

drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own"
on public.trades
for select
using (auth.uid() = user_id);

drop policy if exists "quotes_select_own" on public.quotes;
create policy "quotes_select_own"
on public.quotes
for select
using (auth.uid() = user_id);

drop policy if exists "ledger_select_own" on public.ledger_entries;
create policy "ledger_select_own"
on public.ledger_entries
for select
using (
  exists (
    select 1
    from public.wallet_accounts w
    where w.id = ledger_entries.wallet_account_id
      and w.user_id = auth.uid()
  )
);

drop policy if exists "resolutions_select_public" on public.resolutions;
create policy "resolutions_select_public"
on public.resolutions
for select
using (true);

