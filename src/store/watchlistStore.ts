import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistState {
  symbols: string[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
}

/**
 * Cross-component watchlist state — persisted client-side for now. When the
 * Market Platform API gains a watchlists endpoint, swap the persist storage
 * for a server-synced store without touching consumers of this hook.
 */
export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      symbols: ["AAPL", "MSFT", "NVDA", "SPY"],
      addSymbol: (symbol) =>
        set((state) =>
          state.symbols.includes(symbol) ? state : { symbols: [...state.symbols, symbol] },
        ),
      removeSymbol: (symbol) =>
        set((state) => ({ symbols: state.symbols.filter((s) => s !== symbol) })),
    }),
    { name: "market-platform-watchlist" },
  ),
);
