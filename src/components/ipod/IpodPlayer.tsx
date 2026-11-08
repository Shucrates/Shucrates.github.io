"use client";

import { useEffect, useRef } from "react";
import { HomeLink } from "@/components/HomeLink";
import { useGoHome } from "@/components/HomeLink";
import { useStage, type Shift } from "@/components/stage/store";
import { site } from "@/content/site";
import { IpodScreen, type IpodControls } from "./screen/IpodScreen";
import { ipodStore } from "./stage";
import { useClickSound } from "./useClickSound";
import { useClickWheel } from "./useClickWheel";

const CONTROLS =
  "iPod. Up and down arrows scroll, Enter selects, Escape or Backspace goes back, Space plays or pauses, left and right arrows go back and open (skip in Now Playing).";

const MOBILE = "(max-width: 767px)";
/** Desktop: smaller than the stage's fit and a little low, so the "my ipod" title shows behind it. */
const desktopShift = (): Shift => ({ x: 0, y: 0.095 * window.innerHeight, scale: 0.81 });
const LINK = "pointer-events-auto font-narrow text-[min(2.45vw,3.77dvh)] underline-offset-4";

/** The docked iPod: its screen, and the click wheel wired to it. */
export function IpodPlayer() {
  const goHome = useGoHome();
  // Where the 3D iPod's screen and wheel are on screen; null until it has landed.
  const layout = useStage(ipodStore, (s) => s.layout);
  const screen = useRef<IpodControls>(null);
  const region = useRef<HTMLDivElement>(null);
  const { muted, toggleMuted } = useClickSound();
  const docked = layout !== null;

  const controls = useClickWheel(layout?.wheel ?? null, {
    scroll: (by) => screen.current?.scroll(by),
    select: () => screen.current?.select(),
    press: (button) => screen.current?.button(button),
    playPause: () => screen.current?.playPause(),
    // Escape goes back, then leaves.
    escape: () => screen.current?.menu() || goHome(),
  });

  useEffect(() => {
    const place = () => ipodStore.set({ shift: matchMedia(MOBILE).matches ? null : desktopShift() });
    place();
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("resize", place);
      ipodStore.set({ shift: null });
    };
  }, []);

  // Keys work as soon as the iPod lands, as they did before it had a focusable region.
  useEffect(() => {
    if (docked) region.current?.focus({ preventScroll: true });
  }, [docked]);

  if (!layout) return null;
  const { screen: box, wheel } = layout;
  // The focus ring hugs the iPod's front, from the top of the screen to the bottom of the wheel.
  const pad = box.width * 0.1;
  const ring = {
    left: Math.min(box.left, wheel.x - wheel.radius) - pad,
    top: box.top - pad,
    width: Math.max(box.width, wheel.radius * 2) + pad * 2,
    height: wheel.y + wheel.radius - box.top + pad * 2,
  };

  return (
    <div
      ref={region}
      role="region"
      aria-label={CONTROLS}
      tabIndex={0}
      className="group pointer-events-none fixed inset-0 z-50"
      // The site-wide focus outline would frame the whole window; the ring below frames the iPod instead.
      style={{ outline: "none" }}
      onKeyDown={controls.onKeyDown}
      onWheel={controls.onWheel}
    >
      <div
        aria-hidden
        className="absolute rounded-[8%] border-2 border-accent opacity-0 group-focus-visible:opacity-100"
        style={ring}
      />
      <div
        className="pointer-events-auto absolute overflow-hidden bg-white font-display text-[#111] [container-type:inline-size]"
        style={box}
      >
        <IpodScreen ref={screen} width={box.width} height={box.height} />
      </div>

      {/* Click wheel: drag round it to scroll, press its edges for MENU / ◀◀ / ▶▶ / ▶❙❙. */}
      <div
        aria-hidden
        className="pointer-events-auto absolute touch-none rounded-full"
        style={{ left: wheel.x - wheel.radius, top: wheel.y - wheel.radius, width: wheel.radius * 2, height: wheel.radius * 2 }}
        {...controls.wheel}
      />
      <button
        type="button"
        aria-label="Select"
        tabIndex={-1}
        className="pointer-events-auto absolute rounded-full transition-colors active:bg-black/10"
        style={{
          left: wheel.x - wheel.centre,
          top: wheel.y - wheel.centre,
          width: wheel.centre * 2,
          height: wheel.centre * 2,
        }}
        {...controls.centre}
      />

      <button
        type="button"
        aria-pressed={!muted}
        onClick={toggleMuted}
        className="pointer-events-auto fixed right-gutter top-6 font-label text-sm uppercase tracking-wider text-ink-muted underline-offset-4 hover:underline md:hidden"
      >
        sound: {muted ? "off" : "on"}
      </button>

      {/* Desktop: the same corners as the camera page. */}
      <div className="fixed bottom-[4.2dvh] left-[3.8vw] flex items-baseline gap-[1.2em] max-md:hidden">
        <a href={site.spotify} target="_blank" rel="noopener noreferrer" className={`${LINK} underline hover:text-blue`}>
          follow me on spotify
        </a>
        <button
          type="button"
          aria-pressed={!muted}
          onClick={toggleMuted}
          className={`${LINK} cursor-pointer transition-colors ${muted ? "text-ink-muted hover:text-ink" : "text-blue"}`}
        >
          sound : [{muted ? "off" : "on"}]
        </button>
      </div>
      <HomeLink className={`${LINK} fixed bottom-[4.2dvh] right-[7.9vw] hover:text-blue max-md:hidden`}>[go back]</HomeLink>
    </div>
  );
}
