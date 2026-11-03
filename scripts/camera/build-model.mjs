// Turns the Sketchfab "Digital Camera" (Dokono Kinokoda, CC BY 4.0) into our black
// Canon PowerShot SX510 HS: recolours it, swaps the parody "Cammon / TowerShot"
// markings for Canon ones, blanks the LCD and compresses everything for the web.
//
// Usage: node scripts/camera/build-model.mjs "canon camera assets/digital_camera.glb" public/objects/camera/camera.glb
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, textureCompress } from "@gltf-transform/functions";
import sharp from "sharp";

const [src, out] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
const materials = Object.fromEntries(doc.getRoot().listMaterials().map((m) => [m.getName(), m]));

const SIZE = 2048;
const INK = "#e9e9e6";
const FLAT_NORMAL = { r: 128, g: 128, b: 255 };
const SANS = "Helvetica Neue, Helvetica, Arial, sans-serif";
// Canon's wordmark is a custom face; a heavy serif reads as it at this size.
const LOGO = "Times New Roman, Times, serif";

/** Renders `svg` (drawn the way it should read on the camera) and turns it to match the UV layout. */
async function label(svg, width, height, rotate, mirror) {
  const drawn = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${svg}</svg>`))
    .flop(mirror)
    .png()
    .toBuffer();
  return sharp(drawn).rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

/** Inverts a region of the original texture (black print on white → white print on black). */
async function inverted(image, [x0, y0, x1, y1]) {
  return sharp(image).extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }).negate({ alpha: false }).png().toBuffer();
}

// Measured in the original 2048px textures.
const TOP_PLATE = {
  wifi: [1840, 608, 1866, 666],
  onOff: [1836, 352, 1858, 426],
  icons: [1984, 152, 2014, 360],
  model: [1879, 505, 1911, 765],
};
const FRONT = {
  logo: [722, 105, 790, 314],
  modelName: [1293, 888, 1326, 1053],
  zoom: [716, 942, 818, 1036],
};

// ── Shared body texture (body, top plate, small trims) ─────────────────────────
const bodyMaterial = materials["material_2"];
const original = Buffer.from(bodyMaterial.getBaseColorTexture().getImage());
const layers = [];
for (const box of [TOP_PLATE.wifi, TOP_PLATE.onOff, TOP_PLATE.icons]) {
  layers.push({ input: await inverted(original, box), left: box[0], top: box[1], blend: "lighten" });
}
const place = async ([x0, y0, x1, y1], svg, { rotate, mirror = false }) => {
  // Box is in texture space; the label is drawn in camera space (rotated by 90°).
  const [w, h] = [x1 - x0, y1 - y0];
  const turned = rotate % 180 !== 0;
  const input = await label(svg(turned ? h : w, turned ? w : h), turned ? h : w, turned ? w : h, rotate, mirror);
  return { input, left: x0, top: y0 };
};
// How each surface's UVs are laid out relative to how text should read on the camera.
const FRONT_UV = { rotate: 270, mirror: true };
const TOP_UV = { rotate: 90, mirror: true }; // reads from behind, like the ON/OFF label

layers.push(
  await place(TOP_PLATE.model, (w, h) =>
    `<text x="${w / 2}" y="${h * 0.74}" font-family="${SANS}" font-style="italic" font-size="${h * 0.8}" fill="${INK}" text-anchor="middle" textLength="${w * 0.96}" lengthAdjust="spacingAndGlyphs">PowerShot SX510 HS</text>`, TOP_UV),
  await place(FRONT.logo, (w, h) =>
    `<text x="${w / 2}" y="${h * 0.8}" font-family="${LOGO}" font-weight="bold" font-size="${h * 0.95}" fill="${INK}" text-anchor="middle" textLength="${w * 0.94}" lengthAdjust="spacingAndGlyphs">Canon</text>`, FRONT_UV),
  await place(FRONT.modelName, (w, h) =>
    `<text x="${w / 2}" y="${h * 0.78}" font-family="${SANS}" font-style="italic" font-weight="bold" font-size="${h * 0.85}" fill="${INK}" text-anchor="middle" textLength="${w * 0.95}" lengthAdjust="spacingAndGlyphs">SX510 HS</text>`, FRONT_UV),
  await place(FRONT.zoom, (w, h) =>
    `<g font-family="${SANS}" fill="${INK}" text-anchor="end">
      <text x="${w * 0.97}" y="${h * 0.5}" font-weight="bold" font-size="${h * 0.5}">30x</text>
      <text x="${w * 0.97}" y="${h * 0.72}" font-size="${h * 0.18}" letter-spacing="1">OPTICAL</text>
      <text x="${w * 0.97}" y="${h * 0.92}" font-size="${h * 0.18}" letter-spacing="1">ZOOM</text>
    </g>`, FRONT_UV),
);
const body = await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: "#161616" } })
  .composite(layers)
  .png()
  .toBuffer();
const bodyTexture = doc.createTexture("body").setImage(body).setMimeType("image/png");

// Old embossed markings live in the body normal map; flatten them.
const normalTexture = bodyMaterial.getNormalTexture();
const flat = (box) =>
  sharp({ create: { width: box[2] - box[0] + 8, height: box[3] - box[1] + 8, channels: 3, background: FLAT_NORMAL } })
    .png()
    .toBuffer()
    .then((input) => ({ input, left: box[0] - 4, top: box[1] - 4 }));
const normal = await sharp(Buffer.from(normalTexture.getImage()))
  .composite(await Promise.all([FRONT.logo, FRONT.modelName, FRONT.zoom].map(flat)))
  .png()
  .toBuffer();
normalTexture.setImage(normal).setMimeType("image/png");

// ── Lens face: printed ring text (texture is flipped vertically on the model) ──
// Drawn as it reads on the camera, then flipped vertically to match the lens UVs.
const RING = { cx: 1426, cy: SIZE - 581, r: 496 };
const FONT_SIZE = 46;
/** Lays `text` around the ring, centred at the top or bottom, upright and left-to-right either way. */
function ringText(text, radius, top) {
  // Rough advance per glyph for a 46px sans.
  const step = (FONT_SIZE * 0.68) / radius;
  const span = step * (text.length - 1);
  return [...text]
    .map((char, i) => {
      const angle = top ? -Math.PI / 2 - span / 2 + i * step : Math.PI / 2 + span / 2 - i * step;
      const x = (RING.cx + radius * Math.cos(angle)).toFixed(1);
      const y = (RING.cy + radius * Math.sin(angle)).toFixed(1);
      const deg = ((angle * 180) / Math.PI + (top ? 90 : -90)).toFixed(2);
      return `<text x="${x}" y="${y}" transform="rotate(${deg} ${x} ${y})" text-anchor="middle">${char}</text>`;
    })
    .join("");
}
const lensSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <rect width="100%" height="100%" fill="#0e0e0e"/>
  <g font-family="${SANS}" font-size="${FONT_SIZE}" fill="${INK}" letter-spacing="2">
    ${ringText("CANON ZOOM LENS 30x IS", RING.r - 30, true)}
    ${ringText("4.3-129.0mm 1:3.4-5.8", RING.r - 4, false)}
  </g></svg>`;
const lens = await sharp(Buffer.from(lensSvg)).flip().png().toBuffer();
const lensFace = materials["01_front"];
lensFace.setBaseColorTexture(doc.createTexture("lens-face").setImage(lens).setMimeType("image/png"));
lensFace.setNormalTexture(null).setMetallicFactor(0.2).setRoughnessFactor(0.45);

// ── Colours ────────────────────────────────────────────────────────────────────
const black = (name, { metal = 0.15, rough = 0.5, texture = true } = {}) => {
  const m = materials[name];
  m.setBaseColorFactor([1, 1, 1, 1]).setMetallicFactor(metal).setRoughnessFactor(rough);
  if (texture) m.setBaseColorTexture(bodyTexture);
  else m.setBaseColorTexture(null).setBaseColorFactor([0.03, 0.03, 0.03, 1]);
};
black("material_2", { rough: 0.42 }); // main shell
black("02_plastic", { rough: 0.45 }); // top plate
black("02_black", { rough: 0.6 });
black("02_rubber", { metal: 0, rough: 0.75, texture: false }); // grip
for (const name of ["material", "material_12", "material_23", "08_pole", "02_NONE", "09_NONE", "02_button", "material_24", "material_20"]) {
  black(name, { metal: 0.55, rough: 0.35, texture: false }); // lens barrel, trims, buttons
}
// Back buttons and dial: white print on black.
const buttons = materials["material_11"];
const buttonPrint = await sharp(Buffer.from(buttons.getBaseColorTexture().getImage())).negate({ alpha: false }).linear(0.92, 0).png().toBuffer();
const buttonTexture = doc.createTexture("buttons").setImage(buttonPrint).setMimeType("image/png");
for (const name of ["material_11", "material_17", "material_19"]) {
  materials[name].setBaseColorTexture(buttonTexture).setMetallicFactor(0.4).setRoughnessFactor(0.4);
}

// LCD: plain black; the site draws video on top.
const display = materials["07_display"];
display.setBaseColorTexture(null).setBaseColorFactor([0.01, 0.01, 0.012, 1]).setRoughnessFactor(0.25);
display.setName("lcd");

// Stable names the site looks up at runtime (see src/components/camera/model.ts).
const NODE_NAMES = {
  Object_2: "lens-collar",
  Object_8: "lens-face",
  Object_19: "lens-blades",
  Object_12: "lcd",
};
for (const node of doc.getRoot().listNodes()) {
  const name = NODE_NAMES[node.getName()];
  if (name) node.setName(name);
}

await doc.transform(
  prune(),
  dedup(),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 88 }),
);
await io.write(out, doc);
console.log("wrote", out);
