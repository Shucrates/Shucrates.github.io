import { loadFont as loadWide } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadDot } from "@remotion/google-fonts/DotGothic16";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ease, FadeUp, Grain, Label, Scenes, scenesDuration, ThemeContext, useBetween, useProgress, Words, type Theme } from "./kit";

const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
const { fontFamily: serif } = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: wide } = loadWide("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: dot } = loadDot("normal", { weights: ["400"], subsets: ["latin"] });

/** The pitch's own palette: black tees, cream ink, the club red, and the three theme colours. */
const BLACK = "#111111";
const CREAM = "#F2EAD3";
const RED = "#D20F1A";
const THEMES = [
  { name: "GENESIS", color: "#3E6B47", src: "theme-1" },
  { name: "ORIGIN", color: "#3F5E6A", src: "theme-2" },
  { name: "DAWN", color: "#812A16", src: "theme-3" },
];
const theme: Theme = {
  ink: BLACK,
  muted: "#6A665D",
  paper: CREAM,
  accent: `linear-gradient(${RED}, ${RED})`,
  glow: "rgba(210,15,26,0.08)",
  sans,
  headline: { fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: 140, lineHeight: 0.98, letterSpacing: "-0.02em" },
};
/** On black, highlighted words go cream-red. */
const onBlack: Theme = { ...theme, accent: "linear-gradient(95deg, #FF4A4F, #F2EAD3)" };

const img = (name: string) => staticFile(`run-club/${name}.webp`);

function Dark({ children, background = BLACK }: { children: ReactNode; background?: string }) {
  return (
    <AbsoluteFill style={{ background }}>
      <Grain opacity={0.08} />
      <ThemeContext.Provider value={onBlack}>{children}</ThemeContext.Provider>
    </AbsoluteFill>
  );
}

function Cream({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Grain opacity={0.1} />
      {children}
    </AbsoluteFill>
  );
}

/** A small wide-set caption, like the deck's header row. */
function Caption({ children, delay = 0, color = BLACK, style }: { children: ReactNode; delay?: number; color?: string; style?: CSSProperties }) {
  return (
    <FadeUp delay={delay} style={{ fontFamily: wide, fontSize: 20, letterSpacing: "0.08em", color, ...style }}>
      {children}
    </FadeUp>
  );
}

/** Three horses gallop across under the name. */
function Horses({ delay, y, width = 620 }: { delay: number; y: number; width?: number }) {
  const p = useProgress(delay, 40);
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: width * 0.22, overflow: "hidden", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width,
          height: width * 0.22,
          backgroundImage: `url(${img("graphic-wordmark")})`,
          backgroundSize: `${width * 1.6}px`,
          backgroundPosition: `center 61%`,
          transform: `translateX(${(1 - p) * -900}px) translateY(${Math.sin(frame / 4) * 2}px)`,
          opacity: p,
        }}
      />
    </div>
  );
}

function Intro() {
  return (
    <Dark>
      <div style={{ position: "absolute", left: 60, right: 60, top: 50, display: "flex", justifyContent: "space-between" }}>
        <Caption color={CREAM}>TRCT.IN</Caption>
        <Caption delay={6} color={CREAM}>MERCH PITCHDECK</Caption>
        <Caption delay={12} color={CREAM}>BY @SHUISBORED</Caption>
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <div style={{ ...theme.headline, fontSize: 190, marginTop: -120 }}>
          <Words text="The Run Club Thane" delay={8} stagger={5} />
        </div>
      </AbsoluteFill>
      <Horses delay={34} y={600} />
      <FadeUp delay={60} style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: serif, fontStyle: "italic", fontSize: 54, color: CREAM }}>
        est 2025
      </FadeUp>
    </Dark>
  );
}

function Film() {
  const frame = useCurrentFrame();
  const shot = useProgress(14, 36);
  const views = interpolate(frame, [50, 110], [0, 17900], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const likes = interpolate(frame, [60, 120], [0, 335], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <Cream>
      <div style={{ position: "absolute", left: 160, top: 220, width: 640, display: "flex", flexDirection: "column", gap: 34 }}>
        <Label>The bored files · episode 6</Label>
        <div style={{ ...theme.headline, fontSize: 120, color: BLACK }}>
          <Words text="It started with *a* *party.*" delay={6} />
        </div>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 32, color: theme.muted, lineHeight: 1.4 }}>
          I filmed the club&apos;s one-year anniversary post-run party.
        </FadeUp>
        <div style={{ display: "flex", gap: 70, marginTop: 10 }}>
          {[
            [Math.round(views).toLocaleString("en"), "views"],
            [Math.round(likes).toLocaleString("en"), "likes"],
          ].map(([value, label]) => (
            <FadeUp key={label} delay={50}>
              <div style={{ fontFamily: wide, fontSize: 84, color: RED, fontVariantNumeric: "tabular-nums" }}>{value}</div>
              <div style={{ fontFamily: sans, fontSize: 26, color: theme.muted }}>{label}</div>
            </FadeUp>
          ))}
        </div>
      </div>
      <Img
        src={img("v/ep6")}
        style={{ position: "absolute", left: 880, top: 270, width: 900, borderRadius: 14, boxShadow: "0 50px 100px -30px rgba(0,0,0,0.45)", opacity: shot, transform: `translateY(${(1 - shot) * 140}px) scale(${1 + useBetween(40, 200) * 0.04})` }}
      />
    </Cream>
  );
}

const MARKS = ["trct.in", "trct.in", "trct.in", "TRCT.IN", "trct.in"];
const MARK_STYLES: CSSProperties[] = [
  { fontFamily: sans, fontWeight: 700, letterSpacing: "-0.05em" },
  { fontFamily: sans, fontWeight: 700, fontStyle: "italic", letterSpacing: "-0.05em" },
  { fontFamily: serif, fontStyle: "italic" },
  { fontFamily: wide },
  { fontFamily: dot },
];

function Wordmarks() {
  const frame = useCurrentFrame();
  const i = Math.min(MARKS.length - 1, Math.floor(Math.max(0, frame - 30) / 22));
  const badge = useProgress(150, 24);
  return (
    <Dark>
      <div style={{ position: "absolute", left: 160, top: 150 }}>
        <Label color="rgba(242,234,211,0.7)">Wordmarks</Label>
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 260, color: CREAM, ...MARK_STYLES[i], opacity: 1 - badge, transform: `scale(${1 - badge * 0.3})` }}>{MARKS[i]}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: badge, transform: `scale(${0.8 + badge * 0.2})`, padding: "40px 120px", borderRadius: "50%", background: "#3E6B47", border: `8px solid ${CREAM}`, fontFamily: sans, fontWeight: 700, fontSize: 220, letterSpacing: "-0.05em", color: CREAM }}>trct</div>
      </AbsoluteFill>
      <FadeUp delay={30} style={{ position: "absolute", left: 0, right: 0, bottom: 120, textAlign: "center", fontFamily: sans, fontSize: 30, color: "rgba(242,234,211,0.7)" }}>
        The club&apos;s handle, tried in face after face.
      </FadeUp>
    </Dark>
  );
}

function Themes() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      {THEMES.map((t, i) => {
        const p = interpolate(frame - 10 - i * 50, [0, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const width = interpolate(frame, [10 + i * 50, 40 + i * 50, 170, 200], [0, 1920, 1920, 640], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const left = interpolate(frame, [170, 200], [0, i * 640], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        return (
          <div key={t.name} style={{ position: "absolute", top: 0, bottom: 0, left, width, overflow: "hidden", opacity: p }}>
            <Img src={img(`v/${t.src}`)} style={{ position: "absolute", left: "50%", top: 0, height: 1080, transform: "translateX(-50%)" }} />
          </div>
        );
      })}
      <FadeUp delay={200} style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: wide, fontSize: 24, letterSpacing: "0.08em", color: CREAM }}>
        THREE THEMES FOR A DROP
      </FadeUp>
    </AbsoluteFill>
  );
}

const TEES = [
  { src: "tee-more-than-a-club", ratio: 1400 / 1257 },
  { src: "tee-red", ratio: 1000 / 858 },
  { src: "tee-post-run", ratio: 1000 / 898 },
  { src: "tee-strava", ratio: 1400 / 1153 },
];

function Tees() {
  const frame = useCurrentFrame();
  return (
    <Cream>
      <div style={{ position: "absolute", left: 160, top: 120, display: "flex", flexDirection: "column", gap: 20 }}>
        <Label>Rough tee drafts</Label>
        <div style={{ ...theme.headline, fontSize: 104, color: BLACK }}>
          <Words text="Quiet front, *loud* *back.*" delay={6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 160, right: 160, top: 340, display: "flex", gap: 30, justifyContent: "space-between" }}>
        {TEES.map((tee, i) => {
          const p = interpolate(frame - 20 - i * 12, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          return (
            <div key={tee.src} style={{ width: 380, height: Math.min(620, 380 * tee.ratio), overflow: "hidden", borderRadius: 10, opacity: p, transform: `translateY(${(1 - p) * 200}px)`, boxShadow: "0 40px 80px -30px rgba(0,0,0,0.4)" }}>
              <Img src={img(tee.src)} style={{ width: 380, display: "block" }} />
            </div>
          );
        })}
      </div>
    </Cream>
  );
}

const LINES = [
  { top: "More than a club.", bottom: "The miles brought us here, the people made us stay." },
  { top: "Horses don't stop.", bottom: "They keep going." },
  { top: "I'm only here", bottom: "for the post run activities." },
];

function Lines() {
  const frame = useCurrentFrame();
  const i = Math.min(LINES.length - 1, Math.floor(frame / 70));
  const local = frame - i * 70;
  const p = interpolate(local, [0, 22], [0, 1], { extrapolateRight: "clamp", easing: ease });
  const backgrounds = [BLACK, RED, BLACK];
  return (
    <AbsoluteFill style={{ background: backgrounds[i] }}>
      <Grain opacity={0.08} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 200px", color: "#fff" }}>
        <div style={{ ...theme.headline, fontSize: 160, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>{LINES[i].top}</div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 40, letterSpacing: "0.02em", textTransform: "uppercase", marginTop: 40, opacity: interpolate(local, [12, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {LINES[i].bottom}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: wide, fontSize: 22, letterSpacing: "0.08em", color: CREAM, opacity: 0.7 }}>
        LINES FOR THE BACK
      </div>
    </AbsoluteFill>
  );
}

const PACKAGES = [
  { name: "PACKAGE 01", items: ["Creative direction", "3 tee graphics, front & back", "Custom hem tag", "Print-ready files", "A mockup per design"] },
  { name: "PACKAGE 02", items: ["E-commerce mockups", "Website hero banner", "Product page graphics", "Merch reveal post", "Instagram story"] },
];

function Pitch() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 50, display: "flex", justifyContent: "space-between" }}>
        <Caption>TRCT.IN</Caption>
        <Caption delay={4}>MERCH PITCHDECK</Caption>
        <Caption delay={8}>BY @SHUISBORED</Caption>
      </div>
      <div style={{ position: "absolute", left: 160, right: 160, top: 220, display: "flex", gap: 120 }}>
        {PACKAGES.map((pack, i) => (
          <div key={pack.name} style={{ flex: 1 }}>
            <FadeUp delay={10 + i * 40} style={{ fontFamily: dot, fontSize: 110, color: BLACK }}>
              {pack.name}
            </FadeUp>
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 22 }}>
              {pack.items.map((item, j) => {
                const p = interpolate(frame - 30 - i * 40 - j * 8, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
                return (
                  <div key={item} style={{ fontFamily: sans, fontWeight: 500, fontSize: 38, color: BLACK, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, display: "flex", gap: 18, alignItems: "center" }}>
                    <span style={{ width: 12, height: 12, background: RED }} />
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function End() {
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <div style={{ ...theme.headline, fontSize: 150 }}>
          <Words text="Shubham Patil" delay={6} />
        </div>
        <FadeUp delay={26} style={{ fontFamily: sans, fontWeight: 500, fontSize: 36, marginTop: 30, color: CREAM }}>
          Creative direction, merch design &amp; video · The Run Club Thane
        </FadeUp>
        <FadeUp delay={40} style={{ fontFamily: wide, fontSize: 24, letterSpacing: "0.08em", marginTop: 24, color: RED }}>
          TRCT.IN
        </FadeUp>
      </AbsoluteFill>
    </Dark>
  );
}

const SCENES = [
  { Scene: Intro, frames: 140 },
  { Scene: Film, frames: 190 },
  { Scene: Wordmarks, frames: 200 },
  { Scene: Themes, frames: 250 },
  { Scene: Tees, frames: 200 },
  { Scene: Lines, frames: 210 },
  { Scene: Pitch, frames: 190 },
  { Scene: End, frames: 130 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade(), slide({ direction: "from-right" }), fade()];

export const RUN_CLUB_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function RunClub() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
