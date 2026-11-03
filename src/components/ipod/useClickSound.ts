import { useSyncExternalStore } from "react";

/** The click wheel's soft tick, made with Web Audio (no sound file), and a remembered mute. */

const KEY = "ipod-muted";
let muted: boolean | null = null;
const listeners = new Set<() => void>();

function isMuted() {
  if (muted === null) {
    try {
      muted = localStorage.getItem(KEY) === "1";
    } catch {
      muted = false;
    }
  }
  return muted;
}

function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    // Private mode or storage off: the setting lasts until the page closes.
  }
  listeners.forEach((listener) => listener());
}

let context: AudioContext | null = null;

export function tick() {
  if (isMuted()) return;
  try {
    context ??= new AudioContext();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.frequency.value = 1800;
    gain.gain.setValueAtTime(0.025, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.025);
    osc.connect(gain).connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.03);
  } catch {
    // No audio: the wheel still works.
  }
}

export function useClickSound() {
  const value = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    isMuted,
    () => false,
  );
  return { tick, muted: value, toggleMuted: () => setMuted(!isMuted()) };
}
