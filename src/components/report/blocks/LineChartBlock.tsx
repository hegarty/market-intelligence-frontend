import { LineChart } from "@/components/charts/LineChart";
import { BlockCard } from "@/components/report/blocks/BlockCard";
import type { LineChartBlock as LineChartBlockType } from "@/types/report";

export function LineChartBlock({ block }: { block: LineChartBlockType }) {
  return (
    <BlockCard title={block.title}>
      <LineChart
        data={block.data}
        xKey={block.xKey}
        series={block.series}
        height={block.height ?? 260}
        valueFormat={block.valueFormat}
      />
    </BlockCard>
  );
}
