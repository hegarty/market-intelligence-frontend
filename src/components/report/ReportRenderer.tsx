import { Report } from "@/components/report/Report";
import { ReportSection } from "@/components/report/ReportSection";
import { LazyBlock } from "@/components/report/LazyBlock";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { TradingViewChartBlock } from "@/components/report/blocks/TradingViewChartBlock";
import { LineChartBlock } from "@/components/report/blocks/LineChartBlock";
import { BarChartBlock } from "@/components/report/blocks/BarChartBlock";
import { ScatterPlotBlock } from "@/components/report/blocks/ScatterPlotBlock";
import { TableBlock } from "@/components/report/blocks/TableBlock";
import { MetricGridBlock } from "@/components/report/blocks/MetricGridBlock";
import { TextBlock } from "@/components/report/blocks/TextBlock";
import type { MarketReport, ReportBlock } from "@/types/report";

function blockMinHeight(block: ReportBlock): number {
  switch (block.type) {
    case "tradingview-chart":
      return block.height ?? 420;
    case "line-chart":
    case "bar-chart":
    case "scatter-plot":
      return block.height ?? 260;
    case "metric-grid":
      return 88;
    case "text":
      return 80;
    case "table":
      return 200;
  }
}

/**
 * Renders a MarketReport's data into UI. This is the only place report JSON
 * is turned into React — new report types (backend- or AI-generated) work
 * automatically as long as they conform to the ReportBlock union in
 * types/report.ts. See docs/report-system.md for how to add a new block type.
 */
function ReportBlockRenderer({ block }: { block: ReportBlock }) {
  switch (block.type) {
    case "tradingview-chart":
      return <TradingViewChartBlock block={block} />;
    case "line-chart":
      return <LineChartBlock block={block} />;
    case "bar-chart":
      return <BarChartBlock block={block} />;
    case "scatter-plot":
      return <ScatterPlotBlock block={block} />;
    case "table":
      return <TableBlock block={block} />;
    case "metric-grid":
      return <MetricGridBlock block={block} />;
    case "text":
      return <TextBlock block={block} />;
  }
}

export function ReportRenderer({ report }: { report: MarketReport }) {
  return (
    <Report title={report.title} description={report.description} updatedAt={report.updatedAt}>
      {report.sections.map((section) => (
        <ReportSection key={section.id} title={section.title} layout={section.layout}>
          {section.blocks.map((block) => (
            <ErrorBoundary key={block.id} label={block.title ?? block.type}>
              <LazyBlock minHeight={blockMinHeight(block)}>
                <ReportBlockRenderer block={block} />
              </LazyBlock>
            </ErrorBoundary>
          ))}
        </ReportSection>
      ))}
    </Report>
  );
}
