import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadBengali } from "@remotion/google-fonts/NotoSansBengali";
import { loadFont as loadDevanagari } from "@remotion/google-fonts/NotoSansDevanagari";
import { loadFont as loadTamil } from "@remotion/google-fonts/NotoSansTamil";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  Browser,
  ease,
  FadeUp,
  Grain,
  Label,
  Paper,
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

const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500"], subsets: ["latin"] });
const { fontFamily: display } = loadDisplay("normal", { weights: ["500", "600"], subsets: ["latin"] });
const { fontFamily: devanagari } = loadDevanagari("normal", { weights: ["500"], subsets: ["devanagari"] });
const { fontFamily: bengali } = loadBengali("normal", { weights: ["500"], subsets: ["bengali"] });
const { fontFamily: tamil } = loadTamil("normal", { weights: ["500"], subsets: ["tamil"] });

/** The pitch deck's look: cobalt, warm cream, Space Grotesk headlines. */
const COBALT = "#1E2BFA";
const INK = "#111111";
const theme: Theme = {
  ink: INK,
  muted: "#6B6A5E",
  paper: "#FDFAE7",
  accent: "linear-gradient(95deg, #1E2BFA 0%, #5B6BFF 100%)",
  glow: "rgba(30,43,250,0.10)",
  sans,
  headline: { fontFamily: display, fontWeight: 500, fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.03em" },
};

const LIGHT = "rgba(255,255,255,0.78)";
/** On cobalt, highlighted words turn the deck's cream instead of disappearing into the blue. */
const onCobalt: Theme = { ...theme, accent: "linear-gradient(95deg, #FFE58A 0%, #FDFAE7 100%)" };
const RED = "#E5484D";

/** Cobalt with the deck's faint grid. */
function Cobalt({ children }: { children: ReactNode }) {
  const frame = useCurrentFrame();
  const drift = (frame * 0.4) % 64;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 75% 20%, #4250FF 0%, ${COBALT} 45%, #1520C8 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `${drift}px ${drift}px`,
        }}
      />
      <Grain opacity={0.06} />
      <ThemeContext.Provider value={onCobalt}>{children}</ThemeContext.Provider>
    </AbsoluteFill>
  );
}

function Intro() {
  const rule = useProgress(40, 40);
  return (
    <Cobalt>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 200px", color: "#fff" }}>
        <FadeUp delay={4} style={{ fontSize: 44, opacity: 0.85 }}>
          <span style={{ fontFamily: devanagari }}>प्रमाण</span>
          <span style={{ fontFamily: display }}> · proof</span>
        </FadeUp>
        <div style={{ ...theme.headline, fontSize: 230, marginTop: 10 }}>
          <Words text="Praman" delay={10} />
        </div>
        <div style={{ height: 3, width: 760 * rule, background: "rgba(255,255,255,0.7)", margin: "24px 0 34px" }} />
        <div style={{ ...theme.headline, fontSize: 58, maxWidth: 1200 }}>
          <Words text="Proof you can read, in a language you understand." delay={34} stagger={3} />
        </div>
        <div style={{ marginTop: 44 }}>
          <Label delay={70} color={LIGHT}>
            Top 12 · Sarvam AI hackathon · Bengaluru 2026
          </Label>
        </div>
      </AbsoluteFill>
    </Cobalt>
  );
}

function Problem() {
  const frame = useCurrentFrame();
  const flip = useBetween(70, 100);
  const rate = Math.round(interpolate(frame, [80, 130], [3.5, 42], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) * 10) / 10;
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center" }}>
        <Label>The problem</Label>
        <div style={{ ...theme.headline, fontSize: 104, color: INK, marginTop: 40 }}>
          <Words text="Borrowers sign what" delay={6} />
          <Words text="they *can't* *parse.*" delay={18} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 70, fontFamily: display, fontWeight: 600 }}>
          <FadeUp delay={44} style={{ fontSize: 120, letterSpacing: "-0.03em", color: flip > 0.5 ? RED : INK, fontVariantNumeric: "tabular-nums" }}>
            {frame < 80 ? "3.5%" : `${rate.toFixed(rate < 10 ? 1 : 0)}%`}
          </FadeUp>
          <FadeUp delay={50} style={{ fontSize: 48, color: theme.muted }}>
            <span style={{ opacity: 1 - flip, position: "absolute" }}>per month. Sounds small.</span>
            <span style={{ opacity: flip }}>a year, buried in the jargon.</span>
          </FadeUp>
        </div>
      </AbsoluteFill>
    </Paper>
  );
}

const SCRIPTS = [
  { word: "मराठी", font: devanagari },
  { word: "हिंदी", font: devanagari },
  { word: "English", font: display },
  { word: "বাংলা", font: bengali },
  { word: "தமிழ்", font: tamil },
];

function WhatsApp() {
  const frame = useCurrentFrame();
  const picker = useProgress(10, 40);
  const chat = useProgress(70, 40);
  const index = Math.min(SCRIPTS.length - 1, Math.floor(Math.max(0, frame - 20) / 22));
  const local = (Math.max(0, frame - 20) % 22) / 22;
  const current = SCRIPTS[index];
  return (
    <Cobalt>
      <Split width={600}>
        <Label color={LIGHT}>On WhatsApp</Label>
        <div style={{ ...theme.headline, fontSize: 92, color: "#fff" }}>
          <Words text="Speak or type, in *your* language." delay={6} />
        </div>
        <div style={{ height: 120, overflow: "hidden", position: "relative" }}>
          <div
            style={{
              fontFamily: current.font,
              fontWeight: 500,
              fontSize: 96,
              color: "#fff",
              opacity: frame < 20 ? 0 : index === SCRIPTS.length - 1 ? 1 : interpolate(local, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
              transform: `translateY(${index === SCRIPTS.length - 1 ? 0 : interpolate(local, [0, 0.2, 0.8, 1], [40, 0, 0, -40])}px)`,
            }}
          >
            {current.word}
          </div>
        </div>
        <FadeUp delay={60} style={{ fontFamily: sans, fontSize: 30, color: LIGHT, lineHeight: 1.4 }}>
          Voice notes in, answers out in the same language.
        </FadeUp>
      </Split>
      <Img
        src={staticFile("praman/whatsapp-languages.webp")}
        style={{ position: "absolute", left: 860, top: 150, width: 420, borderRadius: 28, boxShadow: "0 50px 100px -30px rgba(0,0,30,0.6)", opacity: picker, transform: `translateY(${(1 - picker) * 120}px)` }}
      />
      <Img
        src={staticFile("praman/whatsapp-chat.webp")}
        style={{ position: "absolute", left: 1130, top: 300, width: 700, borderRadius: 24, boxShadow: "0 50px 100px -30px rgba(0,0,30,0.7)", opacity: chat, transform: `translateY(${(1 - chat) * 160}px)` }}
      />
    </Cobalt>
  );
}

function Dashboard() {
  const enter = useProgress(8, 40);
  const swap = useBetween(130, 160);
  const frame = { position: "absolute", left: 0, top: 0 } as const;
  return (
    <Paper>
      <Split width={540}>
        <Label>The dashboard</Label>
        <div style={{ ...theme.headline, color: INK }}>
          <Words text="Every loan, *one* *view.*" delay={6} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={50}>What you owe and pay each month</Point>
          <Point delay={66}>FOIR on a coloured gauge</Point>
          <Point delay={82}>Every label in your language</Point>
        </div>
      </Split>
      <div style={{ position: "absolute", left: 770, top: 190, width: 1060, height: 720, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}>
        <Browser src="praman/dashboard.webp" url="praman · Overview" width={1060} viewport={662} image={{ width: 1440, height: 900 }} style={{ ...frame, opacity: 1 - swap }} />
        <Browser src="praman/dashboard-hindi.webp" url="praman · अवलोकन" width={1060} viewport={662} image={{ width: 1440, height: 900 }} style={{ ...frame, opacity: swap }} />
      </div>
    </Paper>
  );
}

const FINDINGS = [
  { severity: "Critical", title: "Unilateral rate revision", color: "#B42318", bg: "#FEE4E2" },
  { severity: "High", title: "Foreclosure penalty on own funds", color: "#B54708", bg: "#FEF0C7" },
  { severity: "Medium", title: "Undefined penal charge", color: "#93710B", bg: "#FDF6D8" },
];

function Report() {
  const enter = useProgress(8, 40);
  const zoom = useBetween(100, 160);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "0 0 0 140px", justifyContent: "center" }}>
        <div style={{ width: 560, display: "flex", flexDirection: "column", gap: 30 }}>
          <Label>The AI report</Label>
          <div style={{ ...theme.headline, fontSize: 84, color: INK }}>
            <Words text="Every finding points at *its* *clause.*" delay={6} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 6 }}>
            {FINDINGS.map((finding, i) => (
              <FadeUp key={finding.title} delay={50 + i * 12} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: sans, fontSize: 28, color: INK }}>
                <span style={{ fontWeight: 500, fontSize: 20, padding: "6px 14px", borderRadius: 999, color: finding.color, background: finding.bg, minWidth: 92, textAlign: "center" }}>{finding.severity}</span>
                {finding.title}
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={92} style={{ fontFamily: sans, fontSize: 26, color: theme.muted }}>
            Each one cited against RBI rules. Uncited claims are dropped.
          </FadeUp>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 760, top: 170, width: 1080, height: 740, overflow: "hidden", borderRadius: 18, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}>
        <div style={{ transformOrigin: "26% 62%", transform: `scale(${1 + zoom * 0.35})` }}>
          <Browser src="praman/report.webp" url="praman · Document report" width={1080} viewport={675} image={{ width: 1440, height: 900 }} />
        </div>
      </div>
    </Paper>
  );
}

function Context() {
  const enter = useProgress(8, 40);
  const swap = useBetween(110, 140);
  const frame = { position: "absolute", left: 0, top: 0 } as const;
  return (
    <Cobalt>
      <Split width={540}>
        <Label color={LIGHT}>In context</Label>
        <div style={{ ...theme.headline, fontSize: 88, color: "#fff" }}>
          <Words text="What it costs, and what it does *to* *you.*" delay={6} />
        </div>
        <FadeUp delay={50} style={{ fontFamily: sans, fontSize: 30, color: LIGHT, lineHeight: 1.4 }}>
          Terms beside typical market terms, then your FOIR before and after signing.
        </FadeUp>
      </Split>
      <div style={{ position: "absolute", left: 770, top: 190, width: 1060, height: 720, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}>
        <Browser src="praman/report-comparison.webp" url="praman · Policy comparison" width={1060} viewport={662} image={{ width: 1440, height: 900 }} style={{ ...frame, opacity: 1 - swap }} />
        <Browser src="praman/report-impact.webp" url="praman · Profile impact" width={1060} viewport={662} image={{ width: 1440, height: 900 }} style={{ ...frame, opacity: swap }} />
      </div>
    </Cobalt>
  );
}

const SLIDES = ["deck-cover", "deck-problem", "deck-loop", "deck-report", "deck-stack"];

function Pitch() {
  const frame = useCurrentFrame();
  const applicants = Math.round(interpolate(frame, [60, 110], [0, 6272], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const pan = useBetween(10, 230);
  const stat = { fontFamily: display, fontWeight: 600, fontSize: 96, letterSpacing: "-0.03em", color: INK, fontVariantNumeric: "tabular-nums" } as const;
  const caption = { fontFamily: sans, fontSize: 26, color: theme.muted, marginTop: 6 } as const;
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "130px 160px 0" }}>
        <Label>The pitch</Label>
        <div style={{ ...theme.headline, fontSize: 84, color: INK, marginTop: 30 }}>
          <Words text="Twelve hours of building, *then* *the* *stage.*" delay={6} />
        </div>
        <div style={{ display: "flex", gap: 110, marginTop: 50 }}>
          <FadeUp delay={56}>
            <div style={stat}>{applicants.toLocaleString("en-IN")}</div>
            <div style={caption}>applied</div>
          </FadeUp>
          <FadeUp delay={74}>
            <div style={stat}>~100</div>
            <div style={caption}>got in</div>
          </FadeUp>
          <FadeUp delay={92}>
            <div style={{ ...stat, color: COBALT }}>Top 12</div>
            <div style={caption}>where I gave the demo and pitch</div>
          </FadeUp>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 660, display: "flex", gap: 36, transform: `translateX(${160 - pan * 1500}px)` }}>
        {SLIDES.map((name, i) => {
          const p = interpolate(frame - 20 - i * 8, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          return (
            <Img
              key={name}
              src={staticFile(`praman/${name}.webp`)}
              style={{ width: 560, borderRadius: 12, boxShadow: "0 30px 70px -25px rgba(17,17,17,0.35)", opacity: p, transform: `translateY(${(1 - p) * 80}px)` }}
            />
          );
        })}
      </div>
    </Paper>
  );
}

function End() {
  return (
    <Cobalt>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <div style={{ ...theme.headline, fontSize: 150 }}>
          <Words text="Shubham Patil" delay={8} />
        </div>
        <FadeUp delay={30} style={{ fontFamily: sans, fontWeight: 500, fontSize: 36, marginTop: 30 }}>
          Ideation, frontend, deck &amp; pitch · Praman
        </FadeUp>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 28, marginTop: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
          Next.js · Sarvam AI · WhatsApp
        </FadeUp>
        <FadeUp delay={52} style={{ fontFamily: sans, fontSize: 26, marginTop: 40, opacity: 0.7 }}>
          With Yash Varma, Rithvik Shetty &amp; Vinay Pokharkar
        </FadeUp>
      </AbsoluteFill>
    </Cobalt>
  );
}

const SCENES = [
  { Scene: Intro, frames: 150 },
  { Scene: Problem, frames: 190 },
  { Scene: WhatsApp, frames: 230 },
  { Scene: Dashboard, frames: 230 },
  { Scene: Report, frames: 240 },
  { Scene: Context, frames: 210 },
  { Scene: Pitch, frames: 270 },
  { Scene: End, frames: 135 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade(), fade(), fade()];

export const PRAMAN_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function Praman() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
