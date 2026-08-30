export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Markets", href: "/" },
  { label: "Chart", href: "/chart/SPY" },
  { label: "Compare", href: "/compare" },
  { label: "Reports", href: "/reports" },
  { label: "Watchlists", href: "/watchlists" },
  { label: "Settings", href: "/settings" },
];

export const SITE_NAME = "Market Platform";

export const DEFAULT_CHART_SYMBOL = "SPY";
