"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { posterImage, type Poster } from "@/content/posters";
import { trapTab } from "@/components/mac/focus";
import { PosterCard } from "./PosterCard";

const pad = (n: number) => String(n).padStart(2, "0");
const EASE = [0.22, 1, 0.36, 1] as const;

/** The open poster lives in the URL (?poster=id), so it can be linked to and Back closes it. */
const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  window.addEventListener("poster-change", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("poster-change", onChange);
  };
};
const openId = () => new URLSearchParams(window.location.search).get("poster");
const setOpenId = (id: string | null, mode: "push" | "replace") => {
  const url = id ? `?poster=${id}` : window.location.pathname;
  if (mode === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event("poster-change"));
};

/**
 * /posters: my graphic design work as a grid. Hovering a poster swaps its number for its name;
 * clicking it grows it into a card you can turn, with its story beside it. ←/→ step through,
 * Escape (or "all posters") goes back to the grid.
 */
export function PosterWall({ posters }: { posters: Poster[] }) {
  const reducedMotion = useReducedMotion();
  const id = useSyncExternalStore(subscribe, openId, () => null);
  const at = posters.findIndex((poster) => poster.id === id);
  const open = at >= 0 ? posters[at] : null;
  // Opened with a push from the grid, so closing can go back in history.
  const pushed = useRef(false);
  // The poster first opened from the grid grows out of its tile; the rest slide in.
  const [grownFrom, setGrownFrom] = useState<string | null>(null);

  const show = (poster: Poster) => {
    pushed.current = true;
    setGrownFrom(poster.id);
    setOpenId(poster.id, "push");
  };
  const step = useCallback(
    (by: number) => {
      const next = posters[at + by];
      if (next) setOpenId(next.id, "replace");
    },
    [posters, at],
  );
  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else setOpenId(null, "replace");
  }, []);

  const line: Variants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 24 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  };

  return (
    <LayoutGroup>
      {/* Has its own way back, so the site's link bar hides (see LinkBar). */}
      <div data-own-links hidden />
      <motion.div
        className="px-gutter pb-[18dvh] pt-[6dvh]"
        initial="hidden"
        animate="shown"
        variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.035 } } }}
      >
        <header className="text-center">
          <motion.h1
            variants={{ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.8 } } }}
            className="font-serif text-[clamp(3.25rem,9vw,8.5rem)] leading-[0.95] tracking-[-0.02em] text-blue"
          >
            my graphic design work
          </motion.h1>
          <motion.p
            variants={line}
            className="mx-auto mt-4 flex max-w-[1000px] justify-between font-serif text-[clamp(1rem,1.9vw,1.75rem)] leading-tight text-blue"
          >
            <span>(click) on poster to learn more</span>
            <span>({pad(posters.length)}) pieces</span>
          </motion.p>
        </header>

        <ul className="mx-auto mt-[9dvh] grid max-w-[1000px] grid-cols-2 items-end gap-x-[6vw] gap-y-14 sm:grid-cols-3 md:grid-cols-4 md:gap-x-[clamp(32px,6vw,92px)] md:gap-y-20">
          {posters.map((poster, i) => (
            <motion.li
              key={poster.id}
              variants={{ hidden: { opacity: 0, y: reducedMotion ? 0 : 40 }, shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
            >
              <PosterTile poster={poster} number={i + 1} onOpen={() => show(poster)} hidden={open?.id === poster.id} />
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Stays in the corner while the grid scrolls under it, where [close bag] is on the homepage. */}
      <motion.div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-end px-gutter pb-[4dvh] md:pr-[calc(var(--spacing-gutter)+3%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.4 } }}
      >
        <Link
          href="/"
          className="pointer-events-auto bg-bg/85 px-2 py-1 font-condensed text-3xl leading-none tracking-[-0.01em] backdrop-blur-sm hover:text-blue md:text-[min(2.6vw,4.2dvh)]"
        >
          [go back]
        </Link>
      </motion.div>

      <AnimatePresence>
        {open && (
          <PosterDetail
            key="detail"
            poster={open}
            number={at + 1}
            total={posters.length}
            previous={posters[at - 1] ?? null}
            next={posters[at + 1] ?? null}
            grown={grownFrom === open.id}
            onStep={step}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

type TileProps = {
  poster: Poster;
  number: number;
  onOpen: () => void;
  /** Open, so the card stands in for it. */
  hidden: boolean;
};

/** A poster in the grid. Its number swaps for its name on hover or focus. */
function PosterTile({ poster, number, onOpen, hidden }: TileProps) {
  return (
    <button type="button" onClick={onOpen} className="group flex w-full flex-col items-center gap-3 focus-visible:outline-offset-8">
      <span className="flex aspect-[4/5] w-full items-end justify-center">
        <motion.span
          layoutId={`poster-${poster.id}`}
          className="block w-full overflow-hidden rounded-[3px] shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-[translate,box-shadow] duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
          style={{ aspectRatio: `${poster.width} / ${poster.height}`, opacity: hidden ? 0 : 1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- already sized in public/posters */}
          <img
            src={posterImage(poster, "thumb")}
            alt=""
            loading={number > 8 ? "lazy" : undefined}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.span>
      </span>
      {/* Number by default, name on hover: they swap places, one sliding out as the other slides in. */}
      <span className="relative block h-[1.3em] w-full overflow-hidden text-center font-narrow text-lg leading-[1.3em]">
        <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full group-focus-visible:-translate-y-full">
          ({pad(number)})
        </span>
        <span className="absolute inset-x-0 top-full block truncate text-blue transition-transform duration-300 ease-out group-hover:-translate-y-full group-focus-visible:-translate-y-full">
          {poster.title}
        </span>
        <span className="sr-only">: {poster.title}</span>
      </span>
    </button>
  );
}

type DetailProps = {
  poster: Poster;
  number: number;
  total: number;
  previous: Poster | null;
  next: Poster | null;
  /** Opened from its tile, so it grows out of it (and shrinks back into it). */
  grown: boolean;
  onStep: (by: number) => void;
  onClose: () => void;
};

/** One poster, big and turnable, with its details beside it and the way to the ones either side. */
function PosterDetail({ poster, number, total, previous, next, grown, onStep, onClose }: DetailProps) {
  const reducedMotion = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  // Which way the last step went, so the new poster slides in from that side.
  const [direction, setDirection] = useState(1);
  const go = useCallback(
    (by: number) => {
      setDirection(by);
      onStep(by);
    },
    [onStep],
  );

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const scroll = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = scroll;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const facts: [string, string][] = [
    ["Kind", poster.kind],
    ["Year", poster.year ? String(poster.year) : "—"],
    ...(poster.client ? ([["For", poster.client]] as [string, string][]) : []),
    ["Tools", poster.tools.join(", ")],
  ];
  const slide = reducedMotion ? 0 : 60 * direction;

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-modal
      aria-label={poster.title}
      onKeyDown={(event) => trapTab(event, panel.current)}
      className="fixed inset-0 z-30 flex flex-col overflow-y-auto bg-bg md:flex-row md:overflow-hidden"
      initial={{ backgroundColor: "rgba(255,255,255,0)" }}
      animate={{ backgroundColor: "rgba(255,255,255,1)" }}
      exit={{ backgroundColor: "rgba(255,255,255,0)", transition: { duration: 0.3, delay: 0.1 } }}
      transition={{ duration: 0.3 }}
    >
      {/* The poster, centred in what's left of the screen. */}
      <div className="flex shrink-0 items-center justify-center px-gutter pb-6 pt-20 md:min-w-0 md:flex-1 md:py-[8dvh] md:pl-[6vw] md:pr-0">
        <AnimatePresence mode="popLayout" initial={false} custom={slide}>
          <motion.div
            key={poster.id}
            className="flex h-[62dvh] max-w-full items-center justify-center md:h-full"
            initial={grown ? false : { opacity: 0, x: slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slide, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <PosterCard
              poster={poster}
              layoutId={grown ? `poster-${poster.id}` : undefined}
              className="max-h-full w-auto max-w-[min(100%,86vw)] [height:min(100%,82dvh)]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Its story. */}
      <motion.aside
        className="flex shrink-0 flex-col gap-8 px-gutter pb-16 md:w-[min(420px,34vw)] md:py-[8dvh] md:pl-[3vw] md:pr-gutter"
        initial={{ opacity: 0, x: reducedMotion ? 0 : 24 }}
        animate={{ opacity: 1, x: 0, transition: { duration: 0.45, delay: 0.15, ease: EASE } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          className="w-fit font-condensed text-3xl leading-none tracking-[-0.01em] hover:text-blue md:text-[min(2.6vw,4.2dvh)]"
        >
          [all posters]
        </button>

        <div aria-live="polite" className="md:mt-auto">
          <p className="font-narrow text-lg text-ink-muted">
            ({pad(number)}) / ({pad(total)})
          </p>
          <h2 className="mt-2 font-serif text-[clamp(2.5rem,4.2vw,4.25rem)] leading-[0.95] tracking-[-0.02em] text-blue">
            {poster.title}
          </h2>
          <p className="mt-4 max-w-[38ch] text-lg leading-snug">{poster.description}</p>
          <dl className="mt-6 grid grid-cols-[64px_1fr] gap-x-4 gap-y-2 border-t border-line pt-4 text-sm">
            {facts.map(([term, detail]) => (
              <div key={term} className="contents">
                <dt className="font-label text-xs uppercase tracking-wider text-ink-muted">{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <nav aria-label="Posters" className="grid grid-cols-2 gap-4 border-t border-line pt-4 font-narrow text-lg">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={!previous}
            className="flex min-w-0 flex-col items-start text-left hover:text-blue disabled:opacity-30 disabled:hover:text-ink"
          >
            <span className="font-label text-xs uppercase tracking-wider text-ink-muted">← previous</span>
            <span className="w-full truncate">{previous?.title ?? "—"}</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={!next}
            className="flex min-w-0 flex-col items-end text-right hover:text-blue disabled:opacity-30 disabled:hover:text-ink"
          >
            <span className="font-label text-xs uppercase tracking-wider text-ink-muted">next →</span>
            <span className="w-full truncate">{next?.title ?? "—"}</span>
          </button>
        </nav>
      </motion.aside>
    </motion.div>
  );
}
