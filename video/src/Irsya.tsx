import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadScript } from "@remotion/google-fonts/PinyonScript";
import { loadFont as loadDeva } from "@remotion/google-fonts/TiroDevanagariHindi";
import { loadFont as loadBlack } from "@remotion/google-fonts/UnifrakturMaguntia";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ease, FadeUp, Grain, Scenes, scenesDuration, ThemeContext, useBetween, useProgress, Words, type Theme } from "./kit";

const { fontFamily: cinzel } = loadCinzel("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: serif } = loadSerif("normal", { weights: ["400", "500"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500"], subsets: ["latin"] });
const { fontFamily: script } = loadScript("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: deva } = loadDeva("normal", { weights: ["400"], subsets: ["devanagari"] });
const { fontFamily: black } = loadBlack("normal", { weights: ["400"], subsets: ["latin"] });

/** The label's own look: black, bone-white serif, the teaser's pale green glow, and the tees' colours. */
const INK = "#0A0B0C";
const BONE = "#F1ECDF";
const GLOW = "#D9F2C9";
const MUTED = "rgba(241,236,223,0.6)";
const theme: Theme = {
  ink: BONE,
  muted: MUTED,
  paper: INK,
  accent: "linear-gradient(95deg, #D9F2C9 0%, #F1ECDF 100%)",
  glow: "rgba(217,242,201,0.10)",
  sans,
  headline: { fontFamily: serif, fontWeight: 500, fontSize: 120, lineHeight: 1, letterSpacing: "-0.01em", color: BONE },
};

const v = (name: string) => staticFile(`irsya/v/${name}.webp`);
const img = (name: string) => staticFile(`irsya/${name}.webp`);

function Dark({ children, background = INK }: { children: ReactNode; background?: string }) {
  return (
    <AbsoluteFill style={{ background }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(217,242,201,0.06), transparent 60%)" }} />
      <Grain opacity={0.1} />
      {children}
    </AbsoluteFill>
  );
}

function Caption({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  return (
    <FadeUp delay={delay} style={{ fontFamily: cinzel, fontSize: 24, letterSpacing: "0.32em", color: MUTED, ...style }}>
      {children}
    </FadeUp>
  );
}

/** Each letter flickers through typefaces before settling, like the launch reel. */
const FACES = [script, black, cinzel, serif, sans];
function Flicker({ text, settle, size = 220 }: { text: string; settle: number; size?: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: size * 0.32 }}>
      {text.split("").map((ch, i) => {
        const done = frame > settle + i * 6;
        const face = done ? cinzel : FACES[(Math.floor(frame / 4) + i * 3) % FACES.length];
        const p = interpolate(frame - i * 5, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span key={i} style={{ fontFamily: face, fontSize: size, color: GLOW, opacity: p, textShadow: `0 0 ${done ? 24 : 40}px rgba(217,242,201,${done ? 0.35 : 0.6})`, width: size * 0.62, textAlign: "center" }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}

function Intro() {
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40 }}>
        <Caption>PRESENTING</Caption>
        <Flicker text="IRSYA" settle={60} />
        <Caption delay={90}>WHERE JEALOUSY IS A VIRTUE</Caption>
      </AbsoluteFill>
    </Dark>
  );
}

function Meaning() {
  const deva_ = useProgress(40, 30);
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 30 }}>
        <div style={{ fontFamily: deva, fontSize: 300, color: BONE, lineHeight: 1.1, opacity: deva_, transform: `translateY(${(1 - deva_) * 40}px)` }}>ईर्ष्या</div>
        <div style={{ fontFamily: cinzel, fontSize: 64, letterSpacing: "0.5em", color: BONE, marginLeft: "0.5em" }}>
          <Words text="ĪRṢYĀ" delay={10} />
        </div>
        <FadeUp delay={70} style={{ fontFamily: serif, fontStyle: "italic", fontSize: 44, color: MUTED, maxWidth: 1100 }}>
          a Sanskrit and Buddhist term, translated as jealousy or envy
        </FadeUp>
      </AbsoluteFill>
    </Dark>
  );
}

const PRINTS = [
  { src: "mandela-print", name: "Mandela" },
  { src: "om-print", name: "Om" },
  { src: "butterfly-print", name: "Butterfly" },
];

function Prints() {
  const frame = useCurrentFrame();
  return (
    <Dark>
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center" }}>
        <Caption>THE FIRST THREE TEES</Caption>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 230, display: "flex", justifyContent: "space-between" }}>
        {PRINTS.map((print, i) => {
          const p = interpolate(frame - 14 - i * 22, [0, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          const spin = print.src === "mandela-print" ? frame * 0.15 : 0;
          return (
            <div key={print.src} style={{ width: 520, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 120}px)` }}>
              <Img src={v(print.src)} style={{ width: 520, height: 520, objectFit: "contain", transform: `rotate(${spin}deg) scale(${0.9 + p * 0.1})` }} />
              <div style={{ fontFamily: serif, fontSize: 56, color: BONE, marginTop: 30 }}>{print.name}</div>
            </div>
          );
        })}
      </div>
    </Dark>
  );
}

const COLOURS = [
  { src: "brown", bg: "#2B211D" },
  { src: "green", bg: "#13231F" },
  { src: "lilac", bg: "#5A4D7A" },
  { src: "red", bg: "#6E1414" },
];

function Colourways() {
  const frame = useCurrentFrame();
  const i = Math.min(3, Math.floor(frame / 50));
  return (
    <AbsoluteFill style={{ background: "#5C6B5E" }}>
      {COLOURS.map((c, k) => {
        const p = k === 0 ? 1 : interpolate(frame - k * 50, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        return <Img key={c.src} src={v(`${c.src}-mandela`)} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, objectFit: "cover", opacity: p, transform: `scale(${1.04 - p * 0.04})` }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center" }}>
        <Caption style={{ color: BONE }}>EVERY DESIGN, EVERY COLOUR</Caption>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, display: "flex", justifyContent: "center", gap: 18 }}>
        {COLOURS.map((c, k) => (
          <span key={c.src} style={{ width: 40, height: 40, borderRadius: "50%", background: c.bg, border: `3px solid ${k === i ? BONE : "rgba(241,236,223,0.3)"}` }} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

function Mockups() {
  const frame = useCurrentFrame();
  const list = ["mandela-mockup", "om-mockup", "butterfly-mockup"];
  return (
    <AbsoluteFill style={{ background: "#5C6B5E" }}>
      {list.map((m, i) => {
        const p = interpolate(frame - 8 - i * 40, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const out = interpolate(frame - 48 - i * 40, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const last = i === list.length - 1;
        return <Img key={m} src={img(m)} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, objectFit: "cover", opacity: p * (last ? 1 : 1 - out), transform: `scale(${1.08 - p * 0.08})` }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center" }}>
        <Caption style={{ color: BONE }}>MANDELA · OM · BUTTERFLY</Caption>
      </div>
    </AbsoluteFill>
  );
}

const POSTS = ["coming-soon-planet", "butterfly-poster", "text-art-6", "eye-sticker-sheet"];

function Launch() {
  const frame = useCurrentFrame();
  const settle = useBetween(100, 200);
  return (
    <Dark>
      <div style={{ position: "absolute", left: 160, top: 120, width: 560, display: "flex", flexDirection: "column", gap: 30 }}>
        <Caption>THE LAUNCH</Caption>
        <div style={{ ...theme.headline, fontSize: 104 }}>
          <Words text="Teased before *it* *dropped.*" delay={6} />
        </div>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 30, color: MUTED, lineHeight: 1.45 }}>
          Posts, stickers, a save-the-date and the launch reel, all made in Photoshop.
        </FadeUp>
      </div>
      {POSTS.map((post, i) => {
        const p = interpolate(frame - 20 - i * 16, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const x = 820 + (i % 2) * 520;
        const y = 90 + Math.floor(i / 2) * 470;
        return <Img key={post} src={v(post)} style={{ position: "absolute", left: x, top: y, width: 440, height: 440, objectFit: "cover", borderRadius: 10, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.8)", opacity: p, transform: `translateY(${(1 - p) * 100}px) rotate(${(i % 2 ? 1.5 : -1.5) * (1 - settle * 0.6)}deg)` }} />;
      })}
    </Dark>
  );
}

function End() {
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 28 }}>
        <div style={{ fontFamily: cinzel, fontSize: 110, letterSpacing: "0.4em", color: GLOW, marginLeft: "0.4em", textShadow: "0 0 30px rgba(217,242,201,0.35)" }}>
          <Words text="ĪRṢYĀ" delay={4} />
        </div>
        <FadeUp delay={24} style={{ fontFamily: serif, fontSize: 60, color: BONE }}>
          Shubham Patil
        </FadeUp>
        <FadeUp delay={36} style={{ fontFamily: sans, fontSize: 28, color: MUTED }}>
          Brand, tee &amp; launch graphics design · Photoshop
        </FadeUp>
      </AbsoluteFill>
    </Dark>
  );
}

const SCENES = [
  { Scene: Intro, frames: 160 },
  { Scene: Meaning, frames: 170 },
  { Scene: Prints, frames: 190 },
  { Scene: Colourways, frames: 210 },
  { Scene: Mockups, frames: 170 },
  { Scene: Launch, frames: 200 },
  { Scene: End, frames: 130 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), fade(), slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade()];

export const IRSYA_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function Irsya() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
