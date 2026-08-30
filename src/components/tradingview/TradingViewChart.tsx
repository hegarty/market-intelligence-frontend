"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { loadTradingViewScript } from "@/lib/tradingview/loadScript";
import type { TradingViewChartProps, TradingViewWidgetHandle } from "@/components/tradingview/types";

type Status = "loading" | "ready" | "error";

/**
 * The only component in the app allowed to talk to TradingView's tv.js
 * directly. Everything else renders this (or, eventually, a
 * MarketPriceChart wrapper with the same prop shape) instead of touching
 * `window.TradingView` itself — see docs/tradingview-integration.md.
 *
 * Symbol/interval/theme changes tear down and recreate the widget rather
 * than calling tv.js's internal setSymbol API: tv.js is a third-party
 * script outside our type/version control, and remount-on-change is the
 * behavior a future MarketPriceChart(Advanced Charts | Lightweight Charts)
 * swap can reproduce exactly, keeping the two implementations interchangeable.
 */
export function TradingViewChart({
  symbol,
  interval = "D",
  theme = "dark",
  height = 520,
  autosize = true,
  hideToolbar = false,
  allowSymbolChange = false,
  showVolume = true,
  className,
}: TradingViewChartProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const widgetRef = React.useRef<TradingViewWidgetHandle | null>(null);
  const [retryToken, setRetryToken] = React.useState(0);
  const reactId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const containerId = `tv-chart-${reactId}`;

  const [status, setStatus] = React.useState<Status>("loading");

  // Reset to "loading" whenever the widget config actually changes, computed
  // during render (React's documented pattern for state that tracks a
  // changing value) instead of as a synchronous setState call inside the effect.
  const configKey = JSON.stringify([
    symbol,
    interval,
    theme,
    autosize,
    hideToolbar,
    allowSymbolChange,
    showVolume,
    retryToken,
  ]);
  const [renderedConfigKey, setRenderedConfigKey] = React.useState(configKey);
  if (configKey !== renderedConfigKey) {
    setRenderedConfigKey(configKey);
    setStatus("loading");
  }

  React.useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    loadTradingViewScript()
      .then(() => {
        if (cancelled) return;
        if (!container || !window.TradingView) {
          setStatus("error");
          return;
        }

        container.innerHTML = "";
        const mountPoint = document.createElement("div");
        mountPoint.id = containerId;
        mountPoint.style.height = "100%";
        mountPoint.style.width = "100%";
        container.appendChild(mountPoint);

        try {
          widgetRef.current = new window.TradingView.widget({
            symbol,
            interval,
            container_id: containerId,
            autosize,
            theme,
            style: "1",
            timezone: "Etc/UTC",
            locale: "en",
            hide_top_toolbar: hideToolbar,
            hide_side_toolbar: hideToolbar,
            allow_symbol_change: allowSymbolChange,
            hide_volume: !showVolume,
            withdateranges: true,
            support_host: "https://www.tradingview.com",
          });
          if (!cancelled) setStatus("ready");
        } catch {
          if (!cancelled) setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      try {
        widgetRef.current?.remove();
      } catch {
        // tv.js can throw if the container was already detached — safe to ignore on cleanup.
      }
      widgetRef.current = null;
      if (container) container.innerHTML = "";
    };
  }, [
    containerId,
    symbol,
    interval,
    theme,
    autosize,
    hideToolbar,
    allowSymbolChange,
    showVolume,
    retryToken,
  ]);

  return (
    <div
      className={className}
      style={{ height, width: "100%", position: "relative" }}
      data-testid="tradingview-chart"
      data-tv-symbol={symbol}
      data-tv-status={status}
      data-tv-theme={theme}
    >
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {status === "loading" ? (
        <div className="absolute inset-0 flex flex-col gap-2 bg-panel p-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-full w-full" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-panel text-center">
          <AlertTriangle className="h-5 w-5 text-negative" />
          <p className="text-sm text-foreground">Unable to load chart for {symbol}</p>
          <Button size="sm" variant="outline" onClick={() => setRetryToken((t) => t + 1)}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
