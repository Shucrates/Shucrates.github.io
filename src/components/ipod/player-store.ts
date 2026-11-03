import { useSyncExternalStore } from "react";
import type { Preview, Track } from "@/lib/music-types";

/**
 * The iPod's one <audio> element and its queue, as a tiny external store (like the
 * stage stores). Playing a song queues the list it came from, so ⏭/⏮ and the end of a
 * preview move through that list. Only ever plays the provider's 30s preview URL.
 */

export type PlayerState = {
  queue: Track[];
  /** Position in `queue`; -1 when nothing is loaded. */
  index: number;
  status: "idle" | "loading" | "playing" | "paused" | "no-preview";
  /** Seconds into the preview. */
  elapsed: number;
  duration: number;
  /** Where the current preview comes from, for the attribution line. */
  preview: Preview | null;
};

const PREVIEW_SECONDS = 30;
/** ⏮ restarts the song if it's further in than this, as on the real thing. */
const RESTART_SECONDS = 3;
/** A silent WAV, played inside the first tap so mobile browsers let this element play later. */
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

const initial: PlayerState = { queue: [], index: -1, status: "idle", elapsed: 0, duration: PREVIEW_SECONDS, preview: null };
let state = initial;
const listeners = new Set<() => void>();

function set(patch: Partial<PlayerState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

let audio: HTMLAudioElement | null = null;
let unlocked = false;
/** Bumped on every load, so a slow preview lookup can't start a song you've skipped past. */
let request = 0;
/** iTunes preview URLs don't expire, so they're remembered; Deezer's are looked up each time. */
const remembered = new Map<string, Preview>();

function element() {
  if (audio) return audio;
  const el = new Audio();
  el.preload = "auto";
  el.addEventListener("timeupdate", () => set({ elapsed: el.currentTime }));
  el.addEventListener("loadedmetadata", () =>
    set({ duration: Number.isFinite(el.duration) ? el.duration : PREVIEW_SECONDS }),
  );
  el.addEventListener("playing", () => set({ status: "playing" }));
  el.addEventListener("pause", () => state.status === "playing" && set({ status: "paused" }));
  el.addEventListener("ended", () => {
    if (state.index < state.queue.length - 1) load(state.index + 1, true);
    else reset();
  });
  audio = el;
  return el;
}

function knownPreview(track: Track): Preview | null {
  if (track.previewUrl) return { previewUrl: track.previewUrl, source: "itunes", externalUrl: null };
  return remembered.get(track.id) ?? null;
}

async function lookUp(track: Track): Promise<Preview> {
  const params = new URLSearchParams({ title: track.title, artist: track.artist });
  if (track.isrc) params.set("isrc", track.isrc);
  try {
    const res = await fetch(`/api/music/preview/?${params}`);
    if (!res.ok) throw new Error(String(res.status));
    const preview = (await res.json()) as Preview;
    if (preview.source === "itunes") remembered.set(track.id, preview);
    return preview;
  } catch {
    return { previewUrl: null, source: null, externalUrl: null };
  }
}

function start(preview: Preview, autoplay: boolean) {
  const el = element();
  if (!preview.previewUrl) return set({ status: "no-preview", preview });
  set({ preview, status: autoplay ? "loading" : "paused" });
  el.src = preview.previewUrl;
  if (autoplay) el.play().catch(() => set({ status: "paused" }));
}

function load(index: number, autoplay: boolean) {
  const track = state.queue[index];
  const id = ++request;
  element().pause();
  set({ index, elapsed: 0, duration: PREVIEW_SECONDS, status: "loading", preview: null });
  // Start straight away when the URL is known, so it's still inside the tap that asked for it.
  const known = knownPreview(track);
  if (known) return start(known, autoplay);
  void lookUp(track).then((preview) => id === request && start(preview, autoplay));
}

function reset() {
  request++;
  audio?.pause();
  set(initial);
}

export const player = {
  /** Play `queue[index]` and queue the rest. Call from a tap, click or key press. */
  play(queue: Track[], index: number) {
    const el = element();
    if (!unlocked) {
      unlocked = true;
      el.src = SILENCE;
      el.play().catch(() => {});
    }
    set({ queue });
    load(index, true);
  },
  toggle() {
    if (state.status === "playing") audio?.pause();
    else if (state.status === "paused") audio?.play().catch(() => {});
  },
  /** ⏭ / ⏮. Keeps playing if it was playing; stops at the end of the list. */
  skip(by: 1 | -1) {
    if (state.index < 0) return;
    const el = element();
    if (by < 0 && (state.elapsed > RESTART_SECONDS || state.index === 0)) {
      el.currentTime = 0;
      return;
    }
    const next = state.index + by;
    if (next >= state.queue.length) return reset();
    load(next, state.status !== "paused");
  },
  pause: () => audio?.pause(),
};

export function usePlayer(): PlayerState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => state,
    () => initial,
  );
}
