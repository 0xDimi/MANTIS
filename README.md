# xyz Labs Demo v0.8.3

Premium-polish pass on top of the existing v0.8.2 Greek-first prediction-market prototype.

## What changed in v0.8.3

This pass is intentionally not a feature spree. It keeps the strong v0.8.2 product core intact:

- still a **36-market** board
- still **password-gated** with onboarding
- still supports **EN / ΕΛ** switching
- still uses **probability-first YES / NO** headline odds
- still keeps **EUR-first** ticketing and account math
- still includes the **live tape, odds chart, resolution framework, and portfolio**
- still runs locally with the same simple `npm start` flow

The v0.8.3 work is a premium-polish pass focused on four things:

### 1) Better market-card hierarchy

- stronger internal structure on each board card
- clearer separation between title, change, headline odds, and secondary metrics
- quieter supporting metadata so the important numbers read first
- slightly cleaner featured-card treatment without changing market logic

### 2) Stronger featured-market / flagship presentation

- more substantial featured hero treatment
- dedicated **Flagship lane** ahead of the full grid for the lead contracts
- flagship section only shows on the unfiltered board so filtering/search still feels sane

### 3) More consistent poster art / art direction

- added shared poster-art shell, theme tinting, and texture treatment
- added category-aware art fallbacks so cards without a bespoke art key still feel designed
- expanded the semantic poster system with extra motifs like screen / awards / factory treatment
- kept the existing market-matched gradients, labels, and emoji layer intact

### 4) Subtle hover / motion polish

- softer hover lift on cards and flagship tiles
- gentle poster drift / texture motion when reduced-motion is not preferred
- tighter hover feedback on side-rail items and trade-side controls

### Small low-risk ticket clarity win

- added a compact top-line ticket preview strip for order value, selected quote, and estimated contracts
- left ticket logic and accounting behavior unchanged

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
4. Verify the gate and app metadata show **v0.8.3**
5. Confirm the hero reads more like a flagship surface
6. Confirm the **Flagship lane** appears on the default board and hides once search/filter is applied
7. Verify board cards feel cleaner to scan, with headline odds and supporting metrics separated better
8. Open a market and confirm the detail page still works normally
9. Confirm the ticket now shows the compact preview strip while staying **EUR-first**
10. Switch between **EN** and **ΕΛ** and verify the updated labels remain coherent

## Files

- `index.html` - app shell and v0.8.3 metadata
- `styles.css` - premium-polish visual pass, hierarchy, art-direction, and motion refinements
- `app.js` - v0.8.3 presentation updates and local-state compatibility
- `server.js` - zero-dependency static server
- `package.json` - local start script and v0.8.3 metadata

## Notes

- App state lives in browser `localStorage`
- The password gate is intentionally local/demo-only and **not** real security
- The live tape / watcher cues are staged demo energy, not real backend market data
- The odds chart remains illustrative by design
