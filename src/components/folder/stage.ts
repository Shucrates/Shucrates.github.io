import type { StageConfig } from "@/components/stage/ObjectStage";
import { createStageStore } from "@/components/stage/store";
import { loadFolderModel } from "./model";

export const folderStore = createStageStore<never>();

/**
 * Standing on the homepage, stuffed with paper; hover lifts the cover and the sheets jiggle
 * out of the top. It never docks yet: clicking it just opens /posters.
 */
export const folderStage: StageConfig<never> = {
  store: folderStore,
  path: "/posters",
  load: loadFolderModel,
  home: { pitch: 0.12, yaw: 0.3, roll: 0.05 },
  docked: { pitch: 0, yaw: 0, roll: 0 },
  hoverTurn: { pitch: 0, yaw: -0.2 },
  // Underdamped, so the sheets overshoot and settle like they've been jostled.
  hoverOpen: { type: "spring", stiffness: 140, damping: 7 },
  fit: { width: 0.6, height: 0.8 },
  // TODO: the transition into /posters.
  dockWhen: "not all",
};
