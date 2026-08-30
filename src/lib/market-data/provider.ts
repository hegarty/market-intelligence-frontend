import type { Asset } from "@/types/asset";
import type {
  DateRange,
  Fundamentals,
  Interval,
  MarketMetrics,
  OHLCV,
  Quote,
} from "@/types/market-data";

/**
 * The data-provider boundary. Every consumer (hooks, pages, report blocks)
 * depends on this interface, never on a concrete implementation. Swapping
 * MockMarketDataProvider for a Market Platform API client should require no
 * changes outside this module and its concrete implementations.
 */
export interface MarketDataProvider {
  searchAssets(query: string): Promise<Asset[]>;
  getAsset(symbol: string): Promise<Asset>;
  getQuote(symbol: string): Promise<Quote>;
  getOHLCV(symbol: string, interval: Interval, range: DateRange): Promise<OHLCV[]>;
  getFundamentals?(symbol: string): Promise<Fundamentals>;
  getMetrics?(symbol: string): Promise<MarketMetrics>;
}

export class AssetNotFoundError extends Error {
  constructor(symbol: string) {
    super(`Unknown asset symbol: ${symbol}`);
    this.name = "AssetNotFoundError";
  }
}
