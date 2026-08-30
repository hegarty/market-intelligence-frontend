"use client";

import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  seriesColor,
  CHART_AXIS_COLOR,
  CHART_GRID_COLOR,
  CHART_NEGATIVE_COLOR,
  CHART_POSITIVE_COLOR,
} from "@/components/charts/palette";
import type { ChartDatum, ChartSeriesDef, ChartSize } from "@/components/charts/types";
import type { ChartValueFormat } from "@/components/charts/format";
import { EmptyBlock } from "@/components/common/QueryStates";

export interface BarChartProps {
  data: ChartDatum[];
  xKey: string;
  series: ChartSeriesDef[];
  layout?: "horizontal" | "vertical";
  height?: ChartSize;
  valueFormat?: ChartValueFormat;
  /** Colors single-series bars green/red by sign instead of a fixed series color (e.g. sector returns). */
  colorByValue?: boolean;
}

/** Reusable bar chart — sector performance, relative strength, ranked returns. */
export function BarChart({
  data,
  xKey,
  series,
  layout = "horizontal",
  height = 280,
  valueFormat = "number",
  colorByValue = false,
}: BarChartProps) {
  if (!data || data.length === 0) return <EmptyBlock />;
  const isVertical = layout === "vertical";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart
        data={data}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 12, bottom: 0, left: isVertical ? 8 : 0 }}
      >
        <CartesianGrid
          stroke={CHART_GRID_COLOR}
          strokeDasharray="3 3"
          horizontal={!isVertical}
          vertical={isVertical}
        />
        {isVertical ? (
          <>
            <XAxis
              type="number"
              stroke={CHART_AXIS_COLOR}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_AXIS_COLOR }}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              stroke={CHART_AXIS_COLOR}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={64}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xKey}
              stroke={CHART_AXIS_COLOR}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART_AXIS_COLOR }}
            />
            <YAxis
              stroke={CHART_AXIS_COLOR}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
          </>
        )}
        <Tooltip
          content={(props) => <ChartTooltip {...props} valueFormat={valueFormat} />}
          cursor={{ fill: "var(--muted)" }}
        />
        {series.length > 1 ? (
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
        ) : null}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            radius={4}
            isAnimationActive={false}
            fill={s.color ?? seriesColor(i)}
          >
            {colorByValue
              ? data.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={Number(entry[s.key]) >= 0 ? CHART_POSITIVE_COLOR : CHART_NEGATIVE_COLOR}
                  />
                ))
              : null}
          </Bar>
        ))}
      </RBarChart>
    </ResponsiveContainer>
  );
}
