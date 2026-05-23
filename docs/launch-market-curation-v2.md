# MANTIS Launch Market Curation v2 (out-of-the-box mix)

## Wave 1 target mix (12 total)
- Politics: 2
- Economy: 3
- Gas price: 1
- Sports: 2
- Weather: 1
- Social: 1
- Global: 1
- Crypto: 1

## Proposed Wave 1 markets

Naming rule: user-facing inflation/CPI markets must include "πληθωρισμός" in Greek titles. "ΔΤΚ" can stay for precision, but never as the only user-facing term.

1) **Politics**
- `gre-politics-cabinet-reshuffle-announced`
  - Q: Will the Greek government announce a cabinet reshuffle before month-end?
- `gre-politics-tsipras-new-party-may15`
  - Q: Will Alexis Tsipras announce his new party by May 15, 2026?

2) **Economy**
- `gre-economy-inflation-below-2`
  - Q: Will annual CPI inflation print below 2.0% at the next ELSTAT release?
- `gre-economy-unemployment-rate-down`
  - Q: Will unemployment be lower vs previous month at the next official release?
- `gre-economy-eu-unemployment-last`
  - Q: Will Greece rank last in the next Eurostat unemployment table (EU-27)?
- `gre-markets-athex-general-index-2300-may29-2026`
  - Q: Will the Athens Stock Exchange General Index close above 2,300 points by Friday, May 29, 2026?
  - Primary source: ATHEXGroup / Athens Exchange official end-of-day closing prices for indices, General Index.
  - Fallback: ATHEXGroup official daily market bulletin, or a reputable financial news mirror reproducing the same official ATHEX closing value only if the official closing-prices page is unavailable.
  - Resolution: YES if the official ATHEX General Index closing value is strictly above 2,300.00 points on any trading day through the May 29, 2026 session; NO otherwise.

3) **Gas price**
- `gre-gas-unleaded-above-2-monthend`
  - Q: Will Greece average Euro-super 95 stay above €2.00/L on the last EC Weekly Oil Bulletin print before month-end?
  - Primary source: European Commission Weekly Oil Bulletin (energy.ec.europa.eu)
  - Fallback: data.europa.eu Oil Bulletin dataset mirror
  - Resolution: YES if Greece Euro-super 95 > 2.000 €/L on that print date, else NO.

4) **Sports**
- `gre-sports-euroleague-final4`
  - Q: Will a Greek team reach the EuroLeague Final Four?
- `gre-sports-aek-superleague-title`
  - Q: Will AEK F.C. win the Super League title this season?

5) **Weather**
- `gre-weather-athens-30c-before-may15`
  - Q: Will Athens hit 30°C before May 15, 2026?
- `gre-weather-athens-33c-by-jun15-2026`
  - Q: Will the maximum air temperature in Athens exceed 33°C through June 15, 2026?
  - Primary source: National Observatory of Athens / meteo.gr station ATHENS - CENTER daily maximum air temperature.
  - Fallback: HNMS/EMY official Athens station daily maximum temperature only if the meteo.gr station data for the critical window is unavailable.
  - Resolution: YES if the defined Athens station records a daily maximum air temperature strictly above 33.0°C by 2026-06-15 23:59 Europe/Athens; NO otherwise; VOID only if comparable official data is unavailable from both defined sources.

6) **Social**
- `gre-social-adonis-posts-over-300-monthend`
  - Q: Will Adonis Georgiadis post more than **300** times on X before month-end?
  - Counting rule: **original posts only** (reposts excluded).

7) **Global**
- `global-us-iran-final-agreement-apr30`
  - Q: Will the US and Iran reach a final agreement before April 30, 2026?
  - Definition for "final agreement": an official bilateral deal publicly confirmed by both governments.

8) **Crypto**
- `crypto-btc-close-above-80k`
  - Q: Will BTC close above $80,000 (UTC daily close) before month-end?

## Featured swipe (always 3 pinned)
1. `gre-politics-cabinet-reshuffle-announced`
2. `gre-politics-tsipras-new-party-may15`
3. `crypto-btc-close-above-80k`

## Notes
- Gas source/resolution is confirmed and objective (EC weekly bulletin).
- Social threshold can be adjusted to 750 or 850 if you want easier/harder odds.
- Global market wording should stay strict to avoid ambiguity at settlement.
