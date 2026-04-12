-- 0013_realign_market_state_prices_with_lmsr.sql
-- Align stored yes/no prices with LMSR-implied prices from q_yes/q_no and market depth.

update market_state s
set
  yes_price = round((1.0 / (1.0 + exp(-((s.q_yes - s.q_no) / m.b_liquidity::numeric))))::numeric, 6),
  no_price = round((1.0 - (1.0 / (1.0 + exp(-((s.q_yes - s.q_no) / m.b_liquidity::numeric)))))::numeric, 6),
  updated_at = timezone('utc', now())
from markets m
where m.id = s.market_id
  and m.b_liquidity > 0
  and (
    abs(
      s.yes_price - (1.0 / (1.0 + exp(-((s.q_yes - s.q_no) / m.b_liquidity::numeric))))
    ) > 0.000001
    or abs(
      s.no_price - (1.0 - (1.0 / (1.0 + exp(-((s.q_yes - s.q_no) / m.b_liquidity::numeric)))))
    ) > 0.000001
  );
