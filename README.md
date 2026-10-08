# MANTIS

MANTIS is exploring a real-money prediction market for Greek users, inspired by Kalshi, with centralized operation and an order book built in house. The project resumed product and regulatory feasibility work on 8 October 2026.

The resolution system will also be built in house, with AI assistance and human supervision as the intended direction. Crypto and decentralized components are excluded. Read the [current project direction](docs/PROJECT_DIRECTION.md) for the product constraints, implementation status, and next milestones.

[Open the live demo](https://mantis-demo.xyz/)

> **Project status:** Feasibility work is active. The code on `main` remains a static product demo with illustrative data and balances. It does not establish readiness or authorization for real-money operation. The legal route and operating structure remain under examination.

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

The founder paused the earlier launch because of legal issues in Greece. The restart focuses on defining the exact event contract, counterparty, funding, exit, and settlement structure and identifying a lawful route for that model. Regulatory change is part of the research scope if existing permissions do not accommodate it.

The product model and architecture are documented. The next milestones are a written legal assessment of the centralized order book, a funded liquidity plan, a complete prototype audit, and staged implementation. A launch date and regulatory approval have not been established.

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
