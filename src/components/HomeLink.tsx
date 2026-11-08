"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, type ComponentProps } from "react";
import { openedFrom } from "@/components/projects/back";
import { stepsHere } from "@/components/useBackSteps";

/**
 * The homepage is the entry just before this one in history, so going home can step back
 * instead of stacking another "/" on top (which made the browser's back button return to the section).
 */
let homeBelow = false;
let lastPath: string | null = null;

/** Mounted once in the layout: notes when a section was opened from the homepage. */
export function TrackHome() {
  const pathname = usePathname();
  useEffect(() => {
    // Moving within a section (e.g. between projects) replaces the entry, so the homepage stays below.
    if (pathname === "/") homeBelow = false;
    else if (lastPath === "/") homeBelow = true;
    lastPath = pathname;
  }, [pathname]);
  return null;
}

/** Back to the homepage: a step back in history when that's where we came from. */
export function useGoHome() {
  const router = useRouter();
  return useCallback(() => {
    // A case study opened from the gallery sits above /projects, not the homepage. Steps back over
    // any layers open on this page too (see useBackSteps).
    if (homeBelow && !openedFrom.gallery) window.history.go(-1 - stepsHere());
    else router.push("/");
  }, [router]);
}

/** A link to the homepage that goes back in history when it can. */
export function HomeLink({ onClick, ...props }: Omit<ComponentProps<typeof Link>, "href">) {
  const goHome = useGoHome();
  return (
    <Link
      {...props}
      href="/"
      onClick={(event) => {
        onClick?.(event);
        // Let new-tab clicks through.
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        goHome();
      }}
    />
  );
}
