"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Project } from "@/content/projects";
import { trapTab } from "../focus";
import type { Gallery } from "./Finder";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  gallery: Gallery;
  onClose: () => void;
  onOpen: (project: Project) => void;
};

/**
 * Quick Look on the selected project: its video big, with sound. ←/→ carry on through the
 * gallery, Return opens the case study, Space or Escape closes. Modal: focus stays inside.
 */
export function QuickLook({ gallery, onClose, onOpen }: Props) {
  const { project, list, index, previous, next } = gallery;
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>("[data-close]")?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        // The video's own controls seek with the arrows.
        if (target.tagName === "VIDEO") return;
        event.preventDefault();
        if (event.key === "ArrowLeft") previous();
        else next();
      } else if (event.key === "Escape" || (event.key === " " && !target.closest("button, video"))) {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
      } else if (event.key === "Enter" && project && !target.closest("button, video")) {
        event.preventDefault();
        onOpen(project);
      }
    };
    // Capture, so it runs before the desktop's own Escape.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [project, previous, next, onClose, onOpen]);

  if (!project) return null;
  const arrow =
    "absolute top-1/2 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-[26px] leading-none text-white/85 backdrop-blur-md hover:bg-black/65 disabled:hidden";

  return (
    <div className="absolute inset-0 z-[1400] flex items-center justify-center" onPointerDown={(e) => e.stopPropagation()}>
      {/* Clicking outside the panel closes it, as on the Mac. */}
      <div aria-hidden className="absolute inset-0" onClick={onClose} />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal
        aria-label={`Quick Look: ${project.title}`}
        onKeyDown={(event) => trapTab(event, panel.current)}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="relative flex h-[720px] w-[1180px] flex-col overflow-hidden rounded-[12px] border border-white/15 bg-[#1e1e1e]/95 text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        <header className="flex h-[44px] shrink-0 items-center gap-3 border-b border-black/50 bg-[#2b2b2b] px-3">
          <button
            type="button"
            data-close
            aria-label="Close Quick Look"
            onClick={onClose}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] text-[18px] leading-none text-white/70 hover:bg-white/10"
          >
            ×
          </button>
          <p className="flex-1 truncate text-center text-[13px] font-semibold">
            {project.title}
            <span className="ml-3 font-mono text-[12px] font-normal tabular-nums text-white/45">
              {pad(index + 1)} / {pad(list.length)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="h-[26px] rounded-[6px] bg-white/12 px-3 text-[12px] font-medium hover:bg-white/20"
          >
            Open Case Study <kbd className="ml-1 font-sans text-white/50">⏎</kbd>
          </button>
        </header>
        <div className="relative min-h-0 flex-1 bg-black">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={project.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {project.video ? (
                <video
                  src={project.video}
                  poster={project.poster}
                  autoPlay
                  controls
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-white/50">
                  <p className="text-[40px] font-semibold tracking-[-0.02em] text-white/85">{project.title}</p>
                  <p className="text-[13px]">{project.summary} · video coming soon</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <button type="button" aria-label="Previous project" disabled={index === 0} onClick={previous} className={`${arrow} left-4`}>
            ‹
          </button>
          <button
            type="button"
            aria-label="Next project"
            disabled={index === list.length - 1}
            onClick={next}
            className={`${arrow} right-4`}
          >
            ›
          </button>
        </div>
      </motion.div>
    </div>
  );
}
