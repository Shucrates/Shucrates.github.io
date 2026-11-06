import type { StageConfig } from "@/components/stage/ObjectStage";
import { createStageStore } from "@/components/stage/store";
import { useMedia } from "@/components/stage/useMedia";
import { loadLaptopModel, type LaptopLayout } from "./model";

export const laptopStore = createStageStore<LaptopLayout>();

/**
 * Where the laptop opens on /projects. The one test for desktop vs phone there: the Mac, the
 * phone list and the phone case study page all follow it (not CSS breakpoints, which are in rem
 * and drift from it when the browser's font size isn't 16px).
 */
export const LAPTOP_DOCKS = "(min-width: 768px)";
export const useLaptopDocks = () => useMedia(LAPTOP_DOCKS);

/**
 * Shut on the homepage, seen from above; hover lifts the lid a little. Clicked, it dollies in
 * and opens until its screen fills the view, with a thin edge of bezel left showing.
 */
export const laptopStage: StageConfig<LaptopLayout> = {
  store: laptopStore,
  path: "/projects",
  load: loadLaptopModel,
  home: { pitch: 0.55, yaw: -0.45, roll: 0 },
  docked: { pitch: 0, yaw: 0, roll: 0 },
  hoverTurn: { pitch: -0.1, yaw: 0.15 },
  hoverOpen: { type: "spring", stiffness: 70, damping: 13 },
  fit: { width: 1, height: 1, inset: 16 },
  launch: true,
  // Phones get a plain list instead (see src/app/projects).
  dockWhen: LAPTOP_DOCKS,
};
