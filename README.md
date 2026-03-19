# xyz Labs Demo v0.8.4.0

Focused mainstream-market refresh for the Greek-first prediction-market demo.

## What changed in v0.8.4.0

This pass kept the demo at a curated **39 surfaced markets**, but reshaped the top shelf so the board reads more naturally for a mainstream Greek audience.

### New flagship markets

The hero + flagship lane now surface these five contracts:

1. **Will New Democracy finish first in Greece's next national election?**
2. **Will petrol in Greece go above €2 per litre again before the end of 2026?**
3. **Will Panathinaikos finish above Olympiacos in the 2026-27 EuroLeague regular season?**
4. **Will the 2026 summer heatwave in Athens break 43°C?**
5. **Will a Greek club reach a major European football or basketball final in the 2026-27 season?**

### Slate curation choices

To keep the surfaced board clean instead of bloated, this pass **replaced** five weaker or more generic contracts rather than simply stacking more cards on top:

- replaced a generic tech-attention social card with a proper **Greek politics** market
- replaced the old EuroLeague top-four market with a cleaner **Panathinaikos vs Olympiacos** rivalry market
- replaced a narrower Greek-clubs-in-Europe quarter-final market with a broader **Greek team in a European final** contract
- replaced a less memorable weather heat card with the stronger **Athens 43°C heatwave** threshold
- replaced a niche sovereign-rating macro card with the more mainstream **petrol above €2/litre** market

### Supporting polish

- added a **Politics** category to filters and labels
- refreshed the flagship shelf so the requested markets are actually front-and-centre
- added dedicated poster art treatments for **elections** and **fuel prices**
- kept the rest of the demo structure intact: gate, onboarding, EN/EL switching, portfolio, ticketing, live tape, and chart

## Access code for local testing

```text
athens-alpha
```

## Run locally

```bash
cd side-project-os/prediction-market/demo
npm start
```

Then open:

```text
http://localhost:4173
```

## Quick review checklist

1. Unlock the gate with `athens-alpha`
2. Confirm the gate and top bar show **v0.8.4.0**
3. Verify the hero + flagship lane are the five new mainstream Greek-facing markets
4. Check the new **Politics** filter appears and works
5. Open each new market and confirm the card art, copy, and resolution logic feel coherent
6. Confirm the board still feels curated, not overstuffed

## Files

- `app.js` - board content, filters, market data, and resolution logic
- `styles.css` - market-card art, theme, and layout polish
- `index.html` - app metadata
- `server.js` - zero-dependency local server
- `package.json` - local start script and version metadata
