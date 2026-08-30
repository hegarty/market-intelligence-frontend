"use client";

import * as React from "react";
import { X } from "lucide-react";
import { AssetSearch } from "@/components/search/AssetSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryStates";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { FinancialTable } from "@/components/tables/FinancialTable";
import { percentColumn, textColumn } from "@/components/tables/columns";
import { useMetricsMulti, useNormalizedComparison } from "@/features/market-data/hooks";
import { DATE_RANGE_SHORTCUTS } from "@/config/intervals";
import type { FinancialColumnDef } from "@/components/tables/features";
import type { Asset } from "@/types/asset";
import type { DateRangeShortcut } from "@/types/market-data";

const DEFAULT_SYMBOLS = ["SPY", "QQQ", "IWM", "TLT", "GLD", "BTCUSD"];
const MAX_SYMBOLS = 8;

interface ReturnsRow {
  symbol: string;
  return1D: number;
  return5D: number;
  return1M: number;
  returnYTD: number;
}

const RETURNS_COLUMNS: FinancialColumnDef<ReturnsRow>[] = [
  textColumn<ReturnsRow>("symbol", "Symbol"),
  percentColumn<ReturnsRow>("return1D", "1D"),
  percentColumn<ReturnsRow>("return5D", "5D"),
  percentColumn<ReturnsRow>("return1M", "1M"),
  percentColumn<ReturnsRow>("returnYTD", "YTD"),
];

export function CompareView() {
  const [symbols, setSymbols] = React.useState<string[]>(DEFAULT_SYMBOLS);
  const [range, setRange] = React.useState<DateRangeShortcut>("1Y");

  const comparisonQuery = useNormalizedComparison(symbols, range);
  const metricsQueries = useMetricsMulti(symbols);
  const metricsLoading = metricsQueries.some((q) => q.isLoading);

  function addSymbol(asset: Asset) {
    setSymbols((prev) => (prev.includes(asset.symbol) || prev.length >= MAX_SYMBOLS ? prev : [...prev, asset.symbol]));
  }

  function removeSymbol(symbol: string) {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
  }

  const returnsRows: ReturnsRow[] = symbols.map((symbol, i) => ({
    symbol,
    return1D: metricsQueries[i]?.data?.return1D ?? 0,
    return5D: metricsQueries[i]?.data?.return5D ?? 0,
    return1M: metricsQueries[i]?.data?.return1M ?? 0,
    returnYTD: metricsQueries[i]?.data?.returnYTD ?? 0,
  }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 p-3">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold tracking-tight">Compare</h1>
        <div className="flex flex-wrap items-center gap-2">
          {symbols.map((symbol) => (
            <Badge key={symbol} variant="accent" className="flex items-center gap-1 py-1">
              {symbol}
              <button
                type="button"
                aria-label={`Remove ${symbol}`}
                onClick={() => removeSymbol(symbol)}
                className="ml-0.5 rounded-sm hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="max-w-xs">
          <AssetSearch
            onSelect={addSymbol}
            placeholder={symbols.length >= MAX_SYMBOLS ? `Max ${MAX_SYMBOLS} symbols` : "Add a symbol to compare…"}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Normalized Performance (Start = 100)</CardTitle>
          <div className="flex items-center gap-0.5">
            {DATE_RANGE_SHORTCUTS.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={option.value === range ? "secondary" : "ghost"}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {comparisonQuery.isLoading ? (
            <LoadingBlock />
          ) : comparisonQuery.isError || !comparisonQuery.data ? (
            <ErrorBlock message="Unable to load comparison." onRetry={comparisonQuery.refetch} />
          ) : (
            <MultiLineChart
              data={comparisonQuery.data}
              xKey="date"
              series={symbols.map((symbol) => ({ key: symbol, label: symbol }))}
              height={360}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <LoadingBlock lines={4} />
          ) : (
            <FinancialTable data={returnsRows} columns={RETURNS_COLUMNS} searchable={false} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
