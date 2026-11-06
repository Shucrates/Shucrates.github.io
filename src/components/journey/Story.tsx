"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { createContext, useContext, useEffect, useState } from "react";
import { player, usePlayer } from "@/components/camera/player-store";
import { goToEpisode } from "@/components/camera/useCameraControls";
import { episodes, show, type Episode } from "@/content/episodes";
import { StatRow } from "./StatRow";

/*
 * Sizes follow the MacBook Air mockup (1470×956): each is min(vw, dvh) so the
 * layout keeps its proportions on other screens, like the homepage hero.
 */
const TITLE = "font-serif text-blue";
const BODY = "font-serif text-xl leading-[1.1] md:text-[min(3.04vw,4.68dvh)] md:leading-[1.03]";
/** Stories longer than this many characters set smaller, in two columns, so they still fit beside the camera. */
const LONG_STORY = 280;
const BODY_LONG = "font-serif text-xl leading-[1.1] md:text-[min(2.05vw,3.15dvh)] md:leading-[1.08]";
const SMALL = "font-serif text-base md:text-[min(1.9vw,2.9dvh)]";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.55, 0, 0.75, 0.3] as const;
const FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.4 } };

/**
 * The page around the camera (drawn above this): a fixed title screen, then,
 * once an episode is opened, one episode at a time: scrolling, swiping or the
 * arrow keys move to the next, its lines rising in as the last one's drift out.
 */
export function Story() {
  const view = usePlayer((s) => s.view);
  return (
    // data-own-links: this page has its own links, so the site's top bar steps aside.
    <div data-own-links className="relative z-[35]">
      <AnimatePresence mode="wait" initial={false}>
        {view === "title" ? <TitleScreen key="title" /> : <Episodes key="episodes" />}
      </AnimatePresence>
    </div>
  );
}

const stagger = (each: number, delay: number): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: each, delayChildren: delay } },
});

/**
 * The title screen: "the bored files" rises in letter by letter while the
 * camera lands, then the handle and intro settle in under it.
 */
function TitleScreen() {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const rise = reducedMotion ? 0 : 1;
  const letter: Variants = {
    hidden: { opacity: 0, y: `${0.35 * rise}em`, rotate: 6 * rise },
    shown: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.8, ease: EASE_OUT } },
  };
  const line: Variants = {
    hidden: { opacity: 0, y: 24 * rise },
    shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
  };
  return (
    <motion.section {...FADE} aria-label="Intro" className="fixed inset-0 h-svh overflow-hidden">
      <motion.h1
        aria-label={show.title}
        initial="hidden"
        animate="shown"
        variants={stagger(0.045, 0.25)}
        className={`${TITLE} absolute inset-x-0 top-[9%] text-center text-[18vw] leading-[0.8] md:top-[4.5%] md:text-[min(17.8vw,27.4dvh)]`}
      >
        {[...show.title].map((char, i) => (
          <motion.span key={i} aria-hidden variants={letter} className="inline-block whitespace-pre">
            {char}
          </motion.span>
        ))}
      </motion.h1>
      <motion.div initial="hidden" animate="shown" variants={stagger(0.12, 0.9)}>
        <motion.p
          variants={line}
          className={`${TITLE} absolute inset-x-[6%] top-[22%] flex justify-between text-[5vw] md:right-[9.6%] md:left-[8.3%] md:top-[26.6%] md:text-[min(2.84vw,4.37dvh)]`}
        >
          <span>{show.handle}</span>
          <span>{show.presents}</span>
        </motion.p>
        <motion.p variants={line} className={`${BODY} absolute inset-x-gutter top-[74%] text-center md:top-[83.5%]`}>
          {show.intro.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </motion.p>
      </motion.div>
    </motion.section>
  );
}

/** Which way the episodes are moving: 1 to the next one, -1 back. */
const Direction = createContext(1);

/** How long after one move a fresh gesture can move again; about the time the lines take to settle. */
const STEP_GAP = 450;
/** A pause this long in wheel events ends a gesture (a trackpad keeps sending them while it coasts). */
const GESTURE_GAP = 160;

function Episodes() {
  const index = usePlayer((s) => s.index);
  const [shown, setShown] = useState(index);
  const [direction, setDirection] = useState(1);
  if (shown !== index) {
    // Past the last episode wraps round to the first, still moving forwards.
    const wrapped = shown === episodes.length - 1 && index === 0;
    setDirection(index > shown || wrapped ? 1 : -1);
    setShown(index);
  }

  // Wheel, swipe and keys each move one episode; the page itself never scrolls.
  useEffect(() => {
    let lastStep = 0;
    let lastWheel = 0;
    let lastDelta = 0;
    const step = (by: number) => {
      const now = performance.now();
      if (now - lastStep < STEP_GAP) return;
      lastStep = now;
      const next = player.get().index + by;
      goToEpisode(next === episodes.length ? 0 : next);
    };
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch zoom
      event.preventDefault();
      const now = performance.now();
      const delta = Math.abs(event.deltaY);
      const fresh = now - lastWheel > GESTURE_GAP;
      // A new push on top of a coasting trackpad shows up as a sudden jump in speed.
      const push = delta > lastDelta * 1.4 + 8;
      lastWheel = now;
      lastDelta = delta;
      if (delta >= 4 && (fresh || push)) step(Math.sign(event.deltaY));
    };
    let touchY: number | null = null;
    const onTouchStart = (event: TouchEvent) => (touchY = event.touches[0].clientY);
    const onTouchEnd = (event: TouchEvent) => {
      if (touchY === null) return;
      const dy = touchY - event.changedTouches[0].clientY;
      touchY = null;
      if (Math.abs(dy) > 40) step(Math.sign(dy));
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.key === " " && target instanceof HTMLElement && target.closest("button, a")) return;
      const by = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 }[event.key];
      if (!by) return;
      event.preventDefault();
      step(event.shiftKey && event.key === " " ? -1 : by);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const episode = episodes[index];
  return (
    <motion.div {...FADE} className="fixed inset-0 touch-none">
      <Direction.Provider value={direction}>
        <AnimatePresence>
          <EpisodeScreen key={episode.id} episode={episode} index={index} />
        </AnimatePresence>
      </Direction.Provider>
    </motion.div>
  );
}

/**
 * One episode, filling the screen. Its lines rise in one after another; moving
 * on, they drift out the way you're going while the next episode's come in.
 */
function EpisodeScreen({ episode, index }: { episode: Episode; index: number }) {
  const reducedMotion = useReducedMotion();
  const direction = useContext(Direction);
  const travel = reducedMotion ? 0 : 56 * direction;
  const line: Variants = {
    hidden: { opacity: 0, y: travel },
    shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
    gone: { opacity: 0, y: -travel, transition: { duration: 0.3, ease: EASE_IN } },
  };
  const lines: Variants = {
    hidden: {},
    // Let the old lines clear before the new ones arrive.
    shown: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
    gone: { transition: { staggerChildren: 0.03 } },
  };

  const long = episode.story.join("").length > LONG_STORY;

  return (
    <motion.section
      aria-labelledby={`episode-${index}`}
      initial="hidden"
      animate="shown"
      exit="gone"
      variants={lines}
      className="absolute inset-0"
    >
      <div className="absolute inset-x-gutter top-[8%] flex flex-col gap-4 md:inset-x-auto md:left-[3.8vw] md:top-[5.5%] md:gap-[min(3vw,4.6dvh)]">
        <motion.h2 variants={line} id={`episode-${index}`} className={`${TITLE} text-[16vw] leading-[0.85] md:text-[min(11.46vw,17.6dvh)]`}>
          {episode.label}
        </motion.h2>
        <div
          className={
            long
              ? `${BODY_LONG} flex flex-col gap-[1.1em] md:mt-[min(2.9vw,4.4dvh)] md:w-[56vw] md:gap-[1.6em]`
              : `${BODY} flex flex-col gap-[1.1em] md:mt-[min(2.9vw,4.4dvh)] md:w-[34vw] md:gap-[1.2em]`
          }
        >
          <div className={long ? "flex flex-col gap-[1.1em] md:block md:columns-2 md:gap-[3vw]" : "contents"}>
            {episode.story.map((paragraph) => (
              <motion.p key={paragraph} variants={line} className={long ? "md:mb-[0.9em] md:break-inside-avoid" : undefined}>
                {paragraph}
              </motion.p>
            ))}
          </div>
          <motion.div variants={line} className={`${SMALL} flex flex-col gap-[0.4em] text-ink-muted`}>
            <StatRow episode={episode} />
            {episode.link && (
              <a
                href={episode.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-ink underline underline-offset-2 hover:text-blue"
              >
                {episode.link.label} ↗
              </a>
            )}
          </motion.div>
        </div>
      </div>
      <motion.p
        variants={line}
        className="absolute inset-x-0 bottom-[1.5%] hidden text-center font-narrow text-base md:block md:text-[min(1.5vw,2.3dvh)]"
      >
        {show.hint}
        <span aria-hidden className="block">
          ↓
        </span>
      </motion.p>
    </motion.section>
  );
}
