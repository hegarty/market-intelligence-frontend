import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatting/number";

export type ChartValueFormat = "number" | "percent" | "currency";

export function formatChartValue(value: number, format: ChartValueFormat = "number"): string {
  switch (format) {
    case "percent":
      return formatPercent(value);
    case "currency":
      return formatCurrency(value);
    default:
      return formatNumber(value);
  }
}
