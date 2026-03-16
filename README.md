# xyz Labs Demo v0.8.2

Probability-first UX consistency pass on top of the existing v0.8.1 Greek-first prediction-market prototype.

## What changed in v0.8.2

This pass keeps the v0.8.1 experience intact:

- still a **36-market** board
- still **amount-first EUR** ticketing
- still supports the **EN / ΕΛ** switch
- still keeps the **password gate**, onboarding, live tape, resolution integrity, and chart module
- still runs locally with the same simple `npm start` flow

The v0.8.2 change is a deliberate display split:

### Headline market odds now show probabilities

These surfaces now present YES / NO as percentages for a cleaner prediction-market read:

- board market cards
- hero / featured market odds
- featured odds stat card
- market-detail header odds block
- main YES / NO trade-side buttons
- top movers price-discovery line
- chart header odds key
- 24h move display on headline market surfaces now reads as probability points instead of euro cents

### Ticket math and account math stay in EUR

These surfaces still stay money-first in EUR:

- order amount input and presets
- selected quote row inside the ticket
- payout preview, max loss, receive-now, remaining exposure, and sell constraints
- cash, equity, market value, exposure, P&L, and position value
- live flow amounts and tape amounts
- portfolio history fills and trade tape quote execution lines
- market volume and matched-flow metrics

### Contrast / readability cleanup

To support the probability-first pass, the UI also got a small readability sweep:

- stronger YES / NO odds emphasis on cards
- clearer probability pills on light and dark surfaces
- darker secondary quote text inside trade buttons
- stronger contrast on mover odds labels

## Access code for local testing

```text
athens-alpha
```

## Location

```text
side-project-os/prediction-market/demo/
```

## Run locally

From the workspace root:

```bash
cd side-project-os/prediction-market/demo
npm start
```

Then open:

```text
http://localhost:4173
```

## Quick test checklist

1. Open the app and confirm the **password gate** appears first in a fresh browser session
2. Use the access code `athens-alpha`
3. Confirm the onboarding overlay still appears after unlock
4. Verify the gate and app metadata show **v0.8.2**
5. Verify board cards show **YES / NO percentages** instead of euro prices
6. Verify the hero / featured market shows **probability-first odds**
7. Open any market and confirm the detail header and **trade-side buttons** use percentages
8. Confirm the ticket math and payout preview remain **EUR-first**
9. Verify the chart still renders and the odds key now reads in percentages
10. Switch between **EN** and **ΕΛ** and verify the updated labels remain consistent

## Files

- `index.html` - app shell and v0.8.2 metadata
- `styles.css` - probability-first odds styling and readability refinements
- `app.js` - v0.8.2 display split, copy updates, and local-state compatibility
- `server.js` - zero-dependency static server
- `package.json` - local start script and v0.8.2 metadata

## Notes

- App state lives in browser `localStorage`
- The password gate is intentionally local/demo-only and **not** real security
- The live tape / watcher cues are staged demo energy, not real backend market data
- The odds chart remains illustrative by design
