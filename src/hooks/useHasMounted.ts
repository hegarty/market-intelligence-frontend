import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after the client has hydrated. Backed by useSyncExternalStore
 * (server snapshot `false`, client snapshot `true`) instead of a
 * `useEffect(() => setMounted(true), [])` — that pattern trips the
 * react-hooks/set-state-in-effect rule because it's a synchronous setState
 * call in an effect body.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
