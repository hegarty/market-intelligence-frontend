# TradingView Integration

## Components

```
src/components/tradingview/
  TradingViewChart.tsx           Advanced Real-Time Chart widget (tv.js). Primary chart.
  TradingViewMiniChart.tsx       Mini Chart embed. Compact sparkline-style preview.
  TradingViewSymbolOverview.tsx  Symbol Overview embed. Small multi-symbol comparison.
  TradingViewProvider.tsx        Preloads tv.js once near the app root.
  types.ts                       Prop types + the ambient `window.TradingView` type.

src/lib/tradingview/
  loadScript.ts        Singleton tv.js loader + the embed-widget mount helper.
  symbolMapping.ts      Asset -> TradingView symbol resolution.
```

**No report block or page creates a `<script>` tag or touches
`window.TradingView` directly.** Everything goes through these components.

## `TradingViewChart`

The Advanced Real-Time Chart widget, loaded via `https://s3.tradingview.com/tv.js`
and instantiated with `new TradingView.widget({...})`.

```tsx
<TradingViewChart symbol="NASDAQ:AAPL" interval="D" theme="dark" autosize />
```

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
  className?: string;
}
```

### Lifecycle

1. On mount, `loadTradingViewScript()` is called (idempotent — see below) and
   the component shows a skeleton (`data-tv-status="loading"`).
2. Once the script resolves, a container `<div>` with a fresh id is appended
   inside the component's wrapper, and `new TradingView.widget({...})` is
   constructed against it. Status becomes `"ready"` (or `"error"` if
   construction throws or `window.TradingView` never showed up).
3. **Symbol/interval/theme/etc. changes tear down and recreate the widget**
   rather than calling tv.js's internal `setSymbol` API. tv.js is a
   third-party script outside this repo's type/version control; teardown +
   recreate is simple, doesn't depend on undocumented widget internals, and
   is exactly the behavior a future `MarketPriceChart` (Advanced Charts /
   Lightweight Charts) implementation would need to reproduce anyway to stay
   swappable. The reset itself happens during render (comparing a
   `configKey` derived from the props against the previously-rendered one),
   not synchronously inside the effect — see the comment in the component
   for why (it's what keeps this compliant with `react-hooks/set-state-in-
   effect`, a stricter lint rule than the historical `exhaustive-deps`).
4. On unmount (or before the next widget is created), the previous widget's
   `.remove()` is called inside a `try/catch` — tv.js can throw if the
   container was already detached, which is safe to ignore on cleanup — and
   the container is cleared.

### Avoiding duplicate scripts

`loadTradingViewScript()` (`src/lib/tradingview/loadScript.ts`) is a
module-level singleton: the first call creates the `<script>` tag and caches
the load promise; every subsequent call (from any `TradingViewChart`
instance, anywhere in the tree) awaits the same promise. `TradingViewProvider`
also calls it once, near the app root, purely to start the download earlier
— it doesn't change the guarantee, which lives in `loadTradingViewScript`
itself.

### `data-tv-*` test hooks

The root element carries `data-tv-symbol`, `data-tv-status`
(`loading | ready | error`), and `data-tv-theme` — used by both the Vitest
component tests and the Playwright e2e tests instead of reaching into the
TradingView iframe.

## `TradingViewMiniChart` / `TradingViewSymbolOverview`

These wrap TradingView's self-contained iframe embeds (`embed-widget-mini-
symbol-overview.js`, `embed-widget-symbol-overview.js`) via
`mountTradingViewEmbed()` in `loadScript.ts`. Unlike `TradingViewChart`, each
instance injects its own `<script>` tag with a JSON config as its text
content — that's the documented pattern for these widgets, and multiple
instances on one page is normal and doesn't need the same de-duplication
`TradingViewChart` needs for tv.js.

## Symbol mapping

`src/lib/tradingview/symbolMapping.ts`:

```ts
export function toTradingViewSymbol(asset: Asset): string {
  if (asset.tradingViewSymbol) return asset.tradingViewSymbol;
  if (asset.exchange) return `${asset.exchange}:${asset.symbol}`;
  return asset.symbol;
}
```

Every `Asset` in `src/lib/market-data/fixtures/assets.ts` carries an explicit
`tradingViewSymbol`. Internal symbols (`"AAPL"`, `"GC"`, `"VIX"`) are never
assumed to equal their TradingView counterpart.

## Symbol availability — verified, not assumed

Per the spec's warning to verify TradingView identifiers rather than assume
them: every fixture symbol was rendered through the actual Advanced
Real-Time Chart widget from an **unauthorized origin** (i.e. the same
environment this app runs in — no TradingView-registered domain). Findings:

- **Restricted on the free widget:** cash indices (`TVC:VIX`, `TVC:US10Y`,
  `TVC:TNX`) and continuous futures (`COMEX:GC1!`, `NYMEX:CL1!`,
  `CBOT:ZN1!`) all resolve to *"This symbol is only available on
  TradingView."* — that data is commercially licensed per-domain.
- **Work fine:** stocks, ETFs, forex pairs, crypto pairs, and TVC's CFD/spot
  instruments (`TVC:GOLD`, `TVC:USOIL`).

Because of this, some fixtures intentionally point `tradingViewSymbol` at a
proxy instrument rather than the "obvious" one, with a comment explaining
why:

| Asset | Represents | `tradingViewSymbol` | Why |
|---|---|---|---|
| `VIX` | CBOE Volatility Index | `AMEX:VIXY` | `TVC:VIX` is restricted; VIXY (VIX Short-Term Futures ETF) is the closest instrument that renders. |
| `GC` | Gold Futures | `TVC:GOLD` | `COMEX:GC1!` is restricted; TVC's CFD/spot gold tracks it closely and renders. |
| `CL` | Crude Oil Futures | `TVC:USOIL` | `NYMEX:CL1!` is restricted; TVC's CFD/spot WTI tracks it closely and renders. |
| `US10Y` | US 10Y Treasury Yield | *(none)* | No unrestricted instrument tracks the 10Y yield directly. This asset is used for its quote/metrics only — nothing in the app renders a TradingView chart for it. |

If this app is later served from a TradingView-registered domain (or moves
to Advanced Charts, which doesn't have this restriction), these proxy
mappings should be revisited — the fixtures and this table are the place to
update.

## Advanced Charts compatibility (Phase 2)

The rest of the app depends on `TradingViewChart`'s prop shape
(`symbol`/`interval`/`theme`/`height`/…), not on it being the hosted widget.
The intended future architecture:

```
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

To swap in Advanced Charts later:

1. Add the licensed Advanced Charts library (per its own install
   instructions — its source isn't checked into this repo, per the spec's
   licensing boundary).
2. Implement a `Datafeed` against the Market Platform API's OHLCV/quote
   endpoints — this is genuinely new work, not a refactor of anything here.
3. Replace `TradingViewChart`'s internals (the `new TradingView.widget(...)`
   call and its config) with the Advanced Charts constructor and the new
   datafeed, keeping `TradingViewChartProps` the same. Every caller —
   `ChartWorkspaceView`, `AssetOverviewView`, `TradingViewChartBlock`, the
   dashboard — keeps working unmodified, because none of them know which
   implementation they're getting.

Do not assume Advanced Charts includes market data of its own — per the
spec, it only renders whatever the datafeed adapter feeds it.
