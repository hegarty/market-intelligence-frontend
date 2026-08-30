import type { MarketDataProvider } from "@/lib/market-data/provider";
import { resolveDateRange } from "@/lib/market-data/dateRange";
import type { DateRangeShortcut } from "@/types/market-data";

/** Normalizes each symbol's close series to start=100 so differently-priced assets can be compared. */
export async function buildNormalizedComparison(
  provider: MarketDataProvider,
  symbols: string[],
  range: DateRangeShortcut,
): Promise<Record<string, number | string>[]> {
  if (symbols.length === 0) return [];

  const resolved = resolveDateRange(range);
  const series = await Promise.all(
    symbols.map(async (symbol) => ({ symbol, bars: await provider.getOHLCV(symbol, "1D", resolved) })),
  );

  const barCount = Math.min(...series.map((s) => s.bars.length));
  const data: Record<string, number | string>[] = [];

  for (let i = 0; i < barCount; i += 1) {
    const point: Record<string, number | string> = {
      date: new Date(series[0].bars[i].time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
    for (const { symbol, bars } of series) {
      const base = bars[0].close;
      point[symbol] = Number(((bars[i].close / base) * 100).toFixed(2));
    }
    data.push(point);
  }

  return data;
}
