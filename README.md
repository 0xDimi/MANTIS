# xyz Labs Demo v0.8.6.3

Current local/live version of the Greek-first prediction-market demo.

## What changed in v0.8.6.3

This version is a focused refinement pass on the market cards and market detail page.

### Markets surfaces

- market-facing YES / NO pricing now shows percentage only
- 24h move presentation now uses percentage language instead of points / pts
- existing dark board, chart, and ticket direction stays intact

### Market detail page

- removed the old Overview section entirely
- converted the remaining info sections into compact clickable tabs
- tab content now switches in place instead of stacking all sections vertically
- kept the current dark detail-page structure and simple ticket flow

### UI refinements

- kept the same routes, data model, and trade logic

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
2. Confirm the gate and top bar show **v0.8.6.3**
3. Check the homepage hero, featured markets, and all-markets grid feel cleaner and denser
4. Open a market and confirm the chart still sits on a dark seamless surface
5. Confirm the old Overview treatment is gone and the remaining sections switch via tabs
6. Verify portfolio still matches the dark theme and renders cleanly

## Files

- `app.js` - app structure, routes, market data, ticket logic, and detail-page rendering
- `styles.css` - theme, layout, board styling, and market-detail styling
- `index.html` - app metadata
- `server.js` - zero-dependency local server
- `package.json` - local start script and version metadata
