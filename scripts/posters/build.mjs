// Compresses the source posters (in "shubham graphic design posters/", not committed) into
// public/posters/: a large WebP for the detail view and a small one for the grid.
// Run: node scripts/posters/build.mjs
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "shubham graphic design posters";
const OUT = "public/posters";
const SIZES = { large: 1800, thumb: 640 };

const slug = (name) =>
  name
    .replace(/\.png$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

await mkdir(OUT, { recursive: true });
for (const file of (await readdir(SOURCE)).filter((f) => /\.png$/i.test(f)).sort()) {
  const id = slug(file);
  const input = sharp(path.join(SOURCE, file));
  for (const [size, edge] of Object.entries(SIZES)) {
    const out = path.join(OUT, size === "large" ? `${id}.webp` : `${id}-thumb.webp`);
    const info = await input
      .clone()
      .resize(edge, edge, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: size === "large" ? 84 : 78 })
      .toFile(out);
    console.log(`${out}\t${info.width}x${info.height}\t${Math.round(info.size / 1024)}K`);
  }
}
