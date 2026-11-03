"use client";

import { useEffect, useRef } from "react";

/** Pointer pushes particles within this many CSS pixels. */
const RADIUS = 70;
const PUSH = 1.6;
/** Sideways share of the push, so particles swirl around the pointer instead of just scattering. */
const SWIRL = 0.5;
/** How much of the pointer's own movement particles pick up, like stirring a liquid. */
const DRAG = 0.12;
const SPRING = 0.035;
const DAMPING = 0.88;
/** Below this speed and distance from home (px), a particle counts as settled. */
const REST = 0.05;
/** On load, particles start up to this far (px) from home and drift together. */
const SCATTER = 50;

type Props = {
  src: string;
  /** Gather the particles into the image on load, instead of drawing it in place. */
  assemble?: boolean;
  className?: string;
};

/**
 * Draws an image (dark ink on transparent) as one particle per CSS pixel. The pointer
 * scatters nearby particles like stirring a fluid; springs pull them back into the image.
 */
export function AsciiParticles({ src, assemble = false, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const image = new Image();
    image.src = src;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    // Particle state, one slot per particle: home, position, velocity, ink alpha.
    let homeX = new Float32Array(0);
    let homeY = new Float32Array(0);
    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let alpha = new Uint8Array(0);
    let pixels: ImageData | null = null;
    const pointer = { x: -1e4, y: -1e4, dx: 0, dy: 0, inside: false };
    // Only the first layout gathers in; resizes just redraw.
    let scatter = assemble && !reducedMotion;

    /** Fits the image to the canvas (height first, centred) and samples a particle per opaque CSS pixel. */
    function layout() {
      if (!canvas || !ctx || !image.complete || !image.naturalWidth) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const drawW = Math.round(image.naturalWidth * scale);
      const drawH = Math.round(image.naturalHeight * scale);
      const left = Math.round((width - drawW) / 2);
      const sample = document.createElement("canvas");
      sample.width = drawW;
      sample.height = drawH;
      const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
      if (!sampleCtx || !drawW || !drawH) return;
      sampleCtx.drawImage(image, 0, 0, drawW, drawH);
      const data = sampleCtx.getImageData(0, 0, drawW, drawH).data;

      let count = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 40) count++;
      homeX = new Float32Array(count);
      homeY = new Float32Array(count);
      alpha = new Uint8Array(count);
      let n = 0;
      for (let py = 0; py < drawH; py++) {
        for (let px = 0; px < drawW; px++) {
          const a = data[(py * drawW + px) * 4 + 3];
          if (a <= 40) continue;
          homeX[n] = left + px;
          homeY[n] = py;
          alpha[n] = a;
          n++;
        }
      }
      x = homeX.slice();
      y = homeY.slice();
      vx = new Float32Array(count);
      vy = new Float32Array(count);
      if (scatter) {
        scatter = false;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = SCATTER * Math.sqrt(Math.random());
          x[i] += Math.cos(angle) * distance;
          y[i] += Math.sin(angle) * distance;
        }
        wake();
      }
      pixels = ctx.createImageData(canvas.width, canvas.height);
      draw();
    }

    function draw() {
      if (!ctx || !pixels) return;
      const buffer = new Uint32Array(pixels.data.buffer);
      buffer.fill(0);
      const w = pixels.width;
      const h = pixels.height;
      const block = Math.max(1, Math.round(dpr));
      for (let i = 0; i < x.length; i++) {
        const px = Math.round(x[i] * dpr);
        const py = Math.round(y[i] * dpr);
        if (px < 0 || py < 0 || px + block > w || py + block > h) continue;
        // Little-endian RGBA: ink is near-black (#111) with the source pixel's alpha.
        const colour = (alpha[i] << 24) | 0x111111;
        for (let by = 0; by < block; by++) buffer.fill(colour, (py + by) * w + px, (py + by) * w + px + block);
      }
      ctx.putImageData(pixels, 0, 0);
    }

    /** One physics step; returns whether anything is still moving. */
    function step() {
      let moving = false;
      const r2 = RADIUS * RADIUS;
      for (let i = 0; i < x.length; i++) {
        if (pointer.inside) {
          const dx = x[i] - pointer.x;
          const dy = y[i] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const falloff = 1 - d / RADIUS;
            const force = (PUSH * falloff * falloff) / d;
            vx[i] += dx * force - dy * force * SWIRL + pointer.dx * DRAG * falloff;
            vy[i] += dy * force + dx * force * SWIRL + pointer.dy * DRAG * falloff;
          }
        }
        vx[i] = (vx[i] + (homeX[i] - x[i]) * SPRING) * DAMPING;
        vy[i] = (vy[i] + (homeY[i] - y[i]) * SPRING) * DAMPING;
        x[i] += vx[i];
        y[i] += vy[i];
        if (
          !moving &&
          (Math.abs(vx[i]) > REST || Math.abs(vy[i]) > REST || Math.abs(homeX[i] - x[i]) > REST || Math.abs(homeY[i] - y[i]) > REST)
        )
          moving = true;
      }
      pointer.dx = 0;
      pointer.dy = 0;
      return moving;
    }

    // Only runs while something is moving, so a still page costs nothing.
    function tick() {
      const moving = step();
      draw();
      frame = moving || pointer.inside ? requestAnimationFrame(tick) : 0;
    }
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    function onPointerMove(event: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const inside = px > -RADIUS && py > -RADIUS && px < rect.width + RADIUS && py < rect.height + RADIUS;
      if (pointer.inside) {
        pointer.dx += px - pointer.x;
        pointer.dy += py - pointer.y;
      }
      pointer.x = px;
      pointer.y = py;
      pointer.inside = inside;
      if (inside) wake();
    }
    const onPointerLeave = () => (pointer.inside = false);

    image.onload = layout;
    if (image.complete) layout();
    const resize = new ResizeObserver(layout);
    resize.observe(canvas);
    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove);
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      image.onload = null;
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
    // Only read on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
