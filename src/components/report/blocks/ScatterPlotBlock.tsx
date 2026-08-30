import { ScatterPlot } from "@/components/charts/ScatterPlot";
import { BlockCard } from "@/components/report/blocks/BlockCard";
import type { ScatterPlotBlock as ScatterPlotBlockType } from "@/types/report";

export function ScatterPlotBlock({ block }: { block: ScatterPlotBlockType }) {
  return (
    <BlockCard title={block.title}>
      <ScatterPlot
        data={block.data}
        xKey={block.xKey}
        yKey={block.yKey}
        nameKey={block.nameKey}
        height={block.height ?? 260}
      />
    </BlockCard>
  );
}
