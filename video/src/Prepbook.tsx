import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InterTight";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, Easing, Img, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  accentText,
  Browser,
  easeInOut,
  FadeUp,
  Grain,
  Label,
  Paper,
  Phone,
  Point,
  Scenes,
  scenesDuration,
  Split,
  ThemeContext,
  useBetween,
  useProgress,
  Words,
  type Theme,
} from "./kit";

const { fontFamily: serif } = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });
loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

const INK = "#121318";
const PAPER = "#FAF9F6";
const MUTED = "#6B6B70";

const theme: Theme = {
  ink: INK,
  muted: MUTED,
  paper: PAPER,
  // Prepbook's orange, as on the logo and the new site's headline.
  accent: "linear-gradient(95deg, #FFA51F 0%, #FF6A13 55%, #EE3A1B 100%)",
  glow: "rgba(255,138,31,0.16)",
  sans,
  headline: { fontFamily: serif, fontSize: 104, lineHeight: 1, letterSpacing: "-0.02em" },
};

/** Slow-moving orange light, with a little grain so it doesn't band. */
function Gradient() {
  const t = useCurrentFrame() / 30;
  const a = `${50 + 22 * Math.sin(t * 0.55)}% ${35 + 18 * Math.cos(t * 0.45)}%`;
  const b = `${25 + 20 * Math.cos(t * 0.4)}% ${75 + 12 * Math.sin(t * 0.6)}%`;
  const c = `${85 + 10 * Math.sin(t * 0.35)}% ${80 + 10 * Math.cos(t * 0.5)}%`;
  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(circle at ${a}, #FFC94A 0%, transparent 42%)`,
          `radial-gradient(circle at ${b}, #F0421C 0%, transparent 50%)`,
          `radial-gradient(circle at ${c}, #FF8A1F 0%, transparent 45%)`,
          "linear-gradient(135deg, #FF9A1F, #FF5E14)",
        ].join(", "),
      }}
    >
      <Grain />
    </AbsoluteFill>
  );
}

function Intro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120 } });
  const reveal = useProgress(34, 30);
  return (
    <AbsoluteFill>
      <Gradient />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `translateX(${(1 - reveal) * 300}px)` }}>
          <Img src={staticFile("prepbook/logo-mark.png")} style={{ height: 190, transform: `scale(${pop}) rotate(${(1 - pop) * -50}deg)`, filter: "brightness(0) invert(1)" }} />
          <Img src={staticFile("prepbook/wordmark.svg")} style={{ height: 150, filter: "brightness(0) invert(1)", clipPath: `inset(-10% ${(1 - reveal) * 100}% -10% 0)` }} />
        </div>
        <div style={{ position: "absolute", top: 640 }}>
          <Label delay={66} color="rgba(255,255,255,0.92)">
            Website redesign &amp; web app · 2025
          </Label>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function About() {
  const chips = ["UPSC", "SSC", "Banking", "State PSCs"];
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 36 }}>
        <Label>The product</Label>
        <div style={{ ...theme.headline, color: INK }}>
          <Words text="Prepbook helps students in India" delay={6} />
          <Words text="prepare for *competitive* *exams.*" delay={22} />
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
          {chips.map((chip, i) => {
            const p = spring({ frame: frame - 52 - i * 6, fps, config: { damping: 16 } });
            return (
              <span key={chip} style={{ transform: `scale(${p})`, opacity: p, padding: "14px 30px", borderRadius: 999, border: `2px solid ${INK}`, fontFamily: sans, fontWeight: 500, fontSize: 30, color: INK }}>
                {chip}
              </span>
            );
          })}
        </div>
        <FadeUp delay={88} style={{ fontFamily: sans, fontSize: 38, color: MUTED, maxWidth: 1200, lineHeight: 1.35 }}>
          Daily current affairs and GK, in a crisp, exam-focused app.
        </FadeUp>
      </AbsoluteFill>
    </Paper>
  );
}

function Stat({ value, format, label, delay }: { value: number; format: (n: number) => string; label: string; delay: number }) {
  const p = useProgress(delay, 50, Easing.bezier(0.33, 1, 0.68, 1));
  return (
    <FadeUp delay={delay} style={{ flex: 1 }}>
      <div style={{ fontFamily: serif, fontSize: 190, lineHeight: 1, letterSpacing: "-0.03em", ...accentText(theme) }}>{format(value * p)}</div>
      <div style={{ fontFamily: sans, fontSize: 32, color: "rgba(255,255,255,0.7)", marginTop: 12 }}>{label}</div>
    </FadeUp>
  );
}

function Stats() {
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Grain opacity={0.08} />
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 70 }}>
        <div style={{ ...theme.headline, color: "#fff" }}>
          <Words text="Students loved the app." delay={4} />
        </div>
        <div style={{ display: "flex", gap: 60 }}>
          <Stat value={201000} format={(n) => `${Math.round(n).toLocaleString("en-US")}+`} label="installs" delay={22} />
          <Stat value={4.7} format={(n) => n.toFixed(1)} label="rating on the Play Store" delay={30} />
          <Stat value={2400} format={(n) => `${Math.round(n).toLocaleString("en-US")}+`} label="cities reached" delay={38} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Before() {
  const frame = useCurrentFrame();
  const enter = useProgress(10, 40);
  const zoom = interpolate(frame, [0, 165], [1, 1.05]);
  return (
    <Paper>
      <Split width={640}>
        <Label>Before · 2024</Label>
        <div style={{ ...theme.headline, color: INK }}>
          <Words text="But the website *didn't* show it." delay={6} />
        </div>
        <FadeUp delay={60} style={{ fontFamily: sans, fontSize: 34, color: MUTED, lineHeight: 1.4 }}>
          Cluttered, dated, and the proof buried halfway down the page.
        </FadeUp>
      </Split>
      <div style={{ position: "absolute", left: 840, top: 200, perspective: 2000, opacity: enter }}>
        <Browser
          src="prepbook/site-before.webp"
          url="prepbookedu.com"
          width={980}
          viewport={610}
          image={{ width: 1440, height: 900 }}
          style={{ transform: `translateX(${(1 - enter) * 120}px) rotateY(-10deg) scale(${zoom})`, transformOrigin: "left center" }}
          imageStyle={{ filter: "grayscale(0.7) contrast(0.9)" }}
        />
      </div>
    </Paper>
  );
}

function Website() {
  const enter = useProgress(8, 40);
  const scroll = useBetween(50, 260);
  return (
    <Paper>
      <Split width={560}>
        <Label>The redesign</Label>
        <div style={{ ...theme.headline, color: INK }}>
          <Words text="So I rebuilt it *from* *scratch.*" delay={6} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={60}>Four clear destinations</Point>
          <Point delay={80}>Proof in the first scroll</Point>
          <Point delay={100}>One call to action</Point>
        </div>
      </Split>
      <Browser
        src="prepbook/site-home.webp"
        url="prepbookedu.com"
        width={1060}
        viewport={800}
        image={{ width: 1318, height: 3000 }}
        scroll={scroll}
        style={{ position: "absolute", left: 790, top: 110, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}
      />
    </Paper>
  );
}

function WebApp() {
  const enter = useProgress(8, 40);
  const phone = useProgress(70, 40);
  const dark = useProgress(170, 30, easeInOut);
  const scroll = useBetween(110, 260);
  const ink = interpolateColors(dark, [0, 1], [INK, "#FFFFFF"]);
  return (
    <Paper background={interpolateColors(dark, [0, 1], [PAPER, "#1B1A19"])}>
      <Split>
        <Label color={interpolateColors(dark, [0, 1], [MUTED, "rgba(255,255,255,0.7)"])}>The web app</Label>
        <div style={{ ...theme.headline, color: ink }}>
          <Words text="And brought the app *to* *the* *web.*" delay={6} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={70} color={ink}>Daily streaks in view</Point>
          <Point delay={90} color={ink}>Listen, save, quiz yourself</Point>
          <Point delay={110} color={ink}>Desktop and phone</Point>
          <Point delay={176} color={ink}>Light and dark</Point>
        </div>
      </Split>
      <div style={{ position: "absolute", left: 830, top: 150, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}>
        <Browser src="prepbook/app-explore.webp" url="Prepbook · Explore" width={1020} viewport={680} image={{ width: 1440, height: 1024 }} />
        <div style={{ position: "absolute", left: 0, top: 46, opacity: dark }}>
          <Img src={staticFile("prepbook/app-explore-dark.webp")} style={{ width: 1020, height: 680, objectFit: "cover", objectPosition: "top", borderRadius: "0 0 18px 18px", display: "block" }} />
        </div>
      </div>
      <Phone
        src="prepbook/app-mobile-explore.webp"
        image={{ width: 412, height: 917 }}
        width={300}
        scroll={scroll}
        style={{ position: "absolute", left: 1560, top: 340, opacity: phone, transform: `translateY(${(1 - phone) * 300}px)` }}
      />
    </Paper>
  );
}

function Quote() {
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Grain opacity={0.08} />
      <AbsoluteFill style={{ padding: "0 200px", justifyContent: "center", gap: 50 }}>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 92, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff" }}>
          <Words text="The redesign “*directly* *improved* the usability of our learning environment.”" delay={6} stagger={3} />
        </div>
        <FadeUp delay={64} style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: sans, fontSize: 32, color: "rgba(255,255,255,0.75)" }}>
          <span style={{ width: 60, height: 3, background: theme.accent }} />
          Deepak Rawat, Founder &amp; CEO, Prepbook
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function End() {
  return (
    <AbsoluteFill>
      <Gradient />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <FadeUp delay={4}>
          <Img src={staticFile("prepbook/logo-mark.png")} style={{ height: 90, filter: "brightness(0) invert(1)" }} />
        </FadeUp>
        <div style={{ fontFamily: serif, fontSize: 170, lineHeight: 1, letterSpacing: "-0.03em", marginTop: 30 }}>
          <Words text="Shubham Patil" delay={10} />
        </div>
        <FadeUp delay={34} style={{ fontFamily: sans, fontWeight: 500, fontSize: 36, marginTop: 30 }}>
          Graphic &amp; Web Designer Intern, Prepbook
        </FadeUp>
        <FadeUp delay={44} style={{ fontFamily: sans, fontSize: 28, marginTop: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
          Jun – Aug 2025
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const SCENES = [
  { Scene: Intro, frames: 120 },
  { Scene: About, frames: 165 },
  { Scene: Stats, frames: 135 },
  { Scene: Before, frames: 165 },
  { Scene: Website, frames: 285 },
  { Scene: WebApp, frames: 300 },
  { Scene: Quote, frames: 150 },
  { Scene: End, frames: 135 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), fade(), slide({ direction: "from-bottom" }), slide({ direction: "from-right" }), fade(), fade(), fade()];

export const PREPBOOK_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function Prepbook() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
