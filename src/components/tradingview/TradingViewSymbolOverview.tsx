"use client";

import * as React from "react";
import { mountTradingViewEmbed } from "@/lib/tradingview/loadScript";
import type { TradingViewSymbolOverviewProps } from "@/components/tradingview/types";

const SYMBOL_OVERVIEW_SRC = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";

/** Self-contained multi-symbol overview embed — useful for report headers comparing a small basket. */
export function TradingViewSymbolOverview({
  symbols,
  theme = "dark",
  height = 300,
  width = "100%",
  className,
}: TradingViewSymbolOverviewProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanup = mountTradingViewEmbed(container, SYMBOL_OVERVIEW_SRC, {
      symbols: symbols.map((s) => [s.label, s.symbol]),
      chartOnly: false,
      width: "100%",
      height: "100%",
      locale: "en",
      colorTheme: theme,
      autosize: false,
      showVolume: false,
      isTransparent: true,
    });

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(symbols), theme]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width }}
      data-testid="tradingview-symbol-overview"
    />
  );
}
