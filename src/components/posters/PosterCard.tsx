"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { posterImage, type Poster } from "@/content/posters";

/** Most the card turns, in degrees, with the pointer at its edge. */
const TILT = 16;
const SPRING = { stiffness: 180, damping: 18, mass: 0.6 };

type Props = {
  poster: Poster;
  /** Shared with the poster's tile in the grid, so opening it grows out of the tile. */
  layoutId?: string;
  /** Sizes the card; its aspect ratio is the poster's. */
  className?: string;
};

/**
 * A poster as a glossy card you can turn: it tilts towards the pointer (or a dragging finger),
 * and a thin gloss and a soft highlight slide across it as it does, like light on a laminated
 * print. Both are faint white only (no blend modes), so the poster's own colours stay true;
 * they fade in while it's handled and out at rest. Still under reduced motion.
 */
export function PosterCard({ poster, layoutId, className = "" }: Props) {
  const reducedMotion = useReducedMotion();
  // Pointer across the card, 0–1; 0.5 is the middle.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const x = useSpring(px, SPRING);
  const y = useSpring(py, SPRING);
  const rotateY = useTransform(x, [0, 1], [-TILT, TILT]);
  const rotateX = useTransform(y, [0, 1], [TILT, -TILT]);
  const glareX = useTransform(x, (v) => `${v * 100}%`);
  const glareY = useTransform(y, (v) => `${v * 100}%`);
  const sweep = useTransform(x, (v) => `${(v - 0.5) * 120 + 50}%`);
  const shadowX = useTransform(x, (v) => (0.5 - v) * 40);
  const shadowY = useTransform(y, (v) => (0.5 - v) * 40 + 30);

  // How far from rest the card is turned, 0–1: the gloss only shows while it's handled.
  const lit = useTransform([x, y], ([a, b]: number[]) => Math.min(1, Math.hypot(a - 0.5, b - 0.5) * 3));
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 45%)`;
  const shine = useMotionTemplate`linear-gradient(115deg, transparent calc(${sweep} - 12%), rgba(255,255,255,0.12) ${sweep}, transparent calc(${sweep} + 12%))`;
  const shadow = useMotionTemplate`${shadowX}px ${shadowY}px 60px rgba(0,0,0,0.28)`;

  const move = (event: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const box = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - box.left) / box.width);
    py.set((event.clientY - box.top) / box.height);
  };
  const rest = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      layoutId={layoutId}
      onPointerMove={move}
      onPointerLeave={rest}
      onPointerCancel={rest}
      className={`relative touch-none select-none rounded-[6px] [transform-style:preserve-3d] ${className}`}
      style={{
        aspectRatio: `${poster.width} / ${poster.height}`,
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
        transformPerspective: 1100,
        boxShadow: shadow,
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[6px] bg-ink">
        {/* The thumbnail shows at once (it's cached from the grid); the large image fades in over it. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- already sized in public/posters */}
        <img src={posterImage(poster, "thumb")} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element -- already sized in public/posters */}
        <img
          src={posterImage(poster)}
          alt={`${poster.title}, ${poster.kind.toLowerCase()}`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {/* A thin band of gloss that slides across as it turns, and a soft highlight under the pointer. */}
        <motion.div aria-hidden className="absolute inset-0" style={{ backgroundImage: shine, opacity: reducedMotion ? 0 : lit }} />
        <motion.div aria-hidden className="absolute inset-0" style={{ backgroundImage: glare, opacity: reducedMotion ? 0 : lit }} />
        <div aria-hidden className="absolute inset-0 rounded-[6px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]" />
      </div>
    </motion.div>
  );
}
