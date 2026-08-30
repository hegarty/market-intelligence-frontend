import { LineChart, type LineChartProps } from "@/components/charts/LineChart";

/** Same rendering as LineChart; named separately per the multi-series use case (cross-asset comparison, breadth vs. price, …). */
export function MultiLineChart(props: LineChartProps) {
  return <LineChart {...props} showLegend={props.showLegend ?? true} />;
}
