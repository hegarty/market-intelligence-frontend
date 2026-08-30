import { AssetOverviewView } from "@/app/asset/[symbol]/AssetOverviewView";

export default async function AssetSymbolPage(props: PageProps<"/asset/[symbol]">) {
  const { symbol } = await props.params;
  return <AssetOverviewView symbol={decodeURIComponent(symbol).toUpperCase()} />;
}
