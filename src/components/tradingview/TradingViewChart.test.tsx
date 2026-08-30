import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TradingViewChart } from "@/components/tradingview/TradingViewChart";

vi.mock("@/lib/tradingview/loadScript", () => ({
  loadTradingViewScript: vi.fn(() => Promise.resolve()),
}));

const widgetConstructor = vi.fn();
const widgetRemove = vi.fn();

class MockWidget {
  constructor(options: Record<string, unknown>) {
    widgetConstructor(options);
  }
  remove = widgetRemove;
}

beforeEach(() => {
  widgetConstructor.mockClear();
  widgetRemove.mockClear();
  window.TradingView = { widget: MockWidget };
});

afterEach(() => {
  delete window.TradingView;
});

describe("TradingViewChart", () => {
  it("initializes the widget once on mount", async () => {
    render(<TradingViewChart symbol="NASDAQ:AAPL" />);

    await waitFor(() => expect(widgetConstructor).toHaveBeenCalledTimes(1));
    expect(widgetConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ symbol: "NASDAQ:AAPL" }),
    );
  });

  it("does not re-create the widget on a re-render with identical props", async () => {
    const { rerender } = render(<TradingViewChart symbol="NASDAQ:AAPL" />);
    await waitFor(() => expect(widgetConstructor).toHaveBeenCalledTimes(1));

    rerender(<TradingViewChart symbol="NASDAQ:AAPL" />);
    await waitFor(() => screen.getByTestId("tradingview-chart"));
    expect(widgetConstructor).toHaveBeenCalledTimes(1);
  });

  it("recreates the widget when the symbol changes", async () => {
    const { rerender } = render(<TradingViewChart symbol="NASDAQ:AAPL" />);
    await waitFor(() => expect(widgetConstructor).toHaveBeenCalledTimes(1));

    rerender(<TradingViewChart symbol="NASDAQ:MSFT" />);
    await waitFor(() => expect(widgetConstructor).toHaveBeenCalledTimes(2));
    expect(widgetConstructor).toHaveBeenLastCalledWith(
      expect.objectContaining({ symbol: "NASDAQ:MSFT" }),
    );
  });

  it("cleans up the widget on unmount", async () => {
    const { unmount } = render(<TradingViewChart symbol="NASDAQ:AAPL" />);
    await waitFor(() => expect(widgetConstructor).toHaveBeenCalledTimes(1));

    unmount();
    expect(widgetRemove).toHaveBeenCalledTimes(1);
  });
});
