import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AssetSearch } from "@/components/search/AssetSearch";
import type { Asset } from "@/types/asset";

const AAPL: Asset = {
  id: "AAPL",
  symbol: "AAPL",
  tradingViewSymbol: "NASDAQ:AAPL",
  name: "Apple Inc.",
  assetType: "stock",
  exchange: "NASDAQ",
};

const MSFT: Asset = {
  id: "MSFT",
  symbol: "MSFT",
  tradingViewSymbol: "NASDAQ:MSFT",
  name: "Microsoft Corporation",
  assetType: "stock",
  exchange: "NASDAQ",
};

vi.mock("@/lib/market-data", () => ({
  marketDataProvider: {
    searchAssets: vi.fn((query: string) => {
      const normalized = query.toLowerCase();
      const all = [AAPL, MSFT];
      return Promise.resolve(all.filter((a) => a.symbol.toLowerCase().includes(normalized)));
    }),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("AssetSearch", () => {
  it("shows matching results as the user types", async () => {
    const user = userEvent.setup();
    renderWithClient(<AssetSearch onSelect={vi.fn()} />);

    await user.type(screen.getByTestId("asset-search-input"), "AAPL");

    await waitFor(() => expect(screen.getByTestId("asset-search-option-AAPL")).toBeInTheDocument());
    expect(screen.queryByTestId("asset-search-option-MSFT")).not.toBeInTheDocument();
  });

  it("selects the highlighted option with the keyboard", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithClient(<AssetSearch onSelect={onSelect} />);

    const input = screen.getByTestId("asset-search-input");
    await user.type(input, "A");

    await waitFor(() => expect(screen.getByTestId("asset-search-option-AAPL")).toBeInTheDocument());
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].symbol).toBe("AAPL");
    // Selecting clears the query.
    expect(input).toHaveValue("");
  });

  it("closes the dropdown on Escape", async () => {
    const user = userEvent.setup();
    renderWithClient(<AssetSearch onSelect={vi.fn()} />);

    const input = screen.getByTestId("asset-search-input");
    await user.type(input, "AAPL");
    await waitFor(() => expect(screen.getByTestId("asset-search-results")).toBeInTheDocument());

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("asset-search-results")).not.toBeInTheDocument();
  });
});
