"use client";

import { useEffect, useRef } from "react";
import { MEDAL } from "./geometry";
import { RIBBON_POINTS } from "./model";
import { medalStore } from "./stage";

/*
 * The medal on /achievements hangs from a hook just above the top-right of the
 * page. The ribbon is a chain of light points held at fixed spacing (so it bends
 * and folds like cloth but doesn't stretch), with the heavy disc on the end.
 * Integrated with Verlet steps; all energy slowly leaks to the air.
 *
 * Units are model units (the medal is 1 wide), relative to the hook, y down.
 */

/** How long the ribbon "is", in metres; sets the pace of the swing (about 1.4 s a swing). */
const RIBBON_METRES = 0.4;
const GRAVITY = 9.81 / (RIBBON_METRES / MEDAL.ribbonLength);
/** Share of speed lost to the air per second; the ribbon, being light, loses more. */
const AIR = { disc: 0.55, ribbon: 1.6 };
/** Relative weights: a light ribbon and a heavy disc. */
const MASS = { ribbon: 0.04, disc: 1 };
/** Constraint passes per step; more is a less stretchy ribbon. */
const ITERATIONS = 12;
/** How much the ribbon resists bending (0 = a chain, 1 = a rod). */
const BEND = 0.04;
/** Twist about the ribbon: springiness, damping, how much sideways motion sets it off, and its limit. */
const TWIST = { stiffness: 5, damping: 2.2, coupling: 0.06, max: 0.25 };
/** While held, how quickly the disc catches up with the pointer (per second). */
const FOLLOW = 22;
/** Below this speed (units/s) for everything, the medal counts as still and the simulation sleeps. */
const REST = 0.004;
const STEP = 1 / 240;
/** Where the disc is let go from, relative to the hook: up and to the right, off the page. */
const START = { x: 1.05, y: 0.35 };

const SEGMENTS = RIBBON_POINTS - 1;
const SEGMENT = MEDAL.ribbonLength / SEGMENTS;
/** Ribbon points, then the disc's centre. */
const COUNT = RIBBON_POINTS + 1;
const DISC = COUNT - 1;

/** Hook position and scale (CSS px per model unit) for the current viewport. */
function rig(w: number, h: number) {
  const mobile = w < 768;
  const scale = mobile ? 0.42 * w : Math.min(0.32 * w, 0.5 * h);
  // About 40% of the medal hangs above the page, so the hook and the top of the ribbon are never seen.
  return { hook: { x: (mobile ? 0.72 : 0.74) * w, y: -0.4 * MEDAL.height * scale }, scale };
}

export function MedalSwing() {
  const hitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const x = new Float64Array(COUNT);
    const y = new Float64Array(COUNT);
    const inverseMass = new Float64Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      if (reduced) {
        // Hanging straight.
        y[i] = i === DISC ? MEDAL.ribbonLength + MEDAL.discDrop : i * SEGMENT;
      } else {
        // Let go from up and off the right of the page, ribbon a little slack.
        const along = i === DISC ? 1 : (i * SEGMENT) / MEDAL.ribbonLength;
        x[i] = along * START.x;
        y[i] = along * START.y;
      }
      inverseMass[i] = i === 0 ? 0 : 1 / (i === DISC ? MASS.disc : MASS.ribbon);
    }
    const px = x.slice();
    const py = y.slice();
    let twist = 0;
    let spin = 0;
    let held: { x: number; y: number; dx: number; dy: number } | null = null;
    let awake = !reduced;
    let frame = 0;
    let last = performance.now();

    /** Pulls points a and b towards `length` apart, each moving by its share of the mass. */
    const constrain = (a: number, b: number, length: number, stiffness = 1) => {
      const wa = inverseMass[a];
      const wb = inverseMass[b];
      if (wa + wb === 0) return;
      const dx = x[b] - x[a];
      const dy = y[b] - y[a];
      const d = Math.hypot(dx, dy) || 1e-9;
      const k = (((d - length) / d) * stiffness) / (wa + wb);
      x[a] += dx * k * wa;
      y[a] += dy * k * wa;
      x[b] -= dx * k * wb;
      y[b] -= dy * k * wb;
    };

    const step = (dt: number) => {
      for (let i = 1; i < COUNT; i++) {
        const keep = Math.exp(-(i === DISC ? AIR.disc : AIR.ribbon) * dt);
        const vx = (x[i] - px[i]) * keep;
        const vy = (y[i] - py[i]) * keep;
        px[i] = x[i];
        py[i] = y[i];
        x[i] += vx;
        y[i] += vy + GRAVITY * dt * dt;
      }
      const discWeight = inverseMass[DISC];
      if (held) {
        // The disc follows the pointer (within the ribbon's reach) and pulls the ribbon along.
        const reach = MEDAL.ribbonLength + MEDAL.discDrop;
        const d = Math.hypot(held.x, held.y);
        const tx = d > reach ? (held.x / d) * reach : held.x;
        const ty = d > reach ? (held.y / d) * reach : held.y;
        const k = 1 - Math.exp(-FOLLOW * dt);
        x[DISC] += (tx - x[DISC]) * k;
        y[DISC] += (ty - y[DISC]) * k;
        inverseMass[DISC] = 0;
      }
      for (let n = 0; n < ITERATIONS; n++) {
        for (let i = 0; i < SEGMENTS; i++) constrain(i, i + 1, SEGMENT);
        constrain(SEGMENTS, DISC, MEDAL.discDrop);
        for (let i = 0; i + 2 <= SEGMENTS; i++) constrain(i, i + 2, 2 * SEGMENT, BEND);
      }
      inverseMass[DISC] = discWeight;
      // Sideways motion of the disc turns it a little on the ribbon, which winds back.
      const discVx = (x[DISC] - px[DISC]) / dt;
      spin += (-TWIST.stiffness * twist - TWIST.damping * spin + discVx * TWIST.coupling) * dt;
      twist = Math.max(-TWIST.max, Math.min(TWIST.max, twist + spin * dt));
    };

    const publish = () => {
      const { hook, scale } = rig(window.innerWidth, window.innerHeight);
      const deform = [twist];
      for (let i = 0; i < COUNT; i++) deform.push(x[i], y[i]);
      medalStore.set({ dock: { x: hook.x, y: hook.y, width: scale, pitch: 0, yaw: 0, roll: 0, deform } });
      // Keep the grab area on the disc.
      const r = MEDAL.discRadius * scale * 1.25;
      const hit = hitRef.current;
      if (hit) {
        hit.style.transform = `translate(${hook.x + x[DISC] * scale - r}px, ${hook.y + y[DISC] * scale - r}px)`;
        hit.style.width = hit.style.height = `${2 * r}px`;
      }
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const elapsed = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Hold still in the start pose until the flight onto the page is over.
      if (medalStore.get().landed && awake) {
        for (let t = 0; t < elapsed; t += STEP) step(STEP);
        let fastest = Math.abs(spin);
        for (let i = 1; i < COUNT; i++) fastest = Math.max(fastest, Math.hypot(x[i] - px[i], y[i] - py[i]) / STEP);
        if (!held && fastest < REST) awake = false;
      }
      publish();
    };
    frame = requestAnimationFrame(loop);

    const toModel = (clientX: number, clientY: number) => {
      const { hook, scale } = rig(window.innerWidth, window.innerHeight);
      return { x: (clientX - hook.x) / scale, y: (clientY - hook.y) / scale };
    };
    const hit = hitRef.current!;
    const onDown = (event: PointerEvent) => {
      hit.setPointerCapture(event.pointerId);
      const at = toModel(event.clientX, event.clientY);
      held = { x: x[DISC], y: y[DISC], dx: x[DISC] - at.x, dy: y[DISC] - at.y };
      awake = true;
    };
    const onMove = (event: PointerEvent) => {
      if (!held) return;
      const at = toModel(event.clientX, event.clientY);
      held.x = at.x + held.dx;
      held.y = at.y + held.dy;
    };
    // Let go: it carries on with whatever speed it had.
    const onUp = () => (held = null);
    hit.addEventListener("pointerdown", onDown);
    hit.addEventListener("pointermove", onMove);
    hit.addEventListener("pointerup", onUp);
    hit.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(frame);
      hit.removeEventListener("pointerdown", onDown);
      hit.removeEventListener("pointermove", onMove);
      hit.removeEventListener("pointerup", onUp);
      hit.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={hitRef}
      aria-hidden
      className="fixed left-0 top-0 z-50 cursor-grab touch-none rounded-full active:cursor-grabbing"
    />
  );
}
