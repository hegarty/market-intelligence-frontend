"use client";

import { useTheme } from "next-themes";
import { useHasMounted } from "@/hooks/useHasMounted";

/** Resolves next-themes' theme (which may be "system") to "light" | "dark". */
export function useResolvedTheme(): "light" | "dark" {
  const { resolvedTheme } = useTheme();
  const mounted = useHasMounted();

  if (!mounted) return "dark";
  return resolvedTheme === "light" ? "light" : "dark";
}
