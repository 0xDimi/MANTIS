# xyz Labs Demo v0.8.6.2

Current local/live version of the Greek-first prediction-market demo.

## What changed in v0.8.6.2

This version moves the demo away from the older light, cutout board feel and toward a darker, cleaner product shell with a more credible market-first flow.

### Board / homepage

- dark blue continuous page background with lighter visual noise
- stronger hero with the slogan **"Here, your opinion has value"**
- featured markets followed by a cleaner **All markets** section
- denser layout with less dead space on the sides
- title-first market cards with clearer YES / NO treatment
- regular market cards are clickable directly
- reduced demo/tutorial clutter on the main page

### Market detail page

- cleaner Polymarket-style detail layout
- title first, then chart, then trade ticket on the right
- line-chart treatment on a dark embedded surface
- simpler trade ticket with only the core info needed to place a trade
- cleaner lower information blocks for overview, rules, and context

### UI refinements

- clearer green YES and red NO styling
- improved typography sizing for hero/support text, section headings, and tags
- more consistent dark theme on portfolio and supporting surfaces
- removed duplicated YES / NO controls outside the main trade ticket
- removed price text from YES / NO blocks where percentage alone is enough

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
2. Confirm the gate and top bar show **v0.8.6.2**
3. Check the homepage hero, featured markets, and all-markets grid feel cleaner and denser
4. Open a market and confirm the chart sits on a dark seamless surface
5. Confirm the trade ticket is the only YES / NO interaction area on the detail page
6. Verify portfolio and supporting tabs still match the dark theme

## Files

- `app.js` - app structure, routes, market data, ticket logic, and detail-page rendering
- `styles.css` - theme, layout, board styling, and market-detail styling
- `index.html` - app metadata
- `server.js` - zero-dependency local server
- `package.json` - local start script and version metadata
