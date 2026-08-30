import * as React from "react";
import { FinancialTable } from "@/components/tables/FinancialTable";
import { currencyColumn, numberColumn, percentColumn, textColumn } from "@/components/tables/columns";
import { BlockCard } from "@/components/report/blocks/BlockCard";
import type { TableBlock as TableBlockType } from "@/types/report";
import type { FinancialColumnDef } from "@/components/tables/features";

type Row = Record<string, number | string>;

export function TableBlock({ block }: { block: TableBlockType }) {
  const columns = React.useMemo<FinancialColumnDef<Row>[]>(
    () =>
      block.columns.map((col) => {
        switch (col.format) {
          case "percent":
            return percentColumn<Row>(col.key, col.label);
          case "currency":
            return currencyColumn<Row>(col.key, col.label);
          case "number":
            return numberColumn<Row>(col.key, col.label);
          default:
            return textColumn<Row>(col.key, col.label);
        }
      }),
    [block.columns],
  );

  return (
    <BlockCard title={block.title}>
      <FinancialTable data={block.rows} columns={columns} searchable={block.rows.length > 8} />
    </BlockCard>
  );
}
