import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { REPORT_DEFINITIONS } from "@/features/reports/registry";

export default function ReportsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Reusable market-analysis reports combining TradingView charts with our own visualizations.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {REPORT_DEFINITIONS.map((report) => (
          <Link key={report.id} href={`/reports/${report.id}`}>
            <Card className="transition-colors hover:border-accent/50">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-foreground">{report.title}</div>
                  <div className="text-sm text-muted-foreground">{report.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
