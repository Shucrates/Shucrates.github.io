"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { useScreenScale } from "./scale";

export type Rect = { x: number; y: number; width: number; height: number };

type Props = {
  title: string;
  rect: Rect;
  z: number;
  focused: boolean;
  /** Filling the desktop after the green button. */
  zoomed: boolean;
  /** The desktop's size, for zooming. */
  bounds: { width: number; height: number };
  /** Dark chrome, e.g. for video. */
  dark?: boolean;
  /** Replaces the plain title bar, e.g. Finder's toolbar; the traffic lights stay. */
  toolbar?: ReactNode;
  onFocus: () => void;
  onMove: (rect: Rect) => void;
  onClose: () => void;
  onMinimise: () => void;
  onZoom: () => void;
  children: ReactNode;
};

const MENU_BAR = 30;
const TITLE_BAR = 30;

/** A macOS-style window: drag by its title bar, traffic lights to close, minimise and zoom. */
export function Window({
  title,
  rect,
  z,
  focused,
  zoomed,
  bounds,
  dark,
  toolbar,
  onFocus,
  onMove,
  onClose,
  onMinimise,
  onZoom,
  children,
}: Props) {
  const scale = useScreenScale();
  // Follows the pointer exactly while dragged; springs otherwise (opening, zooming).
  const [dragging, setDragging] = useState(false);
  const frame = zoomed ? { x: 0, y: MENU_BAR, width: bounds.width, height: bounds.height - MENU_BAR } : rect;

  const startDrag = (event: React.PointerEvent) => {
    if (zoomed || (event.target as HTMLElement).closest("button")) return;
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const from = { x: event.clientX, y: event.clientY, rect };
    setDragging(true);
    const move = (e: PointerEvent) => {
      const x = from.rect.x + (e.clientX - from.x) / scale;
      // Keep the title bar reachable: below the menu bar, not off the bottom.
      const y = Math.min(bounds.height - TITLE_BAR, Math.max(MENU_BAR, from.rect.y + (e.clientY - from.y) / scale));
      onMove({ ...from.rect, x, y });
    };
    const up = () => {
      setDragging(false);
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  };

  const lights = (
    <div className="group/lights flex gap-2" onDoubleClick={(e) => e.stopPropagation()}>
      {[
        { label: "Close", color: "bg-[#ff5f57]", glyph: "×", action: onClose },
        { label: "Minimise", color: "bg-[#febc2e]", glyph: "−", action: onMinimise },
        { label: "Zoom", color: "bg-[#28c840]", glyph: "+", action: onZoom },
      ].map(({ label, color, glyph, action }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={action}
          className={`flex h-3 w-3 items-center justify-center rounded-full text-[10px] font-bold leading-none text-black/0 group-hover/lights:text-black/60 ${
            focused ? color : "bg-[#c8c8c8]"
          }`}
        >
          {glyph}
        </button>
      ))}
    </div>
  );

  return (
    <motion.section
      aria-label={title}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1, x: frame.x, y: frame.y, width: frame.width, height: frame.height }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
      transition={
        dragging
          ? { duration: 0 }
          : { type: "spring", stiffness: 500, damping: 40, opacity: { duration: 0.15 } }
      }
      onPointerDown={onFocus}
      className={`absolute left-0 top-0 flex flex-col overflow-hidden rounded-[10px] border ${
        dark ? "border-white/15 bg-[#1e1e1e] text-white" : "border-black/20 bg-white text-[#1d1d1f]"
      } ${focused ? "shadow-[0_22px_70px_rgba(0,0,0,0.45)]" : "shadow-[0_12px_40px_rgba(0,0,0,0.25)]"}`}
      style={{ zIndex: z }}
    >
      <header
        onPointerDown={startDrag}
        onDoubleClick={onZoom}
        className={`flex shrink-0 select-none items-center gap-4 px-3 ${toolbar ? "h-[52px]" : "h-[30px]"} ${
          dark ? "bg-[#2b2b2b]" : "bg-[#ececec]"
        } ${focused ? "" : "opacity-70"} border-b ${dark ? "border-black/50" : "border-black/10"}`}
      >
        {lights}
        {toolbar ?? <p className="flex-1 truncate pr-14 text-center text-[13px] font-semibold">{title}</p>}
      </header>
      <div className="relative min-h-0 flex-1">{children}</div>
    </motion.section>
  );
}
