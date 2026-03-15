# xyz Labs Demo v0.8

Private-tester upgrade of the Greek-first prediction-market sandbox.

## What changed in v0.8

v0.8 keeps the strong v0.7 core intact:

- still a **36-market** board
- still Greek-first in tone and slate mix
- still semantic art / poster treatment
- still **amount-first EUR** ticketing
- still **YES green / NO red**
- still shows the illustrative odds chart on detail pages
- still supports the **EN / ΕΛ** switch
- still runs locally with the same simple `npm start` flow

And adds the new "bringing it slowly to life" layer:

### 1) Private tester password gate

- clean access screen before the board opens
- optional local tester-name field
- simple shared access code flow
- no backend, no email auth, no external dependency
- access state stored locally in the browser

### 2) Lightweight onboarding

- one-time onboarding overlay after unlocking
- explains the board, EUR-first ticketing, and resolution trust model
- can be dismissed instantly

### 3) More live board energy

- subtle private-beta / live tape badges
- recent flow signals on market cards
- top movers module
- live tape module on board and market detail pages
- staged recent flow / watcher activity to make the demo feel inhabited without becoming noisy

### 4) Stronger trust and resolution presentation

- clearer **Resolution integrity** module on every market detail page
- explicitly shows:
  - primary resolution path
  - fallback path
  - lock / settlement timing
  - void / manual review logic
  - source-priority rule

### 5) Clearer ticket intuition

- order ticket now explains the trade in plain language
- buying shows immediate win/loss intuition
- clearer separation of:
  - spend now
  - max loss
  - gross payout if right
  - contracts controlled
- selling shows:
  - cash received now
  - contracts closed
  - contracts remaining
  - exposure after sell

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

1. Open the app and confirm the **password gate** appears first
2. Use the access code `athens-alpha`
3. Confirm the **onboarding overlay** appears after unlock
4. Dismiss onboarding and verify the board still shows **36 markets**
5. Confirm the board still feels like v0.7, not a total redesign
6. Verify market cards now show subtle **live flow / updated / watcher** cues
7. Verify the right rail shows **Top movers** and **Live tape**
8. Open any market and confirm the detail page still shows the **odds chart**
9. On the detail page, confirm the new **Resolution integrity** module is present
10. In the ticket, enter a EUR amount and confirm the scenario cards make payout / downside easier to understand
11. Place a buy and a sell order and confirm the mock portfolio updates instantly
12. Switch between **EN** and **ΕΛ** and verify the main new UI copy changes cleanly
13. Reset the portfolio and confirm the seeded state returns

## Files

- `index.html` - app shell and v0.8 metadata
- `styles.css` - existing visual system plus gate, onboarding, live-energy, trust-module, and ticket-clarity styling
- `app.js` - market data, routing, password gate, onboarding, live board cues, trust modules, and EUR trade preview logic
- `server.js` - zero-dependency static server
- `package.json` - local start script and v0.8 metadata

## Notes

- App state lives in browser `localStorage`
- The password gate is intentionally local/demo-only and **not** real security
- The live tape / watcher cues are staged demo energy, not real backend market data
- The odds chart remains illustrative by design
