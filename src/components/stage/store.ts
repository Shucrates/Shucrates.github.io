import { useSyncExternalStore } from "react";

export type Box = { left: number; top: number; width: number; height: number };

/** A docked pose set by the page itself, e.g. the swinging medal. */
export type Dock = {
  /** Where the model's face centre sits on screen, in CSS pixels. */
  x: number;
  y: number;
  /** CSS pixels per model unit (the model is 1 unit wide). */
  width: number;
  pitch: number;
  yaw: number;
  roll: number;
  /** Model-specific shape, handed to the model's `pose`, e.g. where the medal's ribbon is. */
  deform?: number[];
};

export type StageState<L> = {
  /** The homepage slot the object sits in; `null` when it isn't on the page. */
  anchor: HTMLElement | null;
  /** Hovered or focused on the homepage. */
  active: boolean;
  /** Opacity while the object sits on the homepage; fades it in with the other objects. */
  presence: number;
  /** Has finished flying onto its page. */
  landed: boolean;
  /** Extra turn (radians) once docked, e.g. the dragged card. Applied as is, so callers smooth it. */
  spin: number;
  /** Extra tilt (radians, top towards you) once docked. Applied as is. */
  tilt: number;
  /** Replaces the default docked pose (centred, filling the screen) when set. */
  dock: Dock | null;
  /** Where the object's interactive parts are on screen once docked; null otherwise. */
  layout: L | null;
};

export type StageStore<L> = ReturnType<typeof createStageStore<L>>;

const initial = { anchor: null, active: false, presence: 1, landed: false, spin: 0, tilt: 0, dock: null, layout: null };

/** A tiny external store per 3D object, shared by its stage, its homepage slot and its page. */
export function createStageStore<L>() {
  let state: StageState<L> = initial;
  const listeners = new Set<() => void>();
  const store = {
    get: () => state,
    set(patch: Partial<StageState<L>>) {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  return store;
}

export function useStage<L, T>(store: StageStore<L>, select: (state: StageState<L>) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => select(store.get()),
    () => select(initial),
  );
}
