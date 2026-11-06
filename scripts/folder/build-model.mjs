// Turns the Sketchfab "Document File Folder" (Kami Rapacz, CC BY 4.0) into a plain manila
// folder: recolours the grey card to manila while keeping its paper grain, patches out the
// Bell System logos (in the colour, normal and roughness maps alike) and prints a "shu's"
// label where the Bell one was. Compresses everything for the web.
//
// Usage: node scripts/folder/build-model.mjs "canon camera assets/document_file_folder.glb" public/objects/folder/folder.glb
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, textureCompress } from "@gltf-transform/functions";
import sharp from "sharp";

const [src, out] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
const folder = doc.getRoot().listMaterials().find((m) => m.getName() === "Folder_1Shape");

/** Manila, in sRGB. */
const MANILA = [198, 176, 128];
/** How strongly the card's grain shows through, relative to the original grey. */
const GRAIN = 1.25;
/** The original card's average brightness. */
const GREY = 60;
const INK = "#4a3c2c";
const LABEL = "#f6f1e4";

// Where each logo is, in pixels of the 1024px textures: [x0, y0, x1, y1], and the offset to
// a clean patch of card nearby to cover it with.
const LOGOS = [
  { box: [222, 405, 320, 475], from: [0, -125] }, // "BELL SYSTEMS" label, front
  { box: [6, 244, 48, 304], from: [70, 0] }, // four dots by the tab
  { box: [544, 224, 606, 286], from: [0, 120] }, // bell, back
];
const FEATHER = 6;
/** Where the "shu's" label goes: the Bell label's spot. */
const LABEL_BOX = [228, 411, 314, 469];

const read = async (texture) => {
  const { data, info } = await sharp(Buffer.from(texture.getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, info };
};

/** Covers each logo with the card next to it, faded in at the edges so there's no seam. */
function patch({ data, info }) {
  const { width, channels } = info;
  for (const { box: [x0, y0, x1, y1], from: [dx, dy] } of LOGOS) {
    for (let y = y0 - FEATHER; y < y1 + FEATHER; y++) {
      for (let x = x0 - FEATHER; x < x1 + FEATHER; x++) {
        const edge = Math.min(x - (x0 - FEATHER), x1 + FEATHER - 1 - x, y - (y0 - FEATHER), y1 + FEATHER - 1 - y);
        const t = Math.min(1, edge / FEATHER);
        const at = (y * width + x) * channels;
        const source = ((y + dy) * width + (x + dx)) * channels;
        for (let c = 0; c < channels; c++) data[at + c] = Math.round(data[at + c] * (1 - t) + data[source + c] * t);
      }
    }
  }
}

const write = (texture, { data, info }, format) =>
  sharp(data, { raw: info })
    [format]({ quality: 92 })
    .toBuffer()
    .then((buffer) => texture.setImage(buffer).setMimeType(`image/${format}`));

// ── Colour: patch, then grey card to manila, keeping its grain ─────────────────
const base = await read(folder.getBaseColorTexture());
patch(base);
for (let i = 0; i < base.data.length; i += base.info.channels) {
  const lum = 0.299 * base.data[i] + 0.587 * base.data[i + 1] + 0.114 * base.data[i + 2];
  for (let c = 0; c < 3; c++) base.data[i + c] = Math.max(0, Math.min(255, Math.round(MANILA[c] + (lum - GREY) * GRAIN)));
}
// The label, drawn mirrored like the Bell one it replaces (the front's UVs are flipped).
const [lx0, ly0, lx1, ly1] = LABEL_BOX;
const [lw, lh] = [lx1 - lx0, ly1 - ly0];
const label = await sharp(
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${lw}" height="${lh}">
    <rect x="0.5" y="0.5" width="${lw - 1}" height="${lh - 1}" rx="2" fill="${LABEL}" stroke="${INK}" stroke-opacity="0.35" />
    <text x="${lw / 2}" y="${lh * 0.68}" font-family="Georgia" font-style="italic" font-size="${lh * 0.52}" fill="${INK}" text-anchor="middle">shu’s</text>
  </svg>`),
)
  .flop()
  .png()
  .toBuffer();
const colour = await sharp(base.data, { raw: base.info }).composite([{ input: label, left: lx0, top: ly0 }]).jpeg({ quality: 92 }).toBuffer();
folder.getBaseColorTexture().setImage(colour).setMimeType("image/jpeg");
// Card, not metal.
folder.setMetallicFactor(0);

// ── Normal and roughness: just patch out the embossing ─────────────────────────
for (const texture of [folder.getNormalTexture(), folder.getMetallicRoughnessTexture()]) {
  const map = await read(texture);
  patch(map);
  await write(texture, map, "png");
}

// ── The cover: keep only its opening, every few frames ────────────────────────
// The model ships a 7s open-and-shut animation as 210 morph targets, one per frame (each the
// whole pose, not a step). Frames 16–96 are the opening; the site blends between the kept
// frames itself (see src/components/folder/model.ts), so the animation goes.
const OPENING = { from: 16, to: 96, every: 4 };
const cover = doc.getRoot().listMeshes().find((m) => m.getName() === "Folder_1Shape");
const primitive = cover.listPrimitives()[0];
primitive.listTargets().forEach((target, i) => {
  const kept = i >= OPENING.from && i <= OPENING.to && (i - OPENING.from) % OPENING.every === 0;
  if (!kept) primitive.removeTarget(target);
});
cover.setWeights(primitive.listTargets().map(() => 0));
for (const animation of doc.getRoot().listAnimations()) animation.dispose();
for (const node of doc.getRoot().listNodes()) if (node.getMesh() === cover) node.setName("cover");

await doc.transform(prune(), dedup(), textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 88 }));
await io.write(out, doc);
console.log("wrote", out);
