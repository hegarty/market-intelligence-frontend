import { cn } from "@/lib/utils/cn";

export function ReportHeading({
  level = 2,
  children,
  className,
}: {
  level?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}) {
  const Tag = (`h${level}` as const) as "h1" | "h2" | "h3";
  const sizes = {
    1: "text-2xl font-semibold tracking-tight",
    2: "text-lg font-semibold tracking-tight",
    3: "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
  } as const;

  return <Tag className={cn(sizes[level], className)}>{children}</Tag>;
}
