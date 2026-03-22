# xyz Labs Demo v0.8.6.6

Current local/live version of the Greek-first prediction-market demo.

## What changed in v0.8.6.6

This version completes the dedicated mobile polish sequence and brings the alpha into a cleaner, more reliable phone-first state.

### Mobile detail page

- tightened the market-detail hierarchy for narrow screens
- improved chart, ticket, and tabs readability on phones
- cleaned up tap targets, spacing, and trade-ticket flow on mobile
- kept the dark integrated chart and simplified ticket direction intact

### Mobile homepage and cards

- compressed the hero so the slogan and featured contract appear faster
- improved featured-market flow on phones
- made market cards denser and easier to scan on mobile
- improved filter/category controls for touch and horizontal scrolling

### Mobile nav and final QA

- smoother board -> market -> back flow
- clearer active states and mobile action hierarchy
- tighter consistency across spacing, pills, buttons, and sections
- final cleanup for overflow, wrapping, and rough mobile edges

### Core product state

- homepage, market detail, and portfolio all render cleanly
- current alpha UI direction remains the same
- routes, market data, and trade logic are unchanged
- version metadata is updated to **v0.8.6.6**

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
2. Confirm the gate and top bar show **v0.8.6.6**
3. Check the homepage hero, featured markets, and all-markets grid on mobile
4. Open a market and confirm the chart/ticket/tabs feel clean on phone width
5. Verify portfolio still matches the dark theme and renders cleanly
6. Confirm mobile navigation across board, market, and portfolio feels consistent

## Files

- `app.js` - app structure, routes, market data, ticket logic, and detail-page rendering
- `styles.css` - theme, layout, board styling, detail-page styling, and mobile polish
- `index.html` - app metadata
- `server.js` - zero-dependency local server
- `package.json` - local start script and version metadata
