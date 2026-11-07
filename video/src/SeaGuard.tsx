import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadSlab } from "@remotion/google-fonts/RobotoSlab";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ease, FadeUp, Grain, Label, Paper, Point, Scenes, scenesDuration, Split, ThemeContext, useBetween, useProgress, Words, type Theme } from "./kit";

const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500"], subsets: ["latin"] });
const { fontFamily: slab } = loadSlab("normal", { weights: ["800"], subsets: ["latin"] });

/** The app's own look: black water, a heavy slab wordmark, teal from Seabot and the red of the SOS. */
const DEEP = "#05090D";
const SOS = "#D92D20";
const theme: Theme = {
  ink: "#0B1620",
  muted: "#5E6A73",
  paper: "#EEF1EF",
  accent: "linear-gradient(95deg, #1E8C8A 0%, #47C3B5 100%)",
  glow: "rgba(71,195,181,0.18)",
  sans,
  headline: { fontFamily: slab, fontWeight: 800, fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.03em" },
};

const LIGHT = "rgba(255,255,255,0.74)";
/** On the dark scenes highlighted words turn a brighter teal. */
const onDark: Theme = { ...theme, accent: "linear-gradient(95deg, #5FE0CF 0%, #A6F2E6 100%)" };

/** Night sea: a slow swell of light across black water. */
function Sea({ children }: { children: ReactNode }) {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 60) * 18;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${x}% 110%, #12414A 0%, #0A1E26 38%, ${DEEP} 75%)` }}>
      <Grain opacity={0.1} />
      <ThemeContext.Provider value={onDark}>{children}</ThemeContext.Provider>
    </AbsoluteFill>
  );
}

/** An app screen in a phone, slid up into place. */
function Screen({ src, width, delay = 0, style, scroll = 0, ratio = 2.1 }: { src: string; width: number; delay?: number; style?: CSSProperties; scroll?: number; ratio?: number }) {
  const p = useProgress(delay, 36);
  const inner = width - 20;
  return (
    <div style={{ position: "absolute", width, padding: 10, borderRadius: 46, background: "#0E0F12", boxShadow: "0 50px 90px -25px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)", opacity: p, transform: `translateY(${(1 - p) * 220}px)`, ...style }}>
      <div style={{ height: inner * ratio, borderRadius: 36, overflow: "hidden", background: "#fff" }}>
        <Img src={staticFile(src)} style={{ width: inner, display: "block", transform: `translateY(${-scroll}px)` }} />
      </div>
    </div>
  );
}

function Intro() {
  const logo = useProgress(8, 34);
  const ring = useProgress(30, 60);
  return (
    <Sea>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", border: "2px solid rgba(95,224,207,0.25)", transform: `scale(${0.4 + ring * 0.8})`, opacity: 1 - ring }} />
        <Img src={staticFile("seaguard/logo.png")} style={{ width: 760, opacity: logo, transform: `translateY(${(1 - logo) * 30}px)` }} />
        <div style={{ ...theme.headline, fontFamily: sans, fontWeight: 500, fontSize: 46, letterSpacing: "-0.01em", marginTop: 10 }}>
          <Words text="Your trusted partner at *sea.*" delay={30} />
        </div>
        <div style={{ marginTop: 40 }}>
          <Label delay={56} color={LIGHT}>
            Most Product Readiness · HackCelestial 2.0
          </Label>
        </div>
      </AbsoluteFill>
    </Sea>
  );
}

function Problem() {
  const shot = useProgress(20, 40);
  return (
    <Paper>
      <Split width={820}>
        <Label>The problem</Label>
        <div style={{ ...theme.headline, fontSize: 100, color: theme.ink }}>
          <Words text="Everything a fisherman needs," delay={6} />
          <Words text="behind *a* *dozen* *icons.*" delay={22} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={60}>SOS at the same level as "Other services"</Point>
          <Point delay={78}>Every feature on its own page</Point>
          <Point delay={96}>Before dawn, on a small screen</Point>
        </div>
      </Split>
      <Img
        src={staticFile("seaguard/reference-fisher-friend.webp")}
        style={{ position: "absolute", left: 1290, top: 110, width: 400, borderRadius: 34, boxShadow: "0 50px 100px -30px rgba(11,22,32,0.45)", opacity: shot, transform: `translateY(${(1 - shot) * 160}px) rotate(${(1 - shot) * 4}deg)` }}
      />
      <FadeUp delay={50} style={{ position: "absolute", left: 1290, top: 990, fontFamily: sans, fontSize: 22, color: theme.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Fisher Friend, the app we studied
      </FadeUp>
    </Paper>
  );
}

function Process() {
  const enter = useProgress(8, 36);
  const swap = useBetween(110, 140);
  const box = { position: "absolute", left: 0, top: 0, width: 1060, borderRadius: 18, boxShadow: "0 50px 100px -30px rgba(0,0,0,0.6)" } as const;
  return (
    <Sea>
      <Split width={560}>
        <Label color={LIGHT}>Process</Label>
        <div style={{ ...theme.headline, fontSize: 84, color: "#fff" }}>
          <Words text="From a list of features *to* *a* *hierarchy.*" delay={6} />
        </div>
        <FadeUp delay={44} style={{ fontFamily: sans, fontSize: 30, color: LIGHT, lineHeight: 1.4 }}>
          <span style={{ opacity: 1 - swap * 0.6 }}>First draft: a blue bar and a drawer of every feature.</span>{" "}
          <span style={{ opacity: 0.4 + swap * 0.6 }}>Final: SOS and the sea up front, the rest one tap away.</span>
        </FadeUp>
      </Split>
      <div style={{ position: "absolute", left: 780, top: 200, width: 1060, height: 760, opacity: enter, transform: `translateY(${(1 - enter) * 140}px)` }}>
        <Img src={staticFile("seaguard/first-version.webp")} style={{ ...box, opacity: 1 - swap }} />
        <Img src={staticFile("seaguard/final-screens.webp")} style={{ ...box, top: 130, opacity: swap }} />
      </div>
    </Sea>
  );
}

function Home() {
  const frame = useCurrentFrame();
  const press = interpolate(frame, [120, 132, 150], [1, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate((frame - 132) % 40, [0, 40], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <Sea>
      <Split width={640}>
        <Label color={LIGHT}>Home</Label>
        <div style={{ ...theme.headline, color: "#fff" }}>
          <Words text="SOS first, *then* *the* *sea.*" delay={6} />
        </div>
        <FadeUp delay={44} style={{ fontFamily: sans, fontSize: 32, color: LIGHT, lineHeight: 1.4 }}>
          One tap sends your trail to the coast guard. Below it: weather, waves and a single risk bar.
        </FadeUp>
        <FadeUp delay={70} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: sans, fontWeight: 500, fontSize: 26, color: "#fff" }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: SOS, boxShadow: frame > 132 ? `0 0 0 ${pulse * 18}px rgba(217,45,32,${0.5 * (1 - pulse)})` : "none" }} />
          {frame > 132 ? "Trail shared with the coast guard" : "Emergency SOS"}
        </FadeUp>
      </Split>
      <div style={{ transform: `scale(${press})`, transformOrigin: "1340px 230px", position: "absolute", inset: 0 }}>
        <Screen src="seaguard/home.webp" width={430} delay={10} style={{ left: 1130, top: 70 }} ratio={2751 / 1236} />
      </div>
    </Sea>
  );
}

function Features() {
  const frame = useCurrentFrame();
  const steps = 5;
  const step = Math.min(steps - 1, Math.max(0, Math.floor((frame - 40) / 34)));
  const enter = useProgress(8, 40);
  const strip = useBetween(30, 40 + (steps - 1) * 34);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "0 0 0 140px", justifyContent: "center" }}>
        <div style={{ width: 600, display: "flex", flexDirection: "column", gap: 30 }}>
          <Label>Features</Label>
          <div style={{ ...theme.headline, fontSize: 86, color: theme.ink }}>
            <Words text="Rebuilt until every tile *earned* *its* *place.*" delay={6} />
          </div>
          <FadeUp delay={44} style={{ fontFamily: sans, fontSize: 30, color: theme.muted, lineHeight: 1.4 }}>
            Seabot, geo-fencing, a catch monitor, a fishing optimizer and a fish identifier.
          </FadeUp>
          <FadeUp delay={30} style={{ fontFamily: sans, fontWeight: 500, fontSize: 26, color: theme.ink, fontVariantNumeric: "tabular-nums" }}>
            Version {step + 1} of {steps}
          </FadeUp>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 830, top: 60, width: 1000, height: 960, overflow: "hidden", opacity: enter }}>
        <Img
          src={staticFile("seaguard/features-iterations.webp")}
          style={{ height: 960, width: (2340 * 960) / 1054, maxWidth: "none", borderRadius: 30, transform: `translateX(${-strip * ((2340 * 960) / 1054 - 1000)}px)` }}
        />
      </div>
    </Paper>
  );
}

const FISH = [
  { name: "Pomfret", color: "#C2551B" },
  { name: "Mackerel", color: "#1C4E8A" },
  { name: "Prawns", color: "#B5531E" },
  { name: "Sardine", color: "#24557A" },
];

function CatchLog() {
  const frame = useCurrentFrame();
  const kg = interpolate(frame, [60, 120], [0, 59.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <Paper>
      <Split width={560}>
        <Label>Catch log</Label>
        <div style={{ ...theme.headline, color: theme.ink }}>
          <Words text="Every outing, *on* *record.*" delay={6} />
        </div>
        <FadeUp delay={50} style={{ fontFamily: slab, fontWeight: 800, fontSize: 120, color: theme.ink, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
          {kg.toFixed(1)}
          <span style={{ fontSize: 56 }}>kg</span>
        </FadeUp>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {FISH.map((fish, i) => (
            <FadeUp key={fish.name} delay={90 + i * 8} style={{ fontFamily: sans, fontWeight: 500, fontSize: 22, color: "#fff", background: fish.color, padding: "8px 18px", borderRadius: 999 }}>
              {fish.name}
            </FadeUp>
          ))}
        </div>
      </Split>
      <Screen src="seaguard/catch-logs.webp" width={330} delay={14} style={{ left: 820, top: 170 }} ratio={676 / 297} />
      <Screen src="seaguard/catch-detail.webp" width={330} delay={34} style={{ left: 1180, top: 130 }} ratio={2.1} />
      <Screen src="seaguard/log-new-catch.webp" width={330} delay={54} style={{ left: 1540, top: 210 }} ratio={2.1} scroll={useBetween(120, 190) * 60} />
    </Paper>
  );
}

function Recognition() {
  return (
    <Sea>
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", color: "#fff", gap: 40 }}>
        <Label color={LIGHT}>Recognition</Label>
        <div style={{ ...theme.headline, fontSize: 104 }}>
          <Words text="Most *Product* *Readiness,*" delay={6} />
          <Words text="HackCelestial 2.0." delay={20} />
        </div>
        <FadeUp delay={56} style={{ fontFamily: sans, fontSize: 40, color: LIGHT, lineHeight: 1.35, maxWidth: 1300 }}>
          Then presented to Dr. V. Narayanan, Chairman of ISRO.
        </FadeUp>
      </AbsoluteFill>
      <Screen src="seaguard/onboarding.webp" width={340} delay={30} style={{ left: 1420, top: 120, rotate: "4deg" }} ratio={2751 / 1236} />
    </Sea>
  );
}

function End() {
  return (
    <Sea>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <div style={{ ...theme.headline, fontSize: 150 }}>
          <Words text="Shubham Patil" delay={8} />
        </div>
        <FadeUp delay={30} style={{ fontFamily: sans, fontWeight: 500, fontSize: 36, marginTop: 30 }}>
          UI/UX design &amp; frontend · SeaGuard
        </FadeUp>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 28, marginTop: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
          Figma · React Native · FastAPI
        </FadeUp>
        <FadeUp delay={52} style={{ fontFamily: sans, fontSize: 26, marginTop: 40, opacity: 0.7 }}>
          With Rithvik Shetty, Yash Varma, Vinay Pokharkar &amp; Vedant Thakur
        </FadeUp>
      </AbsoluteFill>
    </Sea>
  );
}

const SCENES = [
  { Scene: Intro, frames: 130 },
  { Scene: Problem, frames: 200 },
  { Scene: Process, frames: 210 },
  { Scene: Home, frames: 230 },
  { Scene: Features, frames: 240 },
  { Scene: CatchLog, frames: 230 },
  { Scene: Recognition, frames: 180 },
  { Scene: End, frames: 140 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade(), fade(), fade()];

export const SEAGUARD_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function SeaGuard() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
