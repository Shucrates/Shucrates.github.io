import type { StageConfig } from "@/components/stage/ObjectStage";
import { createStageStore } from "@/components/stage/store";
import { loadMedalModel } from "./model";

export const medalStore = createStageStore<never>();

/**
 * Hangs face-on on the homepage; hover twists it on its ribbon. On /achievements
 * <MedalSwing> takes over its pose and swings it from a hook above the page.
 */
export const medalStage: StageConfig<never> = {
  store: medalStore,
  path: "/achievements",
  load: loadMedalModel,
  home: { pitch: 0.08, yaw: -0.25, roll: 0 },
  docked: { pitch: 0, yaw: 0, roll: 0 },
  hoverTurn: { pitch: 0, yaw: 0 },
  // Underdamped so it twists past and back like it's on a ribbon.
  hoverOpen: { type: "spring", stiffness: 70, damping: 5 },
  fit: { width: 1, height: 1 },
  rotationOrder: "ZYX",
};
