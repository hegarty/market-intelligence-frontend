import type { DateRange, DateRangeShortcut } from "@/types/market-data";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Resolves a UI date-range shortcut (e.g. "YTD") into an absolute range. */
export function resolveDateRange(
  shortcut: DateRangeShortcut,
  now: Date = new Date(),
): DateRange {
  const to = now.toISOString();

  switch (shortcut) {
    case "1D":
      return { from: new Date(now.getTime() - 1 * DAY_MS).toISOString(), to };
    case "5D":
      return { from: new Date(now.getTime() - 5 * DAY_MS).toISOString(), to };
    case "1M":
      return { from: addMonths(now, -1).toISOString(), to };
    case "3M":
      return { from: addMonths(now, -3).toISOString(), to };
    case "6M":
      return { from: addMonths(now, -6).toISOString(), to };
    case "YTD":
      return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to };
    case "1Y":
      return { from: addMonths(now, -12).toISOString(), to };
    case "5Y":
      return { from: addMonths(now, -60).toISOString(), to };
    case "MAX":
      return { from: addMonths(now, -240).toISOString(), to };
    default:
      return { from: addMonths(now, -12).toISOString(), to };
  }
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
