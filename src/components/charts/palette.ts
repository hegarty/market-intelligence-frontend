/**
 * Categorical series palette, sourced from the validated dataviz reference
 * palette (see dataviz skill references/palette.md). Colors are read as CSS
 * custom properties so they resolve per-theme automatically — never assign
 * hues by index/rank, always by a series' fixed slot.
 */
export const SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
] as const;

export const CHART_GRID_COLOR = "var(--chart-grid)";
export const CHART_AXIS_COLOR = "var(--chart-axis)";
export const CHART_POSITIVE_COLOR = "var(--positive)";
export const CHART_NEGATIVE_COLOR = "var(--negative)";

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}
