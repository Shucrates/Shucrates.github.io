"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Project } from "@/content/projects";

/** A frame of the project's video: its poster, or the video's first frame, or a title card until there's either. */
export function ProjectStill({ project, className = "" }: { project: Project; className?: string }) {
  if (project.poster) {
    // eslint-disable-next-line @next/next/no-img-element -- poster frames are already sized
    return <img src={project.poster} alt="" className={`object-cover ${className}`} draggable={false} />;
  }
  if (project.video) {
    return <video src={`${project.video}#t=0.1`} preload="metadata" muted playsInline className={`object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-end bg-ink p-[8%] ${className}`}>
      <span className="font-condensed text-[min(12cqw,4rem)] leading-none text-bg/90">{project.title}</span>
    </div>
  );
}

/**
 * The case study's video: plays muted on a loop (not under reduced motion), with controls for
 * sound. It pauses while scrolled out of view and picks up again if it was playing.
 */
export function ProjectVideo({ project }: { project: Project }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // Whether it should be playing when in view: starts as autoplay, then follows the viewer's own play/pause.
    let wanted = !reducedMotion;
    let visible = true;
    const follow = () => {
      if (visible) wanted = !video.paused;
    };
    video.addEventListener("play", follow);
    video.addEventListener("pause", follow);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) video.pause();
      else if (wanted) video.play().catch(() => {});
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.removeEventListener("play", follow);
      video.removeEventListener("pause", follow);
    };
  }, [reducedMotion]);

  if (!project.video) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-soft bg-ink [container-type:inline-size]">
        <p className="font-label text-xs uppercase tracking-wider text-bg/50">Video coming soon</p>
      </div>
    );
  }
  return (
    <video
      ref={ref}
      src={project.video}
      poster={project.poster}
      autoPlay={!reducedMotion}
      muted
      loop
      playsInline
      controls
      className="aspect-video w-full rounded-soft bg-ink object-cover"
    />
  );
}
