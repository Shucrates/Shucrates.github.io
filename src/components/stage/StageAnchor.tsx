"use client";

import { useEffect, useRef } from "react";
import type { StageState } from "./store";

/**
 * A 3D object's slot on the homepage. The object itself is drawn by its
 * <ObjectStage> (root layout) over this box.
 */
type Props = {
  store: { set: (patch: Partial<Pick<StageState<unknown>, "anchor" | "active">>) => void };
  active: boolean;
};

export function StageAnchor({ store, active }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    store.set({ anchor: ref.current });
    return () => store.set({ anchor: null, active: false });
  }, [store]);

  useEffect(() => {
    store.set({ active });
  }, [store, active]);

  return <span ref={ref} className="block h-full w-full" />;
}
