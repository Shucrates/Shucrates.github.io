import * as THREE from "three";
import type { StageModel } from "@/components/stage/ObjectStage";
import type { Box } from "@/components/stage/store";

/*
 * A classic-style iPod, built from primitives: silver anodised front, click wheel,
 * polished chrome back. Root units: 1 wide, y up, front face towards +z.
 * Proportions follow the real thing (61.8 × 103.5 × 10.5 mm).
 */
const HEIGHT = 103.5 / 61.8;
const DEPTH = 10.5 / 61.8;
const CORNER = 0.11;
/** The polished back wraps round the sides in a soft pillow curve. */
const EDGE = { size: 0.035, thickness: 0.055 };
/** The aluminium front plate sits on the flat of the front, a hair proud of it. */
const PLATE = 0.004;
const FRONT = DEPTH / 2 + PLATE;
export const IPOD = {
  screen: { y: 0.41, width: 0.81, height: 0.61 },
  wheel: { y: -0.4, radius: 0.31, centre: 0.12 },
};

export type IpodLayout = { screen: Box; wheel: { x: number; y: number; radius: number; centre: number } };

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

/** Draws onto a canvas texture; `size` is in CSS-ish pixels, rendered at 2×. */
function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/** The menu the screen shows when it wakes on the homepage. */
function homeScreen() {
  return canvasTexture(324, 244, (ctx) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 324, 244);
    const bar = ctx.createLinearGradient(0, 0, 0, 30);
    bar.addColorStop(0, "#f4f5f7");
    bar.addColorStop(1, "#c9ced6");
    ctx.fillStyle = bar;
    ctx.fillRect(0, 0, 324, 30);
    ctx.fillStyle = "#111";
    ctx.font = `600 16px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("iPod", 162, 21);
    const items = ["Music", "Artists", "On Repeat", "Shuffle Songs", "Settings"];
    ctx.textAlign = "left";
    ctx.font = `500 17px ${FONT}`;
    items.forEach((item, i) => {
      const y = 30 + i * 32;
      if (i === 0) {
        const highlight = ctx.createLinearGradient(0, y, 0, y + 32);
        highlight.addColorStop(0, "#5aa2f0");
        highlight.addColorStop(1, "#1f6fd1");
        ctx.fillStyle = highlight;
        ctx.fillRect(0, y, 324, 32);
      }
      ctx.fillStyle = i === 0 ? "#fff" : "#111";
      ctx.fillText(item, 12, y + 22);
      ctx.fillText("›", 300, y + 22);
    });
  });
}

function wheelLabels() {
  return canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = "#dfe1e4";
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8e949c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 19px ${FONT}`;
    ctx.fillText("MENU", 128, 30);
    ctx.font = `700 18px ${FONT}`;
    ctx.fillText("▶❙❙", 128, 228);
    ctx.fillText("▶▶❙", 226, 128);
    ctx.fillText("❙◀◀", 30, 128);
  });
}

/** Fine grain for the bead-blasted aluminium, used as a bump map. */
function grain() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 110 + Math.random() * 36;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/** A soft diagonal sheen for the plastic window over the screen. */
function glare() {
  return canvasTexture(128, 128, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,0.22)");
    g.addColorStop(0.38, "rgba(255,255,255,0.07)");
    g.addColorStop(0.39, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
}

/** A rounded-edged disc facing +z: flat top of height `h`, its rim rounded over by `round`. */
function roundedDisc(radius: number, h: number, round: number, segments = 72) {
  const points = [new THREE.Vector2(0, h)];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    points.push(new THREE.Vector2(radius - round + Math.sin(a) * round, h - round + Math.cos(a) * round));
  }
  points.push(new THREE.Vector2(radius, 0));
  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

export async function loadIpodModel(): Promise<StageModel<IpodLayout>> {
  // Shell: polished stainless steel, rounded all round.
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xe2e5e9, metalness: 1, roughness: 0.06, clearcoat: 0.6 });
  const core = DEPTH - 2 * EDGE.thickness;
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(1 - 2 * EDGE.size, HEIGHT - 2 * EDGE.size, CORNER - EDGE.size), {
      depth: core,
      bevelEnabled: true,
      bevelSize: EDGE.size,
      bevelThickness: EDGE.thickness,
      bevelSegments: 12,
      curveSegments: 24,
    }),
    chrome,
  );
  body.position.z = -core / 2;

  // Front: bead-blasted silver aluminium, its edge softly rounded.
  const plateSize = 1 - 2 * EDGE.size;
  const aluminium = new THREE.MeshStandardMaterial({
    color: 0xc3c8ce,
    metalness: 0.9,
    roughness: 0.48,
    bumpMap: grain(),
    bumpScale: 0.6,
    envMapIntensity: 0.9,
  });
  const front = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(plateSize - 0.006, HEIGHT - 2 * EDGE.size - 0.006, CORNER - EDGE.size - 0.003), {
      depth: PLATE / 2,
      bevelEnabled: true,
      bevelSize: 0.003,
      bevelThickness: PLATE / 4,
      bevelSegments: 3,
      curveSegments: 24,
    }),
    aluminium,
  );
  front.position.z = DEPTH / 2 + PLATE / 4;

  const { screen: s, wheel: w } = IPOD;
  // The clear window: black surround, the LCD, and a sheen of reflection over both.
  const windowShape = roundedRect(s.width + 0.07, s.height + 0.07, 0.025);
  const bezel = new THREE.Mesh(new THREE.ShapeGeometry(windowShape, 8), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.2 }));
  bezel.position.set(0, s.y, FRONT + 0.0006);
  const display = new THREE.MeshBasicMaterial({ map: homeScreen(), toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(s.width, s.height), display);
  screen.position.set(0, s.y, FRONT + 0.0012);
  const sheen = new THREE.Mesh(
    new THREE.ShapeGeometry(windowShape, 8),
    new THREE.MeshBasicMaterial({ map: glare(), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }),
  );
  // ShapeGeometry UVs are in shape units; stretch the sheen over the window.
  const uv = sheen.geometry.getAttribute("uv");
  const position = sheen.geometry.getAttribute("position");
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, position.getX(i) / (s.width + 0.07) + 0.5, position.getY(i) / (s.height + 0.07) + 0.5);
  }
  sheen.position.set(0, s.y, FRONT + 0.002);

  // Click wheel: a matte disc set in a fine groove, with a domed aluminium button.
  const groove = new THREE.Mesh(new THREE.CircleGeometry(w.radius + 0.006, 96), new THREE.MeshBasicMaterial({ color: 0xa3a8ae }));
  groove.position.set(0, w.y, FRONT + 0.0004);
  const wheel = new THREE.Mesh(
    roundedDisc(w.radius, 0.004, 0.004, 96),
    new THREE.MeshStandardMaterial({ color: 0xe8e9eb, roughness: 0.85, metalness: 0, envMapIntensity: 0.45 }),
  );
  wheel.position.set(0, w.y, FRONT);
  const labels = new THREE.Mesh(
    new THREE.CircleGeometry(w.radius - 0.004, 96),
    new THREE.MeshStandardMaterial({ map: wheelLabels(), roughness: 0.85, metalness: 0, envMapIntensity: 0.45 }),
  );
  labels.position.set(0, w.y, FRONT + 0.0042);
  const gap = new THREE.Mesh(new THREE.CircleGeometry(w.centre + 0.005, 64), new THREE.MeshBasicMaterial({ color: 0xa3a8ae }));
  gap.position.set(0, w.y, FRONT + 0.0046);
  const buttonFinish = aluminium.clone();
  buttonFinish.setValues({ color: 0xd5d9de, metalness: 0.55, roughness: 0.4 });
  const button = new THREE.Mesh(roundedDisc(w.centre, 0.01, 0.006, 64), buttonFinish);
  button.position.set(0, w.y, FRONT + 0.0006);

  // Top: headphone jack and hold switch. Bottom: dock connector.
  const dark = new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.5 });
  const top = HEIGHT / 2;
  const jack = new THREE.Mesh(new THREE.CircleGeometry(0.026, 32), dark);
  jack.rotation.x = -Math.PI / 2;
  jack.position.set(-0.3, top + 0.0005, 0);
  const holdSlot = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.04), dark);
  holdSlot.rotation.x = -Math.PI / 2;
  holdSlot.position.set(0.3, top + 0.0005, 0);
  const hold = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.032), chrome);
  hold.position.set(0.33, top + 0.004, 0);
  const dock = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(0.36, 0.035, 0.012), 6), dark);
  dock.rotation.x = Math.PI / 2;
  dock.position.set(0, -top - 0.0005, 0);

  const root = new THREE.Group();
  root.add(body, front, bezel, screen, sheen, groove, wheel, labels, gap, button, jack, holdSlot, hold, dock);

  const project3 = (project: (p: THREE.Vector3) => { x: number; y: number }, x: number, y: number) =>
    project(root.localToWorld(new THREE.Vector3(x, y, FRONT)));

  return {
    root,
    face: { centre: new THREE.Vector3(0, 0, FRONT), width: 1, height: HEIGHT },
    // The screen wakes on hover, and stays on once docked.
    pose: (hover, dock) => {
      display.color.setScalar(0.06 + 0.94 * Math.max(hover, dock));
    },
    layout: (project) => {
      const a = project3(project, -s.width / 2, s.y + s.height / 2);
      const b = project3(project, s.width / 2, s.y - s.height / 2);
      const c = project3(project, 0, w.y);
      const rim = project3(project, w.radius, w.y);
      const inner = project3(project, w.centre, w.y);
      return {
        screen: { left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y },
        wheel: { x: c.x, y: c.y, radius: rim.x - c.x, centre: inner.x - c.x },
      };
    },
  };
}
