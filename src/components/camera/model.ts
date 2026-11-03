import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { StageModel } from "@/components/stage/ObjectStage";
import type { Box } from "@/components/stage/store";
import { BUTTONS, BUTTONS_Y, LCD, LENS, MODEL_URL, NODES, type CameraButton } from "./geometry";

/** Where the LCD and buttons land on screen once the camera is docked on /shuisbored. */
export type ScreenLayout = {
  lcd: Box;
  buttons: { id: CameraButton; label: string; box: Box }[];
};

// Parsed once per session; each stage clones it.
let source: Promise<THREE.Group> | null = null;
const loadSource = () => (source ??= new GLTFLoader().loadAsync(MODEL_URL).then((gltf) => gltf.scene));

/**
 * Loads the camera and rigs its lens: two inner tubes slide out of the fixed
 * collar carrying the front element, then the lens-cover blades iris open onto
 * the glass behind them.
 */
export async function loadCameraModel(): Promise<StageModel<ScreenLayout>> {
  const scene = (await loadSource()).clone(true);
  const find = (name: string) => {
    const node = scene.getObjectByName(name);
    if (!node?.parent) throw new Error(`camera.glb is missing "${name}"`);
    return node;
  };
  const collar = find(NODES.collar);
  const local = collar.parent!;

  // Front element (face, blades, glass) as one group centred on the lens axis.
  const front = new THREE.Group();
  front.position.set(LENS.x, 0, LENS.z);
  local.add(front);
  const iris = new THREE.Group();
  front.add(find(NODES.face), iris);
  iris.add(find(NODES.blades));
  for (const part of [find(NODES.face), find(NODES.blades)]) part.position.set(-LENS.x, 0, -LENS.z);

  // Plain black glass: only the studio reflections show on it.
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 64),
    new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
  );
  glass.rotation.x = Math.PI / 2; // face -y, the way the lens points
  glass.position.y = LENS.bladesY + 0.003;
  front.add(glass);

  const tubeLength = LENS.extend * 0.62;
  const tube = (radius: number) => {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, tubeLength, 72, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.32, side: THREE.DoubleSide }),
    );
    mesh.position.set(LENS.x, 0, LENS.z);
    local.add(mesh);
    return mesh;
  };
  const outerTube = tube(LENS.radius * 0.91);
  const innerTube = tube(LENS.radius * 0.84);

  const setLens = (open: number) => {
    // First 60% extends the barrel, the rest opens the cover.
    const reach = THREE.MathUtils.smoothstep(open, 0, 0.6);
    const opening = THREE.MathUtils.smoothstep(open, 0.5, 1);
    front.position.y = -reach * LENS.extend;
    const shrink = 1 - 0.16 * reach;
    front.scale.set(shrink, 1, shrink);
    outerTube.position.y = LENS.lip - reach * LENS.extend * 0.5 + tubeLength / 2;
    innerTube.position.y = LENS.lip - reach * LENS.extend + tubeLength / 2;
    outerTube.visible = innerTube.visible = reach > 0.001;
    const blade = Math.max(0.001, 1 - opening);
    iris.scale.set(blade, 1, blade);
    iris.rotation.y = opening * 0.9;
    glass.visible = opening > 0;
  };
  setLens(0);

  // Normalise: centre the body and make it 1 unit wide.
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  scene.position.sub(box.getCenter(new THREE.Vector3()));
  const holder = new THREE.Group();
  holder.scale.setScalar(1 / size.x);
  holder.add(scene);
  const root = new THREE.Group();
  root.add(holder);

  const toWorld = (x: number, y: number, z: number) => local.localToWorld(new THREE.Vector3(x, y, z));
  const bodySize = size.divideScalar(size.x);
  return {
    root,
    // The back faces the viewer once docked (turned by π), so its centre is half the depth behind.
    face: { centre: new THREE.Vector3(0, 0, -bodySize.z / 2), width: 1, height: bodySize.y },
    pose: (hover) => setLens(hover),
    layout: (project) => {
      const corners = [
        toWorld(LCD.x1, LCD.y, LCD.z1),
        toWorld(LCD.x0, LCD.y, LCD.z1),
        toWorld(LCD.x0, LCD.y, LCD.z0),
        toWorld(LCD.x1, LCD.y, LCD.z0),
      ].map(project);
      const xs = corners.map((c) => c.x);
      const ys = corners.map((c) => c.y);
      const lcd = {
        left: Math.min(...xs),
        top: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
      const buttons = BUTTONS.map(({ id, label, x, z, r }) => {
        const c = project(toWorld(x, BUTTONS_Y, z));
        const rim = project(toWorld(x + r, BUTTONS_Y, z));
        const radius = Math.hypot(rim.x - c.x, rim.y - c.y);
        return { id, label, box: { left: c.x - radius, top: c.y - radius, width: radius * 2, height: radius * 2 } };
      });
      return { lcd, buttons };
    },
  };
}
