"use client";

import {
  Area,
  AreaChart as RAreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { seriesColor, CHART_AXIS_COLOR, CHART_GRID_COLOR } from "@/components/charts/palette";
import type { ChartDatum, ChartSeriesDef, ChartSize } from "@/components/charts/types";
import type { ChartValueFormat } from "@/components/charts/format";
import { EmptyBlock } from "@/components/common/QueryStates";

export interface AreaChartProps {
  data: ChartDatum[];
  xKey: string;
  series: ChartSeriesDef[];
  height?: ChartSize;
  valueFormat?: ChartValueFormat;
  showLegend?: boolean;
}

/** Reusable area chart — useful for volume trends and cumulative series. */
export function AreaChart({ data, xKey, series, height = 280, valueFormat = "number", showLegend }: AreaChartProps) {
  if (!data || data.length === 0) return <EmptyBlock />;
  const shouldShowLegend = showLegend ?? series.length > 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RAreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={CHART_GRID_COLOR} strokeDasharray="3 3" vertical={false} />
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
        <Tooltip content={(props) => <ChartTooltip {...props} valueFormat={valueFormat} />} />
        {shouldShowLegend ? (
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
        ) : null}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? seriesColor(i)}
            fill={s.color ?? seriesColor(i)}
            fillOpacity={0.12}
            strokeWidth={2}
            isAnimationActive={false}
          />
        ))}
      </RAreaChart>
    </ResponsiveContainer>
  );
}
