import type { RowData } from "@tanstack/react-table";
import type { FinancialColumnDef } from "@/components/tables/features";
import { formatCompactNumber, formatCurrency, formatNumber, formatPercent, formatVolume } from "@/lib/formatting/number";
import { cn } from "@/lib/utils/cn";

function signColor(value: number | undefined | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  if (value > 0) return "text-positive";
  if (value < 0) return "text-negative";
  return "";
}

export function textColumn<T extends RowData>(accessor: keyof T & string, header: string): FinancialColumnDef<T> {
  return {
    accessorKey: accessor,
    header,
    cell: (info) => <span>{String(info.getValue() ?? "—")}</span>,
  };
}

export function numberColumn<T extends RowData>(
  accessor: keyof T & string,
  header: string,
  fractionDigits = 2,
): FinancialColumnDef<T> {
  return {
    accessorKey: accessor,
    header,
    cell: (info) => (
      <span className="font-tabular">{formatNumber(info.getValue() as number, fractionDigits)}</span>
    ),
  };
}

export function compactNumberColumn<T extends RowData>(accessor: keyof T & string, header: string): FinancialColumnDef<T> {
  return {
    accessorKey: accessor,
    header,
    cell: (info) => <span className="font-tabular">{formatCompactNumber(info.getValue() as number)}</span>,
  };
}

export function volumeColumn<T extends RowData>(accessor: keyof T & string, header: string): FinancialColumnDef<T> {
  return {
    accessorKey: accessor,
    header,
    cell: (info) => <span className="font-tabular">{formatVolume(info.getValue() as number)}</span>,
  };
}

export function currencyColumn<T extends RowData>(accessor: keyof T & string, header: string): FinancialColumnDef<T> {
  return {
    accessorKey: accessor,
    header,
    cell: (info) => (
      <span className="font-tabular">{formatCurrency(info.getValue() as number)}</span>
    ),
  };
}

export function percentColumn<T extends RowData>(
  accessor: keyof T & string,
  header: string,
  { colorBySign = true }: { colorBySign?: boolean } = {},
): FinancialColumnDef<T> {
  return {
    accessorKey: accessor,
    header,
    cell: (info) => {
      const value = info.getValue() as number | undefined;
      return (
        <span className={cn("font-tabular", colorBySign && signColor(value))}>
          {formatPercent(value)}
        </span>
      );
    },
  };
}
