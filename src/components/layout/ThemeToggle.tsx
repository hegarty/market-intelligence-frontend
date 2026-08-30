"use client";

import type * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/useHasMounted";

const THEME_SEQUENCE = ["dark", "light", "system"] as const;

const THEME_ICON: Record<(typeof THEME_SEQUENCE)[number], React.ReactNode> = {
  dark: <Moon className="h-3.5 w-3.5" />,
  light: <Sun className="h-3.5 w-3.5" />,
  system: <Monitor className="h-3.5 w-3.5" />,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();

  const current = (theme as (typeof THEME_SEQUENCE)[number]) ?? "dark";

  function cycleTheme() {
    const currentIndex = THEME_SEQUENCE.indexOf(current);
    const next = THEME_SEQUENCE[(currentIndex + 1) % THEME_SEQUENCE.length];
    setTheme(next);
  }

  if (!mounted) return <div className="h-8 w-8" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Theme: ${current}. Click to change.`}
      title={`Theme: ${current}`}
      onClick={cycleTheme}
    >
      {THEME_ICON[current]}
    </Button>
  );
}
