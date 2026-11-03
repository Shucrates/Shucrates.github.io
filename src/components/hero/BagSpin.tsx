"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/** Frames in /hero/bag-spin.webp, laid side by side: the bag at 0°, 45°, ... 315°. */
const FRAMES = 8;
const FRAME_RATIO = 225 / 320;
const FRAME_MS = 140;
/** How much bigger the bag gets when clicked. */
export const CLOSING_SCALE = 1.6;

type Props = {
  /** Kept in layout but invisible, while the opened bag flies into this spot. */
  hidden: boolean;
  /** Enlarged and facing front, ready to take the objects back. */
  closing: boolean;
  /** It or [close bag] is hovered or focused: grows a little and turns. */
  active: boolean;
  onClick: () => void;
  ref?: React.Ref<HTMLButtonElement>;
};

/** The tote, sitting still; it turns while active, and clicking packs the space back into it. */
export function BagSpin({ hidden, closing, active, onClick, ref }: Props) {
  const [frame, setFrame] = useState(0);
  const spinning = active && !closing;

  useEffect(() => {
    if (!spinning || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => setFrame((current) => (current + 1) % FRAMES), FRAME_MS);
    return () => {
      clearInterval(interval);
      setFrame(0);
    };
  }, [spinning]);

  return (
    <motion.button
      ref={ref}
      data-bag-spot
      type="button"
      aria-label="Close the bag"
      onClick={onClick}
      initial={false}
      animate={{
        scale: closing ? CLOSING_SCALE : spinning ? 1.12 : 1,
        opacity: hidden ? 0 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 22,
        opacity: { duration: 0.2 },
      }}
      className="relative h-[clamp(64px,11dvh,110px)] origin-bottom cursor-pointer overflow-hidden"
      style={{ aspectRatio: FRAME_RATIO }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a sprite strip, stepped through by hand */}
      <img
        src="/hero/bag-spin.webp"
        alt=""
        draggable={false}
        className="absolute top-0 left-0 h-full max-w-none"
        style={{
          width: `${FRAMES * 100}%`,
          transform: `translateX(-${(frame * 100) / FRAMES}%)`,
        }}
      />
    </motion.button>
  );
}
