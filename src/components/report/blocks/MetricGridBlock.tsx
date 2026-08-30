import { MetricGrid } from "@/components/metrics/MetricGrid";
import { BlockCard } from "@/components/report/blocks/BlockCard";
import type { MetricBlock } from "@/types/report";

export function MetricGridBlock({ block }: { block: MetricBlock }) {
  return (
    <BlockCard title={block.title}>
      <MetricGrid metrics={block.metrics} />
    </BlockCard>
  );
}
