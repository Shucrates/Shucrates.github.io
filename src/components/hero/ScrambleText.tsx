"use client";

import { useEffect, useRef, useState } from "react";

/** No wide letters (M, W), so the scramble stays inside the text's box. */
const GLYPHS = "abcdefghijklnoprstuvxyz";
const FRAME_MS = 45;

type Props = {
  text: string;
  /** Scramble in on mount instead of showing `text` straight away. Changes to `text` always scramble. */
  play: boolean;
  delay?: number;
  /** Seconds until the last letter settles. */
  duration?: number;
  /** Letters before this index never scramble, e.g. a prefix shared by every value of `text`. */
  keep?: number;
  /** Called once `text` has settled. */
  onSettled?: () => void;
};

const scramble = (text: string, settled: number) =>
  [...text]
    .map((char, i) =>
      i < settled || !/[a-z]/i.test(char) ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    )
    .join("");

/**
 * Text that starts as random letters and resolves into `text`, left to right.
 * The real text holds the layout so the line doesn't jitter as glyph widths change.
 */
export function ScrambleText({ text, play, delay = 0, duration = 0.9, keep = 0, onSettled }: Props) {
  const [shown, setShown] = useState(play ? "" : text);
  const first = useRef(true);
  const settledRef = useRef(onSettled);
  useEffect(() => {
    settledRef.current = onSettled;
  });

  useEffect(() => {
    const mounting = first.current;
    first.current = false;
    if (mounting && !play) return;
    const wait = mounting ? delay : 0;
    const finish = () => {
      setShown(text);
      settledRef.current?.();
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timeout = setTimeout(finish, wait * 1000);
      return () => clearTimeout(timeout);
    }
    let interval = 0;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = () => {
        const progress = Math.min(1, (performance.now() - start) / (duration * 1000));
        if (progress === 1) {
          clearInterval(interval);
          finish();
        } else {
          setShown(scramble(text, keep + Math.floor(progress * (text.length - keep))));
        }
      };
      tick();
      interval = window.setInterval(tick, FRAME_MS);
    }, wait * 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
    // Plays per change of `text`; the other props are read as they were then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="sr-only">{text}</span>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0">
        {shown}
      </span>
    </span>
  );
}
