/*
 * Shared facts about the camera model (public/objects/camera/camera.glb, built by
 * scripts/camera/build-model.mjs). Plain module so server components can import it.
 *
 * Mesh-local coordinates come straight from the model file: x across the body,
 * y front-to-back (the lens points to -y), z up.
 */

export const MODEL_URL = "/objects/camera/camera.glb";

export const NODES = {
  collar: "lens-collar",
  face: "lens-face",
  blades: "lens-blades",
  lcd: "lcd",
} as const;

export const LENS = {
  /** Lens axis in mesh-local x/z. */
  x: 0.278,
  z: 0,
  /** Front lip of the fixed collar, and the collar's radius. */
  lip: -0.78,
  radius: 0.88,
  /** How far the front element travels when the lens opens. */
  extend: 0.55,
  bladesY: -0.824,
};

/** LCD corners in mesh-local x/z, on the back face. */
export const LCD = { x0: -0.91, x1: 1.33, z0: -0.87, z1: 0.94, y: 0.372 };

export type CameraButton = "play" | "record" | "up" | "down" | "left" | "right" | "set" | "menu" | "disp";

/** Back-panel controls in mesh-local x/z (seen from behind, -x is on the right). */
const DIAL = { x: -1.247, z: -0.212 };
export const BUTTONS: { id: CameraButton; label: string; x: number; z: number; r: number }[] = [
  { id: "disp", label: "Toggle display info", x: -1.116, z: 0.189, r: 0.11 },
  { id: "record", label: "Restart video", x: -1.358, z: 0.189, r: 0.11 },
  { id: "up", label: "Up", x: DIAL.x, z: DIAL.z + 0.17, r: 0.065 },
  { id: "down", label: "Down", x: DIAL.x, z: DIAL.z - 0.17, r: 0.065 },
  { id: "left", label: "Previous video", x: DIAL.x + 0.17, z: DIAL.z, r: 0.065 },
  { id: "right", label: "Next video", x: DIAL.x - 0.17, z: DIAL.z, r: 0.065 },
  { id: "set", label: "Func. set", x: DIAL.x, z: DIAL.z, r: 0.1 },
  { id: "play", label: "Play or pause", x: -1.117, z: -0.624, r: 0.11 },
  { id: "menu", label: "Menu", x: -1.358, z: -0.624, r: 0.11 },
];
export const BUTTONS_Y = 0.355;

/** How much of the viewport the camera back may fill on /shuisbored. */
export const STAGE_FIT = { width: 0.94, height: 0.8 };
