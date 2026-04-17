-- 0013_alpha_fee_tuning_75bps.sql
-- Lower alpha default fee from 200 bps to 75 bps and align existing launch markets.

alter table markets
  alter column fee_bps set default 75;

update markets
set fee_bps = 75,
    updated_at = timezone('utc', now())
where fee_bps > 100;
