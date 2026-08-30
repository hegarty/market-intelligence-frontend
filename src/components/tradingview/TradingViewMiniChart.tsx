"use client";

import * as React from "react";
import { mountTradingViewEmbed } from "@/lib/tradingview/loadScript";
import type { TradingViewMiniChartProps } from "@/components/tradingview/types";

const MINI_CHART_SRC = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";

/**
 * Self-contained iframe embed (TradingView's "Mini Chart" widget) — good for
 * compact sparkline-style previews inside cards and watchlists. Unlike
 * TradingViewChart this does not depend on tv.js.
 */
export function TradingViewMiniChart({
  symbol,
  theme = "dark",
  height = 220,
  width = "100%",
  dateRange = "12M",
  className,
}: TradingViewMiniChartProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanup = mountTradingViewEmbed(container, MINI_CHART_SRC, {
      symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange,
      colorTheme: theme,
      isTransparent: true,
      autosize: false,
      largeChartUrl: "",
    });

    return cleanup;
  }, [symbol, theme, dateRange]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width }}
      data-testid="tradingview-mini-chart"
      data-tv-symbol={symbol}
    />
  );
}
