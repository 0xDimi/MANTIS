# xyz Labs Demo v0.8.3.1

Premium-polish pass on top of the existing v0.8.2 Greek-first prediction-market prototype.

## What changed in v0.8.3.1

This pass is intentionally not a feature spree. It keeps the strong v0.8.2 product core intact:

- still a **39-market** board
- still **password-gated** with onboarding
- still supports **EN / ΕΛ** switching
- still uses **probability-first YES / NO** headline odds
- still keeps **EUR-first** ticketing and account math
- still includes the **live tape, odds chart, resolution framework, and portfolio**
- still runs locally with the same simple `npm start` flow

The v0.8.3.1 work is a narrow micro-polish pass focused on four things:

### 1) Calmer right rail

- lightened the ticket, account, and live-tape stack
- removed some repeated ticket rows and replaced them with quieter support stats
- softened cards so the rail feels less dense and more premium

### 2) Tighter high-visibility copy

- trimmed ticket intro copy
- shortened accordion subtitles
- tightened right-rail helper text where the UI benefits from less explanation

### 3) More natural demo activity timing

- shifted seeded account activity to relative recent offsets instead of one clustered static block
- made recent-activity timestamps read more naturally
- widened live-tape freshness ranges so updates feel less obviously synthetic

### 4) Quieter footer and metadata

- simplified the footer into a cleaner private-preview signature
- updated app metadata to **v0.8.3.1**
- kept layout direction, chart-first hierarchy, and core product framing intact

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
4. Verify the gate and app metadata show **v0.8.3.1**
5. Open a market and confirm the detail page still works normally
6. Verify the right rail feels lighter, with calmer ticket/account/live-tape treatment
7. Confirm the ticket keeps the compact top-line preview while staying **EUR-first**
8. Check that recent activity and live tape timestamps feel more natural
9. Confirm the footer is quieter and less explanatory
10. Switch between **EN** and **ΕΛ** and verify the updated labels remain coherent

## Files

- `index.html` - app shell and v0.8.3.1 metadata
- `styles.css` - premium-polish visual pass, hierarchy, art-direction, and motion refinements
- `app.js` - v0.8.3.1 micro-polish updates and local-state compatibility
- `server.js` - zero-dependency static server
- `package.json` - local start script and v0.8.3.1 metadata

## Notes

- App state lives in browser `localStorage`
- The password gate is intentionally local/demo-only and **not** real security
- The live tape / watcher cues are staged demo energy, not real backend market data
- The odds chart remains illustrative by design
