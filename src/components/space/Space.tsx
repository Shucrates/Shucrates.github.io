"use client";

import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BagSpin, CLOSING_SCALE } from "@/components/hero/BagSpin";
import { launchOnClick } from "@/components/stage/ObjectStage";
import { stages } from "@/components/stage/Stages";
import { useMedia } from "@/components/stage/useMedia";
import { useBackSteps } from "@/components/useBackSteps";
import type { SpaceObject } from "@/content/objects";
import { site } from "@/content/site";
import { ObjectLink } from "./ObjectLink";
import { ScrambleText } from "@/components/hero/ScrambleText";
import { Links } from "@/components/hero/Links";

type Props = {
  /** Already sorted by `order`, so DOM (and tab) order follows [n]. */
  objects: SpaceObject[];
  /** Where the bag is (viewport px); objects are thrown out of it. `null` shows them in place. */
  origin: Point | null;
  /** The bag is still on its way to its spot above [close bag]; it's hidden until it lands. */
  bagArriving: boolean;
  /** The bag was closed and every object is back in it. */
  onClosed: () => void;
};

export type Point = { x: number; y: number };

const pad = (n: number) => String(n).padStart(2, "0");

const REVEAL = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const;
const THROW_DURATION = 1.1;
const THROW_STAGGER = 0.07;
const PACK_DURATION = 0.8;
const PACK_STAGGER = 0.05;
/** How far above its path an object rises before dropping into place, in px. */
const THROW_ARC = 90;

type Offset = { x: number; y: number; rotate: number };
type Keyframes = { animate: TargetAndTransition; transition: Transition };

/** Keyframes from the bag's mouth to the object's slot: up out of the bag, then down into place. */
function throwFrom({ x, y, rotate }: Offset, i: number): Keyframes {
  const delay = i * THROW_STAGGER;
  return {
    animate: {
      x: [x, 0],
      y: [y, Math.min(y, 0) - THROW_ARC, 0],
      rotate: [rotate, 0],
      scale: [0.2, 1],
      opacity: [0, 1],
    },
    transition: {
      x: { duration: THROW_DURATION, ease: [0.3, 0.7, 0.4, 1], delay },
      y: {
        duration: THROW_DURATION,
        times: [0, 0.45, 1],
        ease: ["easeOut", "easeIn"],
        delay,
      },
      rotate: { duration: THROW_DURATION, ease: "easeOut", delay },
      scale: { duration: THROW_DURATION * 0.6, ease: "easeOut", delay },
      opacity: { duration: 0.2, delay },
    },
  };
}

/** The throw played backwards: up off its slot, over and down into the bag's mouth. */
function packInto({ x, y, rotate }: Offset, delay: number): Keyframes {
  return {
    animate: {
      x: [0, x],
      y: [0, Math.min(y, 0) - THROW_ARC, y],
      rotate: [0, rotate],
      scale: [1, 0.2],
      opacity: [1, 1, 0],
    },
    transition: {
      x: { duration: PACK_DURATION, ease: [0.6, 0, 0.7, 0.3], delay },
      y: {
        duration: PACK_DURATION,
        times: [0, 0.5, 1],
        ease: ["easeOut", "easeIn"],
        delay,
      },
      rotate: { duration: PACK_DURATION, ease: "easeIn", delay },
      scale: { duration: PACK_DURATION, ease: "easeIn", delay },
      opacity: { duration: PACK_DURATION, times: [0, 0.85, 1], delay },
    },
  };
}

/** A slot's centre, and how far it spins on its way in or out of the bag. */
type Slot = Point & { rotate: number };

/** Each slot's offset from `point`. */
function offsetsFrom(point: Point, slots: Record<string, Slot>): Record<string, Offset> {
  return Object.fromEntries(
    Object.entries(slots).map(([id, slot]) => [id, { x: point.x - slot.x, y: point.y - slot.y, rotate: slot.rotate }]),
  );
}

export function Space({ objects, origin, bagArriving, onClosed }: Props) {
  // Shared by objects and the index, so hovering either behaves the same.
  const [active, setActive] = useState<string | null>(null);

  const [intro] = useState(() => origin !== null);
  // Hovering only retitles the space once the title has been typed.
  const [ready, setReady] = useState(!intro);
  const slots = useRef<Record<string, HTMLLIElement | null>>({});
  // Each slot's distance from the bag's mouth, measured before the throw.
  const [offsets, setOffsets] = useState<Record<string, Offset> | null>(null);
  // Slot centres when the bag starts closing.
  const [packFrom, setPackFrom] = useState<Record<string, Slot> | null>(null);
  const [packPoint, setPackPoint] = useState<Point | null>(null);
  // The bag and [close bag] act as one control: hovering either wakes both.
  const [bagActive, setBagActive] = useState(false);
  const bag = useRef<HTMLButtonElement>(null);
  // Phones show one object at a time, swiped through; the one in view plays its hover animation.
  // It loops: the objects are reordered (CSS `order`) so the current one always sits in the middle
  // slot with others either side, and the row jumps back to that slot each time a swipe settles.
  const phone = useMedia("(max-width: 767px)");
  const carousel = useRef<HTMLUListElement>(null);
  const middle = Math.floor(objects.length / 2);
  const [base, setBase] = useState(0);
  // Slots moved from the middle mid-swipe, so the name changes as soon as the next object is in view.
  const [moved, setMoved] = useState(0);
  const wrap = (i: number) => ((i % objects.length) + objects.length) % objects.length;
  const current = wrap(base + moved);
  const slotOf = (i: number) => wrap(i - base + middle);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const go = (by: number) => {
    const list = carousel.current;
    if (list) list.scrollTo({ left: (middle + by) * list.clientWidth, behavior: "smooth" });
  };
  const onCarouselScroll = (list: HTMLUListElement) => {
    const by = Math.round(list.scrollLeft / list.clientWidth) - middle;
    setMoved(by);
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      if (by === 0) return;
      setBase((b) => wrap(b + by));
      setMoved(0);
    }, 140);
  };
  // Back to the middle slot (now the new current object) without animating; first run is before the throw measures slots.
  useLayoutEffect(() => {
    const list = carousel.current;
    if (list && phone) list.scrollLeft = middle * list.clientWidth;
  }, [base, phone, middle]);
  const hidden = { opacity: 0, y: 24 };
  const shown = { opacity: 1, y: 0 };

  const measure = () => {
    const measured: Record<string, Slot> = {};
    for (const object of objects) {
      const rect = slots.current[object.id]?.getBoundingClientRect();
      if (rect) {
        measured[object.id] = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          rotate: (Math.random() - 0.5) * 50,
        };
      }
    }
    return measured;
  };

  // 3D objects are drawn on their own canvases, so they fade in through their stores instead.
  useLayoutEffect(() => {
    const stores = Object.values(stages).map((stage) => stage.store);
    if (intro) stores.forEach((store) => store.set({ presence: 0 }));
    return () => stores.forEach((store) => store.set({ presence: 1 }));
  }, [intro]);

  useLayoutEffect(() => {
    if (!intro || !origin) return;
    // Slots can only be measured once laid out, so this has to set state from the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffsets(offsetsFrom(origin, measure()));
    // Measured once, at the moment the bag opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const packing = packFrom && packPoint ? offsetsFrom(packPoint, packFrom) : null;

  // Timed rather than waiting on the animations, which don't all report back (e.g. after
  // returning from a section). A beat longer so the last object is seen going in.
  const packStarted = packing !== null;
  useEffect(() => {
    if (!packStarted) return;
    const ms = (PACK_DURATION + (objects.length - 1) * PACK_STAGGER + 0.25) * 1000;
    const timeout = setTimeout(onClosed, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms);
    return () => clearTimeout(timeout);
    // Once per close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packStarted]);

  const motionFor = (id: string, i: number): Keyframes | null => {
    if (packing?.[id]) return packInto(packing[id], (objects.length - 1 - i) * PACK_STAGGER);
    if (intro && offsets?.[id]) return throwFrom(offsets[id], i);
    return null;
  };

  // The index says what each object holds; the title names the object itself.
  const label = ready ? objects.find((object) => object.id === (phone ? objects[current]?.id : active))?.name : undefined;
  const title = label ? `shubham’s [${label}]` : site.spaceTitle;
  /** "shubham’s [" stays put; only the word in brackets scrambles. */
  const keep = site.spaceTitle.indexOf("[") + 1;
  const closing = packFrom !== null;
  const settled = offsets || !intro;
  const shownId = phone ? (ready && !closing ? objects[current]?.id ?? null : null) : active;

  const close = () => {
    const rect = bag.current?.getBoundingClientRect();
    if (!rect || closing) return;
    setActive(null);
    setPackFrom(measure());
    // The bag grows from its bottom edge; aim for its mouth once it has.
    setPackPoint({
      x: rect.left + rect.width / 2,
      y: rect.bottom - rect.height * CLOSING_SCALE * 0.6,
    });
  };

  // The browser's back button closes the bag.
  useBackSteps("bag", closing ? 0 : 1, close);

  const activeHandlers = (id: string) => (isActive: boolean) =>
    setActive((current) => (isActive ? id : current === id ? null : current));

  const index = (
    <ul className="inline-flex flex-wrap justify-center gap-x-[0.3em] gap-y-1">
      {objects.map((object, i) => {
        const onActiveChange = activeHandlers(object.id);
        return (
          <li key={object.id} className="flex gap-[0.3em]">
            {i > 0 && <span aria-hidden>/</span>}
            <Link
              href={`/${object.section}`}
              onClick={launchOnClick(object.interaction && stages[object.interaction])}
              onPointerEnter={() => onActiveChange(true)}
              onPointerLeave={() => onActiveChange(false)}
              onFocus={() => onActiveChange(true)}
              onBlur={() => onActiveChange(false)}
              className={`underline-offset-4 hover:text-blue ${shownId === object.id ? "text-blue" : ""}`}
            >
              {pad(object.order)} {object.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      className={`flex flex-col gap-10 px-gutter py-6 md:relative md:block md:h-dvh md:p-0 ${
        closing ? "pointer-events-none" : ""
      }`}
    >
      <motion.nav
        aria-label="Index"
        className="text-center font-condensed text-lg tracking-[-0.01em] md:absolute md:inset-x-gutter md:top-[4.5dvh] md:text-[min(1.8vw,2.9dvh)]"
        initial={intro ? hidden : false}
        animate={closing ? { opacity: 0 } : settled ? shown : undefined}
        transition={closing ? { duration: 0.3 } : { ...REVEAL, delay: THROW_DURATION }}
      >
        {index}
      </motion.nav>

      {/* Desktop: objects sit at their config x/y around the title, centred on the page between
          the index and the bottom bar (both pinned, so neither pushes it off centre). Mobile: a swipeable row, one object at a time. */}
      <section
        aria-label="Portfolio sections"
        className="flex flex-col gap-6 [--object-unit:48vw] md:absolute md:inset-x-gutter md:top-[12dvh] md:bottom-[12dvh] md:block md:[container-type:size] md:[--object-unit:min(12cqw,22cqh)]"
      >
        <motion.div
          className="text-center md:absolute md:inset-x-0 md:top-1/2 md:-translate-y-1/2"
          animate={{ opacity: closing ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="font-condensed text-[12vw] leading-none tracking-[-0.01em] text-blue md:text-[min(7.5cqw,17cqh)]">
            {/* Waits for the opened bag to tuck itself away before scrambling in. */}
            {(!intro || !bagArriving) && (
              <ScrambleText text={title} play={intro} keep={keep} duration={0.5} onSettled={() => setReady(true)} />
            )}
          </h1>
        </motion.div>
        <ul
          ref={carousel}
          onScroll={(event) => phone && onCarouselScroll(event.currentTarget)}
          className="-mx-gutter flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:contents"
        >
          {objects.map((object, i) => {
            const keyframes = motionFor(object.id, i);
            return (
              <motion.li
                key={object.id}
                ref={(element) => {
                  slots.current[object.id] = element;
                }}
                initial={intro ? { opacity: 0 } : false}
                {...keyframes}
                onUpdate={(latest) => {
                  if (object.interaction)
                    stages[object.interaction].store.set({
                      presence: Number(latest.opacity ?? 1),
                    });
                }}
                // Above the camera's 3D canvas (z-10) so labels stay readable.
                className="relative z-[11] flex w-full shrink-0 snap-center justify-center py-4 md:w-auto md:py-0 md:absolute md:top-(--y) md:left-(--x) md:-translate-x-1/2 md:-translate-y-1/2"
                style={
                  {
                    "--x": `${object.x}%`,
                    "--y": `${object.y}%`,
                    order: phone ? slotOf(i) : undefined,
                  } as React.CSSProperties
                }
              >
                <ObjectLink object={object} active={shownId === object.id} onActiveChange={activeHandlers(object.id)} />
              </motion.li>
            );
          })}
        </ul>
        <motion.div
          className="flex items-center justify-center gap-6 font-condensed text-3xl leading-none tracking-[-0.01em] md:hidden"
          animate={{ opacity: closing ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <button type="button" aria-label="Previous object" onClick={() => go(-1)} className="min-h-11 min-w-11">
            ←
          </button>
          <span aria-live="polite" className="min-w-[6em] text-center">
            {objects[current]?.name}
          </span>
          <button type="button" aria-label="Next object" onClick={() => go(1)} className="min-h-11 min-w-11">
            →
          </button>
        </motion.div>
      </section>

      <motion.div
        className="flex flex-col-reverse items-center gap-8 md:absolute md:inset-x-gutter md:bottom-[5dvh] md:flex-row md:items-end md:justify-between"
        initial={intro ? hidden : false}
        animate={settled ? shown : undefined}
        transition={{ ...REVEAL, delay: THROW_DURATION }}
      >
        <motion.nav
          aria-label="Links"
          className="md:pl-[1.4%]"
          animate={{ opacity: closing ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Links />
        </motion.nav>
        {/* The bag sits on [close bag]. */}
        <div
          className="flex flex-col items-center gap-1 md:pr-[3%]"
          onPointerEnter={() => setBagActive(true)}
          onPointerLeave={() => setBagActive(false)}
          onFocus={() => setBagActive(true)}
          onBlur={() => setBagActive(false)}
        >
          <BagSpin ref={bag} hidden={bagArriving} closing={closing} active={bagActive} onClick={close} />
          <button
            type="button"
            onClick={close}
            className={`cursor-pointer font-condensed text-3xl leading-none tracking-[-0.01em] transition-[opacity,color] duration-300 md:text-[min(2.6vw,4.2dvh)] ${
              closing ? "opacity-0" : ""
            } ${bagActive ? "text-blue" : ""}`}
          >
            [close bag]
          </button>
        </div>
      </motion.div>
    </div>
  );
}
