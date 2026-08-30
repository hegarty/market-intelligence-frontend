import { useQueries, useQuery } from "@tanstack/react-query";
import { marketDataProvider } from "@/lib/market-data";
import { resolveDateRange } from "@/lib/market-data/dateRange";
import { computeBreadth } from "@/lib/market-data/breadth";
import { buildNormalizedComparison } from "@/lib/market-data/normalize";
import { SP500_SECTORS } from "@/config/sectors";
import type { DateRangeShortcut, Interval } from "@/types/market-data";

export function useOHLCV(
  symbol: string | undefined,
  interval: Interval,
  range: DateRangeShortcut,
) {
  return useQuery({
    queryKey: ["market-data", "ohlcv", symbol, interval, range],
    queryFn: () =>
      marketDataProvider.getOHLCV(symbol as string, interval, resolveDateRange(range)),
    enabled: Boolean(symbol),
    staleTime: 30_000,
  });
}

export function useMetrics(symbol: string | undefined) {
  return useQuery({
    queryKey: ["market-data", "metrics", symbol],
    queryFn: () => marketDataProvider.getMetrics?.(symbol as string),
    enabled: Boolean(symbol) && Boolean(marketDataProvider.getMetrics),
    staleTime: 60_000,
  });
}

export function useFundamentals(symbol: string | undefined) {
  return useQuery({
    queryKey: ["market-data", "fundamentals", symbol],
    queryFn: () => marketDataProvider.getFundamentals?.(symbol as string),
    enabled: Boolean(symbol) && Boolean(marketDataProvider.getFundamentals),
    staleTime: 60_000,
  });
}

export function useSectorPerformance() {
  return useQuery({
    queryKey: ["market-data", "sector-performance"],
    queryFn: async () => {
      const rows = await Promise.all(
        SP500_SECTORS.map(async (sector) => {
          const metrics = await marketDataProvider.getMetrics?.(sector.symbol);
          return { sector: sector.label, "1D Return": metrics?.return1D ?? 0 };
        }),
      );
      return rows.sort((a, b) => b["1D Return"] - a["1D Return"]);
    },
    staleTime: 60_000,
  });
}

export function useMarketBreadth(symbols: string[]) {
  return useQuery({
    queryKey: ["market-data", "breadth", symbols],
    queryFn: () => computeBreadth(marketDataProvider, symbols),
    staleTime: 60_000,
  });
}

export function useNormalizedComparison(symbols: string[], range: DateRangeShortcut) {
  return useQuery({
    queryKey: ["market-data", "normalized-comparison", symbols, range],
    queryFn: () => buildNormalizedComparison(marketDataProvider, symbols, range),
    enabled: symbols.length > 0,
    staleTime: 60_000,
  });
}

export function useMetricsMulti(symbols: string[]) {
  return useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["market-data", "metrics", symbol],
      queryFn: () => marketDataProvider.getMetrics?.(symbol),
      staleTime: 60_000,
    })),
  });
}
