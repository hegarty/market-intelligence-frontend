import { ChartWorkspaceView } from "@/app/chart/[symbol]/ChartWorkspaceView";

export default async function ChartSymbolPage(props: PageProps<"/chart/[symbol]">) {
  const { symbol } = await props.params;
  return <ChartWorkspaceView symbol={decodeURIComponent(symbol).toUpperCase()} />;
}
