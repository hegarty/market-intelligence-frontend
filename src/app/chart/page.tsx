import { redirect } from "next/navigation";
import { DEFAULT_CHART_SYMBOL } from "@/config/site";

export default function ChartIndexPage() {
  redirect(`/chart/${DEFAULT_CHART_SYMBOL}`);
}
