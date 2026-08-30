/**
 * Market-data types shared by every MarketDataProvider implementation
 * (mock today, Market Platform API clients later). Keep these free of any
 * TradingView- or UI-specific concepts.
 */
export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  relativeVolume?: number;
  marketCap?: number;
  asOf: string;
}

export const INTERVALS = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1H",
  "4H",
  "1D",
  "1W",
  "1M",
] as const;

export type Interval = (typeof INTERVALS)[number];

export const RANGES = [
  "1D",
  "5D",
  "1M",
  "3M",
  "6M",
  "YTD",
  "1Y",
  "5Y",
  "MAX",
] as const;

export type DateRangeShortcut = (typeof RANGES)[number];

export interface DateRange {
  from: string;
  to: string;
}

export interface OHLCV {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Fundamentals {
  symbol: string;
  peRatio?: number;
  epsTtm?: number;
  dividendYield?: number;
  marketCap?: number;
  sharesOutstanding?: number;
  revenueTtm?: number;
  profitMargin?: number;
}

export interface MarketMetrics {
  symbol: string;
  return1D?: number;
  return5D?: number;
  return1M?: number;
  return3M?: number;
  return6M?: number;
  returnYTD?: number;
  return1Y?: number;
  week52High?: number;
  week52Low?: number;
  rsi14?: number;
  atr14?: number;
  beta?: number;
}

export type ReturnKey =
  | "return1D"
  | "return5D"
  | "return1M"
  | "return3M"
  | "return6M"
  | "returnYTD"
  | "return1Y";
