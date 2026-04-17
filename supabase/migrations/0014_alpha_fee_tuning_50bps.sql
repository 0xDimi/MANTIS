-- 0014_alpha_fee_tuning_50bps.sql
-- Lower alpha default fee from 75 bps to 50 bps and align existing markets above 50 bps.

alter table markets
  alter column fee_bps set default 50;

update markets
set fee_bps = 50,
    updated_at = timezone('utc', now())
where fee_bps > 50;
