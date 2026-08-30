import { ReportView } from "@/app/reports/[reportId]/ReportView";

export default async function ReportPage(props: PageProps<"/reports/[reportId]">) {
  const { reportId } = await props.params;
  return <ReportView reportId={reportId} />;
}
