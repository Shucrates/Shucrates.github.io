"use client";

import { animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStage } from "@/components/stage/store";
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

/**
 * The docked card: drag to turn it any way. Let go and it keeps swivelling with
 * the speed you gave it, slowing to a stop wherever it ends up.
 */
export function CardControls() {
  const router = useRouter();
  // Where the 3D card is on screen; null until it has landed.
  const layout = useStage(cardStore, (s) => s.layout);
  const drag = useRef<{ x: number; y: number; spin: number; tilt: number } | null>(null);
  // Pointer targets while dragging, and velocities (radians/s) once released.
  const motion = useRef({ spin: 0, tilt: 0, spinVelocity: 0, tiltVelocity: 0, lastX: 0, lastTime: 0 });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

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
      cardStore.set({ spin: from });
      animate(from, 0, { duration: 0.9, ease: "easeInOut", onUpdate: (value) => cardStore.set({ spin: value }) });
      animate(tilt, 0, { duration: 0.9, ease: "easeInOut", onUpdate: (value) => cardStore.set({ tilt: value }) });
    };
  }, []);

  if (!layout) return null;
  const m = motion.current;
  return (
    <div
      role="img"
      aria-label="Shubham's NFC visiting card. Drag, or use the arrow keys, to turn it."
      tabIndex={0}
      onKeyDown={(event) => {
        const nudge = { ArrowLeft: -KEY_NUDGE, ArrowRight: KEY_NUDGE }[event.key];
        if (nudge === undefined) return;
        event.preventDefault();
        m.spinVelocity += nudge;
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const { spin, tilt } = cardStore.get();
        drag.current = { x: event.clientX, y: event.clientY, spin, tilt };
        Object.assign(m, { spin, tilt, spinVelocity: 0, tiltVelocity: 0, lastX: event.clientX, lastTime: event.timeStamp });
      }}
      onPointerMove={(event) => {
        const d = drag.current;
        if (!d) return;
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
        if (!drag.current) return;
        drag.current = null;
        // Held still before letting go: no throw.
        if (event.timeStamp - m.lastTime > 80) m.spinVelocity = 0;
      }}
      onPointerCancel={() => (drag.current = null)}
      className="fixed z-50 cursor-grab touch-none rounded-[2%] active:cursor-grabbing"
      style={layout.card}
    />
  );
}
