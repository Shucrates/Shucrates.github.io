// Turns the Sketchfab "MacBook Air M2" (rtql8d, CC BY 4.0) into a silver-blue
// MacBook: recolours the aluminium and keyboard deck, names the nodes the site
// animates and compresses everything for the web.
//
// Usage: node scripts/laptop/build-model.mjs "canon camera assets/macbook_air_m2.glb" public/objects/laptop/laptop.glb
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, textureCompress } from "@gltf-transform/functions";
import sharp from "sharp";

const [src, out] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
const root = doc.getRoot();
const materials = Object.fromEntries(root.listMaterials().map((m) => [m.getName(), m]));

/** Silver with a hint of blue, in sRGB. */
const SILVER = [196, 204, 214];
const linear = (c) => ((c / 255 + 0.055) / 1.055) ** 2.4;

// ── Aluminium shell (lid back, edges) ──────────────────────────────────────────
materials["Aluminum_-_Anodized_Glossy_Grey"]
  .setBaseColorFactor([...SILVER.map(linear), 1])
  .setMetallicFactor(0.85)
  .setRoughnessFactor(0.32);

// ── Keyboard deck: the texture is the midnight deck with the keys drawn on it ──
// The deck is a distinctly blue grey; keys and legends are neutral. Swap the blue
// pixels for silver and keep the keys dark, like a silver MacBook.
const deck = materials["Aluminum_-_Anodized_Glossy_Grey_keyboard.jpg"];
const deckTexture = deck.getBaseColorTexture();
const { data, info } = await sharp(Buffer.from(deckTexture.getImage())).raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += info.channels) {
  const [r, , b] = [data[i], data[i + 1], data[i + 2]];
  const t = Math.min(1, Math.max(0, (b - r - 8) / 8));
  for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * (1 - t) + SILVER[c] * t);
}
const recoloured = await sharp(data, { raw: info }).jpeg({ quality: 90 }).toBuffer();
deckTexture.setImage(recoloured).setMimeType("image/jpeg");
deck.setMetallicFactor(0.85).setRoughnessFactor(0.32);

// The Apple logo on the lid: a polished mirror, as on the real thing.
materials["Acrylic_Clear"].setBaseColorFactor([0.8, 0.82, 0.85, 1]).setMetallicFactor(1).setRoughnessFactor(0.12);

// ── Names for the parts the site animates ──────────────────────────────────────
// Each mesh has one material, so name nodes by it. The lid (shell, screen, bezel,
// logo) ships open at 90°; everything else is the base.
const NAMES = {
  "Aluminum_-_Anodized_Glossy_Grey": "lid-shell",
  "Glass_-_Heavy_Color": "screen",
  "Plastic_-_Translucent_Matte_Gray": "lid-bezel",
  Acrylic_Clear: "logo",
  "Aluminum_-_Anodized_Glossy_Grey_keyboard.jpg": "base",
  "Bronze_-_Polished": "ports",
  "Rubber_-_Soft": "feet",
  "Steel_-_Satin": "headphone-jack",
};
for (const node of root.listNodes()) {
  const name = NAMES[node.getMesh()?.listPrimitives()[0].getMaterial()?.getName()];
  if (name) node.setName(name);
}

await doc.transform(prune(), dedup(), textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024] }));
await io.write(out, doc);
console.log(`wrote ${out}`);
