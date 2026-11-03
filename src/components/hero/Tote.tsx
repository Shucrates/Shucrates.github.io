"use client";

import { useAnimate } from "framer-motion";
import { useEffect } from "react";
import type { Point } from "@/components/space/Space";

/** Where the bag's mouth is, as a fraction of its image. Objects come out here. */
const MOUTH = { x: 0.5, y: 0.4 };
const EASE = [0.22, 1, 0.36, 1] as const;
/** Source size of the open bag, in px. */
const SIZE = { width: 367, height: 618 };

type Props = {
  /** The bag's box in the hero photo, to grow out of. */
  from: DOMRect;
  /** The bag is open at `mouth` (viewport px); objects can fly out. */
  onMouth: (mouth: Point) => void;
  /** The bag has shrunk into its spot in the space; unmount it. */
  onDone: () => void;
};

/** The tote from the hero photo, brought up close: it grows, empties, then tucks itself away in the corner. */
export function Tote({ from, onMouth, onDone }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const bag = scope.current.querySelector<HTMLElement>("[data-tote]")!;
    let cancelled = false;
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = (seconds: number) => (instant ? 0 : seconds);
    /** The transform that puts the bag over `rect`. */
    const over = (rect: DOMRect) => {
      const to = bag.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - (to.left + to.width / 2),
        y: rect.top + rect.height / 2 - (to.top + to.height / 2),
        scale: rect.height / to.height,
      };
    };

    (async () => {
      const start = over(from);
      await animate(
        bag,
        { x: [start.x, 0], y: [start.y, 0], scale: [start.scale, 1], opacity: [0, 1] },
        { duration: t(0.7), ease: EASE, opacity: { duration: t(0.2) } },
      );
      if (cancelled) return;
      const rect = bag.getBoundingClientRect();
      onMouth({ x: rect.left + rect.width * MOUTH.x, y: rect.top + rect.height * MOUTH.y });
      await new Promise((resolve) => setTimeout(resolve, t(0.9) * 1000));
      if (cancelled) return;
      // Shrinks into the still bag above [close bag] (see BagSpin).
      const spot = document.querySelector("[data-bag-spot]")?.getBoundingClientRect();
      await animate(
        bag,
        spot ? { ...over(spot), opacity: 0 } : { opacity: 0 },
        { duration: t(0.7), ease: EASE, opacity: { duration: t(0.2), delay: t(0.5) } },
      );
      if (!cancelled) onDone();
    })();
    return () => {
      cancelled = true;
    };
    // Runs once per opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={scope} aria-hidden className="pointer-events-none fixed inset-0 z-[30] flex items-center justify-center">
      <div data-tote className="relative h-[min(64dvh,110vw)] opacity-0" style={{ aspectRatio: `${SIZE.width} / ${SIZE.height}` }}>
        {/* Plain img, warmed by the hero, so it's decoded before the bag grows in. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero/bag-open.webp" alt="" className="h-full w-full object-contain" />
      </div>
    </div>
  );
}
