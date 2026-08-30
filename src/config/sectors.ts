/**
 * S&P 500 sector universe, kept as configuration rather than hard-coded
 * inside components, per docs/frontend-spec.md "S&P 500 Sector Support".
 */
export interface SectorDefinition {
  symbol: string;
  label: string;
}

export const SP500_SECTORS: SectorDefinition[] = [
  { symbol: "XLK", label: "Technology" },
  { symbol: "XLF", label: "Financials" },
  { symbol: "XLE", label: "Energy" },
  { symbol: "XLV", label: "Health Care" },
  { symbol: "XLY", label: "Consumer Discretionary" },
  { symbol: "XLP", label: "Consumer Staples" },
  { symbol: "XLI", label: "Industrials" },
  { symbol: "XLB", label: "Materials" },
  { symbol: "XLRE", label: "Real Estate" },
  { symbol: "XLU", label: "Utilities" },
  { symbol: "XLC", label: "Communication Services" },
];

export const SP500_BENCHMARK_SYMBOL = "SPY";
