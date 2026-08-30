import type { MarketDataProvider } from "@/lib/market-data/provider";
import { resolveDateRange } from "@/lib/market-data/dateRange";

export interface BreadthPoint {
  date: string;
  "Net Advancers": number;
  [key: string]: string | number;
}

/**
 * Cumulative advance/decline line across a symbol universe — a standard
 * derived-data visualization (spec: "Standard Line Charts"), not something
 * TradingView renders for us.
 */
export async function computeBreadth(
  provider: MarketDataProvider,
  symbols: string[],
  days = 60,
): Promise<BreadthPoint[]> {
  const range = resolveDateRange("6M");
  const series = await Promise.all(symbols.map((symbol) => provider.getOHLCV(symbol, "1D", range)));

  const barCount = Math.min(...series.map((bars) => bars.length));
  const start = Math.max(1, barCount - days);
  const points: BreadthPoint[] = [];
  let cumulative = 0;

  for (let i = start; i < barCount; i += 1) {
    let advancers = 0;
    let decliners = 0;
    for (const bars of series) {
      if (bars[i].close > bars[i - 1].close) advancers += 1;
      else if (bars[i].close < bars[i - 1].close) decliners += 1;
    }
    cumulative += advancers - decliners;
    points.push({
      date: new Date(series[0][i].time).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "Net Advancers": cumulative,
    });
  }

  return points;
}
