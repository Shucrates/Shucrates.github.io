import type { StageConfig } from "@/components/stage/ObjectStage";
import { createStageStore } from "@/components/stage/store";
import { loadLaptopModel, type LaptopLayout } from "./model";

export const laptopStore = createStageStore<LaptopLayout>();

/** Shut on the homepage, seen from above; hover lifts the lid a little. Docked on /projects it opens fully and its screen fills the view. */
export const laptopStage: StageConfig<LaptopLayout> = {
  store: laptopStore,
  path: "/projects",
  load: loadLaptopModel,
  home: { pitch: 0.55, yaw: -0.45, roll: 0 },
  docked: { pitch: 0, yaw: 0, roll: 0 },
  hoverTurn: { pitch: -0.1, yaw: 0.15 },
  hoverOpen: { type: "spring", stiffness: 70, damping: 13 },
  fit: { width: 0.95, height: 0.86 },
};
