"use client";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCallback, useState } from "react";
import { laptopStore } from "@/components/laptop/stage";
import { useStage } from "@/components/stage/store";
import type { Project } from "@/content/projects";
import { Desktop } from "./Desktop";
import { LoginScreen } from "./LoginScreen";
import { ScaleContext, SCREEN_WIDTH } from "./scale";

// TODO: swap in my own wallpaper.
const WALLPAPER = "/mac/wallpaper.webp";

/**
 * What the docked laptop's display shows: a Mac that starts at the lock screen.
 * Laid out at a fixed logical size and scaled to fit the 3D screen exactly.
 */
export function MacScreen({ projects }: { projects: Project[] }) {
  // Where the 3D laptop's display is on screen; null until it has landed.
  const layout = useStage(laptopStore, (s) => s.layout);
  const [unlocked, setUnlocked] = useState(false);
  const unlock = useCallback(() => setUnlocked(true), []);

  if (!layout) return null;
  const { left, top, width, height } = layout.screen;
  const scale = width / SCREEN_WIDTH;
  const size = { width: SCREEN_WIDTH, height: height / scale };

  return (
    <div className="fixed z-50 overflow-hidden rounded-[0.5%] bg-black" style={{ left, top, width, height }}>
      <ScaleContext.Provider value={scale}>
        <div
          className="absolute left-0 top-0 origin-top-left select-none overflow-hidden font-[system-ui,-apple-system,'Helvetica_Neue',sans-serif]"
          style={{ ...size, transform: `scale(${scale})` }}
        >
          <Image src={WALLPAPER} alt="" fill sizes="100vw" priority className="object-cover" />
          <AnimatePresence>
            {unlocked ? (
              <Desktop key="desktop" projects={projects} size={size} />
            ) : (
              <LoginScreen key="login" onUnlock={unlock} />
            )}
          </AnimatePresence>
        </div>
      </ScaleContext.Provider>
    </div>
  );
}
