import type { StageConfig } from "@/components/stage/ObjectStage";
import { createStageStore } from "@/components/stage/store";
import { loadCardModel, type CardLayout } from "./model";

export const cardStore = createStageStore<CardLayout>();

/** Lying on the desk on the homepage; hover picks it up and flips it. Docked on /contact it shows the side with the photo. */
export const cardStage: StageConfig<CardLayout> = {
  store: cardStore,
  path: "/contact",
  load: loadCardModel,
  home: { pitch: -0.95, yaw: 0, roll: 0.1 },
  docked: { pitch: 0, yaw: Math.PI, roll: 0 },
  hoverTurn: { pitch: 0.7, yaw: Math.PI },
  hoverOpen: { type: "spring", stiffness: 110, damping: 15 },
  fit: { width: 0.72, height: 0.6 },
};
