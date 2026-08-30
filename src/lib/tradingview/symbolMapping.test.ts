import { describe, expect, it } from "vitest";
import { toTradingViewSymbol } from "@/lib/tradingview/symbolMapping";
import type { Asset } from "@/types/asset";

describe("toTradingViewSymbol", () => {
  it("prefers an explicit tradingViewSymbol", () => {
    const asset: Asset = {
      id: "AAPL",
      symbol: "AAPL",
      tradingViewSymbol: "NASDAQ:AAPL",
      name: "Apple Inc.",
      assetType: "stock",
      exchange: "NASDAQ",
    };
    expect(toTradingViewSymbol(asset)).toBe("NASDAQ:AAPL");
  });

  it("falls back to exchange:symbol when no explicit mapping exists", () => {
    const asset: Asset = {
      id: "XYZ",
      symbol: "XYZ",
      name: "Example Corp",
      assetType: "stock",
      exchange: "NYSE",
    };
    expect(toTradingViewSymbol(asset)).toBe("NYSE:XYZ");
  });

  it("falls back to the bare symbol when there is no exchange either", () => {
    const asset: Asset = {
      id: "XYZ",
      symbol: "XYZ",
      name: "Example Corp",
      assetType: "stock",
    };
    expect(toTradingViewSymbol(asset)).toBe("XYZ");
  });
});
