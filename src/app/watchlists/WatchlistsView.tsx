"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { AssetSearch } from "@/components/search/AssetSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingBlock, EmptyBlock } from "@/components/common/QueryStates";
import { FinancialTable } from "@/components/tables/FinancialTable";
import { currencyColumn, percentColumn } from "@/components/tables/columns";
import { useWatchlistStore } from "@/store/watchlistStore";
import { useQuotes } from "@/features/assets/hooks";
import { useHasMounted } from "@/hooks/useHasMounted";
import type { FinancialColumnDef } from "@/components/tables/features";
import type { Asset } from "@/types/asset";

interface WatchlistRow {
  symbol: string;
  price: number;
  changePercent: number;
}

export function WatchlistsView() {
  const mounted = useHasMounted();
  const symbols = useWatchlistStore((s) => s.symbols);
  const addSymbol = useWatchlistStore((s) => s.addSymbol);
  const removeSymbol = useWatchlistStore((s) => s.removeSymbol);
  const quotes = useQuotes(symbols);

  function handleSelect(asset: Asset) {
    addSymbol(asset.symbol);
  }

  const columns: FinancialColumnDef<WatchlistRow>[] = [
    {
      accessorKey: "symbol",
      header: "Symbol",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Link href={`/asset/${info.getValue()}`} className="font-medium hover:text-accent">
            {String(info.getValue())}
          </Link>
        </div>
      ),
    },
    currencyColumn<WatchlistRow>("price", "Price"),
    percentColumn<WatchlistRow>("changePercent", "Change %"),
    {
      id: "actions",
      header: "",
      enableGlobalFilter: false,
      cell: (info) => (
        <button
          type="button"
          aria-label={`Remove ${info.row.original.symbol}`}
          onClick={() => removeSymbol(info.row.original.symbol)}
          className="rounded-sm p-1 text-muted-foreground hover:text-negative"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  const rows: WatchlistRow[] = symbols.map((symbol, i) => ({
    symbol,
    price: quotes[i]?.data?.price ?? 0,
    changePercent: quotes[i]?.data?.changePercent ?? 0,
  }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 p-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Watchlists</h1>
        <p className="text-sm text-muted-foreground">Tracked symbols, persisted locally in this browser.</p>
      </div>

      <div className="max-w-xs">
        <AssetSearch onSelect={handleSelect} placeholder="Add symbol to watchlist…" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          {!mounted ? (
            <LoadingBlock lines={4} />
          ) : symbols.length === 0 ? (
            <EmptyBlock message="No symbols yet — search above to add one." />
          ) : (
            <FinancialTable data={rows} columns={columns} searchable={false} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
