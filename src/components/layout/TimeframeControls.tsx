"use client";

import { DATE_RANGE_SHORTCUTS, TIMEFRAME_INTERVALS } from "@/config/intervals";
import type { DateRangeShortcut, Interval } from "@/types/market-data";
import { cn } from "@/lib/utils/cn";

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex items-center gap-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
            option.value === value && "bg-muted text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export interface TimeframeControlsProps {
  interval: Interval;
  onIntervalChange: (interval: Interval) => void;
  range: DateRangeShortcut;
  onRangeChange: (range: DateRangeShortcut) => void;
}

/** Interval (bar granularity) and date range (visible window) are kept as separate controls, per spec. */
export function TimeframeControls({
  interval,
  onIntervalChange,
  range,
  onRangeChange,
}: TimeframeControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-border px-3 py-1.5">
      <SegmentedControl
        ariaLabel="Interval"
        options={TIMEFRAME_INTERVALS}
        value={interval}
        onChange={onIntervalChange}
      />
      <div className="h-4 w-px bg-border" />
      <SegmentedControl
        ariaLabel="Date range"
        options={DATE_RANGE_SHORTCUTS}
        value={range}
        onChange={onRangeChange}
      />
    </div>
  );
}
