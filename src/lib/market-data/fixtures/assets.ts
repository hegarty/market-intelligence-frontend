import type { Asset } from "@/types/asset";

/**
 * Development fixtures. TradingView identifiers were verified by rendering
 * each one through the actual Advanced Real-Time Chart widget (tv.js) from
 * an unauthorized origin, per the spec's "verify exact TradingView
 * identifiers" warning. Cash indices (TVC:VIX, TVC:US10Y, TVC:TNX) and
 * continuous futures (COMEX:GC1!, NYMEX:CL1!, CBOT:ZN1!) all resolve to
 * "This symbol is only available on TradingView" on the free widget outside
 * a registered domain — that data is licensed. Stocks, ETFs, forex pairs,
 * crypto pairs, and TVC's CFD/spot instruments (TVC:GOLD, TVC:USOIL) all
 * render normally, so those are used as chart proxies below where the
 * natural instrument is a restricted index/future. See
 * docs/tradingview-integration.md for the full symbol-availability notes.
 */
export const ASSET_FIXTURES: Asset[] = [
  {
    id: "AAPL",
    symbol: "AAPL",
    tradingViewSymbol: "NASDAQ:AAPL",
    name: "Apple Inc.",
    assetType: "stock",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    industry: "Consumer Electronics",
  },
  {
    id: "MSFT",
    symbol: "MSFT",
    tradingViewSymbol: "NASDAQ:MSFT",
    name: "Microsoft Corporation",
    assetType: "stock",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    industry: "Software",
  },
  {
    id: "NVDA",
    symbol: "NVDA",
    tradingViewSymbol: "NASDAQ:NVDA",
    name: "NVIDIA Corporation",
    assetType: "stock",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    industry: "Semiconductors",
  },
  {
    id: "SPY",
    symbol: "SPY",
    tradingViewSymbol: "AMEX:SPY",
    name: "SPDR S&P 500 ETF Trust",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
  },
  {
    id: "QQQ",
    symbol: "QQQ",
    tradingViewSymbol: "NASDAQ:QQQ",
    name: "Invesco QQQ Trust",
    assetType: "etf",
    exchange: "NASDAQ",
    currency: "USD",
  },
  {
    id: "IWM",
    symbol: "IWM",
    tradingViewSymbol: "AMEX:IWM",
    name: "iShares Russell 2000 ETF",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
  },
  {
    id: "GLD",
    symbol: "GLD",
    tradingViewSymbol: "AMEX:GLD",
    name: "SPDR Gold Shares",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
  },
  {
    id: "TLT",
    symbol: "TLT",
    tradingViewSymbol: "AMEX:TLT",
    name: "iShares 20+ Year Treasury Bond ETF",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
  },
  {
    // TVC:VIX (cash index) is restricted on the free widget — see file
    // header. AMEX:VIXY (VIX Short-Term Futures ETF) is the closest
    // instrument that actually renders.
    id: "VIX",
    symbol: "VIX",
    tradingViewSymbol: "AMEX:VIXY",
    name: "CBOE Volatility Index",
    assetType: "index",
    exchange: "TVC",
    currency: "USD",
  },
  {
    // TVC:US10Y and TVC:TNX are both restricted on the free widget — see
    // file header. No unrestricted instrument tracks the 10Y yield
    // directly, so this asset intentionally has no chart-quality
    // tradingViewSymbol; it's used for its quote/metrics only.
    id: "US10Y",
    symbol: "US10Y",
    name: "US 10 Year Treasury Yield",
    assetType: "index",
    exchange: "TVC",
    currency: "USD",
  },
  {
    // COMEX:GC1! (continuous futures) is restricted on the free widget —
    // see file header. TVC:GOLD (CFD/spot gold) renders and tracks closely.
    id: "GC",
    symbol: "GC",
    tradingViewSymbol: "TVC:GOLD",
    name: "Gold Futures",
    assetType: "future",
    exchange: "COMEX",
    currency: "USD",
  },
  {
    // NYMEX:CL1! (continuous futures) is restricted on the free widget —
    // see file header. TVC:USOIL (CFD/spot WTI) renders and tracks closely.
    id: "CL",
    symbol: "CL",
    tradingViewSymbol: "TVC:USOIL",
    name: "Crude Oil Futures",
    assetType: "future",
    exchange: "NYMEX",
    currency: "USD",
  },
  {
    id: "BTCUSD",
    symbol: "BTCUSD",
    tradingViewSymbol: "BITSTAMP:BTCUSD",
    name: "Bitcoin / U.S. Dollar",
    assetType: "crypto",
    exchange: "BITSTAMP",
    currency: "USD",
  },
  {
    id: "EURUSD",
    symbol: "EURUSD",
    tradingViewSymbol: "FX:EURUSD",
    name: "Euro / U.S. Dollar",
    assetType: "forex",
    currency: "USD",
  },
  // S&P 500 sector SPDRs — see docs/frontend-spec.md "S&P 500 Sector Support".
  {
    id: "XLK",
    symbol: "XLK",
    tradingViewSymbol: "AMEX:XLK",
    name: "Technology Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Technology",
  },
  {
    id: "XLF",
    symbol: "XLF",
    tradingViewSymbol: "AMEX:XLF",
    name: "Financial Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Financials",
  },
  {
    id: "XLE",
    symbol: "XLE",
    tradingViewSymbol: "AMEX:XLE",
    name: "Energy Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Energy",
  },
  {
    id: "XLV",
    symbol: "XLV",
    tradingViewSymbol: "AMEX:XLV",
    name: "Health Care Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Health Care",
  },
  {
    id: "XLY",
    symbol: "XLY",
    tradingViewSymbol: "AMEX:XLY",
    name: "Consumer Discretionary Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Consumer Discretionary",
  },
  {
    id: "XLP",
    symbol: "XLP",
    tradingViewSymbol: "AMEX:XLP",
    name: "Consumer Staples Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Consumer Staples",
  },
  {
    id: "XLI",
    symbol: "XLI",
    tradingViewSymbol: "AMEX:XLI",
    name: "Industrial Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Industrials",
  },
  {
    id: "XLB",
    symbol: "XLB",
    tradingViewSymbol: "AMEX:XLB",
    name: "Materials Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Materials",
  },
  {
    id: "XLRE",
    symbol: "XLRE",
    tradingViewSymbol: "AMEX:XLRE",
    name: "Real Estate Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Real Estate",
  },
  {
    id: "XLU",
    symbol: "XLU",
    tradingViewSymbol: "AMEX:XLU",
    name: "Utilities Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Utilities",
  },
  {
    id: "XLC",
    symbol: "XLC",
    tradingViewSymbol: "AMEX:XLC",
    name: "Communication Services Select Sector SPDR Fund",
    assetType: "etf",
    exchange: "AMEX",
    currency: "USD",
    sector: "Communication Services",
  },
];

export function findAssetBySymbol(symbol: string): Asset | undefined {
  const normalized = symbol.trim().toUpperCase();
  return ASSET_FIXTURES.find((asset) => asset.symbol === normalized);
}
