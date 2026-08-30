import type { DateRange, Interval, OHLCV } from "@/types/market-data";

/** Deterministic PRNG (mulberry32) so mock data is stable across renders. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const INTERVAL_MS: Record<Interval, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1H": 60 * 60_000,
  "4H": 4 * 60 * 60_000,
  "1D": 24 * 60 * 60_000,
  "1W": 7 * 24 * 60 * 60_000,
  "1M": 30 * 24 * 60 * 60_000,
};

/** Realistic starting price levels for fixture symbols so the mock data reads plausibly. */
const BASE_PRICE_OVERRIDES: Record<string, number> = {
  AAPL: 230,
  MSFT: 430,
  NVDA: 135,
  SPY: 570,
  QQQ: 490,
  IWM: 220,
  GLD: 245,
  TLT: 90,
  VIX: 15,
  US10Y: 4.2,
  GC: 2650,
  CL: 78,
  BTCUSD: 68000,
  EURUSD: 1.08,
  XLK: 230,
  XLF: 48,
  XLE: 90,
  XLV: 145,
  XLY: 190,
  XLP: 78,
  XLI: 130,
  XLB: 92,
  XLRE: 42,
  XLU: 68,
  XLC: 90,
};

/** Base "price level" per symbol so different assets look distinct. */
function basePrice(symbol: string): number {
  if (symbol in BASE_PRICE_OVERRIDES) return BASE_PRICE_OVERRIDES[symbol];
  const seed = Math.abs(hashSeed(symbol));
  return 20 + (seed % 480);
}

/** Annualized-ish daily volatility per symbol, loosely by asset class. */
function volatilityFor(symbol: string): number {
  if (symbol.includes("BTC")) return 0.045;
  if (symbol === "VIX") return 0.08;
  if (symbol === "GC" || symbol === "GLD") return 0.012;
  if (symbol === "CL") return 0.025;
  if (symbol === "TLT" || symbol === "US10Y") return 0.008;
  if (symbol === "EURUSD") return 0.005;
  return 0.016;
}

export function generateOHLCV(symbol: string, interval: Interval, range: DateRange): OHLCV[] {
  const rand = mulberry32(Math.abs(hashSeed(symbol)) || 1);
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  const step = INTERVAL_MS[interval];
  const barCount = Math.max(2, Math.min(2000, Math.round((to - from) / step)));

  const vol = volatilityFor(symbol);
  let price = basePrice(symbol);
  const bars: OHLCV[] = [];

  for (let i = 0; i < barCount; i += 1) {
    const time = new Date(from + i * step).toISOString();
    const drift = 0.0001;
    const change = price * (drift + vol * (rand() - 0.5) * 2);
    const open = price;
    const close = Math.max(0.01, price + change);
    const high = Math.max(open, close) * (1 + rand() * vol * 0.5);
    const low = Math.min(open, close) * (1 - rand() * vol * 0.5);
    const volume = Math.round(1_000_000 * (0.5 + rand()) * (1 + vol * 10));

    bars.push({ time, open, high, low, close, volume });
    price = close;
  }

  return bars;
}
