import { BarChart } from "@/components/charts/BarChart";
import { BlockCard } from "@/components/report/blocks/BlockCard";
import type { BarChartBlock as BarChartBlockType } from "@/types/report";

export function BarChartBlock({ block }: { block: BarChartBlockType }) {
  return (
    <BlockCard title={block.title}>
      <BarChart
        data={block.data}
        xKey={block.xKey}
        series={block.series}
        layout={block.layout ?? "horizontal"}
        height={block.height ?? 260}
        valueFormat={block.valueFormat}
        colorByValue={block.series.length === 1}
      />
    </BlockCard>
  );
}
