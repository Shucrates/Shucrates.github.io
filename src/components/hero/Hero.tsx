"use client";

import { motion, MotionConfig } from "framer-motion";
import NextImage from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { site } from "@/content/site";
import { AsciiParticles } from "./AsciiParticles";
import { Links } from "./Links";
import { ScrambleText } from "./ScrambleText";

/** Things the detection box can lock onto, as fractions of the photo (left, top, width, height), with some room around each. */
const targets = {
  face: { label: "shubham patil", box: [0.26, -0.01, 0.46, 0.31] },
  phone: { label: "shubham’s iphone", box: [0.14, 0.085, 0.22, 0.22] },
  bag: { label: "shubham’s bag", box: [0.81, 0.655, 0.23, 0.22] },
} as const;
type Target = keyof typeof targets;

const BOX_SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

/** The load-in plays once per visit; coming back from the bag the hero just fades in. */
let introPlayed = false;

type Props = {
  /** Called with the bag's on-screen box, so the opened bag can grow out of it. */
  onOpenBag: (from: DOMRect) => void;
};

/** How far the point (x, y) is from a target's box, in photo fractions; 0 when inside. */
function distance(target: Target, x: number, y: number) {
  const [left, top, width, height] = targets[target].box;
  const dx = Math.max(left - x, 0, x - (left + width));
  const dy = Math.max(top - y, 0, y - (top + height));
  return Math.hypot(dx, dy);
}

const noHover = () => matchMedia("(hover: none)").matches;

export function Hero({ onOpenBag }: Props) {
  const [intro] = useState(() => !introPlayed);
  useEffect(() => {
    introPlayed = true;
  }, []);
  /** Fades and lifts an element in, `delay` seconds into the load-in. */
  const appear = (delay: number) =>
    intro
      ? ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: EASE, delay } } as const)
      : {};

  // Touch screens can't hover, so the box rests on the bag there to show what to tap.
  const touch = useSyncExternalStore(() => () => {}, noHover, () => false);
  const resting: Target = touch ? "bag" : "face";
  const [target, setTarget] = useState<Target | null>(null);
  useEffect(() => {
    // Warm the cache so the bag opens without a flash.
    for (const src of ["/hero/bag-open.webp", "/hero/bag-spin.webp"]) new Image().src = src;
  }, []);

  const current = target ?? resting;
  // Green on Shubham and his phone; orange on the bag, the thing to click.
  const onBag = current === "bag";
  const [left, top, width, height] = targets[current].box;

  const openBag = (event: React.MouseEvent<HTMLElement>) => {
    const bag = event.currentTarget.closest("[data-photo]")?.querySelector("[data-bag]");
    if (bag) onOpenBag(bag.getBoundingClientRect());
  };

  const photo = (
    <div
      data-photo
      className="relative h-full [container-type:size]"
      style={{ aspectRatio: "851 / 1600" }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const names = Object.keys(targets) as Target[];
        setTarget(names.reduce((best, name) => (distance(name, x, y) < distance(best, x, y) ? name : best)));
      }}
      onPointerLeave={() => setTarget(null)}
    >
      <NextImage
        src="/hero/shubham.webp"
        alt="Shubham taking a mirror selfie, a tote bag over one shoulder"
        fill
        preload
        sizes="(max-width: 767px) 60vw, 40vh"
        className="object-contain"
        draggable={false}
      />

      <motion.div
        aria-hidden
        className={`pointer-events-none absolute border transition-colors duration-200 ${
          onBag ? "border-detect-bag" : "border-detect"
        }`}
        initial={intro ? { opacity: 0 } : false}
        animate={{
          left: `${left * 100}%`,
          top: `${top * 100}%`,
          width: `${width * 100}%`,
          height: `${height * 100}%`,
          opacity: 1,
        }}
        transition={{ ...BOX_SPRING, opacity: { duration: 0.4, delay: intro ? 1.2 : 0 } }}
      >
        <span
          className={`absolute right-[-1px] bottom-full text-ink px-1.5 py-px font-label text-[clamp(7px,1.3cqh,11px)] leading-tight whitespace-nowrap tracking-[0.15em] transition-colors duration-200 ${
            onBag ? "bg-detect-bag" : "bg-detect"
          }`}
        >
          {targets[current].label}
        </span>
      </motion.div>

      <button
        type="button"
        data-bag
        aria-label="Open Shubham’s bag"
        onClick={openBag}
        className="absolute cursor-pointer"
        style={{
          left: `${targets.bag.box[0] * 100}%`,
          top: `${targets.bag.box[1] * 100}%`,
          width: `${targets.bag.box[2] * 100}%`,
          height: `${targets.bag.box[3] * 100}%`,
        }}
      />

      {/* Desktop hint, drawn relative to the photo so the arrow always finds the bag. */}
      <motion.svg
        {...appear(1.1)}
        aria-hidden
        viewBox="0 0 200 80"
        fill="none"
        className="pointer-events-none absolute top-[73%] left-[100.5%] hidden h-[10cqh] w-[25cqh] stroke-ink md:block"
      >
        <path d="M196 78C178 30 96-2 6 9" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <path d="M17 2 6 9l10 8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </motion.svg>
      <motion.button
        {...appear(1.1)}
        type="button"
        onClick={openBag}
        className="absolute top-[86%] left-[116%] hidden cursor-pointer font-condensed text-[5.6cqh] tracking-[-0.03em] leading-none whitespace-nowrap md:block"
      >
        click on the bag to explore
      </motion.button>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label="Introduction"
        className="relative flex min-h-dvh flex-col overflow-x-clip px-gutter pt-4 pb-6 md:block md:h-dvh md:p-0"
      >
        <AsciiParticles
          src="/hero/ascii.png"
          assemble={intro}
          className="pointer-events-none absolute inset-y-0 left-0 z-[2] h-full w-[45vw] md:top-[2.5%] md:left-[19%] md:h-[97.5%] md:w-[28%]"
        />

        <h1 className="relative z-[1] text-center font-condensed text-[18vw] leading-[0.8] tracking-[-0.03em] text-blue uppercase md:absolute md:inset-x-0 md:top-[5%] md:text-[min(18vw,34dvh)]">
          <ScrambleText text={site.name} play={intro} delay={0.3} />
        </h1>

        <motion.div
          {...appear(0.9)}
          className="relative z-[1] mt-3 flex justify-between font-condensed text-[5vw] tracking-[-0.03em] text-blue md:absolute md:right-[3%] md:left-[4.9%] md:top-[31.5%] md:mt-0 md:text-[min(2.4vw,3.6dvh)]"
        >
          <p>{site.role}</p>
          <p>currently: {site.currently}</p>
        </motion.div>

        <motion.div
          {...appear(0.1)}
          className="relative z-[3] mx-auto mt-4 h-[118vw] md:absolute md:bottom-0 md:left-1/2 md:mt-0 md:h-[79%] md:-translate-x-[48%]"
        >
          {photo}
        </motion.div>

        <motion.p
          {...appear(1.1)}
          className="mt-6 text-center font-display text-2xl tracking-[-0.05em] md:hidden"
        >
          tap the bag to explore
        </motion.p>

        <motion.nav
          {...appear(1.1)}
          aria-label="Links"
          className="mt-8 md:absolute md:bottom-[4.5%] md:left-[3.4%] md:mt-0"
        >
          <Links />
        </motion.nav>
      </section>
    </MotionConfig>
  );
}
