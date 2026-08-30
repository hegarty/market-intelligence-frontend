# Report System

Reports combine TradingView charts with our own charts, tables, and KPI
cards inside one reusable layout. The important architectural decision:
**a report is data, not a page.** `ReportRenderer` is the only thing that
turns a `MarketReport` into React — there should never be a second,
hand-written page for a report.

## Schema

`src/types/report.ts`:

```ts
interface MarketReport {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  sections: ReportSection[];
}

interface ReportSection {
  id: string;
  title?: string;
  layout?: "single" | "two-column" | "three-column";
  blocks: ReportBlock[];
}

type ReportBlock =
  | TradingViewChartBlock
  | LineChartBlock
  | BarChartBlock
  | ScatterPlotBlock
  | TableBlock
  | MetricBlock
  | TextBlock;
```

Every block is a discriminated union member on `type`, and every field is a
plain JSON-serializable value (strings, numbers, arrays of
`Record<string, number | string>`) — no React elements, no functions. That's
deliberate: a `MarketReport` should be producible by a backend service, a
database row, or an LLM, and transported as JSON, not assembled in a React
component.

## Rendering

```
components/report/
  Report.tsx           Title/description/date chrome around the sections.
  ReportSection.tsx     Section title + single/two-column/three-column grid.
  ReportHeading.tsx      Shared heading styles (report title vs. section title).
  ReportRenderer.tsx      MarketReport -> UI. The dispatch table lives here.
  LazyBlock.tsx           IntersectionObserver-gated mounting (see below).

  blocks/
    BlockCard.tsx             Shared Card wrapper (title + content) blocks reuse.
    TradingViewChartBlock.tsx
    LineChartBlock.tsx
    BarChartBlock.tsx
    ScatterPlotBlock.tsx
    TableBlock.tsx
    MetricGridBlock.tsx
    TextBlock.tsx
```

```tsx
<ReportRenderer report={report} />
```

`ReportRenderer` walks `report.sections`, and for each block: resolves the
right block component via a `switch` on `block.type` (exhaustive — adding a
new member to the `ReportBlock` union without a corresponding `case` is a
TypeScript error), wraps it in `LazyBlock` so below-the-fold blocks don't all
initialize at once, and wraps *that* in an `ErrorBoundary` so a block that
throws during render only replaces itself with a "Unable to load…" message
— it doesn't take down the rest of the report or the page. See
`ReportRenderer.test.tsx` for this exercised directly (multiple TradingView
charts in one report; a deliberately malformed block not crashing its
siblings).

## Adding a new report block type

1. Add the new interface to the `ReportBlock` union in `src/types/report.ts`,
   with a unique `type` string literal and an `id: string`.
2. Add a component under `src/components/report/blocks/` that takes
   `{ block: YourNewBlockType }` and renders it — reuse `BlockCard` for the
   title/card chrome if it has one.
3. Add the `case "your-new-type":` to the `switch` in
   `ReportBlockRenderer` inside `ReportRenderer.tsx`. TypeScript will flag
   this as required (the switch is exhaustive over `ReportBlock["type"]`).
4. If the block has a natural default height, add a case for it in
   `blockMinHeight()` in the same file, so `LazyBlock`'s placeholder doesn't
   cause layout shift when the block mounts.

No page needs to change — any report (existing or new) that includes a block
of the new type picks it up automatically through `ReportRenderer`.

## Adding a new report

Reports are registered, not hand-built as pages:

```
src/features/reports/
  registry.ts             REPORT_DEFINITIONS: { id, title, description, build }[]
  hooks.ts                 useReport(reportId) — TanStack Query wrapper around build()
  builders/
    dailyMarketOverview.ts  The Daily Market Overview report's build() function
```

```ts
export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  build: () => Promise<MarketReport>;
}
```

To add a report:

1. Write a `build(): Promise<MarketReport>` function (see
   `builders/dailyMarketOverview.ts` for the pattern — it composes calls to
   `marketDataProvider` and returns a plain `MarketReport` object).
2. Add an entry to `REPORT_DEFINITIONS` in `registry.ts`.

`/reports` lists `REPORT_DEFINITIONS` automatically, and
`/reports/[reportId]` (`src/app/reports/[reportId]/ReportView.tsx`) resolves
the id via `getReportDefinition`, calls `build()` through `useReport`, and
renders the result with `<ReportRenderer report={report} />`. Nothing here
is specific to any one report — this is what makes "add another report using
configuration rather than building another custom page" (the spec's
Definition of Done item 15) true.

Eventually `build()` can be replaced by a `GET /api/reports/:id` call that
returns the same `MarketReport` shape from a backend or an AI system —
`ReportRenderer` doesn't know or care where the data came from.

## The Daily Market Overview report

`src/features/reports/builders/dailyMarketOverview.ts` builds:

- **Market Snapshot** — a `metric-grid` with SPY, QQQ, VIX, 10Y Yield, Gold,
  Crude Oil quotes.
- **S&P 500** / **Nasdaq** — `tradingview-chart` blocks for SPY and QQQ.
- **Sector Performance** — a `bar-chart` of the SPDR sector ETFs' 1D returns
  (`config/sectors.ts` — not hard-coded in the builder or the component).
- **Cross-Asset Performance** — a `line-chart` normalizing SPY/QQQ/TLT/GLD/
  BTC to start=100 over the trailing 6 months.
- **Market Table** — a `table` block of major indexes/asset classes with
  price, change%, and 1D/5D/1M/YTD returns.
- **Volatility** — a `tradingview-chart` block (see
  `docs/tradingview-integration.md` for why this uses `AMEX:VIXY` rather
  than a raw VIX index symbol).
- **Notes** — a `text` block, explicitly a placeholder for future AI-
  generated or manually written commentary.

This is the report referenced by the spec's "prove that embedded TradingView
charts and our own visualizations coexist naturally within one document" —
it's also the report exercised by `e2e/report.spec.ts`.
