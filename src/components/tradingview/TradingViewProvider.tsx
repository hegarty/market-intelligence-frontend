"use client";

import * as React from "react";
import { loadTradingViewScript } from "@/lib/tradingview/loadScript";

interface TradingViewContextValue {
  status: "idle" | "loading" | "ready" | "error";
  error: Error | null;
}

const TradingViewContext = React.createContext<TradingViewContextValue>({
  status: "idle",
  error: null,
});

/**
 * Loads tv.js once for the whole app so mounting many TradingViewChart
 * instances (e.g. inside a report) never injects duplicate script tags.
 * Wrap the app once near the root; individual charts read this via
 * useTradingViewScript() instead of loading the script themselves.
 */
export function TradingViewProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<TradingViewContextValue>({
    status: "loading",
    error: null,
  });

  React.useEffect(() => {
    let cancelled = false;

    loadTradingViewScript()
      .then(() => {
        if (!cancelled) setState({ status: "ready", error: null });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: "error", error });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <TradingViewContext.Provider value={state}>{children}</TradingViewContext.Provider>;
}

export function useTradingViewScript() {
  return React.useContext(TradingViewContext);
}
