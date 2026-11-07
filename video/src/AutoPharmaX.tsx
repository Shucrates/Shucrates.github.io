import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Browser, ease, FadeUp, Grain, Label, Scenes, scenesDuration, ThemeContext, useBetween, useProgress, Words, type Theme } from "./kit";

/** The landing page's look: near-black, silver wave ribbons, Helvetica, and metallic gold for the numbers that matter. */
const BG = "#0A0A0A";
const helvetica = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const GOLD = "linear-gradient(180deg, #ECEBC2 0%, #A9A774 55%, #6F6D47 100%)";
const SEAM = "#E4DF8F";
const MUTED = "rgba(242,242,239,0.6)";
const theme: Theme = {
  ink: "#F2F2EF",
  muted: MUTED,
  paper: BG,
  accent: "linear-gradient(180deg, #F3F1C8 0%, #B9B67E 70%, #8C8A5A 100%)",
  glow: "rgba(228,223,143,0.08)",
  sans: helvetica,
  headline: { fontFamily: helvetica, fontWeight: 400, fontSize: 104, lineHeight: 1.04, letterSpacing: "-0.03em" },
};
const metal: CSSProperties = { backgroundImage: GOLD, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" };
const img = (name: string) => `autopharmax/${name}.webp`;

/** Silver strands drifting like the hero ribbon. */
function Waves({ opacity = 0.6, top = 380, height = 700 }: { opacity?: number; top?: number; height?: number }) {
  const frame = useCurrentFrame();
  const strands = 54;
  const paths = Array.from({ length: strands }, (_, i) => {
    const t = i / strands;
    const amp = 140 + t * 70;
    const ph = t * 1.4 + frame / 90;
    const y0 = height * 0.5 + (t - 0.5) * 110;
    let d = "";
    for (let x = 0; x <= 1920; x += 20) {
      const y = y0 + Math.sin(x / 340 + ph) * amp * 0.6 + Math.sin(x / 680 - ph * 0.7) * amp * 0.4;
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
    }
    return <path key={i} d={d} stroke={`rgba(230,230,225,${0.06 + 0.34 * Math.sin(t * Math.PI)})`} strokeWidth={1.2} fill="none" />;
  });
  return (
    <svg width={1920} height={height} viewBox={`0 0 1920 ${height}`} style={{ position: "absolute", left: 0, top, opacity }}>
      {paths}
    </svg>
  );
}

function Dark({ children, waves = true }: { children: ReactNode; waves?: boolean }) {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(228,223,143,0.10), transparent 55%)" }} />
      {waves && <Waves />}
      <Grain opacity={0.06} />
      {children}
    </AbsoluteFill>
  );
}

function Logo({ size = 40 }: { size?: number }) {
  return <span style={{ fontFamily: helvetica, fontWeight: 700, fontSize: size, backgroundImage: "linear-gradient(90deg, #E7E2A6, #B9B46E 60%, #9FB86E)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>AutoPharmaX</span>;
}

function Intro() {
  const logo = useProgress(6, 34);
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", marginTop: -100 }}>
        <div style={{ opacity: logo, transform: `translateY(${(1 - logo) * 30}px)` }}>
          <Logo size={140} />
        </div>
        <div style={{ ...theme.headline, fontSize: 56, marginTop: 30, color: "#EDEDEA" }}>
          <Words text="AI-powered drug *efficacy* *prediction*" delay={26} />
        </div>
        <FadeUp delay={50} style={{ marginTop: 34, fontFamily: helvetica, fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED }}>
          Final-year research · SIES GST
        </FadeUp>
      </AbsoluteFill>
    </Dark>
  );
}

function Problem() {
  const frame = useCurrentFrame();
  const diagnoses = interpolate(frame, [90, 150], [0, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <Dark waves={false}>
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 40 }}>
        <Label>The problem</Label>
        <div style={{ ...theme.headline, fontSize: 120, color: "#EDEDEA" }}>
          <Words text="Same cancer. Same drug." delay={6} />
          <Words text="*Different* *outcome.*" delay={24} />
        </div>
        <FadeUp delay={80} style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
          <span style={{ fontFamily: helvetica, fontSize: 150, letterSpacing: "-0.04em", ...metal }}>~{Math.round(diagnoses)}M</span>
          <span style={{ fontFamily: helvetica, fontSize: 34, color: MUTED }}>new cancer diagnoses worldwide in 2022</span>
        </FadeUp>
      </AbsoluteFill>
    </Dark>
  );
}

const DATA = [
  { value: 300000, prefix: "~", label: "drug–cell line pairs" },
  { value: 809, prefix: "", label: "cancer cell lines" },
  { value: 198, prefix: "", label: "compounds" },
  { value: 260000, prefix: "~", label: "pairs kept after the merge" },
];

function Data() {
  const frame = useCurrentFrame();
  return (
    <Dark waves={false}>
      <div style={{ position: "absolute", left: 160, top: 150 }}>
        <Label>Data · GDSC2, CCLE, PubChem, DrugComb</Label>
        <div style={{ ...theme.headline, fontSize: 96, marginTop: 30, color: "#EDEDEA" }}>
          <Words text="All public. *All* *free.*" delay={6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 160, right: 160, top: 560, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: `linear-gradient(90deg, transparent, ${SEAM}, transparent)` }}>
        {DATA.map((d, i) => {
          const n = interpolate(frame, [30 + i * 10, 100 + i * 10], [0, d.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          return (
            <div key={d.label} style={{ background: BG, padding: "40px 30px" }}>
              <FadeUp delay={24 + i * 10}>
              <div style={{ fontFamily: helvetica, fontSize: 92, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", ...metal }}>
                {d.prefix}
                {Math.round(n).toLocaleString("en")}
              </div>
              <div style={{ fontFamily: helvetica, fontSize: 26, color: MUTED, marginTop: 10 }}>{d.label}</div>
              </FadeUp>
            </div>
          );
        })}
      </div>
    </Dark>
  );
}

function Box({ title, sub, delay, gold, style }: { title: string; sub: string; delay: number; gold?: boolean; style?: CSSProperties }) {
  const p = useProgress(delay, 22);
  return (
    <div
      style={{
        border: `1px solid ${gold ? "rgba(228,223,143,0.6)" : "rgba(255,255,255,0.12)"}`,
        borderRadius: 14,
        padding: "20px 26px",
        background: "rgba(255,255,255,0.03)",
        boxShadow: gold ? "0 0 40px rgba(228,223,143,0.15)" : undefined,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
        ...style,
      }}
    >
      <div style={{ fontFamily: helvetica, fontSize: 28, color: "#F2F2EF" }}>{title}</div>
      <div style={{ fontFamily: helvetica, fontSize: 20, color: MUTED, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function Model() {
  const out = useProgress(150, 30);
  return (
    <Dark waves={false}>
      <div style={{ position: "absolute", left: 160, top: 110 }}>
        <Label>Model</Label>
        <div style={{ ...theme.headline, fontSize: 84, marginTop: 24, color: "#EDEDEA" }}>
          <Words text="Two encoders, *one* *number.*" delay={6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 160, right: 160, top: 360, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Box title="Cell line · 1,378" sub="978 genes · 200 mutations · 200 copy numbers" delay={30} />
          <Box title="Cell line encoder → 256" sub="1378 → 1024 → 512 → 256" delay={70} gold />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Box title="Drug · 2,228" sub="2048-bit Morgan fingerprint · ~180 RDKit descriptors" delay={44} />
          <Box title="Drug encoder → 256" sub="2228 → 1024 → 512 → 256" delay={84} gold />
        </div>
      </div>
      <Box title="Fuse 512 → regression head" sub="256 → 128 → 64 → 1" delay={110} gold style={{ position: "absolute", left: 610, width: 700, top: 690 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", opacity: out, transform: `scale(${0.9 + out * 0.1})` }}>
        <span style={{ fontFamily: helvetica, fontSize: 110, letterSpacing: "-0.03em", ...metal }}>ln(IC50)</span>
      </div>
    </Dark>
  );
}

const BENCH = [
  { name: "Ridge", ss: 0.71, ldo: 0.48 },
  { name: "XGBoost", ss: 0.79, ldo: 0.55 },
  { name: "CDRscan", ss: 0.83, ldo: 0.63 },
  { name: "AutoPharmaX", ss: 0.87, ldo: 0.72, ours: true },
];

function Gap() {
  const frame = useCurrentFrame();
  const drop = useBetween(70, 130);
  return (
    <Dark waves={false}>
      <div style={{ position: "absolute", left: 160, top: 110, width: 1000 }}>
        <Label>Leave-drug-out</Label>
        <div style={{ ...theme.headline, fontSize: 84, marginTop: 24, color: "#EDEDEA" }}>
          <Words text="Tested on drugs it has *never* *seen.*" delay={6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 420, width: 980 }}>
        {BENCH.map((b, i) => {
          const r = interpolate(frame, [30 + i * 6, 60 + i * 6], [0, b.ss], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          const now = r - (b.ss - b.ldo) * drop;
          return (
            <div key={b.name} style={{ display: "grid", gridTemplateColumns: "240px 1fr 110px", alignItems: "center", gap: 24, marginTop: 34 }}>
              <span style={{ fontFamily: helvetica, fontSize: 30, color: b.ours ? "#fff" : MUTED }}>{b.name}</span>
              <div style={{ position: "relative", height: 22 }}>
                <div style={{ position: "absolute", height: 22, width: `${b.ss * 100}%`, background: "rgba(255,255,255,0.08)", borderRadius: 3, opacity: drop }} />
                <div style={{ position: "absolute", height: 22, width: `${now * 100}%`, background: b.ours ? "linear-gradient(90deg,#6F6D47,#ECEBC2)" : "rgba(228,223,143,0.35)", borderRadius: 3, boxShadow: b.ours ? "0 0 20px rgba(228,223,143,0.4)" : undefined }} />
              </div>
              <span style={{ fontFamily: helvetica, fontSize: 30, color: b.ours ? "#fff" : MUTED, fontVariantNumeric: "tabular-nums" }}>{now.toFixed(2)}</span>
            </div>
          );
        })}
        <FadeUp delay={70} style={{ fontFamily: helvetica, fontSize: 22, color: MUTED, marginTop: 40 }}>
          Pearson r, random split → drugs held out · indicative values from the paper
        </FadeUp>
      </div>
      <div style={{ position: "absolute", left: 1260, top: 420, width: 520 }}>
        <FadeUp delay={130} style={{ fontFamily: helvetica, fontSize: 22, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
          Smallest drop
        </FadeUp>
        <FadeUp delay={136} style={{ fontFamily: helvetica, fontSize: 230, letterSpacing: "-0.05em", lineHeight: 1, ...metal }}>
          −17%
        </FadeUp>
        <FadeUp delay={146} style={{ fontFamily: helvetica, fontSize: 28, color: MUTED, lineHeight: 1.4 }}>
          against −30% for XGBoost and −32% for Ridge.
        </FadeUp>
      </div>
    </Dark>
  );
}

function Redesign() {
  const enter = useProgress(10, 34);
  const swap = useBetween(80, 110);
  const frame = { position: "absolute", left: 0, top: 0 } as const;
  return (
    <Dark waves={false}>
      <div style={{ position: "absolute", left: 160, top: 110, width: 560 }}>
        <Label>Interface</Label>
        <div style={{ ...theme.headline, fontSize: 80, marginTop: 24, color: "#EDEDEA" }}>
          <Words text="From Streamlit to the *landing* *page's* *world.*" delay={6} />
        </div>
        <FadeUp delay={44} style={{ fontFamily: helvetica, fontSize: 28, color: MUTED, lineHeight: 1.45, marginTop: 30 }}>
          <span style={{ opacity: 1 - swap * 0.6 }}>Before: dropdowns, a red button, default charts.</span> <span style={{ opacity: 0.4 + swap * 0.6 }}>After: the answer first, then the reasons.</span>
        </FadeUp>
      </div>
      <div style={{ position: "absolute", left: 790, top: 150, width: 1000, height: 780, opacity: enter, transform: `translateY(${(1 - enter) * 140}px)` }}>
        <Browser src={img("streamlit")} url="localhost:8501" width={1000} viewport={423} image={{ width: 1440, height: 609 }} style={{ ...frame, top: 140, opacity: 1 - swap }} />
        <Browser src={img("predict")} url="autopharmax · Predict" width={1000} viewport={740} image={{ width: 1440, height: 1184 }} scroll={useBetween(130, 220)} style={{ ...frame, opacity: swap }} />
      </div>
    </Dark>
  );
}

function Screens() {
  const a = useProgress(6, 30);
  const b = useProgress(40, 30);
  const c = useProgress(74, 30);
  const card = (p: number, x: number, y: number, r: number): CSSProperties => ({ position: "absolute", left: x, top: y, opacity: p, transform: `translateY(${(1 - p) * 160}px) rotate(${r}deg)` });
  return (
    <Dark>
      <AbsoluteFill style={{ padding: "110px 160px 0" }}>
        <Label>Every screen, one language</Label>
      </AbsoluteFill>
      <div style={card(a, 120, 250, -2)}>
        <Browser src={img("combination")} url="autopharmax · Combination" width={820} viewport={570} image={{ width: 1440, height: 1000 }} />
      </div>
      <div style={card(b, 980, 210, 2)}>
        <Browser src={img("benchmarks")} url="autopharmax · Benchmarks" width={820} viewport={570} image={{ width: 1440, height: 1000 }} />
      </div>
      <div style={{ ...card(c, 820, 470, 0), width: 300, padding: 10, borderRadius: 44, background: "#111", boxShadow: "0 50px 90px -25px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)" }}>
        <div style={{ height: 560, borderRadius: 34, overflow: "hidden" }}>
          <Img src={staticFile(img("predict-mobile"))} style={{ width: 280, display: "block", transform: `translateY(${-useBetween(90, 180) * 80}px)` }} />
        </div>
      </div>
    </Dark>
  );
}

function End() {
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", marginTop: -80 }}>
        <div style={{ ...theme.headline, fontSize: 140, color: "#EDEDEA" }}>
          <Words text="Shubham Patil" delay={6} />
        </div>
        <FadeUp delay={26} style={{ fontFamily: helvetica, fontSize: 36, color: "#F2F2EF", marginTop: 30 }}>
          Co-author &amp; product design · <Logo size={36} />
        </FadeUp>
        <FadeUp delay={40} style={{ fontFamily: helvetica, fontSize: 26, color: MUTED, marginTop: 24 }}>
          With Rithvik Shetty, Vinay Pokharkar &amp; Srishti Mishra · guided by Prof. Ketki Kausadikar
        </FadeUp>
      </AbsoluteFill>
    </Dark>
  );
}

const SCENES = [
  { Scene: Intro, frames: 130 },
  { Scene: Problem, frames: 190 },
  { Scene: Data, frames: 170 },
  { Scene: Model, frames: 220 },
  { Scene: Gap, frames: 230 },
  { Scene: Redesign, frames: 240 },
  { Scene: Screens, frames: 200 },
  { Scene: End, frames: 140 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), fade(), slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade(), fade()];

export const AUTOPHARMAX_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function AutoPharmaX() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
