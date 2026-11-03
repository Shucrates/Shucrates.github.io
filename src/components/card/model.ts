import * as THREE from "three";
import type { StageModel } from "@/components/stage/ObjectStage";
import type { Box } from "@/components/stage/store";

/** Card artwork, 971 × 613 with rounded corners (public/objects/card). */
const FRONT_URL = "/objects/card/front.webp";
const BACK_URL = "/objects/card/back.webp";
/** In card widths: the artwork's aspect ratio and corner radius, and a credit card's thickness. */
const HEIGHT = 613 / 971;
const RADIUS = 0.02;
const THICKNESS = 0.009;
const PAPER = 0xefeee9;

export type CardLayout = { card: Box };

function roundedRect(width: number, height: number, radius: number) {
  const [x, y] = [width / 2, height / 2];
  const shape = new THREE.Shape();
  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.quadraticCurveTo(x, -y, x, -y + radius);
  shape.lineTo(x, y - radius);
  shape.quadraticCurveTo(x, y, x - radius, y);
  shape.lineTo(-x + radius, y);
  shape.quadraticCurveTo(-x, y, -x, y - radius);
  shape.lineTo(-x, -y + radius);
  shape.quadraticCurveTo(-x, -y, -x + radius, -y);
  return shape;
}

/** One printed side, with the artwork stretched over the whole shape. */
async function side(shape: THREE.Shape, url: string) {
  const geometry = new THREE.ShapeGeometry(shape, 8);
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, position.getX(i) + 0.5, position.getY(i) / HEIGHT + 0.5);
  }
  // Loaded up front: the stage only redraws when something moves, so a late texture would never show.
  const texture = await new THREE.TextureLoader().loadAsync(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  // Unlit and untoned so the print keeps its exact colours; the edge and shadow give it depth.
  const material = new THREE.MeshBasicMaterial({ map: texture, alphaTest: 0.5, toneMapped: false });
  return new THREE.Mesh(geometry, material);
}

/** Builds the NFC card: a thin rounded slab with the front and back artwork on its faces. */
export async function loadCardModel(): Promise<StageModel<CardLayout>> {
  const shape = roundedRect(1, HEIGHT, RADIUS);
  // The edge is a hair thinner than the faces so they never z-fight with its caps.
  const edge = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: THICKNESS * 0.8, bevelEnabled: false, curveSegments: 8 }),
    new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.6 }),
  );
  edge.position.z = -THICKNESS * 0.4;
  const [front, back] = await Promise.all([side(shape, FRONT_URL), side(shape, BACK_URL)]);
  front.position.z = THICKNESS / 2;
  back.rotation.y = Math.PI;
  back.position.z = -THICKNESS / 2;

  const card = new THREE.Group();
  card.add(edge, front, back);
  const root = new THREE.Group();
  root.add(card);

  const corners = [
    new THREE.Vector3(-0.5, HEIGHT / 2, 0),
    new THREE.Vector3(0.5, HEIGHT / 2, 0),
    new THREE.Vector3(0.5, -HEIGHT / 2, 0),
    new THREE.Vector3(-0.5, -HEIGHT / 2, 0),
  ];
  return {
    root,
    face: { centre: new THREE.Vector3(0, 0, THICKNESS / 2), width: 1, height: HEIGHT },
    // Hover and docking only turn the card, which the stage does.
    pose: () => {},
    // The card's footprint as if facing you, so the drag area doesn't shrink as it turns.
    layout: (project) => {
      const points = corners.map((corner) => project(corner.clone().multiplyScalar(root.scale.x).add(root.position)));
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      return {
        card: {
          left: Math.min(...xs),
          top: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        },
      };
    },
  };
}
