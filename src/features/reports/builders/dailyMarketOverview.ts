import { marketDataProvider } from "@/lib/market-data";
import { resolveDateRange } from "@/lib/market-data/dateRange";
import { findAssetBySymbol } from "@/lib/market-data/fixtures/assets";
import { toTradingViewSymbol } from "@/lib/tradingview/symbolMapping";
import { SP500_SECTORS } from "@/config/sectors";
import { formatCurrency, formatNumber } from "@/lib/formatting/number";
import type { MarketReport } from "@/types/report";

function tvSymbol(internalSymbol: string): string {
  const asset = findAssetBySymbol(internalSymbol);
  return asset ? toTradingViewSymbol(asset) : internalSymbol;
}

const INDEX_ROW_SYMBOLS = ["SPY", "QQQ", "IWM", "TLT", "GLD", "VIX", "BTCUSD", "EURUSD"];
const CROSS_ASSET_SYMBOLS = [
  { symbol: "SPY", label: "SPY" },
  { symbol: "QQQ", label: "QQQ" },
  { symbol: "TLT", label: "TLT" },
  { symbol: "GLD", label: "GLD" },
  { symbol: "BTCUSD", label: "BTC" },
];

async function buildMetricCards() {
  const [spy, qqq, vix, us10y, gc, cl] = await Promise.all(
    ["SPY", "QQQ", "VIX", "US10Y", "GC", "CL"].map((symbol) => marketDataProvider.getQuote(symbol)),
  );

  return [
    { label: "S&P 500 (SPY)", value: formatCurrency(spy.price), change: spy.changePercent },
    { label: "Nasdaq 100 (QQQ)", value: formatCurrency(qqq.price), change: qqq.changePercent },
    { label: "VIX", value: formatNumber(vix.price), change: vix.changePercent },
    { label: "10Y Yield", value: `${formatNumber(us10y.price)}%`, change: us10y.changePercent },
    { label: "Gold", value: formatCurrency(gc.price), change: gc.changePercent },
    { label: "Crude Oil", value: formatCurrency(cl.price), change: cl.changePercent },
  ];
}

async function buildSectorPerformance() {
  const rows = await Promise.all(
    SP500_SECTORS.map(async (sector) => {
      const metrics = await marketDataProvider.getMetrics?.(sector.symbol);
      return { sector: sector.label, "1D Return": metrics?.return1D ?? 0 };
    }),
  );
  return rows.sort((a, b) => b["1D Return"] - a["1D Return"]);
}

async function buildCrossAssetPerformance() {
  const range = resolveDateRange("6M");
  const seriesBySymbol = await Promise.all(
    CROSS_ASSET_SYMBOLS.map(async ({ symbol, label }) => {
      const bars = await marketDataProvider.getOHLCV(symbol, "1D", range);
      return { label, bars };
    }),
  );

  const barCount = Math.min(...seriesBySymbol.map((s) => s.bars.length));
  const data: Record<string, number | string>[] = [];

  for (let i = 0; i < barCount; i += 1) {
    const point: Record<string, number | string> = {
      date: new Date(seriesBySymbol[0].bars[i].time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
    for (const { label, bars } of seriesBySymbol) {
      const base = bars[0].close;
      point[label] = Number(((bars[i].close / base) * 100).toFixed(2));
    }
    data.push(point);
  }

  return data;
}

async function buildMarketTable() {
  const rows = await Promise.all(
    INDEX_ROW_SYMBOLS.map(async (symbol) => {
      const [quote, metrics] = await Promise.all([
        marketDataProvider.getQuote(symbol),
        marketDataProvider.getMetrics?.(symbol),
      ]);
      return {
        symbol,
        price: Number(quote.price.toFixed(2)),
        changePercent: Number(quote.changePercent.toFixed(2)),
        return1D: metrics?.return1D !== undefined ? Number(metrics.return1D.toFixed(2)) : 0,
        return5D: metrics?.return5D !== undefined ? Number(metrics.return5D.toFixed(2)) : 0,
        return1M: metrics?.return1M !== undefined ? Number(metrics.return1M.toFixed(2)) : 0,
        returnYTD: metrics?.returnYTD !== undefined ? Number(metrics.returnYTD.toFixed(2)) : 0,
      };
    }),
  );
  return rows;
}

export async function buildDailyMarketOverviewReport(): Promise<MarketReport> {
  const [metrics, sectorPerformance, crossAssetData, marketTableRows] = await Promise.all([
    buildMetricCards(),
    buildSectorPerformance(),
    buildCrossAssetPerformance(),
    buildMarketTable(),
  ]);

  const now = new Date().toISOString();

  const report: MarketReport = {
    id: "daily-market-overview",
    title: "Daily Market Overview",
    description: "Auto-generated snapshot combining TradingView charts with quantitative overlays.",
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: "market-snapshot",
        title: "Market Snapshot",
        layout: "single",
        blocks: [{ type: "metric-grid", id: "market-snapshot-metrics", metrics }],
      },
      {
        id: "sp500",
        title: "S&P 500",
        layout: "single",
        blocks: [
          { type: "tradingview-chart", id: "spy-chart", symbol: tvSymbol("SPY"), interval: "D", height: 460 },
        ],
      },
      {
        id: "nasdaq",
        title: "Nasdaq",
        layout: "single",
        blocks: [
          { type: "tradingview-chart", id: "qqq-chart", symbol: tvSymbol("QQQ"), interval: "D", height: 460 },
        ],
      },
      {
        id: "sector-performance",
        title: "Sector Performance",
        layout: "single",
        blocks: [
          {
            type: "bar-chart",
            id: "sector-performance-bar",
            layout: "horizontal",
            xKey: "sector",
            series: [{ key: "1D Return", label: "1D Return" }],
            data: sectorPerformance,
            height: 360,
            valueFormat: "percent",
          },
        ],
      },
      {
        id: "cross-asset-performance",
        title: "Cross-Asset Performance",
        layout: "single",
        blocks: [
          {
            type: "line-chart",
            id: "cross-asset-line",
            title: "Normalized to 100 · trailing 6 months",
            xKey: "date",
            series: CROSS_ASSET_SYMBOLS.map((s) => ({ key: s.label, label: s.label })),
            data: crossAssetData,
            height: 320,
          },
        ],
      },
      {
        id: "market-table",
        title: "Market Table",
        layout: "single",
        blocks: [
          {
            type: "table",
            id: "market-table-block",
            columns: [
              { key: "symbol", label: "Symbol", format: "text" },
              { key: "price", label: "Price", format: "number" },
              { key: "changePercent", label: "Change %", format: "percent" },
              { key: "return1D", label: "1D", format: "percent" },
              { key: "return5D", label: "5D", format: "percent" },
              { key: "return1M", label: "1M", format: "percent" },
              { key: "returnYTD", label: "YTD", format: "percent" },
            ],
            rows: marketTableRows,
          },
        ],
      },
      {
        id: "volatility",
        title: "Volatility",
        layout: "single",
        blocks: [
          { type: "tradingview-chart", id: "vix-chart", symbol: tvSymbol("VIX"), interval: "D", height: 360 },
        ],
      },
      {
        id: "notes",
        title: "Notes",
        layout: "single",
        blocks: [
          {
            type: "text",
            id: "notes-text",
            body:
              "Placeholder for market observations. This block is where future AI-generated or manually written commentary can appear — swap this text field for generated content without changing the report layout.",
          },
        ],
      },
    ],
  };

  return report;
}
