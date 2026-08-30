import { ArrowDown, ArrowUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/lib/formatting/number";
import { cn } from "@/lib/utils/cn";

export interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  suffix?: string;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({ label, value, change, suffix, isLoading, className }: MetricCardProps) {
  if (isLoading) {
    return (
      <div className={cn("rounded-md border border-border bg-panel p-3", className)}>
        <Skeleton className="mb-2 h-3 w-16" />
        <Skeleton className="mb-1 h-6 w-24" />
        <Skeleton className="h-3 w-14" />
      </div>
    );
  }

  const isPositive = typeof change === "number" && change > 0;
  const isNegative = typeof change === "number" && change < 0;

  return (
    <div className={cn("rounded-md border border-border bg-panel p-3", className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-tabular text-xl font-semibold text-foreground">
        {value}
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
      {typeof change === "number" ? (
        <div
          className={cn(
            "mt-0.5 flex items-center gap-0.5 font-tabular text-xs",
            isPositive && "text-positive",
            isNegative && "text-negative",
            !isPositive && !isNegative && "text-muted-foreground",
          )}
        >
          {isPositive ? <ArrowUp className="h-3 w-3" /> : null}
          {isNegative ? <ArrowDown className="h-3 w-3" /> : null}
          {formatPercent(change)}
        </div>
      ) : null}
    </div>
  );
}
