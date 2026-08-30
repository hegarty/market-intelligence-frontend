"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingViewChart } from "@/components/tradingview/TradingViewChart";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryStates";
import { MetricCard } from "@/components/metrics/MetricCard";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { FinancialTable } from "@/components/tables/FinancialTable";
import { currencyColumn, percentColumn, textColumn } from "@/components/tables/columns";
import { useQuote, useQuotes } from "@/features/assets/hooks";
import { useMarketBreadth, useSectorPerformance } from "@/features/market-data/hooks";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { SP500_SECTORS } from "@/config/sectors";
import type { FinancialColumnDef } from "@/components/tables/features";

const DASHBOARD_METRIC_SYMBOLS = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "Nasdaq 100" },
  { symbol: "VIX", label: "VIX" },
  { symbol: "US10Y", label: "10Y Yield" },
];

const MARKET_TABLE_SYMBOLS = ["SPY", "QQQ", "IWM", "TLT", "GLD", "VIX", "BTCUSD", "EURUSD"];

interface MarketRow {
  symbol: string;
  price: number;
  changePercent: number;
}

const MARKET_TABLE_COLUMNS: FinancialColumnDef<MarketRow>[] = [
  textColumn<MarketRow>("symbol", "Symbol"),
  currencyColumn<MarketRow>("price", "Price"),
  percentColumn<MarketRow>("changePercent", "Change %"),
];

export function DashboardView() {
  const theme = useResolvedTheme();
  const sectorQuery = useSectorPerformance();
  const breadthQuery = useMarketBreadth(SP500_SECTORS.map((s) => s.symbol));

  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>
              <Link href="/chart/SPY" className="hover:text-foreground">
                S&amp;P 500 — SPY
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ErrorBoundary label="market chart">
              <TradingViewChart symbol="AMEX:SPY" theme={theme} height={360} autosize hideToolbar />
            </ErrorBoundary>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {DASHBOARD_METRIC_SYMBOLS.map(({ symbol, label }) => (
              <DashboardMetric key={symbol} symbol={symbol} label={label} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Sector Performance (1D)</CardTitle>
          </CardHeader>
          <CardContent>
            {sectorQuery.isLoading ? (
              <LoadingBlock />
            ) : sectorQuery.isError || !sectorQuery.data ? (
              <ErrorBlock message="Unable to load sector performance." onRetry={sectorQuery.refetch} />
            ) : (
              <BarChart
                data={sectorQuery.data}
                xKey="sector"
                series={[{ key: "1D Return", label: "1D Return" }]}
                valueFormat="percent"
                height={280}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breadth</CardTitle>
          </CardHeader>
          <CardContent>
            {breadthQuery.isLoading ? (
              <LoadingBlock />
            ) : breadthQuery.isError || !breadthQuery.data ? (
              <ErrorBlock message="Unable to load breadth." onRetry={breadthQuery.refetch} />
            ) : (
              <LineChart
                data={breadthQuery.data}
                xKey="date"
                series={[{ key: "Net Advancers", label: "Net Advancers (Sectors)" }]}
                height={280}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Table</CardTitle>
        </CardHeader>
        <CardContent>
          <MarketTable />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardMetric({ symbol, label }: { symbol: string; label: string }) {
  const { data: quote, isLoading } = useQuote(symbol);
  return (
    <MetricCard
      label={label}
      value={quote ? quote.price.toFixed(2) : "—"}
      change={quote?.changePercent}
      isLoading={isLoading}
    />
  );
}

function MarketTable() {
  const quotes = useQuotes(MARKET_TABLE_SYMBOLS);
  const isLoading = quotes.some((q) => q.isLoading);

  if (isLoading) return <LoadingBlock lines={6} />;

  const rows: MarketRow[] = quotes
    .filter((q) => q.data)
    .map((q) => ({
      symbol: q.data!.symbol,
      price: q.data!.price,
      changePercent: q.data!.changePercent,
    }));

  return <FinancialTable data={rows} columns={MARKET_TABLE_COLUMNS} searchable={false} maxHeight={360} />;
}
