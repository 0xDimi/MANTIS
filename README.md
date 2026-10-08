# MANTIS

MANTIS is exploring a real-money prediction market for Greek users, operated centrally with a central limit order book (CLOB). The project resumed product and regulatory feasibility work on 8 October 2026.

The intended model excludes AMM and LMSR pricing. Read the [current project direction](docs/PROJECT_DIRECTION.md) for the product constraints, implementation status, and next milestones.

[Open the live demo](https://mantis-demo.xyz/)

> **Project status:** Feasibility work is active. The code on `main` remains a static product demo with illustrative data and balances. It does not implement the target CLOB or establish authorization for real-money operation. The legal route and operating structure remain under examination.

## What I built

- Greek and English product flows
- Curated Greek and international markets
- Binary and multi-outcome market views
- Search, category, and liquidity-based discovery
- Market detail pages with probabilities and charts
- Trade-ticket and portfolio flows
- Responsive desktop and mobile layouts

The project took the idea from a market thesis to a working product alpha. I designed the path from market discovery to order entry and portfolio tracking, while testing how a prediction-market interface should work for Greek users.

## Restart direction

The founder paused the earlier launch after legal and operational review in Greece. The restart focuses on defining the exact event contract, customer order matching, collateral, and settlement structure and identifying a lawful route for that model. Regulatory change is part of the research scope if existing permissions do not accommodate it.

The next milestones are a complete transaction model, a written legal assessment, a liquidity and commercial plan, and an audit of the available prototype code. A launch date and regulatory approval have not been established.

## Run locally

```bash
git clone https://github.com/0xDimi/MANTIS.git
cd MANTIS
npm start
```

Then open [http://localhost:4173](http://localhost:4173).

Use `athens-alpha` to unlock the local demo.

## Project structure

- `app.js` — routes, market data, trade-ticket logic, and page rendering
- `styles.css` — interface, responsive layouts, and component styling
- `index.html` — application shell and metadata
- `server.js` — local zero-dependency Node server
- `package.json` — local start command and project metadata

## Disclaimer

MANTIS is a product demonstration. Market data, balances, and trading flows shown in the demo are illustrative.
