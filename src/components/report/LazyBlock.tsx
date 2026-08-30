"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Defers mounting expensive report blocks (TradingView widgets, charts)
 * until they scroll near the viewport, then keeps them mounted — a report
 * with ten visualizations should not initialize all ten at once.
 */
export function LazyBlock({
  children,
  minHeight = 240,
}: {
  children: React.ReactNode;
  minHeight?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(
    () => typeof IntersectionObserver === "undefined",
  );

  React.useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref}>
      {visible ? children : <Skeleton style={{ minHeight }} className="w-full" />}
    </div>
  );
}
