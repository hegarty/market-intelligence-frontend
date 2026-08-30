# Frontend Architecture

This document describes how the Market Platform frontend is put together, and
— more importantly — the boundaries it deliberately maintains between asset
identity, market data, TradingView, analytics, visualizations, and reports.
Those boundaries are the point: each layer should be replaceable without
rewriting the ones around it.

## Stack

- **Next.js 16** (App Router, `src/` layout), React 19, TypeScript.
- **Tailwind CSS v4** (CSS-first config via `@theme` in `src/app/globals.css`)
  plus a small hand-rolled shadcn/ui-style component set in
  `src/components/ui/` (Radix primitives + `class-variance-authority` +
  `tailwind-merge`).
- **TanStack Query v5** for all server/async state (search, quotes, OHLCV,
  fundamentals, reports).
- **TanStack Table v9** for the financial table component. v9 is a
  significant rewrite from the v8 API most examples online still show —
  features (sorting, filtering, …) are registered explicitly via
  `tableFeatures({...})` rather than passed as table options. See
  `src/components/tables/features.ts` for the app's registered feature set,
  and run `npx @tanstack/intent@latest list` in this repo if you need the
  migration notes again.
- **Recharts v3** for all non-TradingView charts.
- **Zustand** (with the `persist` middleware) for small pieces of
  cross-component client state — currently just the watchlist.
- **next-themes** for the dark/light/system theme, **Vitest +
  React Testing Library** for unit/component tests, **Playwright** for
  end-to-end tests.

## Layer boundaries

```
asset identity  →  market data  →  TradingView          →  reports
                                 ↘  analytics/visualizations ↗
```

- **Asset identity** (`src/types/asset.ts`, `src/lib/market-data/fixtures/`):
  a canonical `Asset` model, independent of any vendor's symbol format.
- **Market data** (`src/lib/market-data/`): the `MarketDataProvider`
  interface and its implementations. Nothing outside this folder (and
  `src/features/*/hooks.ts`, which wraps it in TanStack Query) should import
  a concrete provider.
- **TradingView** (`src/components/tradingview/`, `src/lib/tradingview/`): the
  only code allowed to touch `window.TradingView` or inject TradingView
  script tags. See `docs/tradingview-integration.md`.
- **Analytics / visualizations** (`src/lib/market-data/returns.ts`,
  `src/components/charts/`, `src/components/tables/`, `src/components/
  metrics/`): derived calculations and the chart/table/metric-card components
  that render them. These never call TradingView.
- **Reports** (`src/types/report.ts`, `src/components/report/`,
  `src/features/reports/`): a JSON-serializable schema plus a renderer that
  turns it into UI by composing the layers above. See
  `docs/report-system.md`.

Each layer talks to the one below it through a narrow interface (a type, a
provider interface, a component prop shape) rather than reaching into
implementation details. That's what lets, for example, the mock market-data
provider become a real API client, or the hosted TradingView widget become
TradingView Advanced Charts, without touching the layers above.

## Data provider boundary

`src/lib/market-data/provider.ts` defines `MarketDataProvider`:

```ts
interface MarketDataProvider {
  searchAssets(query: string): Promise<Asset[]>;
  getAsset(symbol: string): Promise<Asset>;
  getQuote(symbol: string): Promise<Quote>;
  getOHLCV(symbol: string, interval: Interval, range: DateRange): Promise<OHLCV[]>;
  getFundamentals?(symbol: string): Promise<Fundamentals>;
  getMetrics?(symbol: string): Promise<MarketMetrics>;
}
```

`src/lib/market-data/mockProvider.ts` implements it today with deterministic,
seeded pseudo-random data (`src/lib/market-data/mock/randomWalk.ts`) — stable
across renders, but clearly not real market data. `src/lib/market-data/
index.ts` is the single place that instantiates the active provider:

```ts
export const marketDataProvider: MarketDataProvider = new MockMarketDataProvider();
```

**To connect a real Market Platform API**, write a new class implementing
`MarketDataProvider` against the endpoints described in
`docs/frontend-spec.md`'s "API Boundary" section, and swap the instantiation
in `lib/market-data/index.ts`. No hook, component, or page needs to change,
because they all depend on the `MarketDataProvider` interface (via
`src/features/assets/hooks.ts` and `src/features/market-data/hooks.ts`), not
on `MockMarketDataProvider` directly.

## Symbol mapping

Internal asset identity (`Asset.symbol`, e.g. `"AAPL"`) is separate from the
TradingView symbol namespace (`Asset.tradingViewSymbol`, e.g.
`"NASDAQ:AAPL"`). `src/lib/tradingview/symbolMapping.ts` is the only place
that resolves one to the other:

```ts
export function toTradingViewSymbol(asset: Asset): string {
  if (asset.tradingViewSymbol) return asset.tradingViewSymbol;
  if (asset.exchange) return `${asset.exchange}:${asset.symbol}`;
  return asset.symbol;
}
```

No component should construct a TradingView symbol string itself.

## Folder structure

```
src/
├── app/                 Next.js routes. Most route folders hold a thin
│                        server `page.tsx` (awaits `params`) plus a
│                        colocated `*View.tsx` client component that does
│                        the actual work.
├── components/
│   ├── ui/              Small shadcn/ui-style primitives.
│   ├── tradingview/      TradingView-only components (see the doc above).
│   ├── charts/           Recharts wrappers (LineChart, BarChart, …).
│   ├── tables/           FinancialTable + TanStack Table v9 setup.
│   ├── metrics/           MetricCard / MetricGrid.
│   ├── report/            Report renderer + block components.
│   ├── search/            AssetSearch (global asset search box).
│   ├── layout/            Nav bar, asset header, timeframe controls, theme toggle.
│   └── common/             ErrorBoundary, loading/empty/error state helpers.
├── features/
│   ├── assets/            useAssetSearch / useAsset / useQuote(s) hooks.
│   ├── market-data/        useOHLCV / useMetrics / useFundamentals / breadth / comparison hooks.
│   └── reports/             Report registry + the Daily Market Overview builder.
├── lib/
│   ├── market-data/         MarketDataProvider, mock implementation, fixtures, returns math.
│   ├── tradingview/          Symbol mapping, script loader.
│   ├── formatting/           Number/currency/percent/date formatting.
│   └── utils/                cn(), debounce().
├── hooks/                    Small reusable hooks (debounce, mounted, resolved theme, …).
├── store/                    Zustand stores (watchlist).
├── types/                    Asset / market-data / report types.
└── config/                   Nav items, intervals/ranges, S&P sector universe.
```

## State management

- **Server/async state** (anything that comes from `MarketDataProvider` or
  the report registry) lives in TanStack Query, keyed by symbol/interval/
  range/report id. Components read it via the hooks in `src/features/*`.
- **Cross-component client state** that isn't server data — currently just
  the watchlist — lives in a small Zustand store (`src/store/
  watchlistStore.ts`), persisted to `localStorage`.
- **Page-local UI state** (selected interval/range, search query, highlighted
  option, compare basket) is plain `useState` in the page's client view
  component. There was no need for a global UI store.

## Theme

`next-themes` drives `dark` / `light` / `system` via a class on `<html>`.
Color tokens are CSS custom properties in `src/app/globals.css`, redefined
under `.dark` / `[data-theme="dark"]`. Components read colors through
Tailwind utility classes (`bg-panel`, `text-muted-foreground`, …) or, for
chart marks, the `var(--series-N)` custom properties in
`src/components/charts/palette.ts` — so a chart automatically repaints on
theme change with no JS. TradingView's own `theme` prop is driven by
`useResolvedTheme()` (`src/hooks/useResolvedTheme.ts`), which resolves
next-themes' `resolvedTheme` to `"light" | "dark"`.

## Performance choices

- **One TradingView script load for the whole app.** `TradingViewProvider`
  (mounted once, near the root) and `loadTradingViewScript()`
  (`src/lib/tradingview/loadScript.ts`) share a single module-level promise,
  so mounting many `TradingViewChart` instances (e.g. inside a report) never
  injects more than one `<script src="https://s3.tradingview.com/tv.js">`.
- **Lazy-mounted report blocks.** `src/components/report/LazyBlock.tsx` defers
  mounting a block (chart, table, TradingView widget) until it's within
  `rootMargin: "200px"` of the viewport via `IntersectionObserver`, and keeps
  it mounted afterward. A report with ten visualizations only initializes the
  ones the user has scrolled near.
- **Debounced search.** `useDebouncedValue` (200ms) sits between the search
  input and the TanStack Query call in `AssetSearch`.
- **Per-block error isolation.** Every report block is wrapped in an
  `ErrorBoundary` (`src/components/common/ErrorBoundary.tsx`), so one broken
  visualization can't take down the rest of a report or page.

## Testing

- **Vitest + React Testing Library** (`src/**/*.test.{ts,tsx}`, run via
  `npm test`) cover formatting/math utilities, symbol mapping, the
  TradingView chart lifecycle (mount-once, remount-on-prop-change, cleanup
  on unmount), asset search keyboard interaction, and the report renderer
  (every block type, multiple TradingView charts in one report, a broken
  block not crashing the report).
- **Playwright** (`e2e/`, run via `npm run test:e2e`) covers the app loading,
  asset search, selecting an asset changing the chart symbol, navigating
  directly to `/chart/AAPL`, the theme toggle changing the TradingView
  chart's theme, and the Daily Market Overview report rendering multiple
  TradingView charts alongside native tables/charts.
