"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStage } from "@/components/stage/store";
import type { Music, Track } from "@/content/music";
import { ipodStore } from "./stage";

/** Degrees of turn on the click wheel per step through a list. */
const STEP_DEGREES = 24;
/** A press that moves less than this (degrees) is a click, not a scroll. */
const CLICK_DEGREES = 6;
const ROWS = 6;

type Item = { label: string; open: () => Screen | null; arrow?: boolean };
type Screen =
  | { kind: "menu"; title: string; items: Item[] }
  | { kind: "artist"; name: string; favourite: string; href: string | null }
  | { kind: "playing"; queue: Track[]; index: number };

type Frame = { screen: Screen; cursor: number };

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
/** Made-up but stable song lengths, 2:40–4:20. */
const lengthOf = (track: Track) => 160 + ([...track.title].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 100);

/** A soft tick, like the click wheel's. */
let audio: AudioContext | null = null;
function tick() {
  try {
    audio ??= new AudioContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = 1800;
    gain.gain.setValueAtTime(0.025, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.025);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.03);
  } catch {
    // No audio: the wheel still works.
  }
}

function rootMenu(music: Music): Screen {
  const items: Item[] = [
    {
      label: "Artists",
      arrow: true,
      open: () => ({
        kind: "menu",
        title: "Artists",
        items: music.artists.map((artist) => ({ label: artist.name, arrow: true, open: () => ({ kind: "artist", ...artist }) })),
      }),
    },
    {
      label: "On Repeat",
      arrow: true,
      open: () => ({
        kind: "menu",
        title: "On Repeat",
        items: music.onRepeat.map((track, index) => ({
          label: track.title,
          open: () => ({ kind: "playing", queue: music.onRepeat, index }),
        })),
      }),
    },
    {
      label: "Shuffle Songs",
      open: () => {
        const queue = [...music.onRepeat].sort(() => Math.random() - 0.5);
        return { kind: "playing", queue, index: 0 };
      },
    },
  ];
  if (music.profile) {
    const profile = music.profile;
    items.push({ label: "Open Spotify ↗", open: () => (window.open(profile, "_blank", "noopener"), null) });
  }
  return { kind: "menu", title: "iPod", items };
}

/** The docked iPod: a working click wheel driving a classic iPod menu of my music. */
export function IpodPlayer({ music }: { music: Music }) {
  const router = useRouter();
  // Where the 3D iPod's screen and wheel are on screen; null until it has landed.
  const layout = useStage(ipodStore, (s) => s.layout);
  const [stack, setStack] = useState<Frame[]>(() => [{ screen: rootMenu(music), cursor: 0 }]);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const turn = useRef<{ angle: number; moved: number; pending: number } | null>(null);

  const top = stack[stack.length - 1];
  const screen = top.screen;
  const track = screen.kind === "playing" ? screen.queue[screen.index] : null;

  const replaceTop = (frame: Frame) => setStack((s) => [...s.slice(0, -1), frame]);

  const scroll = (by: number) => {
    if (screen.kind === "menu") {
      const cursor = Math.max(0, Math.min(screen.items.length - 1, top.cursor + by));
      if (cursor !== top.cursor) tick();
      replaceTop({ ...top, cursor });
    }
  };
  const skip = (by: number) => {
    if (screen.kind !== "playing") return;
    const index = (screen.index + by + screen.queue.length) % screen.queue.length;
    replaceTop({ ...top, screen: { ...screen, index } });
    setElapsed(0);
    tick();
  };
  const select = () => {
    tick();
    if (screen.kind === "menu") {
      const next = screen.items[top.cursor]?.open();
      if (!next) return;
      if (next.kind === "playing") {
        setElapsed(0);
        setPlaying(true);
      }
      setStack((s) => [...s, { screen: next, cursor: 0 }]);
    } else if (screen.kind === "artist" && screen.href) {
      window.open(screen.href, "_blank", "noopener");
    } else if (screen.kind === "playing" && track?.href) {
      window.open(track.href, "_blank", "noopener");
    }
  };
  const back = () => {
    tick();
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  };
  const press = (button: "menu" | "play" | "prev" | "next") => {
    if (button === "menu") back();
    else if (button === "play") {
      tick();
      setPlaying((p) => !p);
    } else if (screen.kind === "playing") skip(button === "next" ? 1 : -1);
    else scroll(button === "next" ? 1 : -1);
  };

  // The song plays on (silently) while it's showing.
  useEffect(() => {
    if (!track || !playing) return;
    const length = lengthOf(track);
    const timer = setInterval(() => setElapsed((t) => (t + 1 >= length ? 0 : t + 1)), 1000);
    return () => clearInterval(timer);
  }, [track, playing]);

  // Keyboard mirrors the wheel; Escape goes back, then leaves.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const keys: Record<string, () => void> = {
        ArrowUp: () => scroll(-1),
        ArrowDown: () => scroll(1),
        ArrowLeft: () => press("prev"),
        ArrowRight: () => press("next"),
        Enter: select,
        " ": () => press("play"),
        Backspace: back,
        Escape: () => (stack.length > 1 ? back() : router.push("/")),
      };
      const action = keys[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!layout) return null;
  const { screen: box, wheel } = layout;
  const angleAt = (x: number, y: number) => (Math.atan2(y - wheel.y, x - wheel.x) * 180) / Math.PI;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        aria-live="polite"
        className="pointer-events-auto absolute overflow-hidden bg-white font-display text-[#111] [container-type:inline-size]"
        style={box}
        onWheel={(event) => scroll(Math.sign(event.deltaY))}
      >
        <div className="flex h-[12cqw] items-center justify-between border-b border-[#9aa2ad] bg-gradient-to-b from-[#f5f6f8] to-[#c6ccd5] px-[3cqw] text-[5.2cqw] font-semibold">
          <span className="w-[10cqw] text-[4cqw]">{playing && track ? "▶" : ""}</span>
          <span className="truncate">{screen.kind === "menu" ? screen.title : screen.kind === "artist" ? "Artist" : "Now Playing"}</span>
          <span className="flex w-[10cqw] justify-end">
            <span className="h-[4cqw] w-[8cqw] rounded-[0.6cqw] border border-[#555] bg-gradient-to-b from-[#9be07b] to-[#3f9e2b]" />
          </span>
        </div>

        {screen.kind === "menu" && (
          <ul>
            {screen.items.slice(Math.max(0, top.cursor - ROWS + 1), Math.max(ROWS, top.cursor + 1)).map((item) => {
              const i = screen.items.indexOf(item);
              const on = i === top.cursor;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => (on ? select() : replaceTop({ ...top, cursor: i }))}
                    className={`flex h-[12.3cqw] w-full items-center justify-between px-[3cqw] text-left text-[5.6cqw] font-medium ${
                      on ? "bg-gradient-to-b from-[#5aa2f0] to-[#1f6fd1] text-white" : ""
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.arrow && <span>›</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {screen.kind === "artist" && (
          <div className="flex h-[calc(100%-12cqw)] flex-col justify-center gap-[2cqw] px-[6cqw]">
            <p className="text-[8cqw] font-semibold leading-none tracking-[-0.04em]">{screen.name}</p>
            <p className="text-[4.6cqw] text-[#555]">Start with “{screen.favourite}”</p>
            {screen.href && <p className="mt-[3cqw] text-[4cqw] text-[#1f6fd1]">Press the centre button to listen ↗</p>}
          </div>
        )}

        {screen.kind === "playing" && track && (
          <div className="flex h-[calc(100%-12cqw)] flex-col justify-between px-[5cqw] py-[4cqw]">
            <p className="text-[4cqw] text-[#555]">
              {screen.index + 1} of {screen.queue.length}
            </p>
            <div>
              <p className="truncate text-[7cqw] font-semibold leading-tight tracking-[-0.03em]">{track.title}</p>
              <p className="truncate text-[5cqw] text-[#444]">{track.artist}</p>
            </div>
            <div>
              <div className="h-[2.6cqw] overflow-hidden rounded-full border border-[#8b939e] bg-[#e6e9ee]">
                <div
                  className="h-full bg-gradient-to-b from-[#5aa2f0] to-[#1f6fd1]"
                  style={{ width: `${(elapsed / lengthOf(track)) * 100}%` }}
                />
              </div>
              <div className="mt-[1cqw] flex justify-between text-[3.6cqw] text-[#555]">
                <span>{clock(elapsed)}</span>
                <span>-{clock(lengthOf(track) - elapsed)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click wheel: drag round it to scroll, press its edges for MENU / ◀◀ / ▶▶ / ▶❙❙. */}
      <div
        role="slider"
        aria-label="Click wheel. Arrow keys scroll, Enter selects, Backspace goes back."
        aria-valuenow={top.cursor}
        tabIndex={0}
        className="pointer-events-auto absolute touch-none rounded-full"
        style={{ left: wheel.x - wheel.radius, top: wheel.y - wheel.radius, width: wheel.radius * 2, height: wheel.radius * 2 }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          turn.current = { angle: angleAt(event.clientX, event.clientY), moved: 0, pending: 0 };
        }}
        onPointerMove={(event) => {
          const t = turn.current;
          if (!t) return;
          const angle = angleAt(event.clientX, event.clientY);
          const delta = ((angle - t.angle + 540) % 360) - 180;
          t.angle = angle;
          t.moved += Math.abs(delta);
          t.pending += delta;
          // Clockwise scrolls down, as on the real thing.
          while (Math.abs(t.pending) >= STEP_DEGREES) {
            const by = Math.sign(t.pending);
            t.pending -= by * STEP_DEGREES;
            if (screen.kind === "playing") continue;
            scroll(by);
          }
        }}
        onPointerUp={(event) => {
          const t = turn.current;
          turn.current = null;
          if (!t || t.moved > CLICK_DEGREES) return;
          const angle = angleAt(event.clientX, event.clientY);
          press(angle < -45 && angle > -135 ? "menu" : angle > 45 && angle < 135 ? "play" : Math.abs(angle) <= 45 ? "next" : "prev");
        }}
        onPointerCancel={() => (turn.current = null)}
      />
      <button
        type="button"
        aria-label="Select"
        onClick={select}
        className="pointer-events-auto absolute rounded-full transition-colors active:bg-black/10"
        style={{
          left: wheel.x - wheel.centre,
          top: wheel.y - wheel.centre,
          width: wheel.centre * 2,
          height: wheel.centre * 2,
        }}
      />
    </div>
  );
}
