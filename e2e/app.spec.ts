import { expect, test } from "@playwright/test";

test("app loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Market Platform" })).toBeVisible();
  await expect(page.getByText("Sector Performance")).toBeVisible();
});

test("asset search returns results", async ({ page }) => {
  await page.goto("/");
  const input = page.getByTestId("asset-search-input");
  await input.fill("AAPL");
  await expect(page.getByTestId("asset-search-option-AAPL")).toBeVisible();
  await expect(page.getByTestId("asset-search-option-AAPL")).toContainText("Apple Inc.");
});

test("selecting an asset changes the chart symbol", async ({ page }) => {
  await page.goto("/chart/SPY");
  await expect(page.getByTestId("tradingview-chart")).toHaveAttribute("data-tv-symbol", "AMEX:SPY");

  await page.getByPlaceholder("Change symbol…").fill("AAPL");
  await page.getByTestId("asset-search-option-AAPL").click();

  await expect(page).toHaveURL(/\/chart\/AAPL$/);
  await expect(page.getByTestId("tradingview-chart")).toHaveAttribute(
    "data-tv-symbol",
    "NASDAQ:AAPL",
  );
});

test("navigating directly to /chart/AAPL works", async ({ page }) => {
  await page.goto("/chart/AAPL");
  await expect(page.getByRole("heading", { name: "AAPL" })).toBeVisible();
  await expect(page.getByText("Apple Inc.")).toBeVisible();
  await expect(page.getByTestId("tradingview-chart")).toHaveAttribute(
    "data-tv-symbol",
    "NASDAQ:AAPL",
  );
  await expect(page.getByTestId("tradingview-chart")).toHaveAttribute("data-tv-status", "ready", {
    timeout: 15_000,
  });
});

test("theme toggle changes the TradingView chart theme", async ({ page }) => {
  await page.goto("/chart/AAPL");
  await expect(page.getByTestId("tradingview-chart")).toHaveAttribute("data-tv-status", "ready", {
    timeout: 15_000,
  });

  const initialTheme = await page.getByTestId("tradingview-chart").getAttribute("data-tv-theme");
  expect(initialTheme).toBe("dark");

  await page.getByRole("button", { name: /^Theme:/ }).click();

  await expect(page.getByTestId("tradingview-chart")).toHaveAttribute("data-tv-theme", "light");
  await expect(page.getByTestId("tradingview-chart")).toHaveAttribute("data-tv-status", "ready", {
    timeout: 15_000,
  });
});
