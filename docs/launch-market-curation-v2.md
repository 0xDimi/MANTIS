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

1) **Politics**
- `gre-politics-cabinet-reshuffle-announced`
  - Q: Will the Greek government announce a cabinet reshuffle before month-end?
- `gre-politics-tsipras-new-party-may15`
  - Q: Will Alexis Tsipras announce his new party by May 15, 2026?

2) **Economy**
- `gre-economy-inflation-below-2`
  - Q: Will annual CPI print below 2.0% at the next ELSTAT release?
- `gre-economy-unemployment-rate-down`
  - Q: Will unemployment be lower vs previous month at the next official release?
- `gre-economy-eu-unemployment-last`
  - Q: Will Greece rank last in the next Eurostat unemployment table (EU-27)?

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
