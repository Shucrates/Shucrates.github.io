import type { StageConfig } from "@/components/stage/ObjectStage";
import { createStageStore } from "@/components/stage/store";
import { STAGE_FIT } from "./geometry";
import { loadCameraModel, type ScreenLayout } from "./model";

export const cameraStore = createStageStore<ScreenLayout>();

/** Three-quarter view on the homepage; hover extends the lens. Docked on /shuisbored it turns to show its back. */
export const cameraStage: StageConfig<ScreenLayout> = {
  store: cameraStore,
  path: "/shuisbored",
  load: loadCameraModel,
  home: { pitch: 0.18, yaw: -0.5, roll: 0 },
  docked: { pitch: 0, yaw: Math.PI, roll: 0 },
  hoverTurn: { pitch: 0, yaw: -0.3 },
  // Motor-driven: quick start, a touch of overshoot, settles.
  hoverOpen: { type: "spring", stiffness: 120, damping: 16, mass: 0.9 },
  fit: STAGE_FIT,
};
