/**
 * Canonical asset model. Internal identifiers are decoupled from
 * TradingView's symbol namespace — see lib/tradingview/symbolMapping.ts.
 */
export type AssetType =
  | "stock"
  | "etf"
  | "index"
  | "future"
  | "commodity"
  | "forex"
  | "crypto";

export interface Asset {
  id: string;
  symbol: string;
  tradingViewSymbol?: string;
  name: string;
  assetType: AssetType;
  exchange?: string;
  currency?: string;
  sector?: string;
  industry?: string;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stock: "Stock",
  etf: "ETF",
  index: "Index",
  future: "Future",
  commodity: "Commodity",
  forex: "FX",
  crypto: "Crypto",
};
