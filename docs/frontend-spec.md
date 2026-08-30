# Market Platform — TradingView Analytics Frontend

## Objective

Build a modern web frontend for the Market Platform that allows users to:

1. Search for and analyze financial assets.
2. View professional interactive TradingView price charts.
3. Analyze equities, ETFs, indexes, commodities, futures, currencies, and crypto assets.
4. Build reusable market-analysis reports.
5. Embed TradingView charts inside those reports.
6. Combine price charts with tables, KPI cards, line charts, bar charts, scatter plots, correlation data, fundamental data, and other quantitative visualizations.
7. Establish an architecture that can later consume the Market Platform's own OHLCV/data APIs without requiring a frontend rewrite.

This application is initially an **analysis platform**, not an order-entry or brokerage trading platform.

Do not implement trade execution.

---

# Development mode

This project will be developed using Claude Code.

Assume Claude is invoked with:

```bash
claude --permission-mode auto
```

Work autonomously where reasonable.

Do not stop repeatedly for minor implementation questions. Make reasonable architectural decisions, document them, implement them, run tests, and correct failures.

Before making major architectural changes, inspect the existing repository and reuse existing conventions where appropriate.

---

# Product Vision

The frontend should feel like a cross between:

* TradingView
* Bloomberg market dashboards
* Koyfin
* institutional research dashboards
* an internal quantitative market-intelligence platform

The application should not merely be a page containing an embedded TradingView iframe.

TradingView is one visualization component inside a larger analytics system.

The surrounding application should be owned and controlled by us.

---

# Core Architecture

Use:

* React
* TypeScript
* Next.js
* Tailwind CSS
* a high-quality component system such as shadcn/ui
* TanStack Query for server state
* TanStack Table for data-heavy tables
* Zustand or equivalent lightweight state management where cross-component state is required

For non-TradingView visualizations, choose a robust React visualization library.

Recommended:

* Recharts for standard dashboard visualizations
* Apache ECharts where more complex financial/statistical visualization is required

Do not duplicate functionality unnecessarily.

---

# High-Level Application Structure

Implement the application around these major areas:

```text
Market Platform
│
├── Markets
│   ├── Stocks
│   ├── ETFs
│   ├── Indices
│   ├── Commodities
│   ├── Futures
│   ├── FX
│   └── Crypto
│
├── Chart
│
├── Compare
│
├── Reports
│
├── Watchlists
│
└── Settings
```

The first implementation should prioritize:

1. Chart
2. Asset search
3. Asset overview
4. Reports
5. Reusable analytics components

Watchlists can follow once the basic architecture exists.

---

# URL Structure

Use routable URLs.

Examples:

```text
/chart/AAPL
/chart/SPY
/chart/QQQ
/chart/GC1!
/chart/CL1!

/asset/AAPL
/asset/SPY

/compare
/reports
/reports/:reportId
```

Asset selection should therefore be bookmarkable and shareable.

---

# Asset Model

Do not hard-code the application around stocks.

Create a canonical asset model.

Example:

```ts
export type AssetType =
  | "stock"
  | "etf"
  | "index"
  | "future"
  | "commodity"
  | "forex"
  | "crypto";

export interface Asset {
  id: string;
  symbol: string;
  tradingViewSymbol?: string;
  name: string;
  assetType: AssetType;
  exchange?: string;
  currency?: string;
  sector?: string;
  industry?: string;
}
```

TradingView symbols should be treated separately from internal Market Platform identifiers.

For example:

```text
Internal symbol:
AAPL

TradingView symbol:
NASDAQ:AAPL
```

or:

```text
Internal:
GC

TradingView:
COMEX:GC1!
```

Create a symbol mapping layer.

Do NOT spread TradingView-specific symbol strings throughout UI components.

---

# Data Architecture

Create a provider abstraction immediately.

Example:

```ts
interface MarketDataProvider {
  searchAssets(query: string): Promise<Asset[]>;

  getAsset(symbol: string): Promise<Asset>;

  getQuote(symbol: string): Promise<Quote>;

  getOHLCV(
    symbol: string,
    interval: Interval,
    range: DateRange
  ): Promise<OHLCV[]>;

  getFundamentals?(symbol: string): Promise<Fundamentals>;

  getMetrics?(symbol: string): Promise<MarketMetrics>;
}
```

Initial implementations may use mock data where backend endpoints are not available.

The frontend must NOT become dependent on mock data architecture.

Mocks should implement the same interfaces used by real API clients.

Eventually these interfaces will connect to Market Platform APIs.

---

# TradingView Strategy

Implement TradingView through a dedicated abstraction.

Create:

```text
components/
  tradingview/
    TradingViewChart.tsx
    TradingViewMiniChart.tsx
    TradingViewSymbolOverview.tsx
    TradingViewProvider.tsx
    types.ts
```

No report or page should directly create TradingView script tags.

All TradingView behavior must live behind reusable React components.

---

# TradingView Phase 1

Initially support TradingView's Advanced Real-Time Chart widget.

The component should accept parameters such as:

```ts
interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: "light" | "dark";
  height?: number | string;
  autosize?: boolean;
  hideToolbar?: boolean;
  allowSymbolChange?: boolean;
  showVolume?: boolean;
}
```

Example usage:

```tsx
<TradingViewChart
  symbol="NASDAQ:AAPL"
  interval="D"
  theme="dark"
  autosize
/>
```

The component must:

* initialize correctly on mount
* clean up correctly on unmount
* avoid duplicate TradingView scripts
* handle symbol changes
* respond to container resizing
* support light/dark application themes
* work inside dashboard grids
* work inside report layouts

---

# TradingView Phase 2 Compatibility

Design the TradingView abstraction so we can later replace the hosted TradingView widget with TradingView Advanced Charts.

Do NOT assume that TradingView Advanced Charts contains market data.

Our future architecture will be:

```text
Massive / Market Data Sources
            │
            ▼
Market Data Collector
            │
            ▼
Market Platform API
            │
            ▼
TradingView Datafeed Adapter
            │
            ▼
TradingView Advanced Charts
```

The frontend component API should therefore remain approximately:

```tsx
<MarketPriceChart
  asset={asset}
  interval="1D"
/>
```

and callers should not care whether the implementation is:

* TradingView hosted widget
* TradingView Advanced Charts
* TradingView Lightweight Charts
* another internal renderer

---

# Primary Chart Page

Create a dedicated professional chart workspace.

Example layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ Search Assets                  AAPL  Apple Inc.       $xxx   │
├──────────────────────────────────────────────────────────────┤
│ 1m 5m 15m 1H 4H 1D 1W          Indicators      Settings    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                  TRADINGVIEW PRICE CHART                     │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Overview │ Returns │ Volume │ Fundamentals │ Statistics      │
├──────────────────────────────────────────────────────────────┤
│ Metrics / supplemental analysis                              │
└──────────────────────────────────────────────────────────────┘
```

The TradingView chart should dominate the workspace.

---

# Asset Search

Implement a global asset search.

Search should support:

```text
AAPL
Apple
SPY
Gold
Crude Oil
Bitcoin
EURUSD
```

Results should show:

* ticker
* name
* asset type
* exchange when applicable

Example:

```text
AAPL
Apple Inc.
NASDAQ · Stock
```

Keyboard navigation should work.

Support:

* Arrow Up
* Arrow Down
* Enter
* Escape

---

# Asset Header

Above the chart display:

```text
AAPL
Apple Inc.
NASDAQ

$234.52
+3.41
+1.48%
```

Eventually quote data will come from the Market Platform API.

The UI should gracefully display unavailable data.

---

# Timeframe Controls

Support common intervals:

```text
1m
5m
15m
30m
1H
4H
1D
1W
1M
```

Support date-range shortcuts when applicable:

```text
1D
5D
1M
3M
6M
YTD
1Y
5Y
MAX
```

Keep interval and date range conceptually separate.

---

# Market Report System

A major requirement is the ability to build reports combining TradingView charts with other analysis.

Create a reusable report layout system.

Example:

```text
Weekly Market Report
August 28, 2026

────────────────────────────────────

Market Overview

[ SPY TradingView Chart ]

────────────────────────────────────

Market Performance

| Asset | 1D | 5D | 1M | YTD |
|------|----|----|----|----|
| SPY  |    |    |    |    |
| QQQ  |    |    |    |    |
| IWM  |    |    |    |    |

────────────────────────────────────

Sector Performance

[ Horizontal Bar Chart ]

────────────────────────────────────

Breadth

[ Line Chart ]

────────────────────────────────────

Volatility

[ VIX TradingView Chart ]

────────────────────────────────────

Rates

[ Treasury Yield Visualization ]

────────────────────────────────────

Observations

Narrative / notes / conclusions.
```

---

# Report Component Architecture

Create reusable report blocks.

For example:

```text
components/report/
  Report.tsx
  ReportSection.tsx
  ReportHeading.tsx

  blocks/
    TradingViewChartBlock.tsx
    LineChartBlock.tsx
    BarChartBlock.tsx
    ScatterPlotBlock.tsx
    TableBlock.tsx
    MetricGridBlock.tsx
    TextBlock.tsx
```

Each report block should be independently reusable.

---

# Report Model

Reports should eventually be data driven.

Design a schema similar to:

```ts
interface MarketReport {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  sections: ReportSection[];
}
```

Example section:

```ts
interface ReportSection {
  id: string;
  title?: string;
  layout?: "single" | "two-column" | "three-column";
  blocks: ReportBlock[];
}
```

Example blocks:

```ts
type ReportBlock =
  | TradingViewChartBlock
  | LineChartBlock
  | BarChartBlock
  | ScatterPlotBlock
  | TableBlock
  | MetricBlock
  | TextBlock;
```

Use discriminated TypeScript unions.

Example:

```ts
interface TradingViewChartBlock {
  type: "tradingview-chart";
  symbol: string;
  interval: string;
  height?: number;
}
```

This allows reports to eventually be stored as JSON.

---

# Report Renderer

Build:

```tsx
<ReportRenderer report={report} />
```

It should dynamically render the correct report blocks.

This is important.

Do not implement every report as a custom React page.

We want reports to eventually be generated programmatically by backend services or AI systems.

---

# Tables

Implement a professional reusable financial table.

Use TanStack Table.

Support:

* sorting
* filtering
* numeric formatting
* percent formatting
* currency formatting
* positive/negative formatting
* sticky headers
* responsive layout

Potential columns include:

```text
Symbol
Price
Change %
Volume
Relative Volume
Market Cap
1D
5D
1M
3M
YTD
1Y
52W High
52W Low
RSI
ATR
```

---

# KPI / Metric Cards

Build reusable metric cards.

Examples:

```text
S&P 500
5,942.13
+0.72%

VIX
14.82
-3.1%

10Y Yield
4.12%
+3 bps
```

Metric card component:

```tsx
<MetricCard
  label="VIX"
  value="14.82"
  change={-3.1}
  suffix="%"
/>
```

---

# Standard Line Charts

TradingView should not be used for everything.

Use normal visualization components for derived datasets.

Examples:

* market breadth
* advance/decline line
* cumulative returns
* rolling volatility
* relative strength
* moving correlations
* earnings growth
* sector relative performance
* volume trends
* put/call ratios
* credit spreads
* yield curves

Create reusable components:

```text
LineChart
MultiLineChart
BarChart
ScatterPlot
AreaChart
```

---

# Cross-Asset Comparison

Build a comparison view.

Example:

```text
Compare:

SPY
QQQ
IWM
TLT
GLD
BTC
```

Allow normalization to:

```text
Start = 100
```

Then visualize relative performance.

Example:

```text
100 ─────────────────
105 ───── SPY
112 ─────────── QQQ
98  ─── TLT
```

This should use our standard visualization library rather than an embedded TradingView chart.

---

# Returns Analysis

Create reusable analytics components for:

```text
1D return
5D return
1M return
3M return
6M return
YTD return
1Y return
```

Support ranking assets based on returns.

---

# Statistical Analytics

Design the UI so we can progressively add:

* realized volatility
* ATR
* beta
* correlation
* rolling correlation
* Sharpe ratio
* maximum drawdown
* distance from moving averages
* relative strength
* percentile rank
* volume percentile
* historical volatility

These do not need to all be implemented in the first iteration.

However, component architecture should not prevent adding them.

---

# Dashboard Grid

Create a responsive dashboard grid.

Example desktop layout:

```text
┌───────────────────────────────┬─────────────┐
│                               │ Metrics     │
│ TradingView                   │             │
│                               │             │
├───────────────────────────────┼─────────────┤
│ Sector Performance            │ Breadth     │
├───────────────────────────────┴─────────────┤
│ Market Table                                │
└─────────────────────────────────────────────┘
```

Charts should resize correctly within grid containers.

---

# S&P 500 Sector Support

The platform will eventually have dedicated analysis around S&P 500 sectors.

Design the system to easily support:

```text
SPY — S&P 500

XLK — Technology
XLF — Financials
XLE — Energy
XLV — Health Care
XLY — Consumer Discretionary
XLP — Consumer Staples
XLI — Industrials
XLB — Materials
XLRE — Real Estate
XLU — Utilities
XLC — Communication Services
```

Do not hard-code this list deep inside components.

Place asset universes in configuration or API-backed structures.

---

# Theme

The application should support:

```text
Dark
Light
System
```

Dark mode is the default visual target.

TradingView chart theme should follow application theme.

---

# Visual Style

Aim for:

* dark professional financial interface
* high information density without clutter
* subtle borders
* minimal decorative UI
* strong typography hierarchy
* compact tables
* charts as primary visual elements

Avoid:

* oversized cards
* excessive rounded corners
* excessive gradients
* consumer-fintech styling
* animations that interfere with analysis

This should look like a professional analysis workstation.

---

# Responsive Design

Desktop is the primary environment.

Target resolutions:

```text
1440x900
1920x1080
2560x1440
```

The app should still degrade cleanly on tablets and smaller screens.

Do not design desktop financial analytics around mobile-first constraints.

---

# Loading States

Every network-backed component should implement:

```text
loading
success
empty
error
```

Use skeletons where appropriate.

Do not shift the entire layout when data loads.

---

# Error Boundaries

TradingView or another visualization failing must not crash the complete report.

Individual report blocks should have error boundaries.

Example:

```text
Unable to load chart for NASDAQ:AAPL
Retry
```

---

# Performance

Pay particular attention to pages containing many charts.

Requirements:

* lazy load below-the-fold report charts
* avoid loading TradingView scripts repeatedly
* memoize expensive visualizations
* debounce asset searches
* virtualize very large tables when required
* avoid unnecessary React renders

A report containing 10 visualizations should remain responsive.

---

# Accessibility

Implement:

* keyboard navigable menus
* semantic labels
* accessible tables
* sufficient contrast
* focus states
* meaningful empty/error states

---

# Testing

Use:

* Vitest or Jest
* React Testing Library
* Playwright for core end-to-end workflows

At minimum test:

1. App loads.
2. Asset search works.
3. Selecting an asset changes the chart symbol.
4. Navigating directly to `/chart/AAPL` works.
5. Dark/light theme changes the TradingView configuration.
6. TradingView chart component mounts once.
7. TradingView chart component cleans itself up.
8. Report renderer renders each block type.
9. A report can contain multiple TradingView charts.
10. A failed block does not crash the entire report.

---

# Development Fixtures

Create sample assets:

```text
NASDAQ:AAPL
NASDAQ:MSFT
NASDAQ:NVDA
AMEX:SPY
NASDAQ:QQQ
AMEX:IWM
AMEX:GLD
AMEX:TLT
TVC:VIX
COMEX:GC1!
NYMEX:CL1!
BITSTAMP:BTCUSD
FX:EURUSD
```

Verify exact TradingView identifiers when integrating them.

Do not assume symbol mappings are always obvious.

---

# Sample Report

Create one sample report called:

```text
Daily Market Overview
```

It should contain:

## Market Snapshot

Metric cards for:

```text
SPY
QQQ
VIX
10Y Yield
Gold
Crude Oil
```

## S&P 500

Large TradingView SPY chart.

## Nasdaq

TradingView QQQ chart.

## Sector Performance

Horizontal return comparison of the SPDR sector ETFs.

## Cross-Asset Performance

Normalized line chart comparing:

```text
SPY
QQQ
TLT
GLD
BTC
```

## Market Table

Table containing major indexes and asset classes.

## Volatility

TradingView VIX chart.

## Notes

Placeholder text block where future AI-generated or manually written market observations can appear.

The purpose of this sample report is to prove that embedded TradingView charts and our own visualizations coexist naturally within one document.

---

# Folder Structure

Use approximately:

```text
src/
├── app/
│   ├── chart/
│   ├── asset/
│   ├── compare/
│   ├── reports/
│   └── layout.tsx
│
├── components/
│   ├── tradingview/
│   ├── charts/
│   ├── tables/
│   ├── metrics/
│   ├── report/
│   ├── search/
│   └── ui/
│
├── features/
│   ├── assets/
│   ├── market-data/
│   ├── reports/
│   └── watchlists/
│
├── lib/
│   ├── market-data/
│   ├── tradingview/
│   ├── formatting/
│   └── utils/
│
├── hooks/
│
├── types/
│
└── config/
```

Adapt this structure if the repository already has stronger conventions.

---

# API Boundary

Assume future APIs resembling:

```text
GET /api/assets/search?q=AAPL

GET /api/assets/AAPL

GET /api/market/quote/AAPL

GET /api/market/bars/AAPL
    ?interval=1d
    &from=...
    &to=...

GET /api/market/metrics/AAPL

GET /api/reports

GET /api/reports/:id
```

Do not require these APIs to exist before the frontend can run.

Implement mock/provider adapters as necessary.

---

# Future Market Platform Integration

The application should eventually consume services running in Kubernetes.

Expected conceptual architecture:

```text
Massive
   │
   ▼
market-data-collector
   │
   ├── historical OHLCV
   ├── real-time quotes
   ├── volume
   ├── trades
   └── reference data
   │
   ▼
Market Platform APIs
   │
   ▼
Frontend
   ├── TradingView
   ├── Tables
   ├── Quant Charts
   └── Reports
```

Keep that future backend architecture in mind while defining API boundaries.

---

# Documentation

Create:

```text
docs/frontend-architecture.md
docs/tradingview-integration.md
docs/report-system.md
```

Document:

* component architecture
* TradingView lifecycle
* symbol mapping
* data provider boundary
* report JSON schema
* how to add a new report block
* how Advanced Charts can replace hosted widgets later

Also update the project README with local development instructions.

---

# Important TradingView Constraints

Do not scrape TradingView.

Do not treat TradingView as our generic market-data API.

Do not assume embedded TradingView widget data can be extracted and reused by our own charts.

Our quantitative visualizations will eventually consume our own market-data APIs.

Treat these as distinct systems:

```text
TradingView Widget
    ↓
TradingView-hosted market data

Our charts/tables
    ↓
Market Platform data APIs
```

When Advanced Charts is introduced later:

```text
TradingView Advanced Charts
    ↓
Our Market Platform datafeed
```

---

# Licensing Boundary

Do not copy TradingView Advanced Charts source code into the repository unless authorized library access already exists.

If Advanced Charts files are not present, use supported public TradingView widgets for the initial implementation.

Keep the code structured so Advanced Charts can be installed later.

---

# Implementation Order

Work in the following order.

### Phase 1 — Foundation

Build:

* Next.js application shell
* navigation
* theme system
* asset types
* market data provider interface
* mock provider
* asset search

### Phase 2 — TradingView

Build:

* TradingView integration module
* reusable TradingView chart
* symbol mapping
* chart page

Verify lifecycle and resizing behavior.

### Phase 3 — Analytics Components

Build:

* metric cards
* line chart
* bar chart
* scatter chart
* financial table

### Phase 4 — Report Engine

Build:

* report types
* report block discriminated unions
* report renderer
* report sections
* chart block
* table block
* metric block
* text block

### Phase 5 — Sample Market Report

Build the Daily Market Overview report.

### Phase 6 — Validation

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Fix all errors.

Run Playwright tests.

Do not consider the implementation complete until the production build succeeds.

---

# Definition of Done

The first version is complete when I can:

1. Start the frontend locally.
2. Search for AAPL.
3. Open AAPL.
4. See an interactive TradingView chart.
5. Change symbols.
6. Change timeframes.
7. Navigate directly to an asset URL.
8. Open a Daily Market Overview report.
9. See multiple TradingView charts inside the report.
10. See our own line and bar charts beside TradingView.
11. See financial tables and KPI cards.
12. Resize the browser without chart/layout failures.
13. Switch light/dark themes.
14. Successfully run linting, tests, and production build.
15. Add another report using configuration rather than building another custom page.

Most importantly, the architecture must establish a clean boundary between:

* asset identity
* market data
* TradingView
* analytics calculations
* visualizations
* reports

Do not tightly couple these layers.

