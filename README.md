# xyz Labs Demo v0.8.1

Focused experience and polish pass on top of the existing v0.8 Greek-first prediction-market prototype.

## What changed in v0.8.1

This pass keeps the existing v0.8 product structure intact:

- still a **36-market** board
- still Greek-first in tone and slate mix
- still semantic art / poster treatment
- still **amount-first EUR** ticketing
- still **YES green / NO red**
- still shows the illustrative odds chart on detail pages
- still supports the **EN / ΕΛ** switch
- still runs locally with the same simple `npm start` flow

What changed in this polish pass:

### 1) Better gate positioning

- the left-hand gate copy now explains the product at a high level
- the three bullets are product-level, not mechanics-heavy
- the access flow itself stays the same

### 2) Better first-time onboarding

- the onboarding popup now highlights three product benefits
- copy is shorter, more experience-led, and less mechanical
- users coming from older local state will see the refreshed onboarding once

### 3) Hero messaging updated

- hero kicker now says: **A Greek prediction market, with event pricing across politics, economy, sports, culture, and more.**
- hero slogan now says: **Here, your opinion has value.**
- Greek slogan updated to: **Εδώ, η γνώμη σου έχει αξία.**

### 4) Contrast cleanup

- stronger readability on muted labels
- clearer pills on dark / image-backed surfaces
- improved visibility for hero metadata, card labels, and other low-contrast UI text

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
3. Confirm the **refreshed onboarding overlay** appears after unlock
4. Verify the hero copy and slogan match the new v0.8.1 wording
5. Verify the board still shows **36 markets**
6. Confirm the overall layout and v0.8 features remain intact
7. Check card labels, pills, dark surfaces, and muted copy for improved readability
8. Open any market and confirm the detail page still shows the **odds chart**
9. Place a buy and a sell order and confirm the mock portfolio still updates instantly
10. Switch between **EN** and **ΕΛ** and verify the updated copy changes cleanly

## Files

- `index.html` - app shell and v0.8.1 metadata
- `styles.css` - visual system plus contrast and readability refinements
- `app.js` - copy updates, onboarding refresh, and local-state compatibility for the v0.8.1 pass
- `server.js` - zero-dependency static server
- `package.json` - local start script and v0.8.1 metadata

## Notes

- App state lives in browser `localStorage`
- The password gate is intentionally local/demo-only and **not** real security
- The live tape / watcher cues are staged demo energy, not real backend market data
- The odds chart remains illustrative by design
