import type { TooltipContentProps } from "recharts";
import { formatChartValue, type ChartValueFormat } from "@/components/charts/format";

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormat = "number",
}: TooltipContentProps & { valueFormat?: ChartValueFormat }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-border bg-panel px-2.5 py-1.5 text-xs shadow-lg">
      {label !== undefined ? (
        <div className="mb-1 font-medium text-foreground">{label}</div>
      ) : null}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <div key={entry.dataKey as string} className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-tabular font-medium text-foreground">
              {typeof entry.value === "number" ? formatChartValue(entry.value, valueFormat) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
