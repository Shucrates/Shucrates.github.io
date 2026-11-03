// Prepares the homepage hero art: the cut-out photo, the ASCII ornament, the open tote bag and its turning sprite.
//
// Needs macOS 14+ for the bag cutout.
// Usage: node scripts/hero/build-assets.mjs ~/Pictures/illustrations public/hero
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const [src, out] = process.argv.slice(2);
const from = (name) => path.join(src, name);
const to = (name) => path.join(out, name);

// Photo and ASCII art are already cut out; trim the empty canvas around them.
await sharp(from("shubham full image portfolio.png")).trim().resize({ height: 1600 }).webp({ quality: 88, alphaQuality: 100 }).toFile(to("shubham.webp"));
// Kept as PNG: the canvas samples its pixels to place particles, so it needs crisp alpha.
await sharp(from("ascii art for portfolio website.png")).trim().resize({ height: 1400 }).png().toFile(to("ascii.png"));

// The tote sheet has four views on a cream backdrop: closed front (top-left), open three-quarter
// (top-right), side (bottom-left) and back (bottom-right). The open view is the bag the objects
// come out of; the front, side and back become a sprite of the bag turning a full circle. Its handles are nearly the backdrop's colour, so a colour key
// eats them; macOS's subject mask (scripts/hero/cutout.swift) separates them cleanly.
const sheet = from("Four-View Elephant Tote Bag.png");
const { width, height } = await sharp(sheet).metadata();
const half = Math.round(width / 2);
// The lower bags' handles start just below the middle, so the top row stops a little short of it.
const row = Math.round(height * 0.485);
const views = {
  open: { left: half, top: 0, width: width - half, height: row },
  front: { left: 0, top: 0, width: half, height: row },
  side: { left: 0, top: row, width: half, height: height - row },
  back: { left: half, top: row, width: width - half, height: height - row },
};
const scratch = await mkdtemp(path.join(tmpdir(), "tote-"));
const pairs = Object.entries(views).flatMap(([name]) => [path.join(scratch, `${name}.png`), path.join(scratch, `${name}-cut.png`)]);
for (const [name, box] of Object.entries(views)) await sharp(sheet).extract(box).png().toFile(path.join(scratch, `${name}.png`));
execFileSync("swift", [path.join(import.meta.dirname, "cutout.swift"), ...pairs], { stdio: "inherit" });

await sharp(path.join(scratch, "open-cut.png")).trim().webp({ quality: 88, alphaQuality: 100 }).toFile(to("bag-open.webp"));

/** Frame height in px; every view is scaled to it so the bag doesn't change size as it turns. */
const FRAME_H = 320;
const cut = {};
for (const name of ["front", "side", "back"]) {
  cut[name] = await sharp(path.join(scratch, `${name}-cut.png`)).trim().resize({ height: FRAME_H }).png().toBuffer({ resolveWithObject: true });
}
const FRAME_W = Math.max(...Object.values(cut).map(({ info }) => info.width));
/** A view squeezed horizontally, standing in for the angles between the photographed ones. */
const squeeze = async (name, by, flip = false) => {
  const w = Math.max(1, Math.round(cut[name].info.width * by));
  let image = sharp(cut[name].data).resize({ width: w, height: FRAME_H, fit: "fill" });
  if (flip) image = image.flop();
  return { data: await image.png().toBuffer(), width: w };
};
const as = (name, flip = false) => squeeze(name, 1, flip);
// 0°, 45°, 90°, ... 315°: the in-betweens are the nearer face narrowed by cos 45°.
const frames = await Promise.all([
  as("front"),
  squeeze("front", 0.7),
  as("side"),
  squeeze("back", 0.7),
  as("back"),
  squeeze("back", 0.7, true),
  as("side", true),
  // The front's print would read backwards mirrored, so it isn't.
  squeeze("front", 0.7),
]);
await sharp({ create: { width: FRAME_W * frames.length, height: FRAME_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(frames.map((frame, i) => ({ input: frame.data, left: i * FRAME_W + Math.round((FRAME_W - frame.width) / 2), top: 0 })))
  .webp({ quality: 88, alphaQuality: 100 })
  .toFile(to("bag-spin.webp"));
console.log("bag-spin frames:", frames.length, "frame", FRAME_W, "x", FRAME_H);
await rm(scratch, { recursive: true });
console.log("wrote", out);
