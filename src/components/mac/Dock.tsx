"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useScreenScale } from "./scale";

export type DockItem = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Has a window open (or minimised): shows the dot underneath. */
  running: boolean;
  /** Changes each launch, to bounce the icon. */
  bounce: number;
  onClick: () => void;
};

const BASE = 54;
const MAX = 86;
/** How far (logical px) the magnification reaches either side of the pointer. */
const REACH = 140;

/** The Dock: icons magnify around the pointer, bounce when they launch, and show a dot while running. */
export function Dock({ apps, trash }: { apps: DockItem[]; trash: DockItem }) {
  const pointer = useMotionValue(Infinity);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[6px] flex justify-center">
      <nav
        aria-label="Dock"
        onPointerMove={(event) => pointer.set(event.clientX)}
        onPointerLeave={() => pointer.set(Infinity)}
        className="pointer-events-auto flex h-[68px] items-end gap-[6px] rounded-[22px] border border-white/30 bg-white/25 px-[8px] pb-[6px] shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
      >
        {apps.map((item) => (
          <DockIcon key={item.id} item={item} pointer={pointer} />
        ))}
        <span aria-hidden className="mx-[4px] mb-[4px] h-[48px] w-px bg-black/20" />
        <DockIcon item={trash} pointer={pointer} />
      </nav>
    </div>
  );
}

function DockIcon({ item, pointer }: { item: DockItem; pointer: MotionValue<number> }) {
  const scale = useScreenScale();
  const ref = useRef<HTMLButtonElement>(null);
  const distance = useTransform(pointer, (x) => {
    const box = ref.current?.getBoundingClientRect();
    return box ? (x - box.left - box.width / 2) / scale : Infinity;
  });
  const size = useSpring(
    useTransform(distance, [-REACH, 0, REACH], [BASE, MAX, BASE]),
    { mass: 0.1, stiffness: 170, damping: 14 },
  );

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        ref={ref}
        type="button"
        aria-label={item.label}
        onClick={item.onClick}
        style={{ width: size, height: size }}
        className="group relative"
      >
        <motion.span
          key={item.bounce}
          className="block h-full w-full"
          animate={item.bounce ? { y: [0, -26, 0, -12, 0] } : undefined}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {item.icon}
        </motion.span>
        <span className="pointer-events-none absolute -top-[38px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[6px] border border-black/10 bg-[#f2f2f2]/90 px-[10px] py-[3px] text-[13px] text-black opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          {item.label}
        </span>
      </motion.button>
      <span
        aria-hidden
        className={`absolute -bottom-[5px] h-[4px] w-[4px] rounded-full bg-black/70 ${item.running ? "" : "opacity-0"}`}
      />
    </div>
  );
}
