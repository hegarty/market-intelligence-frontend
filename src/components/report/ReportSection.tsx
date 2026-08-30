import { ReportHeading } from "@/components/report/ReportHeading";
import type { ReportSectionLayout } from "@/types/report";
import { cn } from "@/lib/utils/cn";

const LAYOUT_CLASS: Record<ReportSectionLayout, string> = {
  single: "grid-cols-1",
  "two-column": "grid-cols-1 lg:grid-cols-2",
  "three-column": "grid-cols-1 lg:grid-cols-3",
};

export function ReportSection({
  title,
  layout = "single",
  children,
}: {
  title?: string;
  layout?: ReportSectionLayout;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {title ? <ReportHeading level={2}>{title}</ReportHeading> : null}
      <div className={cn("grid gap-3", LAYOUT_CLASS[layout])}>{children}</div>
    </section>
  );
}
