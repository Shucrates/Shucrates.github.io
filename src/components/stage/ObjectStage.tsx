"use client";

import { animate, useReducedMotion, type ValueAnimationTransition } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useStage, type Box, type StageStore } from "./store";
import { createStudio } from "./studio";

/** Projects a world-space point to CSS pixels. */
export type Project = (point: THREE.Vector3) => { x: number; y: number };

export type StageModel<L> = {
  /** Centred, 1 unit wide. */
  root: THREE.Group;
  /** The face that fills the screen once docked, in root units: its centre, and its size. */
  face: { centre: THREE.Vector3; width: number; height: number };
  /**
   * `hover`: 0 resting, 1 hovered. `dock`: 0 on the homepage, 1 filling the screen.
   * `deform`: the page's shape for the model, if it sets one (see `Dock`).
   */
  pose: (hover: number, dock: number, deform?: number[]) => void;
  /** Where interactive parts land on screen once docked; published to the store. */
  layout?: (project: Project) => L;
};

type Pose = { pitch: number; yaw: number; roll: number };

export type StageConfig<L> = {
  store: StageStore<L>;
  /** Route where the object fills the screen. */
  path: string;
  load: () => Promise<StageModel<L>>;
  /** Resting view on the homepage, in radians. */
  home: Pose;
  /** View once docked. */
  docked: Pose;
  /** Extra turn while hovered on the homepage. */
  hoverTurn: { pitch: number; yaw: number };
  /** How the hover pose opens; it always closes with a short ease. */
  hoverOpen: ValueAnimationTransition<number>;
  /** How much of the viewport the docked face may fill. */
  fit: { width: number; height: number };
  /** Euler order for the object's rotation; "ZYX" twists before it swings, like something hanging. */
  rotationOrder?: THREE.EulerOrder;
};

const FOV = 26;
const DISTANCE = 1000;
const FLIGHT = { duration: 1.15, ease: [0.65, 0, 0.3, 1] as const };
const CLOSE: ValueAnimationTransition<number> = { duration: 0.5, ease: "easeInOut" };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Motion = { flight: number; hover: number; pitch: number; yaw: number };

/**
 * One 3D object for the whole site, mounted in the root layout so it survives
 * page changes. On "/" it sits in the slot registered by <StageAnchor>; on its
 * own page it flies to the middle and fills the screen; going back flies it home.
 */
export function ObjectStage<L>({ config }: { config: StageConfig<L> }) {
  const { store, path, hoverOpen, hoverTurn } = config;
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motion = useRef<Motion>({ flight: 0, hover: 0, pitch: 0, yaw: 0 });
  const lastHome = useRef<Box | null>(null);
  const active = useStage(store, (s) => s.active);
  const [layer, setLayer] = useState<"hidden" | "home" | "flying" | "docked">("hidden");

  // Flight target follows the route.
  useEffect(() => {
    const docked = pathname === path;
    const m = motion.current;
    const target = docked ? 1 : 0;
    const hasHome = store.get().anchor !== null || lastHome.current !== null;
    if (reducedMotion || !hasHome || m.flight === target) {
      m.flight = target;
      setLayer(docked ? "docked" : "home");
      return;
    }
    setLayer("flying");
    store.set({ layout: null });
    const animation = animate(m.flight, target, {
      ...FLIGHT,
      onUpdate: (value) => (m.flight = value),
      onComplete: () => setLayer(docked ? "docked" : "home"),
    });
    return () => animation.stop();
  }, [pathname, path, store, reducedMotion]);

  // Hover plays the object's own animation and turns it a little; anything else undoes it.
  useEffect(() => {
    const m = motion.current;
    const open = active && pathname === "/" && layer === "home";
    const options = open ? hoverOpen : CLOSE;
    const animations = [
      animate(m.hover, open ? 1 : 0, { ...options, onUpdate: (value) => (m.hover = value) }),
      animate(m.pitch, open ? hoverTurn.pitch : 0, { ...options, onUpdate: (value) => (m.pitch = value) }),
      animate(m.yaw, open ? hoverTurn.yaw : 0, { duration: 0.8, ease: "easeOut", onUpdate: (value) => (m.yaw = value) }),
    ];
    return () => animations.forEach((animation) => animation.stop());
  }, [active, pathname, layer, hoverOpen, hoverTurn]);

  useEffect(() => {
    store.set({ landed: layer === "docked" });
  }, [store, layer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startRenderer(canvas, config, motion.current, lastHome);
  }, [config]);

  const hidden = layer === "hidden" || (layer === "home" && pathname !== "/");
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 h-dvh w-full ${hidden ? "invisible" : ""} ${
        layer === "flying" ? "z-50" : layer === "docked" ? "z-40" : "z-10"
      }`}
    />
  );
}

function startRenderer<L>(
  canvas: HTMLCanvasElement,
  config: StageConfig<L>,
  motion: Motion,
  lastHome: { current: Box | null },
) {
  const { store, home: rest, docked, fit, rotationOrder = "XYZ" } = config;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const { scene, shadow } = createStudio(renderer);
  const view = new THREE.PerspectiveCamera(FOV, 1, 10, DISTANCE * 4);
  view.position.z = DISTANCE;

  let model: StageModel<L> | null = null;
  let disposed = false;
  config.load().then((loaded) => {
    if (disposed) return;
    model = loaded;
    scene.add(model.root);
  });

  const dockedRotation = new THREE.Quaternion();
  const euler = new THREE.Euler(0, 0, 0, rotationOrder);
  const bounds = new THREE.Box3();
  const offset = new THREE.Vector3();
  let frame = 0;
  let size = "";
  let drawn = "";
  let published = "";
  const viewport = { w: 0, h: 0 };
  const project: Project = (point) => {
    const p = point.clone().project(view);
    return { x: ((p.x + 1) / 2) * viewport.w, y: ((1 - p.y) / 2) * viewport.h };
  };

  const draw = () => {
    frame = requestAnimationFrame(draw);
    if (!model) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    viewport.w = w;
    viewport.h = h;
    if (size !== `${w}x${h}`) {
      size = `${w}x${h}`;
      renderer.setSize(w, h, false);
      view.aspect = w / h;
      view.updateProjectionMatrix();
    }
    const { anchor, presence, spin, tilt, dock } = store.get();
    if (anchor) {
      const r = anchor.getBoundingClientRect();
      lastHome.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
    const home = lastHome.current ?? { left: w / 2, top: h / 2, width: 0, height: 0 };
    const t = motion.flight;

    // Nothing moved: skip the frame. Three of these run at once, so idle ones should be free.
    const key = [w, h, home.left, home.top, home.width, presence, t, motion.hover, motion.pitch, motion.yaw, spin, tilt]
      .concat(dock ? Object.values(dock).flat() : [])
      .join();
    if (key === drawn) return;
    drawn = key;

    // World units per CSS pixel on the z = 0 plane.
    const unit = (2 * DISTANCE * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / h;
    const { face } = model;
    const target = dock ?? {
      x: w / 2,
      y: h / 2,
      width: Math.min((w * fit.width) / face.width, (h * fit.height) / face.height),
      pitch: docked.pitch + tilt,
      yaw: docked.yaw + spin,
      roll: docked.roll,
    };
    const scale = lerp(home.width, target.width, t) * unit;
    const cx = lerp(home.left + home.width / 2, target.x, t);
    const cy = lerp(home.top + home.height / 2, target.y, t);

    const root = model.root;
    root.scale.setScalar(scale);
    root.rotation.set(
      lerp(rest.pitch + motion.pitch, target.pitch, t),
      lerp(rest.yaw + motion.yaw, target.yaw, t),
      lerp(rest.roll, target.roll, t) - 0.14 * Math.sin(Math.PI * t), // a little roll on the way, like being picked up
      rotationOrder,
    );
    // Docked, the face's centre sits on z = 0 at the target, so its on-screen size is exact
    // and the object turns about it.
    dockedRotation.setFromEuler(euler.set(target.pitch, target.yaw, target.roll, rotationOrder));
    offset.copy(face.centre).applyQuaternion(dockedRotation).multiplyScalar(scale * t);
    root.position.set((cx - w / 2) * unit - offset.x, -(cy - h / 2) * unit - offset.y, -offset.z);
    model.pose(motion.hover, t, dock?.deform);

    root.updateMatrixWorld(true);
    bounds.setFromObject(root);
    const width = bounds.max.x - bounds.min.x;
    shadow.position.set((bounds.min.x + bounds.max.x) / 2, bounds.min.y - width * 0.01, 0);
    shadow.scale.set(width * 1.1, width * 0.4, 1);
    (shadow.material as THREE.MeshBasicMaterial).opacity = 1 - Math.min(1, t * 3);

    canvas.style.opacity = String(lerp(presence, 1, t));
    renderer.render(scene, view);

    if (t === 1 && model.layout) {
      const layout = model.layout(project);
      const key = JSON.stringify(layout, (_, v) => (typeof v === "number" ? Math.round(v) : v));
      if (key !== published) {
        published = key;
        store.set({ layout });
      }
    } else if (published) {
      published = "";
      store.set({ layout: null });
    }
  };
  draw();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    renderer.dispose();
  };
}
