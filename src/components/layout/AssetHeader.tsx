import { ArrowDown, ArrowUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ASSET_TYPE_LABELS, type Asset } from "@/types/asset";
import type { Quote } from "@/types/market-data";
import { formatCurrency, formatPercent } from "@/lib/formatting/number";
import { cn } from "@/lib/utils/cn";

export function AssetHeader({
  asset,
  quote,
  isLoading,
  isQuoteLoading,
}: {
  asset?: Asset;
  quote?: Quote;
  isLoading?: boolean;
  isQuoteLoading?: boolean;
}) {
  if (isLoading || !asset) {
    return (
      <div className="flex items-center gap-4 p-3">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    );
  }

  const isPositive = typeof quote?.change === "number" && quote.change > 0;
  const isNegative = typeof quote?.change === "number" && quote.change < 0;

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 p-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{asset.symbol}</h1>
          <Badge variant="accent">{ASSET_TYPE_LABELS[asset.assetType]}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {asset.name}
          {asset.exchange ? ` · ${asset.exchange}` : ""}
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        {isQuoteLoading ? (
          <>
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-20" />
          </>
        ) : quote ? (
          <>
            <div className="font-tabular text-2xl font-semibold">{formatCurrency(quote.price)}</div>
            <div
              className={cn(
                "flex items-center gap-1 font-tabular text-sm",
                isPositive && "text-positive",
                isNegative && "text-negative",
              )}
            >
              {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> : null}
              {isNegative ? <ArrowDown className="h-3.5 w-3.5" /> : null}
              {formatCurrency(Math.abs(quote.change), { fractionDigits: 2 })}
              <span>({formatPercent(quote.changePercent)})</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Quote unavailable</div>
        )}
      </div>
    </div>
  );
}
