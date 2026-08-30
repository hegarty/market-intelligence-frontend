"use client";

import { TradingViewChart } from "@/components/tradingview/TradingViewChart";
import { BlockCard } from "@/components/report/blocks/BlockCard";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import type { TradingViewChartBlock as TradingViewChartBlockType } from "@/types/report";

export function TradingViewChartBlock({ block }: { block: TradingViewChartBlockType }) {
  const theme = useResolvedTheme();

  return (
    <BlockCard title={block.title}>
      <TradingViewChart
        symbol={block.symbol}
        interval={block.interval}
        theme={theme}
        height={block.height ?? 420}
        autosize
      />
    </BlockCard>
  );
}
