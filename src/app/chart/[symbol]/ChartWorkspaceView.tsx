"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AssetSearch } from "@/components/search/AssetSearch";
import { AssetHeader } from "@/components/layout/AssetHeader";
import { TimeframeControls } from "@/components/layout/TimeframeControls";
import { TradingViewChart } from "@/components/tradingview/TradingViewChart";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryStates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricGrid } from "@/components/metrics/MetricGrid";
import { BarChart } from "@/components/charts/BarChart";
import { useAsset, useQuote } from "@/features/assets/hooks";
import { useFundamentals, useMetrics, useOHLCV } from "@/features/market-data/hooks";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { toTradingViewSymbol } from "@/lib/tradingview/symbolMapping";
import { AssetNotFoundError } from "@/lib/market-data";
import { RETURN_KEY_LABELS } from "@/lib/market-data/returns";
import { DEFAULT_INTERVAL, DEFAULT_RANGE, TRADINGVIEW_INTERVAL_MAP } from "@/config/intervals";
import { formatCompactCurrency, formatCurrency, formatPercent, formatVolume } from "@/lib/formatting/number";
import type { DateRangeShortcut, Interval, ReturnKey } from "@/types/market-data";
import type { Asset } from "@/types/asset";

export function ChartWorkspaceView({ symbol }: { symbol: string }) {
  const router = useRouter();
  const [interval, setInterval] = React.useState<Interval>(DEFAULT_INTERVAL);
  const [range, setRange] = React.useState<DateRangeShortcut>(DEFAULT_RANGE);
  const theme = useResolvedTheme();

  const assetQuery = useAsset(symbol);
  const quoteQuery = useQuote(symbol);

  function handleSelect(asset: Asset) {
    router.push(`/chart/${asset.symbol}`);
  }

  if (assetQuery.isError) {
    const message =
      assetQuery.error instanceof AssetNotFoundError
        ? `No asset found for "${symbol}".`
        : "Unable to load this asset.";
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="w-full max-w-sm">
          <AssetSearch onSelect={handleSelect} autoFocus />
        </div>
      </div>
    );
  }

  const asset = assetQuery.data;
  const tvSymbol = asset ? toTradingViewSymbol(asset) : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-2 border-b border-border sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-3 sm:py-2">
        <div className="w-full max-w-xs px-3 pt-2 sm:px-0 sm:pt-0">
          <AssetSearch onSelect={handleSelect} placeholder="Change symbol…" />
        </div>
        <div className="flex-1">
          <AssetHeader
            asset={asset}
            quote={quoteQuery.data}
            isLoading={assetQuery.isLoading}
            isQuoteLoading={quoteQuery.isLoading}
          />
        </div>
      </div>

      <TimeframeControls
        interval={interval}
        onIntervalChange={setInterval}
        range={range}
        onRangeChange={setRange}
      />

      <div className="p-3">
        <ErrorBoundary label={`chart for ${symbol}`}>
          {tvSymbol ? (
            <TradingViewChart
              symbol={tvSymbol}
              interval={TRADINGVIEW_INTERVAL_MAP[interval]}
              theme={theme}
              height={520}
              autosize
              showVolume
            />
          ) : (
            <LoadingBlock lines={8} />
          )}
        </ErrorBoundary>
      </div>

      <div className="flex-1 border-t border-border p-3">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-3">
            <OverviewTab asset={asset} />
          </TabsContent>
          <TabsContent value="returns" className="pt-3">
            <ReturnsTab symbol={symbol} />
          </TabsContent>
          <TabsContent value="volume" className="pt-3">
            <VolumeTab symbol={symbol} interval={interval} range={range} />
          </TabsContent>
          <TabsContent value="fundamentals" className="pt-3">
            <FundamentalsTab symbol={symbol} />
          </TabsContent>
          <TabsContent value="statistics" className="pt-3">
            <StatisticsTab symbol={symbol} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewTab({ asset }: { asset?: Asset }) {
  if (!asset) return <LoadingBlock />;
  const rows: [string, string][] = [
    ["Exchange", asset.exchange ?? "—"],
    ["Currency", asset.currency ?? "—"],
    ["Sector", asset.sector ?? "—"],
    ["Industry", asset.industry ?? "—"],
    ["Internal symbol", asset.symbol],
    ["TradingView symbol", asset.tradingViewSymbol ?? "—"],
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="font-tabular">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const RETURN_KEYS: ReturnKey[] = [
  "return1D",
  "return5D",
  "return1M",
  "return3M",
  "return6M",
  "returnYTD",
  "return1Y",
];

function ReturnsTab({ symbol }: { symbol: string }) {
  const { data: metrics, isLoading, isError, refetch } = useMetrics(symbol);

  if (isLoading) return <LoadingBlock />;
  if (isError || !metrics) return <ErrorBlock message="Unable to load returns." onRetry={refetch} />;

  return (
    <MetricGrid
      metrics={RETURN_KEYS.map((key) => ({
        label: RETURN_KEY_LABELS[key],
        value: formatPercent(metrics[key]),
        change: metrics[key],
      }))}
    />
  );
}

function VolumeTab({ symbol, interval, range }: { symbol: string; interval: Interval; range: DateRangeShortcut }) {
  const { data: bars, isLoading, isError, refetch } = useOHLCV(symbol, interval, range);

  if (isLoading) return <LoadingBlock />;
  if (isError || !bars) return <ErrorBlock message="Unable to load volume." onRetry={refetch} />;

  const data = bars.slice(-90).map((bar) => ({
    date: new Date(bar.time).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    volume: bar.volume,
  }));

  return (
    <BarChart data={data} xKey="date" series={[{ key: "volume", label: "Volume" }]} height={260} />
  );
}

function FundamentalsTab({ symbol }: { symbol: string }) {
  const { data: fundamentals, isLoading, isError, refetch } = useFundamentals(symbol);

  if (isLoading) return <LoadingBlock />;
  if (isError || !fundamentals) return <ErrorBlock message="Unable to load fundamentals." onRetry={refetch} />;

  const rows: [string, string][] = [
    ["P/E Ratio", fundamentals.peRatio !== undefined ? fundamentals.peRatio.toFixed(1) : "—"],
    ["EPS (TTM)", fundamentals.epsTtm !== undefined ? formatCurrency(fundamentals.epsTtm) : "—"],
    ["Dividend Yield", fundamentals.dividendYield !== undefined ? formatPercent(fundamentals.dividendYield, { signed: false }) : "—"],
    ["Market Cap", fundamentals.marketCap !== undefined ? formatCompactCurrency(fundamentals.marketCap) : "—"],
    ["Shares Outstanding", fundamentals.sharesOutstanding !== undefined ? formatVolume(fundamentals.sharesOutstanding) : "—"],
    ["Revenue (TTM)", fundamentals.revenueTtm !== undefined ? formatCompactCurrency(fundamentals.revenueTtm) : "—"],
    ["Profit Margin", fundamentals.profitMargin !== undefined ? formatPercent(fundamentals.profitMargin, { signed: false }) : "—"],
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="font-tabular">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StatisticsTab({ symbol }: { symbol: string }) {
  const { data: metrics, isLoading, isError, refetch } = useMetrics(symbol);

  if (isLoading) return <LoadingBlock />;
  if (isError || !metrics) return <ErrorBlock message="Unable to load statistics." onRetry={refetch} />;

  const rows: [string, string][] = [
    ["52W High", metrics.week52High !== undefined ? formatCurrency(metrics.week52High) : "—"],
    ["52W Low", metrics.week52Low !== undefined ? formatCurrency(metrics.week52Low) : "—"],
    ["RSI (14)", metrics.rsi14 !== undefined ? metrics.rsi14.toFixed(1) : "—"],
    ["ATR (14)", metrics.atr14 !== undefined ? metrics.atr14.toFixed(2) : "—"],
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="font-tabular">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
