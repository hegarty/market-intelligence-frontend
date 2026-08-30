import type { DateRangeShortcut, Interval } from "@/types/market-data";

/**
 * Interval and date-range are kept conceptually separate, per spec:
 * interval controls bar granularity, range controls the visible window.
 */
export const TIMEFRAME_INTERVALS: { value: Interval; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "30m", label: "30m" },
  { value: "1H", label: "1H" },
  { value: "4H", label: "4H" },
  { value: "1D", label: "1D" },
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
];

export const DATE_RANGE_SHORTCUTS: { value: DateRangeShortcut; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "5D", label: "5D" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "YTD", label: "YTD" },
  { value: "1Y", label: "1Y" },
  { value: "5Y", label: "5Y" },
  { value: "MAX", label: "MAX" },
];

export const DEFAULT_INTERVAL: Interval = "1D";
export const DEFAULT_RANGE: DateRangeShortcut = "1Y";

/** Maps our Interval union to TradingView's `interval` widget parameter. */
export const TRADINGVIEW_INTERVAL_MAP: Record<Interval, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "30m": "30",
  "1H": "60",
  "4H": "240",
  "1D": "D",
  "1W": "W",
  "1M": "M",
};
