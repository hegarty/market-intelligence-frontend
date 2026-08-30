import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ReportRenderer } from "@/components/report/ReportRenderer";
import type { MarketReport } from "@/types/report";

vi.mock("@/lib/tradingview/loadScript", () => ({
  loadTradingViewScript: vi.fn(() => Promise.resolve()),
  mountTradingViewEmbed: vi.fn(() => () => {}),
}));

class MockWidget {
  remove = vi.fn();
}

beforeAll(() => {
  window.TradingView = { widget: MockWidget };
});

function baseReport(overrides: Partial<MarketReport> = {}): MarketReport {
  return {
    id: "test-report",
    title: "Test Report",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sections: [],
    ...overrides,
  };
}

describe("ReportRenderer", () => {
  it("renders each block type", async () => {
    const report = baseReport({
      sections: [
        {
          id: "s1",
          title: "All Blocks",
          blocks: [
            { type: "tradingview-chart", id: "tv1", symbol: "NASDAQ:AAPL", interval: "D" },
            {
              type: "line-chart",
              id: "line1",
              xKey: "x",
              series: [{ key: "y", label: "Y" }],
              data: [{ x: "a", y: 1 }],
            },
            {
              type: "bar-chart",
              id: "bar1",
              xKey: "x",
              series: [{ key: "y", label: "Y" }],
              data: [{ x: "a", y: 1 }],
            },
            {
              type: "scatter-plot",
              id: "scatter1",
              xKey: "x",
              yKey: "y",
              data: [{ x: 1, y: 2 }],
            },
            {
              type: "table",
              id: "table1",
              columns: [{ key: "symbol", label: "Symbol", format: "text" }],
              rows: [{ symbol: "AAPL" }],
            },
            {
              type: "metric-grid",
              id: "metrics1",
              metrics: [{ label: "VIX", value: "15.00" }],
            },
            { type: "text", id: "text1", body: "Some narrative text." },
          ],
        },
      ],
    });

    render(<ReportRenderer report={report} />);

    await waitFor(() => expect(screen.getAllByTestId("tradingview-chart")).toHaveLength(1));
    expect(screen.getByText("AAPL")).toBeInTheDocument(); // table cell
    expect(screen.getByText("VIX")).toBeInTheDocument(); // metric card
    expect(screen.getByText("Some narrative text.")).toBeInTheDocument();
  });

  it("supports multiple TradingView charts in one report", async () => {
    const report = baseReport({
      sections: [
        {
          id: "s1",
          blocks: [
            { type: "tradingview-chart", id: "tv1", symbol: "NASDAQ:AAPL", interval: "D" },
            { type: "tradingview-chart", id: "tv2", symbol: "NASDAQ:MSFT", interval: "D" },
          ],
        },
      ],
    });

    render(<ReportRenderer report={report} />);

    await waitFor(() => expect(screen.getAllByTestId("tradingview-chart")).toHaveLength(2));
  });

  it("isolates a failed block instead of crashing the whole report", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const report = baseReport({
      sections: [
        {
          id: "s1",
          blocks: [
            {
              type: "table",
              id: "broken-table",
              columns: [{ key: "symbol", label: "Symbol" }],
              // Malformed data (violates the TableBlock contract) to force a render-time error.
              rows: null as unknown as Record<string, number | string>[],
            },
            { type: "text", id: "text1", body: "This block should still render." },
          ],
        },
      ],
    });

    render(<ReportRenderer report={report} />);

    expect(await screen.findByText("This block should still render.")).toBeInTheDocument();
    expect(screen.getByText(/unable to load/i)).toBeInTheDocument();

    consoleError.mockRestore();
  });
});

afterEach(() => {
  vi.clearAllMocks();
});
