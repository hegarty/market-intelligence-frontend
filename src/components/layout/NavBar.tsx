"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LineChart } from "lucide-react";
import { NAV_ITEMS, SITE_NAME } from "@/config/site";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AssetSearch } from "@/components/search/AssetSearch";
import { cn } from "@/lib/utils/cn";
import type { Asset } from "@/types/asset";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const base = href.split("/").slice(0, 2).join("/");
  return pathname === href || pathname.startsWith(`${base}/`) || pathname === base;
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleSelect(asset: Asset) {
    router.push(`/asset/${asset.symbol}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-12 items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <LineChart className="h-4 w-4 text-accent" />
          <span className="hidden sm:inline">{SITE_NAME}</span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                isActive(pathname, item.href) && "bg-muted text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex max-w-sm flex-1 items-center gap-2">
          <AssetSearch onSelect={handleSelect} />
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
