import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { StageModel } from "@/components/stage/ObjectStage";
import type { Box } from "@/components/stage/store";

/*
 * Facts about public/objects/laptop/laptop.glb (built by scripts/laptop/build-model.mjs).
 * Mesh-local coordinates come straight from the model file: x across, y front-to-back
 * (the screen faces -y), z up. The lid ships open at 90°.
 */
const MODEL_URL = "/objects/laptop/laptop.glb";
const LID_PARTS = ["lid-shell", "screen", "lid-bezel", "logo"];
/** Hinge axis (along x), in mesh-local y/z. */
const HINGE = { y: 1.085, z: -0.03 };
/** Lit area of the display in mesh-local coordinates, measured off the screen texture with a little bleed. */
const DISPLAY = { x: 1.47, y: 1.076, z0: 0.095, z1: 1.965 };
/** Lid angles from its shipped 90°: shut, and opened about 25° on hover. */
const LID = { shut: Math.PI / 2, hover: Math.PI / 2 - THREE.MathUtils.degToRad(25) };

export type LaptopLayout = { screen: Box };

/** Sleeping or shutting down the Mac turns its display off; it comes back on once the lid is shut. */
let screenOn = true;
export const switchOffScreen = () => {
  screenOn = false;
};

let source: Promise<THREE.Group> | null = null;
const loadSource = () => (source ??= new GLTFLoader().loadAsync(MODEL_URL).then((gltf) => gltf.scene));

/** Loads the MacBook and hinges its lid: shut on the homepage, opening on hover and fully when docked. */
export async function loadLaptopModel(): Promise<StageModel<LaptopLayout>> {
  const scene = (await loadSource()).clone(true);
  const find = (name: string) => {
    const node = scene.getObjectByName(name);
    if (!node?.parent) throw new Error(`laptop.glb is missing "${name}"`);
    return node;
  };
  const shell = find("lid-shell");
  const screen = (find("screen") as THREE.Mesh).material as THREE.MeshStandardMaterial;
  const lit = { color: screen.color.clone(), emissive: screen.emissiveIntensity };
  const local = shell.parent!;
  const hinge = new THREE.Group();
  hinge.position.set(0, HINGE.y, HINGE.z);
  local.add(hinge);
  for (const name of LID_PARTS) {
    const part = find(name);
    part.position.set(0, -HINGE.y, -HINGE.z);
    hinge.add(part);
  }

  // Normalise around the open laptop so the docked screen can be measured, then shut it.
  const root = new THREE.Group();
  const holder = new THREE.Group();
  root.add(holder);
  holder.add(scene);
  const box = new THREE.Box3().setFromObject(scene);
  const width = box.max.x - box.min.x;
  holder.scale.setScalar(1 / width);
  root.updateMatrixWorld(true);
  const display = (x: number, z: number) => shell.localToWorld(new THREE.Vector3(x, DISPLAY.y, z));
  const corners = () => [
    display(-DISPLAY.x, DISPLAY.z1),
    display(DISPLAY.x, DISPLAY.z1),
    display(DISPLAY.x, DISPLAY.z0),
    display(-DISPLAY.x, DISPLAY.z0),
  ];
  const [topLeft, topRight, , bottomLeft] = corners();
  const face = {
    centre: new THREE.Vector3().addVectors(topRight, bottomLeft).multiplyScalar(0.5),
    width: topLeft.distanceTo(topRight),
    height: topLeft.distanceTo(bottomLeft),
  };
  // Centre the shut laptop in its homepage slot.
  hinge.rotation.x = LID.shut;
  root.updateMatrixWorld(true);
  const centre = new THREE.Box3().setFromObject(scene).getCenter(new THREE.Vector3());
  holder.position.sub(centre);
  face.centre.sub(centre);

  return {
    root,
    face,
    pose: (hover, dock) => {
      const homeAngle = THREE.MathUtils.lerp(LID.shut, LID.hover, hover);
      hinge.rotation.x = THREE.MathUtils.lerp(homeAngle, 0, THREE.MathUtils.smoothstep(dock, 0, 0.8));
      if (dock === 0) screenOn = true;
      screen.color.copy(lit.color).multiplyScalar(screenOn ? 1 : 0.02);
      screen.emissiveIntensity = screenOn ? lit.emissive : 0;
    },
    layout: (project) => {
      const points = corners().map(project);
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      return {
        screen: {
          left: Math.min(...xs),
          top: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        },
      };
    },
  };
}
