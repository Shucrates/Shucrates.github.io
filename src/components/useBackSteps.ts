"use client";

import { useEffect, useRef } from "react";

/** How deep each layer on the page was when this history entry was made, e.g. { ipod: 2 }. */
type Steps = Record<string, number>;
const stepsOf = (state: unknown): Steps => (state as { steps?: Steps } | null)?.steps ?? {};

/** How many history entries the layers on this page have stacked above it. */
export const stepsHere = () => Object.values(stepsOf(window.history.state)).reduce((sum, step) => sum + step, 0);

/**
 * Lets the browser's back button step out of a layer inside a page (an open bag, an episode,
 * an iPod submenu) instead of leaving the page: each level deeper gets its own history entry,
 * and going back calls `backTo` with the level to return to. Closing a level on the page
 * steps back over its entry, so history never holds a level that isn't open.
 */
export function useBackSteps(key: string, depth: number, backTo: (depth: number) => void) {
  const latest = useRef({ depth, backTo });
  useEffect(() => {
    latest.current = { depth, backTo };
  });

  useEffect(() => {
    const at = stepsOf(window.history.state)[key] ?? 0;
    for (let step = at + 1; step <= depth; step++) {
      window.history.pushState({ steps: { ...stepsOf(window.history.state), [key]: step } }, "");
    }
    if (depth < at) window.history.go(depth - at);
  }, [key, depth]);

  useEffect(() => {
    const onPop = () => {
      const to = stepsOf(window.history.state)[key] ?? 0;
      if (to < latest.current.depth) latest.current.backTo(to);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [key]);
}
