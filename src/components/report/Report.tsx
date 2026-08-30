import { ReportHeading } from "@/components/report/ReportHeading";
import { formatDate } from "@/lib/formatting/date";

export function Report({
  title,
  description,
  updatedAt,
  children,
}: {
  title: string;
  description?: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
      <header className="flex flex-col gap-1 border-b border-border pb-4">
        <ReportHeading level={1}>{title}</ReportHeading>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {updatedAt ? (
          <p className="text-xs text-muted-foreground">{formatDate(updatedAt)}</p>
        ) : null}
      </header>
      <div className="flex flex-col gap-8">{children}</div>
    </article>
  );
}
