const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

let loadPromise: Promise<void> | null = null;

/**
 * Loads TradingView's tv.js exactly once per page, no matter how many chart
 * components mount concurrently. Every caller awaits the same promise.
 */
export function loadTradingViewScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadTradingViewScript can only run in the browser"));
  }

  if (window.TradingView) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TV_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load TradingView script")));
      return;
    }

    const script = document.createElement("script");
    script.src = TV_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load TradingView script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Injects a self-contained TradingView embed widget (mini chart, symbol overview, etc). */
export function mountTradingViewEmbed(
  container: HTMLElement,
  scriptSrc: string,
  config: Record<string, unknown>,
): () => void {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "tradingview-widget-container__widget";
  container.appendChild(wrapper);

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = scriptSrc;
  script.async = true;
  script.text = JSON.stringify(config);
  container.appendChild(script);

  return () => {
    container.innerHTML = "";
  };
}
