import { useSyncExternalStore } from "react";
import { episodes } from "@/content/episodes";

/**
 * The camera's playback state, a tiny external store (like the stage stores).
 * /shuisbored opens on the title screen with the camera in the middle and the
 * episode grid on its LCD; opening an
 * episode switches to the episode view, where the camera waits in the corner;
 * clicking it there goes back to the title screen with the grid open.
 */
export type PlayerState = {
  view: "title" | "episodes";
  /** Episode on the LCD. */
  index: number;
  /** The episode grid is open (MENU), and its highlighted episode. */
  menu: boolean;
  cursor: number;
  playing: boolean;
  muted: boolean;
  /** Playback overlay text on the LCD. */
  hud: boolean;
  /** Bumped to restart the current episode. */
  restart: number;
};

const MUTED_KEY = "camera-muted";
const initial: PlayerState = {
  view: "title",
  index: 0,
  menu: true,
  cursor: 0,
  playing: true,
  muted: true,
  hud: true,
  restart: 0,
};

let state = initial;
const listeners = new Set<() => void>();

function set(patch: Partial<PlayerState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

const wrap = (n: number) => (n + episodes.length) % episodes.length;

export const player = {
  get: () => state,
  /** Back to the title screen, keeping the saved mute choice; videos start muted until the visitor unmutes once. */
  reset: () => {
    let muted = true;
    try {
      muted = localStorage.getItem(MUTED_KEY) !== "0";
    } catch {}
    set({ ...initial, muted });
  },
  /** Opens the episode view at episode `index`. */
  open: (index: number) => set({ view: "episodes", index, cursor: index, menu: false, playing: true }),
  /** Back to the title screen. */
  close: () => set({ view: "title", menu: false }),
  /** Back to the title screen with the episode grid open. */
  pick: () => set({ view: "title", menu: true, cursor: state.index }),
  /** Puts episode `index` on the LCD. */
  show: (index: number) => {
    if (index !== state.index) set({ index, cursor: index, playing: true, restart: 0 });
  },
  /** Moves the grid cursor, or the episode on the LCD when the grid is closed. */
  step: (by: number) => {
    if (episodes.length === 0) return;
    if (state.menu) set({ cursor: wrap(state.cursor + by) });
    else player.show(wrap(state.index + by));
  },
  /** Highlights episode `index` in the grid. */
  setCursor: (index: number) => {
    if (index !== state.cursor) set({ cursor: index });
  },
  toggleMenu: () => set({ menu: !state.menu, cursor: state.index }),
  closeMenu: () => set({ menu: false }),
  togglePlay: () => set({ playing: !state.playing }),
  setPlaying: (playing: boolean) => set({ playing }),
  restart: () => set({ restart: state.restart + 1, playing: true }),
  toggleHud: () => set({ hud: !state.hud }),
  toggleMute: () => {
    const muted = !state.muted;
    set({ muted });
    try {
      localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
    } catch {}
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function usePlayer<T>(select: (state: PlayerState) => T): T {
  return useSyncExternalStore(
    player.subscribe,
    () => select(state),
    () => select(initial),
  );
}
