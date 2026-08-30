import { MockMarketDataProvider } from "@/lib/market-data/mockProvider";
import type { MarketDataProvider } from "@/lib/market-data/provider";

/**
 * Single instantiation point for the active MarketDataProvider. Swap this
 * for a real Market Platform API client when it's available — everything
 * else in the app depends on the MarketDataProvider interface, not this
 * concrete class.
 */
export const marketDataProvider: MarketDataProvider = new MockMarketDataProvider();

export type { MarketDataProvider } from "@/lib/market-data/provider";
export { AssetNotFoundError } from "@/lib/market-data/provider";
