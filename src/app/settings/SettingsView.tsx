"use client";

import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils/cn";

const THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
] as const;

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 p-4">
      <h1 className="text-lg font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex flex-1 items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted",
                mounted && theme === option.value && "border-accent bg-accent/10 text-accent",
              )}
            >
              {option.label}
              {mounted && theme === option.value ? <Check className="h-3.5 w-3.5" /> : null}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          <p>Market Platform Analytics — TradingView-powered market intelligence workstation.</p>
          <p>
            Market data is currently served by a deterministic mock provider. See
            docs/frontend-architecture.md for how this swaps to the Market Platform API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
