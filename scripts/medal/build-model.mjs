// Compresses the Sketchfab "goldmedal" (devmate_, Sketchfab Standard licence) for the web.
//
// Usage: node scripts/medal/build-model.mjs "canon camera assets/goldmedal.glb" public/objects/medal/medal.glb
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, textureCompress } from "@gltf-transform/functions";
import sharp from "sharp";

const [src, out] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
await doc.transform(prune(), dedup(), textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 88 }));
await io.write(out, doc);
console.log("wrote", out);
