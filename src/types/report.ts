/**
 * Report schema. Reports are plain JSON-serializable data so they can
 * eventually be produced by backend services or AI systems, not just
 * hand-written React pages. ReportRenderer turns this data into UI.
 */
export type ReportSectionLayout = "single" | "two-column" | "three-column";

export interface TradingViewChartBlock {
  type: "tradingview-chart";
  id: string;
  symbol: string;
  interval: string;
  height?: number;
  title?: string;
}

export interface LineChartBlock {
  type: "line-chart";
  id: string;
  title?: string;
  data: Record<string, number | string>[];
  xKey: string;
  series: { key: string; label: string; color?: string }[];
  height?: number;
  valueFormat?: "number" | "percent" | "currency";
}

export interface BarChartBlock {
  type: "bar-chart";
  id: string;
  title?: string;
  data: Record<string, number | string>[];
  xKey: string;
  series: { key: string; label: string; color?: string }[];
  layout?: "horizontal" | "vertical";
  height?: number;
  valueFormat?: "number" | "percent" | "currency";
}

export interface ScatterPlotBlock {
  type: "scatter-plot";
  id: string;
  title?: string;
  data: Record<string, number | string>[];
  xKey: string;
  yKey: string;
  nameKey?: string;
  height?: number;
}

export interface TableBlock {
  type: "table";
  id: string;
  title?: string;
  columns: { key: string; label: string; format?: "number" | "percent" | "currency" | "text" }[];
  rows: Record<string, number | string>[];
}

export interface MetricBlock {
  type: "metric-grid";
  id: string;
  title?: string;
  metrics: {
    label: string;
    value: string;
    change?: number;
    suffix?: string;
  }[];
}

export interface TextBlock {
  type: "text";
  id: string;
  title?: string;
  body: string;
}

export type ReportBlock =
  | TradingViewChartBlock
  | LineChartBlock
  | BarChartBlock
  | ScatterPlotBlock
  | TableBlock
  | MetricBlock
  | TextBlock;

export interface ReportSection {
  id: string;
  title?: string;
  layout?: ReportSectionLayout;
  blocks: ReportBlock[];
}

export interface MarketReport {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  sections: ReportSection[];
}
