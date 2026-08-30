import {
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";

/**
 * Shared TanStack Table v9 feature set for every financial table in the app.
 * v9 registers row models and comparators as explicit feature slots instead
 * of table-level options — see the @tanstack/table-core "sorting" and
 * "global-filtering" intent skills for the migration rationale.
 */
export const financialTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
});

export type FinancialTableFeatures = typeof financialTableFeatures;

export type FinancialColumnDef<T extends RowData> = ColumnDef<FinancialTableFeatures, T>;
