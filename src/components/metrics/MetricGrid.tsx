import { MetricCard, type MetricCardProps } from "@/components/metrics/MetricCard";
import { cn } from "@/lib/utils/cn";

export function MetricGrid({
  metrics,
  className,
}: {
  metrics: MetricCardProps[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
        className,
      )}
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
