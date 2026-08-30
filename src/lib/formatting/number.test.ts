import { describe, expect, it } from "vitest";
import { formatCurrency, formatNumber, formatPercent, formatVolume } from "@/lib/formatting/number";

describe("formatNumber", () => {
  it("formats with the requested fraction digits", () => {
    expect(formatNumber(1234.5, 2)).toBe("1,234.50");
  });

  it("returns an em dash for missing values", () => {
    expect(formatNumber(undefined)).toBe("—");
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber(Number.NaN)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("signs positive values by default", () => {
    expect(formatPercent(1.5)).toBe("+1.50%");
  });

  it("signs negative values", () => {
    expect(formatPercent(-1.5)).toBe("-1.50%");
  });

  it("can suppress the sign", () => {
    expect(formatPercent(1.5, { signed: false })).toBe("1.50%");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });
});

describe("formatVolume", () => {
  it("compacts large numbers", () => {
    expect(formatVolume(1_500_000)).toBe("1.5M");
  });
});
