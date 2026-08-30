export type TradingViewTheme = "light" | "dark";

/**
 * Props for the primary chart component. This shape is intentionally close
 * to what a future MarketPriceChart abstraction (Advanced Charts + our own
 * datafeed) would accept, so callers do not need to change when the
 * implementation swaps — see docs/tradingview-integration.md.
 */
export interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: TradingViewTheme;
  height?: number | string;
  autosize?: boolean;
  hideToolbar?: boolean;
  allowSymbolChange?: boolean;
  showVolume?: boolean;
  className?: string;
}

export interface TradingViewMiniChartProps {
  symbol: string;
  theme?: TradingViewTheme;
  height?: number | string;
  width?: number | string;
  dateRange?: "1D" | "1M" | "3M" | "12M" | "60M" | "ALL";
  className?: string;
}

export interface TradingViewSymbolOverviewProps {
  symbols: { symbol: string; label: string }[];
  theme?: TradingViewTheme;
  height?: number | string;
  width?: number | string;
  className?: string;
}

/** Minimal shape of the global exposed by tv.js — not an official type package. */
export interface TradingViewWidgetHandle {
  remove: () => void;
  onChartReady?: (callback: () => void) => void;
}

declare global {
  interface Window {
    TradingView?: {
      widget: new (options: Record<string, unknown>) => TradingViewWidgetHandle;
    };
  }
}
