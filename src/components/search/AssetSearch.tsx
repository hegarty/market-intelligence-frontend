"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAssetSearch } from "@/features/assets/hooks";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ASSET_TYPE_LABELS, type Asset } from "@/types/asset";
import { cn } from "@/lib/utils/cn";

export interface AssetSearchProps {
  onSelect: (asset: Asset) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function AssetSearch({
  onSelect,
  placeholder = "Search assets (AAPL, Apple, Gold, EURUSD)",
  autoFocus,
  className,
}: AssetSearchProps) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(query, 200);
  const { data: results, isLoading } = useAssetSearch(debouncedQuery);
  const options = results ?? [];

  useOnClickOutside(containerRef, () => setOpen(false));

  // Reset the highlighted option whenever new results come in. Adjusted
  // during render (React's documented pattern for "state that depends on a
  // changing value") rather than in an effect, so there's no extra commit.
  const [queryForHighlight, setQueryForHighlight] = React.useState(debouncedQuery);
  if (debouncedQuery !== queryForHighlight) {
    setQueryForHighlight(debouncedQuery);
    setHighlightedIndex(0);
  }

  function selectAsset(asset: Asset) {
    onSelect(asset);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    // Escape should always dismiss the dropdown, even while loading or
    // showing "no matches" — it doesn't depend on there being options.
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (options.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Enter":
        event.preventDefault();
        selectAsset(options[highlightedIndex]);
        break;
    }
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="pl-7"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="asset-search-listbox"
          aria-autocomplete="list"
          data-testid="asset-search-input"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim().length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {showDropdown ? (
        <ul
          id="asset-search-listbox"
          role="listbox"
          data-testid="asset-search-results"
          className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border border-border bg-panel py-1 shadow-lg"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Searching…</li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No matches for &ldquo;{query}&rdquo;</li>
          ) : (
            options.map((asset, index) => (
              <li
                key={asset.id}
                role="option"
                aria-selected={index === highlightedIndex}
                data-testid={`asset-search-option-${asset.symbol}`}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-sm",
                  index === highlightedIndex ? "bg-muted" : "hover:bg-muted/60",
                )}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectAsset(asset)}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium text-foreground">{asset.symbol}</span>
                  <span className="truncate text-xs text-muted-foreground">{asset.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  {asset.exchange ? <span>{asset.exchange}</span> : null}
                  <Badge variant="accent">{ASSET_TYPE_LABELS[asset.assetType]}</Badge>
                </div>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
