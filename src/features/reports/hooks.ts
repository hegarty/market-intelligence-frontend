import { useQuery } from "@tanstack/react-query";
import { getReportDefinition } from "@/features/reports/registry";

export function useReport(reportId: string | undefined) {
  return useQuery({
    queryKey: ["reports", reportId],
    queryFn: async () => {
      const definition = getReportDefinition(reportId as string);
      if (!definition) throw new Error(`Unknown report: ${reportId}`);
      return definition.build();
    },
    enabled: Boolean(reportId),
    staleTime: 60_000,
  });
}
