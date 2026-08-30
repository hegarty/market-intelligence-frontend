import type { MarketReport } from "@/types/report";
import { buildDailyMarketOverviewReport } from "@/features/reports/builders/dailyMarketOverview";

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  build: () => Promise<MarketReport>;
}

/**
 * Every report the app can render, keyed by id. Adding a new report means
 * adding an entry here (and a builder function) — never a bespoke page.
 * ReportRenderer turns whatever MarketReport comes back into UI.
 */
export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: "daily-market-overview",
    title: "Daily Market Overview",
    description:
      "Snapshot of major indexes, sector performance, cross-asset returns, and volatility.",
    build: buildDailyMarketOverviewReport,
  },
];

export function getReportDefinition(id: string): ReportDefinition | undefined {
  return REPORT_DEFINITIONS.find((r) => r.id === id);
}
