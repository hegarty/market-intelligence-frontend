import { useQueries, useQuery } from "@tanstack/react-query";
import { marketDataProvider } from "@/lib/market-data";

export function useAssetSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["assets", "search", trimmed],
    queryFn: () => marketDataProvider.searchAssets(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 60_000,
  });
}

export function useAsset(symbol: string | undefined) {
  return useQuery({
    queryKey: ["assets", "get", symbol],
    queryFn: () => marketDataProvider.getAsset(symbol as string),
    enabled: Boolean(symbol),
    staleTime: 5 * 60_000,
  });
}

export function useQuote(symbol: string | undefined) {
  return useQuery({
    queryKey: ["assets", "quote", symbol],
    queryFn: () => marketDataProvider.getQuote(symbol as string),
    enabled: Boolean(symbol),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/** Fetches quotes for a dynamic symbol list without violating rules-of-hooks. */
export function useQuotes(symbols: string[]) {
  return useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["assets", "quote", symbol],
      queryFn: () => marketDataProvider.getQuote(symbol),
      staleTime: 15_000,
      refetchInterval: 30_000,
    })),
  });
}
