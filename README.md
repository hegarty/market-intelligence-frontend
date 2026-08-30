# Market Platform — Analytics Frontend

A TradingView-powered market analytics, comparison, and reporting
workstation: asset search, an interactive TradingView chart workspace,
cross-asset comparison, and a reusable report engine that combines
TradingView charts with our own tables, KPI cards, and quantitative charts.

This is an **analysis platform**, not an order-entry or brokerage platform —
no trade execution is implemented.

See `docs/frontend-spec.md` for the full product spec, and
`docs/frontend-architecture.md` / `docs/tradingview-integration.md` /
`docs/report-system.md` for how it's built.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Market data comes from a
deterministic mock provider (no backend required) — see "Market data" below.

Try:

- Search for `AAPL` in the top nav, or go straight to
  [`/chart/AAPL`](http://localhost:3000/chart/AAPL) or
  [`/asset/AAPL`](http://localhost:3000/asset/AAPL).
- [`/compare`](http://localhost:3000/compare) — normalized cross-asset
  performance.
- [`/reports/daily-market-overview`](http://localhost:3000/reports/daily-market-overview)
  — the sample report combining TradingView charts with native charts,
  tables, and KPI cards.

## Scripts

```bash
npm run dev         # start the dev server
npm run build        # production build
npm run start         # run the production build
npm run lint            # eslint
npm run typecheck        # tsc --noEmit
npm test                  # vitest (unit/component tests)
npm run test:watch         # vitest --watch
npm run test:e2e             # playwright (starts its own dev server on :3000)
```

Before running `npm run test:e2e` the first time, install a browser:

```bash
npx playwright install chromium
```

## Market data

`src/lib/market-data/index.ts` exports the single `marketDataProvider`
instance every hook/page depends on. Today that's `MockMarketDataProvider` —
seeded pseudo-random OHLCV/quote/fundamentals data, same interface a real
Market Platform API client would implement. See
`docs/frontend-architecture.md#data-provider-boundary` for how to swap it.

## TradingView

TradingView charts are loaded from `https://s3.tradingview.com/tv.js` at
runtime (in the browser, not at build time) — no TradingView package is
installed. This means:

- An internet connection is required to see live TradingView charts in
  development. Everything else (search, our own charts/tables, reports)
  works offline against the mock provider.
- A handful of fixture symbols (VIX, Gold Futures, Crude Oil Futures) are
  mapped to proxy TradingView instruments because their "obvious" symbols
  (cash indices, continuous futures) are restricted on the free widget from
  an unregistered domain. See `docs/tradingview-integration.md#symbol-
  availability--verified-not-assumed` for the full list and why.

## Project structure

See `docs/frontend-architecture.md#folder-structure`.
