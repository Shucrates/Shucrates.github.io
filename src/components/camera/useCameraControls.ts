"use client";

import { useEffect } from "react";
import { useGoHome } from "@/components/HomeLink";
import { episodes } from "@/content/episodes";
import type { CameraButton } from "./geometry";
import { player } from "./player-store";

/** The episode grid is 3 across. */
export const GRID_COLUMNS = 3;
/** A beat between picking an episode and opening it, so the choice registers. */
const OPEN_DELAY = 380;
/** Pixels of mouse wheel or trackpad scroll per step through the menu. */
const STEP_PIXELS = 60;
/** After a step, the wheel waits this long (ms) so one trackpad flick moves one episode. */
const WHEEL_COOLDOWN = 260;

/** Episode view: moves to episode `index` (clamped to the first and last). */
export function goToEpisode(index: number) {
  player.show(Math.max(0, Math.min(episodes.length - 1, index)));
}

/** Opens episode `index`: the episode view from the title screen, or moves to it in the episode view. */
export function openEpisode(index: number) {
  if (player.get().view === "title") {
    if (player.get().opening !== null) return;
    player.setCursor(index);
    player.setOpening(index);
    window.setTimeout(() => player.open(index), OPEN_DELAY);
  }
  else {
    player.closeMenu();
    goToEpisode(index);
  }
}

/** Back one step: the grid, the episode view, then the space. */
export function back(leave: () => void) {
  const { menu, view } = player.get();
  if (menu) player.closeMenu();
  else if (view === "episodes") player.close();
  else leave();
}

/**
 * What each camera button does: ◀/▶ previous/next episode (or move through the
 * grid), FUNC.SET opens the episode on the title screen and pauses otherwise,
 * ▶ pauses, MENU opens the grid.
 */
export function press(button: CameraButton) {
  const { menu, cursor, index, view } = player.get();
  switch (button) {
    case "left":
    case "right":
    case "up":
    case "down": {
      const by = button === "left" || button === "up" ? -1 : 1;
      if (menu) player.step(button === "up" || button === "down" ? by * GRID_COLUMNS : by);
      else if (view === "episodes") goToEpisode(index + by);
      else player.step(by);
      break;
    }
    case "set":
      if (menu) openEpisode(cursor);
      else if (view === "title") player.open(index);
      else player.togglePlay();
      break;
    case "play":
      if (menu) openEpisode(cursor);
      else player.togglePlay();
      break;
    case "menu":
      player.toggleMenu();
      break;
    case "record":
      player.restart();
      break;
    case "disp":
      player.toggleHud();
      break;
  }
}

/**
 * Keyboard for the camera: ←/→ browse, Enter opens or pauses, M mutes, Esc goes
 * back. In the episode view ↑/↓/Space are left to <Story>, which moves between episodes.
 * Also pauses when the tab is hidden.
 */
export function useCameraControls() {
  const goHome = useGoHome();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const { view, menu } = player.get();
      const big = view === "title";
      const keys: Record<string, CameraButton | undefined> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: menu ? "up" : undefined,
        ArrowDown: menu ? "down" : undefined,
        Enter: "set",
        " ": big ? "play" : undefined,
        i: "disp",
        r: "record",
      };
      if (event.key === "Escape") {
        back(goHome);
        return;
      }
      if (event.key === "m" || event.key === "M") {
        player.toggleMute();
        return;
      }
      const button = keys[event.key];
      // Let focused buttons and links handle their own Enter/Space.
      const target = event.target;
      if (!button || (target instanceof HTMLElement && target.closest("button, a") && (event.key === "Enter" || event.key === " "))) return;
      event.preventDefault();
      press(button);
    };
    // The scroll wheel moves through the menu wherever the pointer is.
    let scrolled = 0;
    let lastStep = 0;
    const onWheel = (event: WheelEvent) => {
      if (!player.get().menu) return;
      event.preventDefault();
      scrolled += event.deltaMode === 1 ? event.deltaY * STEP_PIXELS : event.deltaY;
      if (Math.abs(scrolled) < STEP_PIXELS || event.timeStamp - lastStep < WHEEL_COOLDOWN) return;
      player.step(scrolled > 0 ? 1 : -1);
      scrolled = 0;
      lastStep = event.timeStamp;
    };
    const onVisibility = () => {
      if (document.hidden) player.setPlaying(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [goHome]);
}
