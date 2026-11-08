"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { switchOffScreen } from "@/components/laptop/model";
import { laptopStore, useLaptopDocks } from "@/components/laptop/stage";
import { Credit } from "@/components/Credit";
import { useGoHome } from "@/components/HomeLink";
import { site } from "@/content/site";
import { useStage } from "@/components/stage/store";
import { openedFrom } from "@/components/projects/back";
import type { Project } from "@/content/projects";
import { Desktop, forgetSleep, sleepingMac, sleepMac } from "./Desktop";
import { ScaleContext, SCREEN_WIDTH } from "./scale";

// TODO: swap in my own wallpaper.
const WALLPAPER = "/mac/wallpaper.webp";

/** Sleep blanks the screen at once; shutting down closes everything first, then goes dark. */
const BLANK = {
  sleep: { duration: 0.2 },
  off: { duration: 0.45, delay: 0.55 },
};

/**
 * What the docked laptop's display shows: a Mac already awake, laid out at a fixed logical
 * size and scaled to fit the 3D screen exactly. Sleeping or shutting it down closes the
 * laptop, as does clicking anywhere off the screen. Mounted by the /projects layout, so it
 * stays put while a case study (/projects/[id]) opens in a window on it.
 * Desktop only: phones get a plain list.
 */
export function MacScreen({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const goHome = useGoHome();
  const caseStudy = usePathname().match(/^\/projects\/([^/]+)/)?.[1] ?? null;
  // Where the 3D laptop's display is on screen; null until it has landed.
  const layout = useStage(laptopStore, (s) => s.layout);
  const [power, setPower] = useState<"on" | "sleep" | "off">("on");
  // Woken from sleep, it opens as it was; otherwise it boots into Finder.
  const [resumed] = useState(sleepingMac);
  useEffect(() => {
    forgetSleep();
    // It was asleep on a case study: open that again.
    if (resumed?.caseStudy && !caseStudy) {
      openedFrom.gallery = true;
      router.push(`/projects/${resumed.caseStudy}/`);
    }
    // Once, on opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sleep = useCallback(() => {
    sleepMac(caseStudy);
    setPower((p) => (p === "on" ? "sleep" : p));
  }, [caseStudy]);
  const shutDown = useCallback(() => setPower((p) => (p === "on" ? "off" : p)), []);

  const openProject = useCallback(
    (project: Project) => {
      openedFrom.gallery = true;
      router.push(`/projects/${project.id}/`);
    },
    [router],
  );

  const docks = useLaptopDocks();
  const scale = layout ? layout.screen.width / SCREEN_WIDTH : 1;
  const size = layout ? { width: SCREEN_WIDTH, height: layout.screen.height / scale } : null;

  if (!docks) return null;
  return (
    <>
      {/* Blanks the page behind the laptop (drawn at z-40); a click on it, or the bezel, closes the lid. */}
      <button
        type="button"
        aria-label="Close the laptop"
        onClick={sleep}
        className="fixed inset-0 z-30 cursor-zoom-out bg-bg focus-visible:outline-offset-[-6px]"
      />
      {layout && size && (
        <motion.div
          className="fixed z-50 overflow-hidden rounded-[0.5%] bg-black"
          style={layout.screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <ScaleContext.Provider value={scale}>
            <div
              className="absolute left-0 top-0 origin-top-left select-none overflow-hidden font-[system-ui,-apple-system,'Helvetica_Neue',sans-serif]"
              style={{ ...size, transform: `scale(${scale})` }}
            >
              <Image src={WALLPAPER} alt="" fill sizes="100vw" priority className="object-cover" />
              <Desktop
                projects={projects}
                size={size}
                off={power !== "on"}
                resumed={resumed}
                caseStudy={caseStudy}
                onOpenProject={openProject}
                onSleep={sleep}
                onShutDown={shutDown}
              />
              <AnimatePresence>
                {power !== "on" && (
                  <motion.div
                    key="blank"
                    className="absolute inset-0 z-[2000] bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={BLANK[power]}
                    onAnimationComplete={() => {
                      // The 3D laptop's own display stays dark as the lid closes.
                      switchOffScreen();
                      goHome();
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </ScaleContext.Provider>
        </motion.div>
      )}
      {/* Printed on the bezel's chin, under the screen. */}
      <Credit credit={site.credits.laptop} className="bottom-[3px] left-1/2 -translate-x-1/2 text-white/45 hover:text-white/80" />
    </>
  );
}
