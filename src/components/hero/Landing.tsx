"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";
import { stages } from "@/components/stage/Stages";
import { Space, type Point } from "@/components/space/Space";
import type { SpaceObject } from "@/content/objects";
import { Hero } from "./Hero";
import { Tote } from "./Tote";

/** Coming back to the homepage from a section returns to the open bag, not the intro. */
let bagOpen = false;

/** The homepage: the hero photo, whose bag empties out into the space. */
export function Landing({ objects }: { objects: SpaceObject[] }) {
  const [open, setOpen] = useState(bagOpen);
  // The bag clicked in the photo, while it grows and empties; null otherwise.
  const [opening, setOpening] = useState<DOMRect | null>(null);
  const [origin, setOrigin] = useState<Point | null>(null);

  // 3D objects keep drawing at their last slot; hide them while the bag is shut.
  useLayoutEffect(() => {
    if (!open) Object.values(stages).forEach((stage) => stage.store.set({ presence: 0 }));
  }, [open]);

  return (
    <>
      {/* The homepage has its own links, bottom-left, so the link bar hides (see LinkBar). */}
      <div data-own-links hidden />
      {opening && (
        <Tote
          from={opening}
          onMouth={(point) => {
            bagOpen = true;
            setOrigin(point);
            setOpen(true);
          }}
          onDone={() => setOpening(null)}
        />
      )}
      {/* Outside AnimatePresence so it unmounts at once and its 3D objects hide with it. */}
      {open && (
        <Space
          objects={objects}
          origin={origin}
          bagArriving={opening !== null}
          onClosed={() => {
            bagOpen = false;
            setOrigin(null);
            setOpen(false);
          }}
        />
      )}
      <AnimatePresence initial={false}>
        {!open && !opening && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            // Out of the space's way while it fades.
            className="absolute inset-x-0 top-0"
          >
            <Hero onOpenBag={setOpening} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
