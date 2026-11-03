import { useRef, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { tick } from "./useClickSound";

/** Degrees of turn on the click wheel per step through a list. */
const STEP_DEGREES = 18;
/** A press that moves less than this (degrees) is a click, not a scroll. */
const CLICK_DEGREES = 6;
/** Pixels of mouse wheel / trackpad scroll per step. */
const STEP_PIXELS = 40;

export type WheelButton = "menu" | "play" | "prev" | "next";

export type WheelHandlers = {
  /** One step: +1 is clockwise / down. */
  scroll: (by: 1 | -1) => void;
  select: () => void;
  press: (button: WheelButton) => void;
  /** Esc; defaults to MENU. */
  escape?: () => void;
};

/**
 * Turns pointer drags round the wheel, presses on its edges, the mouse wheel and the
 * keyboard into iPod controls, ticking on each. The wheel itself stays presentational:
 * spread `wheel` and `centre` onto its elements, and `onWheel` / `onKeyDown` onto the iPod.
 */
export function useClickWheel(centre: { x: number; y: number } | null, handlers: WheelHandlers) {
  const turn = useRef<{ angle: number; moved: number; pending: number } | null>(null);
  const scrolled = useRef(0);

  const angleAt = (x: number, y: number) => (centre ? (Math.atan2(y - centre.y, x - centre.x) * 180) / Math.PI : 0);
  const step = (by: 1 | -1) => {
    tick();
    handlers.scroll(by);
  };
  const press = (button: WheelButton) => {
    tick();
    handlers.press(button);
  };
  const select = () => {
    tick();
    handlers.select();
  };

  return {
    wheel: {
      onPointerDown(event: PointerEvent<HTMLElement>) {
        event.currentTarget.setPointerCapture(event.pointerId);
        turn.current = { angle: angleAt(event.clientX, event.clientY), moved: 0, pending: 0 };
      },
      onPointerMove(event: PointerEvent<HTMLElement>) {
        const t = turn.current;
        if (!t) return;
        const angle = angleAt(event.clientX, event.clientY);
        const delta = ((angle - t.angle + 540) % 360) - 180;
        t.angle = angle;
        t.moved += Math.abs(delta);
        t.pending += delta;
        // Clockwise scrolls down, as on the real thing.
        while (Math.abs(t.pending) >= STEP_DEGREES) {
          const by = t.pending > 0 ? 1 : -1;
          t.pending -= by * STEP_DEGREES;
          step(by);
        }
      },
      onPointerUp(event: PointerEvent<HTMLElement>) {
        const t = turn.current;
        turn.current = null;
        if (!t || t.moved > CLICK_DEGREES) return;
        const angle = angleAt(event.clientX, event.clientY);
        press(angle < -45 && angle > -135 ? "menu" : angle > 45 && angle < 135 ? "play" : Math.abs(angle) <= 45 ? "next" : "prev");
      },
      onPointerCancel() {
        turn.current = null;
      },
    },
    centre: { onClick: select },
    onWheel(event: WheelEvent) {
      // Line-based mouse wheels report ~1 per notch; trackpads report pixels.
      scrolled.current += event.deltaMode === 1 ? event.deltaY * STEP_PIXELS : event.deltaY;
      while (Math.abs(scrolled.current) >= STEP_PIXELS) {
        const by = scrolled.current > 0 ? 1 : -1;
        scrolled.current -= by * STEP_PIXELS;
        step(by);
      }
    },
    onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const keys: Record<string, () => void> = {
        ArrowUp: () => step(-1),
        ArrowDown: () => step(1),
        ArrowLeft: () => press("prev"),
        ArrowRight: () => press("next"),
        Enter: select,
        " ": () => press("play"),
        Backspace: () => press("menu"),
        Escape: () => (handlers.escape ? (tick(), handlers.escape()) : press("menu")),
      };
      const action = keys[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    },
  };
}
