import { describe, expect, it } from "vitest";
import { computeMetricsFromOHLCV, rankByReturn } from "@/lib/market-data/returns";
import type { OHLCV } from "@/types/market-data";
import type { Asset } from "@/types/asset";

function makeDailyBars(closes: number[], startDate = "2025-01-01"): OHLCV[] {
  const start = new Date(startDate).getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;
  return closes.map((close, i) => ({
    time: new Date(start + i * DAY_MS).toISOString(),
    open: close,
    high: close * 1.01,
    low: close * 0.99,
    close,
    volume: 1000,
  }));
}

describe("computeMetricsFromOHLCV", () => {
  it("computes 1D return from the last two bars", () => {
    const bars = makeDailyBars([100, 100, 100, 100, 100, 110]);
    const metrics = computeMetricsFromOHLCV("TEST", bars);
    expect(metrics.return1D).toBeCloseTo(10, 5);
  });

  it("computes 52-week high/low from the trailing window", () => {
    const bars = makeDailyBars([90, 120, 80, 100]);
    const metrics = computeMetricsFromOHLCV("TEST", bars);
    expect(metrics.week52High).toBeCloseTo(120 * 1.01, 5);
    expect(metrics.week52Low).toBeCloseTo(80 * 0.99, 5);
  });

  it("returns undefined stats when there isn't enough data", () => {
    const bars = makeDailyBars([100]);
    const metrics = computeMetricsFromOHLCV("TEST", bars);
    expect(metrics.return1D).toBeUndefined();
    expect(metrics.rsi14).toBeUndefined();
  });
});

describe("rankByReturn", () => {
  const asset = (symbol: string): Asset => ({
    id: symbol,
    symbol,
    name: symbol,
    assetType: "stock",
  });

  it("sorts descending by default", () => {
    const entries = [
      { asset: asset("A"), metrics: { symbol: "A", return1D: 1 } },
      { asset: asset("B"), metrics: { symbol: "B", return1D: 5 } },
      { asset: asset("C"), metrics: { symbol: "C", return1D: -2 } },
    ];
    const ranked = rankByReturn(entries, "return1D");
    expect(ranked.map((r) => r.asset.symbol)).toEqual(["B", "A", "C"]);
  });

  it("sorts ascending when requested", () => {
    const entries = [
      { asset: asset("A"), metrics: { symbol: "A", return1D: 1 } },
      { asset: asset("B"), metrics: { symbol: "B", return1D: 5 } },
    ];
    const ranked = rankByReturn(entries, "return1D", "asc");
    expect(ranked.map((r) => r.asset.symbol)).toEqual(["A", "B"]);
  });
});
