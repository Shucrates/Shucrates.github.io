"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig, type Variants } from "framer-motion";
import { launchOnClick } from "@/components/stage/ObjectStage";
import { StageAnchor } from "@/components/stage/StageAnchor";
import { stages } from "@/components/stage/Stages";
import type { HoverAnimation, SpaceObject } from "@/content/objects";

const MotionLink = motion.create(Link);

/** Plays while the object (or its index entry) is hovered or focused; "rest" returns it to place. */
const hoverVariants: Record<HoverAnimation, Variants> = {
  // For 3D objects, which animate themselves (see src/components/stage).
  none: {},
  lift: {
    hover: { y: -10, scale: 1.04, transition: { type: "spring", stiffness: 300, damping: 18 } },
  },
  pulse: {
    hover: { scale: [1, 1.06, 1], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
  },
  swing: {
    hover: { rotate: [0, 12, -9, 6, -3, 0], transition: { duration: 1.1, ease: "easeOut" } },
  },
  tilt: {
    hover: { rotate: -6, y: -10, scale: 1.04, transition: { type: "spring", stiffness: 260, damping: 16 } },
  },
  shuffle: {
    hover: { x: [0, -6, 6, 0], rotate: [0, -3, 3, 0], transition: { duration: 0.5 } },
  },
  wobble: {
    hover: { rotate: [0, -4, 4, -2, 0], transition: { duration: 0.6 } },
  },
};

const rest = { x: 0, y: 0, scale: 1, rotate: 0, transition: { duration: 0.3 } };

type Props = {
  object: SpaceObject;
  /** Hovered or focused, here or in the index. */
  active: boolean;
  onActiveChange: (active: boolean) => void;
};

export function ObjectLink({ object, active, onActiveChange }: Props) {
  const name = `${object.label[0].toUpperCase()}${object.label.slice(1)}`;
  const href = `/${object.section}`;
  // Box matches the art's aspect ratio; `scale` sets its longest side.
  const ratio = object.width / object.height;
  const size = object.scale * Math.min(1, ratio);

  return (
    <MotionConfig reducedMotion="user">
      <MotionLink
        href={href}
        aria-label={`${name} — ${object.section}`}
        onClick={launchOnClick(object.interaction && stages[object.interaction])}
        initial="rest"
        animate={active ? "hover" : "rest"}
        onPointerEnter={() => onActiveChange(true)}
        onPointerLeave={() => onActiveChange(false)}
        onFocus={() => onActiveChange(true)}
        onBlur={() => onActiveChange(false)}
        className="flex flex-col items-center gap-2 rounded-soft"
      >
        <span aria-hidden className="font-label text-xs tracking-wider">
          [{object.order}]
        </span>
        <motion.span
          variants={{ rest, ...hoverVariants[object.hover] }}
          className={`relative block w-[calc(var(--object-unit)*var(--size))] ${
            object.hover === "swing" ? "origin-top" : ""
          }`}
          style={{ "--size": size, aspectRatio: `${object.width} / ${object.height}` } as React.CSSProperties}
        >
          {object.interaction ? (
            <StageAnchor store={stages[object.interaction].store} active={active} />
          ) : object.image ? (
            <Image
              src={object.image}
              alt={object.alt}
              fill
              sizes="(max-width: 767px) 45vw, 260px"
              className="object-contain drop-shadow-object"
              draggable={false}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-soft border-2 border-dashed border-ink-muted font-label text-sm uppercase tracking-widest text-ink-muted">
              TBD
            </span>
          )}
        </motion.span>
      </MotionLink>
    </MotionConfig>
  );
}
