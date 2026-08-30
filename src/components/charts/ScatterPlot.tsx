"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart as RScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_AXIS_COLOR, CHART_GRID_COLOR, seriesColor } from "@/components/charts/palette";
import type { ChartDatum, ChartSize } from "@/components/charts/types";
import { EmptyBlock } from "@/components/common/QueryStates";

export interface ScatterPlotProps {
  data: ChartDatum[];
  xKey: string;
  yKey: string;
  nameKey?: string;
  xLabel?: string;
  yLabel?: string;
  height?: ChartSize;
  color?: string;
}

/** Reusable scatter chart — correlation, beta, risk/return placement. */
export function ScatterPlot({
  data,
  xKey,
  yKey,
  nameKey,
  xLabel,
  yLabel,
  height = 280,
  color,
}: ScatterPlotProps) {
  if (!data || data.length === 0) return <EmptyBlock />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={CHART_GRID_COLOR} strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey={xKey}
          name={xLabel ?? xKey}
          stroke={CHART_AXIS_COLOR}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: CHART_AXIS_COLOR }}
        />
        <YAxis
          type="number"
          dataKey={yKey}
          name={yLabel ?? yKey}
          stroke={CHART_AXIS_COLOR}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3", stroke: CHART_AXIS_COLOR }}
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;
            const point = payload[0].payload as ChartDatum;
            return (
              <div className="rounded-md border border-border bg-panel px-2.5 py-1.5 text-xs shadow-lg">
                {nameKey ? (
                  <div className="mb-1 font-medium text-foreground">{String(point[nameKey])}</div>
                ) : null}
                <div className="text-muted-foreground">
                  {xLabel ?? xKey}: <span className="text-foreground">{String(point[xKey])}</span>
                </div>
                <div className="text-muted-foreground">
                  {yLabel ?? yKey}: <span className="text-foreground">{String(point[yKey])}</span>
                </div>
              </div>
            );
          }}
        />
        <Scatter data={data} fill={color ?? seriesColor(0)} isAnimationActive={false} />
      </RScatterChart>
    </ResponsiveContainer>
  );
}
