"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useTable, type RowData } from "@tanstack/react-table";
import { financialTableFeatures, type FinancialColumnDef } from "@/components/tables/features";
import { Input } from "@/components/ui/input";
import { EmptyBlock } from "@/components/common/QueryStates";
import { cn } from "@/lib/utils/cn";

export interface FinancialTableProps<T extends RowData> {
  data: T[];
  columns: FinancialColumnDef<T>[];
  getRowId?: (row: T, index: number) => string;
  searchable?: boolean;
  emptyMessage?: string;
  className?: string;
  maxHeight?: number | string;
}

/**
 * Professional data-dense table: sortable headers, sticky header row, global
 * filter, and cell formatting supplied by components/tables/columns.tsx
 * factories. Built on TanStack Table v9 — see components/tables/features.ts.
 */
export function FinancialTable<T extends RowData>({
  data,
  columns,
  getRowId,
  searchable = true,
  emptyMessage = "No rows to display",
  className,
  maxHeight = "28rem",
}: FinancialTableProps<T>) {
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useTable({
    features: financialTableFeatures,
    columns,
    data,
    getRowId,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {searchable ? (
        <Input
          placeholder="Filter rows…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
          aria-label="Filter table rows"
        />
      ) : null}

      <div className="overflow-auto rounded-md border border-border" style={{ maxHeight }}>
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-panel">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className="whitespace-nowrap border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          disabled={!canSort}
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "flex items-center gap-1",
                            canSort && "cursor-pointer hover:text-foreground",
                          )}
                        >
                          <table.FlexRender header={header} />
                          {canSort ? (
                            sorted === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            )
                          ) : null}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyBlock message={emptyMessage} />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-3 py-1.5">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
