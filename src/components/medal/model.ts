import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { StageModel } from "@/components/stage/ObjectStage";
import { MEDAL, MODEL_URL } from "./geometry";

/** How far hover twists the medal on its ribbon, in radians. */
const HOVER_TWIST = 0.6;

let source: Promise<THREE.Group> | null = null;
const loadSource = () => (source ??= new GLTFLoader().loadAsync(MODEL_URL).then((gltf) => gltf.scene));

/**
 * The ribbon's shape, as handed over by <MedalSwing> in `Dock.deform`: the twist
 * (radians), then x/y points from the hook down the ribbon to the clasp, then the
 * disc's centre. Model units (the medal is 1 wide), y down, relative to the hook.
 */
export const RIBBON_POINTS = 13;
export const restShape = () => {
  const shape = [0];
  const step = MEDAL.ribbonLength / (RIBBON_POINTS - 1);
  for (let i = 0; i < RIBBON_POINTS; i++) shape.push(0, i * step);
  shape.push(0, MEDAL.ribbonLength + MEDAL.discDrop);
  return shape;
};

/**
 * Loads the medal hanging straight from its hook (the face centre), with the ribbon
 * bent to follow a simulated cloth strip and the clasp and disc riding on its end.
 */
export async function loadMedalModel(): Promise<StageModel<never>> {
  const scene = (await loadSource()).clone(true);
  scene.rotation.x = MEDAL.hang;
  const holder = new THREE.Group();
  holder.add(scene);
  const box = new THREE.Box3().setFromObject(holder);
  holder.scale.setScalar(1 / (box.max.x - box.min.x));
  holder.position.copy(box.getCenter(new THREE.Vector3())).multiplyScalar(-holder.scale.x);
  holder.updateMatrixWorld(true);

  // Bake every mesh into root space so vertices can be moved directly.
  const root = new THREE.Group();
  const meshes: THREE.Mesh[] = [];
  holder.traverse((object) => {
    if (object instanceof THREE.Mesh) meshes.push(object);
  });
  for (const mesh of meshes) {
    const geometry = mesh.geometry.clone();
    // Positions and normals may be stored quantised; vertices are rewritten every frame, so make them plain floats.
    for (const name of ["position", "normal"]) {
      const attribute = geometry.getAttribute(name);
      if (!attribute) continue;
      const floats = new Float32Array(attribute.count * 3);
      for (let i = 0; i < attribute.count; i++) {
        floats[3 * i] = attribute.getX(i);
        floats[3 * i + 1] = attribute.getY(i);
        floats[3 * i + 2] = attribute.getZ(i);
      }
      geometry.setAttribute(name, new THREE.BufferAttribute(floats, 3));
    }
    mesh.geometry = geometry.applyMatrix4(mesh.matrixWorld);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    mesh.frustumCulled = false;
    root.add(mesh);
  }

  // The hook: the top of the ribbon loop.
  const hook = new THREE.Vector3(0, -Infinity, 0);
  for (const mesh of meshes) {
    const position = mesh.geometry.getAttribute("position");
    for (let i = 0; i < position.count; i++) {
      if (position.getY(i) > hook.y) hook.set(position.getX(i), position.getY(i), position.getZ(i));
    }
  }
  const clasp = hook.y - MEDAL.ribbonLength;

  const parts = meshes.map((mesh) => {
    const position = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const normal = mesh.geometry.getAttribute("normal") as THREE.BufferAttribute | undefined;
    return { position, normal, rest: position.array.slice(), restNormal: normal?.array.slice() };
  });

  const rest = restShape();
  const shape = rest.slice();
  const segments = RIBBON_POINTS - 1;
  const angles = new Float32Array(segments);
  let posed = "";

  return {
    root,
    face: { centre: hook, width: 1, height: MEDAL.height },
    pose: (hover, dock, deform) => {
      // On the homepage the ribbon hangs straight; flying onto the page it eases into the page's shape.
      const target = deform ?? rest;
      for (let i = 0; i < shape.length; i++) shape[i] = rest[i] + (target[i] - rest[i]) * dock;
      shape[0] = THREE.MathUtils.lerp(hover * HOVER_TWIST, target[0], dock);
      const key = shape.join();
      if (key === posed) return;
      posed = key;

      const twist = shape[0];
      const px = (i: number) => shape[1 + 2 * i];
      const py = (i: number) => shape[2 + 2 * i];
      // Each segment's lean from straight down (positive swings the lower end right).
      for (let k = 0; k < segments; k++) angles[k] = Math.atan2(px(k + 1) - px(k), py(k + 1) - py(k));
      const end = RIBBON_POINTS - 1;
      const discAngle = Math.atan2(px(end + 1) - px(end), py(end + 1) - py(end));

      for (const { position, normal, rest: p0, restNormal: n0 } of parts) {
        const p = position.array as Float32Array;
        const n = normal?.array as Float32Array | undefined;
        for (let i = 0; i < position.count; i++) {
          const j = 3 * i;
          const ox = p0[j] - hook.x;
          const oz = p0[j + 2] - hook.z;
          let s: number; // 0 at the hook, 1 at the clasp
          let lean: number;
          let cx: number;
          let cy: number;
          let oy = 0;
          let turn: number;
          if (p0[j + 1] > clasp) {
            s = (hook.y - p0[j + 1]) / MEDAL.ribbonLength;
            const at = Math.min(segments - 1e-6, s * segments);
            const k = Math.floor(at);
            const f = at - k;
            cx = px(k) + (px(k + 1) - px(k)) * f;
            cy = py(k) + (py(k + 1) - py(k)) * f;
            // Blend into the neighbouring segment's lean so the ribbon curves rather than kinks.
            const next = k + 1 < segments ? angles[k + 1] : discAngle;
            lean = angles[k] + (next - angles[k]) * Math.max(0, f - 0.5);
            turn = twist * s;
          } else {
            // Clasp and disc: rigid, hanging off the end of the ribbon.
            cx = px(end);
            cy = py(end);
            oy = p0[j + 1] - clasp;
            lean = discAngle;
            turn = twist;
          }
          const ct = Math.cos(turn);
          const st = Math.sin(turn);
          const cl = Math.cos(lean);
          const sl = Math.sin(lean);
          // Twist about the ribbon (y), then lean (z). Model y is up; shape y is down.
          const tx = ox * ct + oz * st;
          const tz = -ox * st + oz * ct;
          p[j] = hook.x + cx + tx * cl - oy * sl;
          p[j + 1] = hook.y - cy + tx * sl + oy * cl;
          p[j + 2] = hook.z + tz;
          if (n && n0) {
            const nx = n0[j] * ct + n0[j + 2] * st;
            const nz = -n0[j] * st + n0[j + 2] * ct;
            const ny = n0[j + 1];
            n[j] = nx * cl - ny * sl;
            n[j + 1] = nx * sl + ny * cl;
            n[j + 2] = nz;
          }
        }
        position.needsUpdate = true;
        if (normal) normal.needsUpdate = true;
      }
    },
  };
}
