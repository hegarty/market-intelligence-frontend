import type { Asset } from "@/types/asset";

/**
 * Symbol mapping layer. TradingView-specific symbol strings must never be
 * hard-coded inside UI components — always resolve them through here so the
 * mapping can move to a Market Platform-backed lookup later without
 * touching component code.
 */
export function toTradingViewSymbol(asset: Asset): string {
  if (asset.tradingViewSymbol) return asset.tradingViewSymbol;
  if (asset.exchange) return `${asset.exchange}:${asset.symbol}`;
  return asset.symbol;
}
