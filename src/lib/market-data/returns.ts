import type { Asset } from "@/types/asset";
import type { MarketMetrics, OHLCV, ReturnKey } from "@/types/market-data";

const TRADING_DAYS_PER_YEAR = 252;

/** Finds the bar closest to `daysAgo` calendar days before the last bar. */
function barNDaysAgo(bars: OHLCV[], daysAgo: number): OHLCV | undefined {
  if (bars.length === 0) return undefined;
  const lastTime = new Date(bars[bars.length - 1].time).getTime();
  const targetTime = lastTime - daysAgo * 24 * 60 * 60 * 1000;

  let closest = bars[0];
  let smallestDiff = Infinity;
  for (const bar of bars) {
    const diff = Math.abs(new Date(bar.time).getTime() - targetTime);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = bar;
    }
  }
  return closest;
}

function periodReturn(bars: OHLCV[], daysAgo: number): number | undefined {
  if (bars.length < 2) return undefined;
  const start = barNDaysAgo(bars, daysAgo);
  const end = bars[bars.length - 1];
  if (!start || start === end) return undefined;
  return ((end.close - start.close) / start.close) * 100;
}

function ytdReturn(bars: OHLCV[]): number | undefined {
  if (bars.length < 2) return undefined;
  const end = bars[bars.length - 1];
  const year = new Date(end.time).getFullYear();
  const yearStart = bars.find((bar) => new Date(bar.time).getFullYear() === year);
  if (!yearStart || yearStart === end) return undefined;
  return ((end.close - yearStart.close) / yearStart.close) * 100;
}

function rsi(bars: OHLCV[], period = 14): number | undefined {
  if (bars.length <= period) return undefined;
  const recent = bars.slice(-period - 1);
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < recent.length; i += 1) {
    const delta = recent[i].close - recent[i - 1].close;
    if (delta >= 0) gains += delta;
    else losses -= delta;
  }
  if (gains + losses === 0) return 50;
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function atr(bars: OHLCV[], period = 14): number | undefined {
  if (bars.length <= period) return undefined;
  const recent = bars.slice(-period - 1);
  let trSum = 0;
  for (let i = 1; i < recent.length; i += 1) {
    const current = recent[i];
    const prevClose = recent[i - 1].close;
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - prevClose),
      Math.abs(current.low - prevClose),
    );
    trSum += tr;
  }
  return trSum / period;
}

/** Computes derived MarketMetrics from a daily OHLCV series. */
export function computeMetricsFromOHLCV(symbol: string, bars: OHLCV[]): MarketMetrics {
  const week52Bars = bars.slice(-TRADING_DAYS_PER_YEAR);
  return {
    symbol,
    return1D: periodReturn(bars, 1),
    return5D: periodReturn(bars, 5),
    return1M: periodReturn(bars, 30),
    return3M: periodReturn(bars, 91),
    return6M: periodReturn(bars, 182),
    returnYTD: ytdReturn(bars),
    return1Y: periodReturn(bars, 365),
    week52High: week52Bars.length ? Math.max(...week52Bars.map((b) => b.high)) : undefined,
    week52Low: week52Bars.length ? Math.min(...week52Bars.map((b) => b.low)) : undefined,
    rsi14: rsi(bars),
    atr14: atr(bars),
  };
}

export const RETURN_KEY_LABELS: Record<ReturnKey, string> = {
  return1D: "1D",
  return5D: "5D",
  return1M: "1M",
  return3M: "3M",
  return6M: "6M",
  returnYTD: "YTD",
  return1Y: "1Y",
};

export interface RankedAsset {
  asset: Asset;
  metrics: MarketMetrics;
}

export function rankByReturn(
  entries: RankedAsset[],
  key: ReturnKey,
  direction: "desc" | "asc" = "desc",
): RankedAsset[] {
  return [...entries].sort((a, b) => {
    const aValue = a.metrics[key] ?? Number.NEGATIVE_INFINITY;
    const bValue = b.metrics[key] ?? Number.NEGATIVE_INFINITY;
    return direction === "desc" ? bValue - aValue : aValue - bValue;
  });
}
