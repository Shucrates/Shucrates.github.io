import { loadFont as loadSans } from "@remotion/google-fonts/InterTight";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  accentText,
  Browser,
  FadeUp,
  Grain,
  Label,
  Pan,
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

const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500", "600"], subsets: ["latin", "latin-ext"] });

/** The site's own look: a geometric sans, near-black ink and the logo's blue as one indigo accent. */
const INK = "#0E1022";
const theme: Theme = {
  ink: INK,
  muted: "#5E6275",
  paper: "#F7F7FB",
  accent: "linear-gradient(95deg, #4F46E5 0%, #7C6CF6 100%)",
  glow: "rgba(110,95,240,0.14)",
  sans,
  headline: { fontFamily: sans, fontWeight: 600, fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.035em" },
};

function Intro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 6, fps, config: { damping: 15, stiffness: 110 } });
  return (
    // White, because the logo carries its own white ground.
    <Paper background="#fff">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img src={staticFile("iimsc/logo.webp")} style={{ width: 900, transform: `scale(${0.8 + pop * 0.2})`, opacity: pop }} />
        <div style={{ position: "absolute", top: 760 }}>
          <Label delay={40}>Recruitment website · 2026</Label>
        </div>
      </AbsoluteFill>
    </Paper>
  );
}

function Card({ title, text, dark, delay }: { title: string; text: string; dark?: boolean; delay: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  return (
    <div
      style={{
        width: 620,
        height: 280,
        padding: "44px 48px",
        borderRadius: 32,
        background: dark ? "#0B0B10" : "#fff",
        color: dark ? "#fff" : INK,
        boxShadow: "0 40px 80px -30px rgba(14,16,34,0.35), 0 0 0 1px rgba(14,16,34,0.06)",
        opacity: p,
        transform: `translateY(${(1 - p) * 80}px)`,
        fontFamily: sans,
        position: "relative",
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 500, letterSpacing: "-0.02em" }}>{title}</div>
      <div style={{ fontSize: 28, marginTop: 14, opacity: 0.6 }}>{text}</div>
      <div style={{ position: "absolute", top: 44, right: 48, width: 64, height: 64, borderRadius: "50%", background: dark ? "#2A2A33" : "#F1F1F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>↗</div>
    </div>
  );
}

function Problem() {
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 80, textAlign: "center" }}>
        <div style={{ ...theme.headline, fontSize: 116, color: INK }}>
          <Words text="One agency." delay={6} />
          <Words text="*Two* *audiences.*" delay={22} />
        </div>
        <div style={{ display: "flex", gap: 40, textAlign: "left" }}>
          <Card title="For Candidates" text="Launch your international career." delay={56} />
          <Card title="For Employers" text="Hire pre-vetted automotive talent." delay={66} dark />
        </div>
      </AbsoluteFill>
    </Paper>
  );
}

function Structure() {
  const enter = useProgress(10, 40);
  const swap = useBetween(90, 120);
  const scroll = useBetween(130, 220);
  const frame = { position: "absolute", left: 0, top: 0 } as const;
  return (
    <Paper>
      <Split width={600}>
        <Label>Structure</Label>
        <div style={{ ...theme.headline, color: INK }}>
          <Words text="Split at the *front* *door.*" delay={6} />
        </div>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 34, color: theme.muted, lineHeight: 1.4 }}>
          The first wireframe set the idea: a landing page that only asks who you are.
        </FadeUp>
      </Split>
      <div style={{ position: "absolute", left: 830, top: 190, width: 980, height: 700, opacity: enter, transform: `translateY(${(1 - enter) * 120}px)` }}>
        <Browser src="iimsc/wireframe.webp" url="Wireframe" width={980} viewport={650} image={{ width: 1440, height: 1024 }} style={{ ...frame, opacity: 1 - swap }} />
        <Browser src="iimsc/site-landing.webp" url="ii-msc.com" width={980} viewport={650} image={{ width: 1440, height: 1878 }} scroll={scroll} style={{ ...frame, opacity: swap }} />
      </div>
    </Paper>
  );
}

function Iterations() {
  const enter = useProgress(10, 40);
  return (
    <Paper>
      <Split width={560}>
        <Label>Moodboard &amp; iterations</Label>
        <div style={{ ...theme.headline, color: INK }}>
          <Words text="Trust over *flash.*" delay={6} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={50}>Real tradespeople, not stock handshakes</Point>
          <Point delay={68}>The logo's blue as one accent</Point>
          <Point delay={86}>Dark drafts turned light and calm</Point>
        </div>
      </Split>
      <Pan
        src="iimsc/iterations.webp"
        image={{ width: 2400, height: 754 }}
        width={1040}
        height={640}
        progress={useBetween(20, 210)}
        style={{ position: "absolute", left: 790, top: 220, opacity: enter, transform: `translateY(${(1 - enter) * 120}px)` }}
      />
    </Paper>
  );
}

function Portal({ src, url, height, title, index, scroll }: { src: string; url: string; height: number; title: string; index: number; scroll: number }) {
  const enter = useProgress(24 + index * 12, 40);
  return (
    <div style={{ position: "absolute", left: 160 + index * 820, top: 330, opacity: enter, transform: `translateY(${(1 - enter) * 140}px)` }}>
      <div style={{ fontFamily: sans, fontSize: 30, fontWeight: 500, color: INK, marginBottom: 20 }}>{title}</div>
      <Browser src={src} url={url} width={780} viewport={600} image={{ width: 1440, height }} scroll={scroll} />
    </div>
  );
}

function Portals() {
  const scroll = useBetween(60, 260);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "100px 160px 0", gap: 36 }}>
        <Label>Two portals</Label>
        <div style={{ ...theme.headline, fontSize: 84, color: INK }}>
          <Words text="Each reader gets *their* *own* *site.*" delay={6} />
        </div>
      </AbsoluteFill>
      <Portal src="iimsc/site-candidates.webp" url="ii-msc.com/en/candidates" height={3000} title="For Candidates" index={0} scroll={scroll} />
      <Portal src="iimsc/site-employers.webp" url="ii-msc.com/en/employers" height={3132} title="For Employers" index={1} scroll={scroll} />
    </Paper>
  );
}

/** The landing page's headline, as it reads in each language on the site. */
const LANGUAGES = [
  { code: "EN", name: "English", lines: ["Your Gateway to", "*Global* *Opportunities*"] },
  { code: "DE", name: "Deutsch", lines: ["Ihr Tor zu", "*globalen* *Möglichkeiten*"] },
  { code: "SV", name: "Svenska", lines: ["Din ingång till", "*globala* *möjligheter*"] },
  { code: "HR", name: "Hrvatski", lines: ["Vaš put prema", "*globalnim* *prilikama*"] },
  { code: "SL", name: "Slovenščina", lines: ["Vaš prehod do", "*globalnih* *priložnosti*"] },
];
const PER_LANGUAGE = 44;

function Languages() {
  const frame = useCurrentFrame();
  const current = Math.min(LANGUAGES.length - 1, Math.floor(Math.max(0, frame - 20) / PER_LANGUAGE));
  return (
    <Paper>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150, gap: 60 }}>
        <Label>Five languages</Label>
        <div style={{ display: "flex", gap: 16 }}>
          {LANGUAGES.map((language, i) => (
            <span
              key={language.code}
              style={{
                padding: "12px 26px",
                borderRadius: 999,
                fontFamily: sans,
                fontWeight: 500,
                fontSize: 26,
                color: i === current ? "#fff" : theme.muted,
                background: i === current ? theme.accent : "#fff",
                boxShadow: "0 0 0 1px rgba(14,16,34,0.08)",
              }}
            >
              {language.name}
            </span>
          ))}
        </div>
      </AbsoluteFill>
      {LANGUAGES.map((language, i) => (
        <Sequence key={language.code} from={20 + i * PER_LANGUAGE} durationInFrames={i === LANGUAGES.length - 1 ? Infinity : PER_LANGUAGE}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 140, textAlign: "center" }}>
            <div style={{ ...theme.headline, fontSize: 132, color: INK }}>
              {language.lines.map((line, j) => (
                <Words key={line} text={line} delay={j * 8} stagger={3} />
              ))}
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}
    </Paper>
  );
}

function Stat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const p = useProgress(delay, 50, Easing.bezier(0.33, 1, 0.68, 1));
  return (
    <FadeUp delay={delay} style={{ flex: 1 }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 150, lineHeight: 1, letterSpacing: "-0.04em", ...accentText({ ...theme, accent: "linear-gradient(95deg, #8F86FF, #C3BCFF)" }) }}>
        {Math.round(value * p).toLocaleString("en-US")}
        {suffix}
      </div>
      <div style={{ fontFamily: sans, fontSize: 28, color: "rgba(255,255,255,0.7)", marginTop: 14, maxWidth: 300, lineHeight: 1.3 }}>{label}</div>
    </FadeUp>
  );
}

function Stats() {
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Grain opacity={0.08} />
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 80 }}>
        <div style={{ ...theme.headline, color: "#fff" }}>
          <Words text="Proof, in one place." delay={4} />
        </div>
        <div style={{ display: "flex", gap: 50 }}>
          <Stat value={30} suffix="+" label="years of combined expertise" delay={20} />
          <Stat value={60} suffix="+" label="European automotive partners" delay={28} />
          <Stat value={1200} suffix="+" label="successful placements" delay={36} />
          <Stat value={8} suffix="+" label="countries across Europe" delay={44} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function End() {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 150], [0, 1]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${120 + drift * 30}deg, #3B33C9 0%, #5B4CF0 50%, #8577F7 100%)` }}>
      <Grain opacity={0.1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <div style={{ ...theme.headline, fontSize: 150 }}>
          <Words text="Shubham Patil" delay={8} />
        </div>
        <FadeUp delay={30} style={{ fontFamily: sans, fontWeight: 500, fontSize: 36, marginTop: 30 }}>
          Designer &amp; developer, IIMSC
        </FadeUp>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 28, marginTop: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
          ii-msc.com
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const SCENES = [
  { Scene: Intro, frames: 120 },
  { Scene: Problem, frames: 180 },
  { Scene: Structure, frames: 240 },
  { Scene: Iterations, frames: 225 },
  { Scene: Portals, frames: 285 },
  { Scene: Languages, frames: 20 + LANGUAGES.length * PER_LANGUAGE + 40 },
  { Scene: Stats, frames: 150 },
  { Scene: End, frames: 135 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), slide({ direction: "from-right" }), slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade(), fade()];

export const IIMSC_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function Iimsc() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
