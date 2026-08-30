"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart as LineChartIcon } from "lucide-react";
import { AssetSearch } from "@/components/search/AssetSearch";
import { AssetHeader } from "@/components/layout/AssetHeader";
import { TradingViewChart } from "@/components/tradingview/TradingViewChart";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryStates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricGrid } from "@/components/metrics/MetricGrid";
import { useAsset, useQuote } from "@/features/assets/hooks";
import { useFundamentals, useMetrics } from "@/features/market-data/hooks";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { toTradingViewSymbol } from "@/lib/tradingview/symbolMapping";
import { AssetNotFoundError } from "@/lib/market-data";
import { RETURN_KEY_LABELS } from "@/lib/market-data/returns";
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/formatting/number";
import type { Asset } from "@/types/asset";
import type { ReturnKey } from "@/types/market-data";

const RETURN_KEYS: ReturnKey[] = ["return1D", "return5D", "return1M", "return3M", "returnYTD", "return1Y"];

export function AssetOverviewView({ symbol }: { symbol: string }) {
  const router = useRouter();
  const theme = useResolvedTheme();

  const assetQuery = useAsset(symbol);
  const quoteQuery = useQuote(symbol);
  const metricsQuery = useMetrics(symbol);
  const fundamentalsQuery = useFundamentals(symbol);

  function handleSelect(asset: Asset) {
    router.push(`/asset/${asset.symbol}`);
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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 p-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <AssetHeader
          asset={asset}
          quote={quoteQuery.data}
          isLoading={assetQuery.isLoading}
          isQuoteLoading={quoteQuery.isLoading}
        />
        {asset ? (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/chart/${asset.symbol}`}>
              <LineChartIcon className="h-3.5 w-3.5" /> Open full chart
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <ErrorBoundary label={`chart for ${symbol}`}>
          {tvSymbol ? (
            <TradingViewChart symbol={tvSymbol} theme={theme} height={420} autosize showVolume />
          ) : (
            <LoadingBlock lines={8} />
          )}
        </ErrorBoundary>

        <Card>
          <CardHeader>
            <CardTitle>Fundamentals</CardTitle>
          </CardHeader>
          <CardContent>
            {fundamentalsQuery.isLoading ? (
              <LoadingBlock lines={5} />
            ) : fundamentalsQuery.isError || !fundamentalsQuery.data ? (
              <ErrorBlock message="Unable to load fundamentals." onRetry={fundamentalsQuery.refetch} />
            ) : (
              <dl className="flex flex-col gap-2 text-sm">
                <FundamentalRow label="P/E Ratio" value={fundamentalsQuery.data.peRatio?.toFixed(1)} />
                <FundamentalRow
                  label="Dividend Yield"
                  value={
                    fundamentalsQuery.data.dividendYield !== undefined
                      ? formatPercent(fundamentalsQuery.data.dividendYield, { signed: false })
                      : undefined
                  }
                />
                <FundamentalRow
                  label="Market Cap"
                  value={
                    fundamentalsQuery.data.marketCap !== undefined
                      ? formatCompactCurrency(fundamentalsQuery.data.marketCap)
                      : undefined
                  }
                />
                <FundamentalRow
                  label="52W High"
                  value={metricsQuery.data?.week52High !== undefined ? formatCurrency(metricsQuery.data.week52High) : undefined}
                />
                <FundamentalRow
                  label="52W Low"
                  value={metricsQuery.data?.week52Low !== undefined ? formatCurrency(metricsQuery.data.week52Low) : undefined}
                />
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
        </CardHeader>
        <CardContent>
          {metricsQuery.isLoading ? (
            <LoadingBlock />
          ) : metricsQuery.isError || !metricsQuery.data ? (
            <ErrorBlock message="Unable to load returns." onRetry={metricsQuery.refetch} />
          ) : (
            <MetricGrid
              metrics={RETURN_KEYS.map((key) => ({
                label: RETURN_KEY_LABELS[key],
                value: formatPercent(metricsQuery.data?.[key]),
                change: metricsQuery.data?.[key],
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FundamentalRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-1.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-tabular">{value ?? "—"}</dd>
    </div>
  );
}
