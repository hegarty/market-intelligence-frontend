export interface ChartSeriesDef {
  key: string;
  label: string;
  color?: string;
}

export type ChartDatum = Record<string, number | string>;

/** Matches recharts' ResponsiveContainer height/width type. */
export type ChartSize = number | `${number}%`;
