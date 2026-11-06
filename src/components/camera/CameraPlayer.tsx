"use client";

import Link from "next/link";
import { animate, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useStage, type Box, type Shift } from "@/components/stage/store";
import { episodes, show } from "@/content/episodes";
import { fileNumber } from "./format";
import { LcdMenu } from "./LcdMenu";
import { LcdPlayback } from "./LcdPlayback";
import type { ScreenLayout } from "./model";
import { player, usePlayer } from "./player-store";
import { quadTransform } from "./quad";
import { cameraStore } from "./stage";
import { openEpisode, press, useCameraControls } from "./useCameraControls";

const MOBILE = "(max-width: 767px)";
const FLY = { duration: 0.7, ease: [0.65, 0, 0.3, 1] } as const;
const HOVER = { duration: 0.35, ease: [0.22, 1, 0.36, 1] } as const;
/** Hovered in the corner: it grows by this much and turns a little towards the page. */
const HOVER_GROW = 1.2;
const SWIVEL = { spin: -0.42, tilt: 0.14 };
const NO_SHIFT: Shift = { x: 0, y: 0, scale: 1 };
/** Title screen, from the mockup: a touch left of centre. */
const titleShift = (): Shift => ({ x: -0.0125 * window.innerWidth, y: 0, scale: 0.99 });
/** Phones: the stage's own docked pose is sized for desktop, so the camera grows to fill the width. */
const PHONE_BIG: Shift = { x: 0, y: 0, scale: 1.55 };
const LINK = "font-narrow text-base md:text-[min(2.45vw,3.77dvh)]";

const subscribeMobile = (onChange: () => void) => {
  const query = matchMedia(MOBILE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useMobile = () => useSyncExternalStore(subscribeMobile, () => matchMedia(MOBILE).matches, () => false);

/** The camera body on screen: its LCD and buttons, padded out to the body's edges. */
function bodyBox({ lcd, buttons }: ScreenLayout): Box {
  const boxes = [lcd, ...buttons.map((button) => button.box)];
  const left = Math.min(...boxes.map((b) => b.left));
  const top = Math.min(...boxes.map((b) => b.top));
  const width = Math.max(...boxes.map((b) => b.left + b.width)) - left;
  const height = Math.max(...boxes.map((b) => b.top + b.height)) - top;
  const padX = width * 0.06;
  const padY = height * 0.14;
  return { left: left - padX, top: top - padY, width: width + padX * 2, height: height + padY * 2 };
}

/** Where `box`, drawn with `shift`, would be with no shift. The stage scales about the screen centre, then moves. */
function unshift(box: Box, shift: Shift | null, w: number, h: number): Box {
  const { x, y, scale } = shift ?? NO_SHIFT;
  return {
    left: w / 2 + (box.left - w / 2 - x) / scale,
    top: h / 2 + (box.top - h / 2 - y) / scale,
    width: box.width / scale,
    height: box.height / scale,
  };
}

/** Bottom-right corner, above "[go back]"; `base` is the camera body with no shift. Grows up and left from there. */
function cornerShift(base: Box, mobile: boolean, grow = 1): Shift {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const width = (mobile ? w * 0.48 : Math.min(440, Math.max(300, w * 0.27))) * grow;
  const height = (base.height * width) / base.width;
  const right = mobile ? 16 : w * 0.079;
  const bottom = mobile ? 56 : h * 0.12;
  const scale = width / base.width;
  return {
    scale,
    x: w - right - width / 2 - w / 2 - scale * (base.left + base.width / 2 - w / 2),
    y: h - bottom - height / 2 - h / 2 - scale * (base.top + base.height / 2 - h / 2),
  };
}

const mix = (a: Shift, b: Shift, t: number): Shift => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  scale: a.scale + (b.scale - a.scale) * t,
});

/** A speaker with sound waves, or crossed out when muted. Sized to the text. */
function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-[0.95em]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {muted ? (
        <path d="M17 9l5 6M22 9l-5 6" />
      ) : (
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13" />
      )}
    </svg>
  );
}

const at = ({ left, top, width, height }: Box) => ({ left, top, width, height });

/**
 * Turns the docked camera into the episode player for /shuisbored. On the title
 * screen it sits in the middle playing the episodes; opening one flies it into
 * the bottom-right corner while the story plays out (<Story>). Hovering it there
 * grows and turns it; clicking it goes back to the title screen to pick another.
 */
export function CameraPlayer() {
  // Where the 3D camera's LCD and buttons are on screen; null until it has landed.
  const screen = useStage(cameraStore, (s) => s.layout);
  const { view, index, menu, cursor, playing, muted, hud, restart } = usePlayer((s) => s);
  const mobile = useMobile();
  const reducedMotion = useReducedMotion();
  const base = useRef<{ box: Box; size: string } | null>(null);
  const flight = useRef<AnimationPlaybackControls | null>(null);
  const wasSmall = useRef(false);
  /** Flying between the middle and the corner (not just growing on hover). */
  const flying = useRef(false);
  const small = view === "episodes";
  // Hovered in the corner: the hit area, frozen while the camera grows and turns under it.
  const [hoverBox, setHoverBox] = useState<Box | null>(null);
  const hover = small && hoverBox !== null;
  useCameraControls();

  useEffect(() => {
    player.reset();
    cameraStore.set({ shift: matchMedia(MOBILE).matches ? PHONE_BIG : titleShift(), spin: 0, tilt: 0 });
    return () => cameraStore.set({ spin: 0, tilt: 0 });
  }, []);

  // Remember where the camera sits unshifted; re-aim when the window changes size.
  useEffect(() => {
    if (!screen || flight.current) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = `${w}x${h}`;
    if (base.current?.size === size) return;
    const shift = cameraStore.get().shift;
    base.current = { size, box: unshift(bodyBox(screen), shift, w, h) };
    if (shift && small) cameraStore.set({ shift: cornerShift(base.current.box, mobile) });
  }, [screen, mobile, small]);

  // Fly between the middle and the corner; grow a little on hover.
  useEffect(() => {
    const box = base.current?.box;
    if (!box) return;
    const to = small ? cornerShift(box, mobile, hover ? HOVER_GROW : 1) : mobile ? PHONE_BIG : titleShift();
    const from = cameraStore.get().shift ?? NO_SHIFT;
    const wasSmallBefore = wasSmall.current;
    wasSmall.current = small;
    if (reducedMotion) {
      cameraStore.set({ shift: to });
      return;
    }
    // Only the hover changed: a quick grow, not the full flight.
    const fly = wasSmallBefore !== small;
    if (fly) flying.current = true;
    const animation = animate(0, 1, {
      ...(fly ? FLY : HOVER),
      onUpdate: (t) => cameraStore.set({ shift: mix(from, to, t) }),
      onComplete: () => {
        flight.current = null;
        flying.current = false;
      },
    });
    flight.current = animation;
    return () => {
      animation.stop();
      flight.current = null;
    };
  }, [small, hover, mobile, reducedMotion]);

  // Swivel on hover, so the small camera reads as an object rather than a flat picture.
  useEffect(() => {
    if (reducedMotion) return;
    const { spin, tilt } = cameraStore.get();
    const options = { type: "spring", stiffness: 140, damping: 16 } as const;
    const animations = [
      animate(spin, hover ? SWIVEL.spin : 0, { ...options, onUpdate: (v) => cameraStore.set({ spin: v }) }),
      animate(tilt, hover ? SWIVEL.tilt : 0, { ...options, onUpdate: (v) => cameraStore.set({ tilt: v }) }),
    ];
    return () => animations.forEach((animation) => animation.stop());
  }, [hover, reducedMotion]);

  const episode = episodes[index];
  const announcement = menu
    ? episodes[cursor] && `${fileNumber(cursor)}, ${episodes[cursor].title}. Enter to open.`
    : episode && `${episode.label}: ${episode.title}, ${playing ? "playing" : "paused"}`;
  const body = screen && bodyBox(screen);
  const cornerBox = body && small && !hover ? body : hoverBox;

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {/* Bottom-left, opposite "[go back]": the same spot on the title screen, the menu and an episode. */}
      <div className={`${LINK} fixed bottom-[4.2dvh] left-gutter z-50 flex items-center gap-[1.2em] md:left-[3.8vw]`}>
        <a href={show.instagram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-blue">
          instagram
        </a>
        <button
          type="button"
          onClick={player.toggleMute}
          aria-pressed={!muted}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className={`flex items-center gap-[0.3em] transition-colors ${muted ? "text-ink-muted hover:text-ink" : "text-blue"}`}
        >
          <SpeakerIcon muted={muted} />
          sound : [{muted ? "off" : "on"}]
        </button>
      </div>
      {view === "title" ? (
        <Link href="/" className={`${LINK} fixed bottom-[4.2dvh] right-gutter z-50 hover:text-blue md:right-[7.9vw]`}>
          [go back]
        </Link>
      ) : (
        <button
          type="button"
          onClick={player.close}
          className={`${LINK} fixed bottom-[4.2dvh] right-gutter z-50 hover:text-blue md:right-[7.9vw]`}
        >
          [go back]
        </button>
      )}

      {screen && body && episode && (
        <div className="pointer-events-none fixed inset-0 z-50">
          {!small && (
            <div
              tabIndex={0}
              role="group"
              aria-label="Camera. Left and right arrows browse, Enter opens or pauses, M mutes, Escape goes back."
              className="absolute rounded-soft focus-visible:outline-offset-8"
              style={at(body)}
            />
          )}

          <div
            className="pointer-events-auto absolute top-0 left-0 origin-top-left overflow-hidden bg-black [container-type:inline-size]"
            style={{ width: screen.lcd.width, height: screen.lcd.height, transform: quadTransform(screen.lcd.width, screen.lcd.height, screen.lcdCorners) }}
          >
            <LcdPlayback
              episode={episode}
              index={index}
              playing={playing && !menu}
              muted={muted}
              hud={hud}
              restart={restart}
              compact={small}
            />
            {!small && !menu && (
              // The picture itself: opens the episode from the title screen, pauses once it's open.
              <button
                type="button"
                aria-label={view === "title" ? `Open ${episode.label}: ${episode.title}` : playing ? "Pause" : "Play"}
                onClick={() => (view === "title" ? player.open(index) : player.togglePlay())}
                className="absolute inset-x-0 top-[18%] bottom-[20%] cursor-pointer"
              />
            )}
            {menu && <LcdMenu episodes={episodes} cursor={cursor} onPick={openEpisode} />}
          </div>

          {small ? (
            <button
              type="button"
              aria-label="Back to the episodes"
              onClick={() => {
                setHoverBox(null);
                player.pick();
              }}
              // Only once it has landed in the corner, not while it flies past the pointer.
              onPointerEnter={() => !flying.current && setHoverBox(body)}
              onPointerLeave={() => setHoverBox(null)}
              onFocus={() => !flying.current && setHoverBox(body)}
              onBlur={() => setHoverBox(null)}
              className="pointer-events-auto absolute cursor-pointer rounded-soft"
              style={at(cornerBox ?? body)}
            />
          ) : (
            screen.buttons.map(({ id, label, box }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                onClick={() => press(id)}
                className="pointer-events-auto absolute rounded-full transition-colors duration-75 hover:bg-white/10 focus-visible:outline-offset-1 active:bg-white/20"
                style={at(box)}
              />
            ))
          )}
        </div>
      )}
    </>
  );
}
