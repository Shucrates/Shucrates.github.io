import type { StageConfig } from "@/components/stage/ObjectStage";
import { createStageStore } from "@/components/stage/store";
import { loadIpodModel, type IpodLayout } from "./model";

export const ipodStore = createStageStore<IpodLayout>();

/** Standing on the homepage, screen asleep; hover wakes it. Docked on /music it faces you, ready to play with. */
export const ipodStage: StageConfig<IpodLayout> = {
  store: ipodStore,
  path: "/music",
  load: loadIpodModel,
  home: { pitch: 0.1, yaw: 0.35, roll: -0.06 },
  docked: { pitch: 0, yaw: 0, roll: 0 },
  hoverTurn: { pitch: 0, yaw: -0.3 },
  hoverOpen: { type: "spring", stiffness: 120, damping: 14 },
  fit: { width: 0.9, height: 0.84 },
};
