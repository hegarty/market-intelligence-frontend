import type { Asset } from "@/types/asset";
import type { DateRange, Fundamentals, Interval, MarketMetrics, OHLCV, Quote } from "@/types/market-data";
import { ASSET_FIXTURES, findAssetBySymbol } from "@/lib/market-data/fixtures/assets";
import { resolveDateRange } from "@/lib/market-data/dateRange";
import { generateOHLCV } from "@/lib/market-data/mock/randomWalk";
import { computeMetricsFromOHLCV } from "@/lib/market-data/returns";
import { AssetNotFoundError, type MarketDataProvider } from "@/lib/market-data/provider";

const SIMULATED_LATENCY_MS = 220;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function requireAsset(symbol: string): Asset {
  const asset = findAssetBySymbol(symbol);
  if (!asset) throw new AssetNotFoundError(symbol);
  return asset;
}

/**
 * Deterministic in-memory implementation of MarketDataProvider. Implements
 * the exact same interface a real Market Platform API client will — no page
 * or hook should import from this module directly; use
 * lib/market-data/index.ts's `marketDataProvider` instead.
 */
export class MockMarketDataProvider implements MarketDataProvider {
  async searchAssets(query: string): Promise<Asset[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return delay([]);

    const results = ASSET_FIXTURES.filter((asset) => {
      return (
        asset.symbol.toLowerCase().includes(normalized) ||
        asset.name.toLowerCase().includes(normalized)
      );
    }).sort((a, b) => {
      const aStarts = a.symbol.toLowerCase().startsWith(normalized) ? 0 : 1;
      const bStarts = b.symbol.toLowerCase().startsWith(normalized) ? 0 : 1;
      return aStarts - bStarts;
    });

    return delay(results);
  }

  async getAsset(symbol: string): Promise<Asset> {
    return delay(requireAsset(symbol));
  }

  async getQuote(symbol: string): Promise<Quote> {
    const asset = requireAsset(symbol);
    const range = resolveDateRange("1M");
    const bars = generateOHLCV(asset.symbol, "1D", range);
    const last = bars[bars.length - 1];
    const prev = bars[bars.length - 2] ?? last;

    const quote: Quote = {
      symbol: asset.symbol,
      price: last.close,
      change: last.close - prev.close,
      changePercent: ((last.close - prev.close) / prev.close) * 100,
      previousClose: prev.close,
      dayHigh: last.high,
      dayLow: last.low,
      volume: last.volume,
      relativeVolume: bars.length > 5 ? last.volume / averageVolume(bars.slice(-6, -1)) : undefined,
      marketCap: undefined,
      asOf: last.time,
    };

    return delay(quote);
  }

  async getOHLCV(symbol: string, interval: Interval, range: DateRange): Promise<OHLCV[]> {
    const asset = requireAsset(symbol);
    return delay(generateOHLCV(asset.symbol, interval, range));
  }

  async getFundamentals(symbol: string): Promise<Fundamentals> {
    const asset = requireAsset(symbol);
    const seed = Math.abs(hashSeed(asset.symbol));

    const fundamentals: Fundamentals = {
      symbol: asset.symbol,
      peRatio: asset.assetType === "stock" ? 12 + (seed % 35) : undefined,
      epsTtm: asset.assetType === "stock" ? 1 + (seed % 20) : undefined,
      dividendYield: asset.assetType !== "crypto" ? (seed % 300) / 100 : undefined,
      marketCap: asset.assetType === "stock" ? (50 + (seed % 2500)) * 1_000_000_000 : undefined,
      sharesOutstanding: asset.assetType === "stock" ? (1 + (seed % 20)) * 1_000_000_000 : undefined,
      revenueTtm: asset.assetType === "stock" ? (10 + (seed % 400)) * 1_000_000_000 : undefined,
      profitMargin: asset.assetType === "stock" ? (seed % 40) / 100 : undefined,
    };

    return delay(fundamentals);
  }

  async getMetrics(symbol: string): Promise<MarketMetrics> {
    const asset = requireAsset(symbol);
    const range = resolveDateRange("5Y");
    const bars = generateOHLCV(asset.symbol, "1D", range);
    const metrics = computeMetricsFromOHLCV(asset.symbol, bars);
    return delay(metrics);
  }
}

function averageVolume(bars: OHLCV[]): number {
  if (bars.length === 0) return 1;
  return bars.reduce((sum, bar) => sum + bar.volume, 0) / bars.length;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
