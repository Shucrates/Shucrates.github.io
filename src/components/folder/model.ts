import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { StageModel } from "@/components/stage/ObjectStage";

/*
 * Facts about public/objects/folder/folder.glb (built by scripts/folder/build-model.mjs).
 * The folder lies flat in the file: x across, z along its length (the tab end at -z), y out
 * of the front cover. Its cover opens through a run of morph targets, shut to wide open.
 */
const MODEL_URL = "/objects/folder/folder.glb";
/**
 * The model's loose pages are only the strips that peek out of the folder, hollow in the
 * middle, so they stay put. What slides out on hover are thin copies of the full page on top
 * of the stack: how high each sits (in model units, on top of the stack), how far it slides
 * out of the top, how much it turns, and whether it's flipped end over end so a different
 * part of the page shows.
 */
const STACK = "A4_Paper_StackShape_8_0";
const SHEETS = [
  { lift: 0.004, out: 0.3, turn: -0.04, flip: true },
  { lift: 0.008, out: 0.42, turn: 0.06, flip: false },
];
/** Thickness of a sliding sheet, as a share of the stack's. */
const SHEET_THICKNESS = 0.03;
/** How far hover lifts the cover, as a share of the way to wide open. */
const COVER_LIFT = 0.12;

let source: Promise<THREE.Group> | null = null;
const loadSource = () => (source ??= new GLTFLoader().loadAsync(MODEL_URL).then((gltf) => gltf.scene));

/** Loads the folder standing up, facing you. Hover lifts its cover a little and pushes the sheets out of the top. */
export async function loadFolderModel(): Promise<StageModel<never>> {
  const scene = (await loadSource()).clone(true);
  const find = (name: string) => {
    const object = scene.getObjectByName(name);
    if (!object) throw new Error(`folder.glb is missing "${name}"`);
    return object;
  };
  const cover = find("cover") as THREE.Mesh;
  const frames = cover.morphTargetInfluences!;
  // three bounds a morphing mesh by every frame at once, wide open included; size it shut.
  cover.geometry.boundingBox = new THREE.Box3().setFromBufferAttribute(cover.geometry.getAttribute("position") as THREE.BufferAttribute);
  const stack = find(STACK) as THREE.Mesh;
  stack.geometry.computeBoundingBox();
  const { min, max } = stack.geometry.boundingBox!;
  const centre = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
  const sheets = SHEETS.map((sheet) => {
    // Pivots about the page's centre, so flipping and turning keep it in the folder.
    const pivot = new THREE.Group();
    pivot.position.copy(stack.position).add(new THREE.Vector3(centre.x, max.y + sheet.lift, centre.z));
    const page = new THREE.Mesh(stack.geometry, stack.material);
    page.scale.y = SHEET_THICKNESS;
    page.position.set(-centre.x, -max.y * SHEET_THICKNESS, -centre.z);
    pivot.add(page);
    if (sheet.flip) pivot.rotation.y = Math.PI;
    stack.parent!.add(pivot);
    return { ...sheet, object: pivot, z: pivot.position.z, rotation: pivot.rotation.y };
  });

  // Stood up: the front faces the camera (+z) and the tab end points up.
  const holder = new THREE.Group();
  holder.rotation.x = Math.PI / 2;
  holder.add(scene);
  const root = new THREE.Group();
  root.add(holder);
  const box = new THREE.Box3().setFromObject(holder);
  const size = box.getSize(new THREE.Vector3());
  holder.scale.setScalar(1 / size.x);
  holder.position.copy(box.getCenter(new THREE.Vector3())).multiplyScalar(-1 / size.x);

  return {
    root,
    face: { centre: new THREE.Vector3(), width: 1, height: size.y / size.x },
    pose: (hover) => {
      // Blend the two cover frames either side of where it should be.
      const at = Math.max(0, hover * COVER_LIFT) * (frames.length - 1);
      frames.fill(0);
      const below = Math.min(Math.floor(at), frames.length - 1);
      frames[below] = 1 - (at - below);
      if (below + 1 < frames.length) frames[below + 1] = at - below;
      // The sheets sit in the folder's own space, where up the page is -z.
      for (const sheet of sheets) {
        sheet.object.position.z = sheet.z - sheet.out * hover;
        sheet.object.rotation.y = sheet.rotation + sheet.turn * hover;
      }
    },
  };
}
