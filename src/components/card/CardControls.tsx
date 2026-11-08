"use client";

import { animate, AnimatePresence, motion as fm } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useGoHome } from "@/components/HomeLink";
import { useStage, type Shift } from "@/components/stage/store";
import { site } from "@/content/site";
import { cardStore } from "./stage";

/** Radians of turn per pixel dragged. */
const TURN_PER_PX = Math.PI / 360;
const MAX_TILT = 1.1;
/** How quickly the card catches up with the pointer while dragged (per second). */
const FOLLOW = 18;
/** How quickly a released spin slows down (per second); lower swivels longer. */
const FRICTION = 1.6;
/** Spring that brings the tilt back to level after letting go. */
const TILT_SPRING = { stiffness: 26, damping: 7 };
const KEY_NUDGE = 4;
/** Most the card turns towards the pointer while hovered, in radians, with it at an edge. */
const HOVER_TURN = 0.45;
const HOVER_TILT = 0.35;
/** How quickly the card follows the hovering pointer (per second). */
const HOVER_FOLLOW = 7;
/** A press that moves less than this (px) is a click: it opens or closes the card. */
const CLICK_PX = 5;
const MOBILE = "(max-width: 767px)";

/** Opened, the card shrinks to one side so the links fit beside it (below it on a phone). */
function openShift(): Shift {
  if (matchMedia(MOBILE).matches) return { x: 0, y: -window.innerHeight * 0.22, scale: 0.7 };
  return { x: -window.innerWidth * 0.18, y: 0, scale: 0.6 };
}

function moveShift(to: Shift | null) {
  const from = cardStore.get().shift ?? { x: 0, y: 0, scale: 1 };
  const target = to ?? { x: 0, y: 0, scale: 1 };
  animate(0, 1, {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1],
    onUpdate: (t) =>
      cardStore.set({ shift: { x: from.x + (target.x - from.x) * t, y: from.y + (target.y - from.y) * t, scale: from.scale + (target.scale - from.scale) * t } }),
    onComplete: () => !to && cardStore.set({ shift: null }),
  });
}

/**
 * The docked card: drag to turn it any way. Let go and it keeps swivelling with
 * the speed you gave it, slowing to a stop wherever it ends up.
 */
export function CardControls() {
  const goHome = useGoHome();
  // Where the 3D card is on screen; null until it has landed.
  const layout = useStage(cardStore, (s) => s.layout);
  const drag = useRef<{ x: number; y: number; spin: number; tilt: number; moved: number } | null>(null);
  // A mouse over the card, -0.5 to 0.5 from its middle: the card leans towards it, like the posters.
  // `base` is the spin it leans from; `leaving` eases it back there once the mouse is gone.
  const hover = useRef<{ x: number; y: number; base: number; leaving: boolean } | null>(null);
  // Turning to face you after a click; the lean waits until it's done.
  const turning = useRef(false);
  // Opens by itself once the card has landed: it shrinks aside and the details appear.
  const [open, setOpen] = useState(true);
  const landed = layout !== null;
  useEffect(() => {
    if (landed) moveShift(openShift());
  }, [landed]);
  const toggle = (next = !open) => {
    setOpen(next);
    moveShift(next ? openShift() : null);
    // Opening turns the card to face you, so the photo side sits next to the links.
    if (next) {
      const { spin } = cardStore.get();
      const to = 2 * Math.PI * Math.round(spin / (2 * Math.PI));
      hover.current = null;
      turning.current = true;
      animate(spin, to, {
        duration: 0.6,
        ease: "easeInOut",
        onUpdate: (value) => cardStore.set({ spin: value }),
        onComplete: () => (turning.current = false),
      });
    }
  };
  // Pointer targets while dragging, and velocities (radians/s) once released.
  const motion = useRef({ spin: 0, tilt: 0, spinVelocity: 0, tiltVelocity: 0, lastX: 0, lastTime: 0 });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!open) return goHome();
      setOpen(false);
      moveShift(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goHome]);
  // Re-aim the open card when the window changes size.
  useEffect(() => {
    if (!open) return;
    const onResize = () => cardStore.set({ shift: openShift() });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  useEffect(() => {
    const m = motion.current;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { spin, tilt } = cardStore.get();
      if (drag.current) {
        const k = 1 - Math.exp(-FOLLOW * dt);
        cardStore.set({ spin: spin + (m.spin - spin) * k, tilt: tilt + (m.tilt - tilt) * k });
        return;
      }
      const h = hover.current;
      if (h && Math.abs(m.spinVelocity) < 0.05) {
        const k = 1 - Math.exp(-HOVER_FOLLOW * dt);
        const to = { spin: h.base + h.x * HOVER_TURN, tilt: h.y * HOVER_TILT };
        cardStore.set({ spin: spin + (to.spin - spin) * k, tilt: tilt + (to.tilt - tilt) * k });
        m.tiltVelocity = 0;
        if (h.leaving && Math.abs(to.spin - spin) < 0.001 && Math.abs(to.tilt - tilt) < 0.001) hover.current = null;
        return;
      }
      if (Math.abs(m.spinVelocity) < 0.01 && Math.abs(tilt) < 0.001 && Math.abs(m.tiltVelocity) < 0.01) return;
      m.spinVelocity *= Math.exp(-FRICTION * dt);
      m.tiltVelocity += (-TILT_SPRING.stiffness * tilt - TILT_SPRING.damping * m.tiltVelocity) * dt;
      cardStore.set({ spin: spin + m.spinVelocity * dt, tilt: tilt + m.tiltVelocity * dt });
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      // Leaving: drop whole turns so the flight home unwinds at most half a turn.
      const { spin, tilt } = cardStore.get();
      const from = spin - 2 * Math.PI * Math.round(spin / (2 * Math.PI));
      cardStore.set({ spin: from, shift: null });
      animate(from, 0, { duration: 0.9, ease: "easeInOut", onUpdate: (value) => cardStore.set({ spin: value }) });
      animate(tilt, 0, { duration: 0.9, ease: "easeInOut", onUpdate: (value) => cardStore.set({ tilt: value }) });
    };
  }, []);

  if (!layout) return null;
  const m = motion.current;
  const { card } = layout;
  return (
    <>
    <div
      role="button"
      aria-label="Shubham's NFC visiting card. Click or press Enter to show contact details; drag, or use the arrow keys, to turn it."
      aria-expanded={open}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          m.spinVelocity = 0;
          return toggle();
        }
        const nudge = { ArrowLeft: -KEY_NUDGE, ArrowRight: KEY_NUDGE }[event.key];
        if (nudge === undefined) return;
        event.preventDefault();
        m.spinVelocity += nudge;
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        hover.current = null;
        const { spin, tilt } = cardStore.get();
        drag.current = { x: event.clientX, y: event.clientY, spin, tilt, moved: 0 };
        Object.assign(m, { spin, tilt, spinVelocity: 0, tiltVelocity: 0, lastX: event.clientX, lastTime: event.timeStamp });
      }}
      onPointerMove={(event) => {
        const d = drag.current;
        if (!d) {
          // Not while it's still swivelling from a throw or turning to face you.
          if (event.pointerType !== "mouse" || turning.current || Math.abs(m.spinVelocity) > 0.05) return;
          const box = event.currentTarget.getBoundingClientRect();
          const base = hover.current?.base ?? cardStore.get().spin;
          hover.current = { x: (event.clientX - box.left) / box.width - 0.5, y: (event.clientY - box.top) / box.height - 0.5, base, leaving: false };
          return;
        }
        d.moved = Math.max(d.moved, Math.hypot(event.clientX - d.x, event.clientY - d.y));
        m.spin = d.spin + (event.clientX - d.x) * TURN_PER_PX;
        m.tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, d.tilt + (event.clientY - d.y) * TURN_PER_PX));
        // Smoothed so one jittery event doesn't decide the release speed.
        const dt = Math.max(1, event.timeStamp - m.lastTime) / 1000;
        const velocity = ((event.clientX - m.lastX) * TURN_PER_PX) / dt;
        m.spinVelocity = m.spinVelocity * 0.6 + velocity * 0.4;
        m.lastX = event.clientX;
        m.lastTime = event.timeStamp;
      }}
      onPointerUp={(event) => {
        const d = drag.current;
        if (!d) return;
        drag.current = null;
        if (d.moved < CLICK_PX) {
          m.spinVelocity = 0;
          return toggle();
        }
        // Held still before letting go: no throw.
        if (event.timeStamp - m.lastTime > 80) m.spinVelocity = 0;
      }}
      onPointerCancel={() => (drag.current = null)}
      onPointerLeave={() => {
        if (hover.current) Object.assign(hover.current, { x: 0, y: 0, leaving: true });
      }}
      className="fixed z-50 cursor-pointer touch-none rounded-[2%] active:cursor-grabbing"
      style={card}
    />
    <AnimatePresence>
      {open && (
        <fm.nav
          aria-label="Contact details"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
          className="fixed z-50 w-[min(26rem,calc(100vw-2*var(--spacing-gutter)))] max-md:bottom-4 max-md:left-gutter max-md:right-gutter max-md:w-auto max-md:overflow-y-auto"
          style={
            typeof window !== "undefined" && matchMedia(MOBILE).matches
              ? { top: card.top + card.height + 28 }
              : { left: card.left + card.width + 56, top: card.top + card.height / 2, translate: "0 -50%" }
          }
        >
          <p className="mb-4 font-label text-xs uppercase tracking-wider text-ink-muted">say hello</p>
          <ul>
            {site.contact.map((link, i) => (
              <fm.li
                key={link.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + i * 0.04 } }}
              >
                <a
                  href={link.href}
                  {...(link.href.startsWith("http") || link.href.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-baseline justify-between gap-6 border-t border-line py-3 last:border-b"
                >
                  <span className="font-display text-2xl tracking-[-0.04em] transition-colors group-hover:text-accent md:text-3xl">{link.label}</span>
                  <span className="truncate text-sm text-ink-muted">{link.value} ↗</span>
                </a>
              </fm.li>
            ))}
          </ul>
        </fm.nav>
      )}
    </AnimatePresence>
    </>
  );
}
