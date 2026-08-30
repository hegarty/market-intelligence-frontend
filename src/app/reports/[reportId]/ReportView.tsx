"use client";

import Link from "next/link";
import { useReport } from "@/features/reports/hooks";
import { ReportRenderer } from "@/components/report/ReportRenderer";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryStates";
import { getReportDefinition } from "@/features/reports/registry";

export function ReportView({ reportId }: { reportId: string }) {
  const definition = getReportDefinition(reportId);
  const { data: report, isLoading, isError, refetch } = useReport(reportId);

  if (!definition) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm text-muted-foreground">Unknown report &ldquo;{reportId}&rdquo;.</p>
        <Link href="/reports" className="text-sm text-accent hover:underline">
          Back to reports
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl p-4">
        <LoadingBlock lines={12} />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="p-8">
        <ErrorBlock message="Unable to build this report." onRetry={refetch} />
      </div>
    );
  }

  return <ReportRenderer report={report} />;
}
