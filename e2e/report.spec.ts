import { expect, test } from "@playwright/test";

test("daily market overview report combines TradingView and native charts", async ({ page }) => {
  await page.goto("/reports/daily-market-overview");

  await expect(page.getByRole("heading", { name: "Daily Market Overview" })).toBeVisible();
  await expect(page.getByText("Market Snapshot")).toBeVisible();

  // Scroll to the bottom so lazy-mounted blocks load.
  await page.mouse.wheel(0, 3000);
  await page.getByText("Volatility").scrollIntoViewIfNeeded();

  await expect(page.getByTestId("tradingview-chart").first()).toHaveAttribute(
    "data-tv-status",
    "ready",
    { timeout: 15_000 },
  );

  const chartCount = await page.getByTestId("tradingview-chart").count();
  expect(chartCount).toBeGreaterThanOrEqual(3);

  await expect(page.getByRole("table")).toBeVisible();
});
