# MANTIS

MANTIS is a Greek-first prediction-market product alpha. I built it to explore how localized markets could turn questions about politics, sport, and current affairs into clear forecasts.

[Open the live demo](https://mantis-demo.xyz/)

> **Project status:** Prototype only. MANTIS does not operate a live or regulated prediction market, hold customer funds, or execute real-money trades. I paused the launch after reviewing the legal and operational requirements in Greece.

## What I built

- Greek and English product flows
- Curated Greek and international markets
- Binary and multi-outcome market views
- Search, category, and liquidity-based discovery
- Market detail pages with probabilities and charts
- Trade-ticket and portfolio flows
- Responsive desktop and mobile layouts

The project took the idea from a market thesis to a working product alpha. I designed the path from market discovery to order entry and portfolio tracking, while testing how a prediction-market interface should work for Greek users.

## Why I paused the launch

Once the alpha was working, I looked more closely at what a compliant launch would require in Greece. The legal structure and operational burden made the original plan impractical. I stopped before launch rather than operate with unresolved risks.

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
