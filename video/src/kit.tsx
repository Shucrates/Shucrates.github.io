import { linearTiming, TransitionSeries, type TransitionPresentation } from "@remotion/transitions";
import { createContext, useContext, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

/** Each project's video sets its own colours and type; the pieces below read them from here. */
export type Theme = {
  ink: string;
  muted: string;
  paper: string;
  /** A CSS background (colour or gradient) for highlighted words, dots and rules. */
  accent: string;
  /** Soft light in the corner of light scenes. */
  glow: string;
  sans: string;
  headline: CSSProperties;
};

export const ThemeContext = createContext<Theme | null>(null);

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("Wrap the video in a ThemeContext provider.");
  return theme;
}

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 to 1 over `duration` frames, starting at `delay`. */
export function useProgress(delay = 0, duration = 24, easing = ease) {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

/** 0 to 1 between two frames, eased in and out. For scrolls and pans. */
export function useBetween(from: number, to: number) {
  return useProgress(from, to - from, easeInOut);
}

export function accentText(theme: Theme): CSSProperties {
  return { backgroundImage: theme.accent, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" };
}

/** Words rise into place one after another. Wrap a word in *asterisks* to paint it with the accent. */
export function Words({ text, delay = 0, stagger = 4, style }: { text: string; delay?: number; stagger?: number; style?: CSSProperties }) {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div style={style}>
      {words.map((raw, i) => {
        const highlight = raw.includes("*");
        const word = raw.replaceAll("*", "");
        const p = interpolate(frame - delay - i * stagger, [0, 22], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`, ...(highlight ? accentText(theme) : {}) }}>{word}</span>
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </div>
  );
}

export function FadeUp({ delay = 0, children, style }: { delay?: number; children: ReactNode; style?: CSSProperties }) {
  const p = useProgress(delay, 26);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 24}px)`, ...style }}>{children}</div>;
}

export function Label({ children, delay = 0, color }: { children: ReactNode; delay?: number; color?: string }) {
  const theme = useTheme();
  return (
    <FadeUp
      delay={delay}
      style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: theme.sans, fontWeight: 500, fontSize: 22, letterSpacing: "0.18em", textTransform: "uppercase", color: color ?? theme.muted }}
    >
      <span style={{ width: 12, height: 12, borderRadius: 3, background: theme.accent }} />
      {children}
    </FadeUp>
  );
}

export function Point({ children, delay, color }: { children: ReactNode; delay: number; color?: string }) {
  const theme = useTheme();
  return (
    <FadeUp delay={delay} style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: theme.sans, fontSize: 34, color: color ?? theme.ink }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: theme.accent, flexShrink: 0 }} />
      {children}
    </FadeUp>
  );
}

export function Grain({ opacity = 0.12 }: { opacity?: number }) {
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity, mixBlendMode: "overlay" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

/** The light page most scenes sit on, with the theme's glow in one corner. */
export function Paper({ children, background }: { children: ReactNode; background?: string }) {
  const theme = useTheme();
  return (
    <AbsoluteFill style={{ background: background ?? theme.paper }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 92% 8%, ${theme.glow}, transparent 40%)` }} />
      {children}
    </AbsoluteFill>
  );
}

/** Text on the left, a visual on the right: the layout most scenes share. */
export function Split({ width = 600, children }: { width?: number; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ padding: "0 0 0 160px", justifyContent: "center" }}>
      <div style={{ width, display: "flex", flexDirection: "column", gap: 34 }}>{children}</div>
    </AbsoluteFill>
  );
}

type Size = { width: number; height: number };

/** A browser window showing a screenshot, scrolled from 0 (top) to 1 (bottom). */
export function Browser({
  src,
  url,
  width,
  viewport,
  image,
  scroll = 0,
  style,
  imageStyle,
}: {
  src: string;
  url: string;
  width: number;
  viewport: number;
  image: Size;
  scroll?: number;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
}) {
  const theme = useTheme();
  const height = (image.height * width) / image.width;
  const offset = Math.max(0, height - viewport) * scroll;
  return (
    <div style={{ width, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 50px 100px -30px rgba(18,19,24,0.4), 0 0 0 1px rgba(18,19,24,0.08)", ...style }}>
      <div style={{ height: 46, background: "#F1F0ED", display: "flex", alignItems: "center", padding: "0 20px", borderBottom: "1px solid rgba(18,19,24,0.06)" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((color) => (
          <span key={color} style={{ width: 13, height: 13, borderRadius: "50%", background: color, marginRight: 8 }} />
        ))}
        <span style={{ margin: "0 auto", transform: "translateX(-30px)", background: "#fff", borderRadius: 8, padding: "6px 90px", fontFamily: theme.sans, fontSize: 16, color: theme.muted }}>{url}</span>
      </div>
      <div style={{ height: viewport, overflow: "hidden", position: "relative" }}>
        <Img src={staticFile(src)} style={{ width, display: "block", transform: `translateY(${-offset}px)`, ...imageStyle }} />
      </div>
    </div>
  );
}

export function Phone({ src, image, width = 330, scroll = 0, style }: { src: string; image: Size; width?: number; scroll?: number; style?: CSSProperties }) {
  const screen = width - 24;
  const viewport = screen * 2.1;
  const offset = Math.max(0, (image.height * screen) / image.width - viewport) * scroll;
  return (
    <div style={{ width, padding: 12, borderRadius: 56, background: "#121318", boxShadow: "0 50px 90px -25px rgba(18,19,24,0.55)", ...style }}>
      <div style={{ height: viewport, borderRadius: 44, overflow: "hidden", background: "#fff" }}>
        <Img src={staticFile(src)} style={{ width: screen, display: "block", transform: `translateY(${-offset}px)` }} />
      </div>
    </div>
  );
}

/** A wide image panned from left to right inside a frame, for moodboards and rows of iterations. */
export function Pan({ src, image, width, height, progress, style }: { src: string; image: Size; width: number; height: number; progress: number; style?: CSSProperties }) {
  const scaled = (image.width * height) / image.height;
  return (
    <div style={{ width, height, overflow: "hidden", borderRadius: 18, boxShadow: "0 50px 100px -30px rgba(18,19,24,0.4)", ...style }}>
      <Img src={staticFile(src)} style={{ height, width: scaled, maxWidth: "none", display: "block", transform: `translateX(${-(scaled - width) * progress}px)` }} />
    </div>
  );
}

export type Scene = { Scene: ComponentType; frames: number };

/** Plays scenes in order, overlapping each pair by `overlap` frames through the given transitions. */
export function Scenes({ scenes, transitions, overlap }: { scenes: Scene[]; transitions: TransitionPresentation<Record<string, unknown>>[]; overlap: number }) {
  return (
    <TransitionSeries>
      {scenes.flatMap(({ Scene, frames }, i) => [
        <TransitionSeries.Sequence key={`scene-${i}`} durationInFrames={frames}>
          <Scene />
        </TransitionSeries.Sequence>,
        ...(i < transitions.length
          ? [<TransitionSeries.Transition key={`transition-${i}`} presentation={transitions[i]} timing={linearTiming({ durationInFrames: overlap, easing: easeInOut })} />]
          : []),
      ])}
    </TransitionSeries>
  );
}

export const scenesDuration = (scenes: Scene[], transitions: number, overlap: number) =>
  scenes.reduce((sum, { frames }) => sum + frames, 0) - transitions * overlap;
