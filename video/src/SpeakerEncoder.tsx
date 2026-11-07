import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ease, FadeUp, Grain, Label, Scenes, scenesDuration, ThemeContext, useProgress, Words, type Theme } from "./kit";

const { fontFamily: sans } = loadSans("normal", { weights: ["300", "400", "500"], subsets: ["latin"] });
const { fontFamily: mono } = loadMono("normal", { weights: ["400"], subsets: ["latin"] });

/** IEEE-blue on a night background, like an oscilloscope: the voice is the hero. */
const NIGHT = "#0B0E14";
const BLUE = "#4FB3FF";
const MUTED = "#8B97AB";
const theme: Theme = {
  ink: "#E8ECF2",
  muted: MUTED,
  paper: NIGHT,
  accent: "linear-gradient(95deg, #4FB3FF 0%, #A6DBFF 100%)",
  glow: "rgba(79,179,255,0.12)",
  sans,
  headline: { fontFamily: sans, fontWeight: 300, fontSize: 104, lineHeight: 1.04, letterSpacing: "-0.035em", color: "#E8ECF2" },
};

/** A live waveform: bars that breathe with the frame. */
function Wave({ bars = 90, width = 1600, height = 240, color = BLUE, delay = 0, seed = 0 }: { bars?: number; width?: number; height?: number; color?: string; delay?: number; seed?: number }) {
  const frame = useCurrentFrame();
  const on = useProgress(delay, 30);
  const w = width / bars;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: w * 0.35, height, width }}>
      {Array.from({ length: bars }, (_, i) => {
        const env = Math.sin((i / bars) * Math.PI);
        const v = Math.abs(Math.sin(i * 0.61 + seed + frame / 7) * Math.cos(i * 0.17 - frame / 11 + seed)) * env;
        const reveal = interpolate(on * bars - i, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <span key={i} style={{ width: w * 0.65, height: Math.max(4, v * height * reveal), borderRadius: 4, background: color, opacity: 0.35 + v * 0.65 }} />;
      })}
    </div>
  );
}

function Night({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 80% 0%, rgba(79,179,255,0.12), transparent 50%)" }} />
      <Grain opacity={0.06} />
      {children}
    </AbsoluteFill>
  );
}

function Intro() {
  return (
    <Night>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 30 }}>
        <Wave delay={0} width={1400} height={180} />
        <div style={{ ...theme.headline, fontSize: 92, maxWidth: 1500 }}>
          <Words text="Attention Enhanced Speaker Representation" delay={22} stagger={3} />
          <Words text="with *Contrastive* *Learning*" delay={40} stagger={3} />
        </div>
        <FadeUp delay={66} style={{ fontFamily: mono, fontSize: 24, color: MUTED, letterSpacing: "0.08em" }}>
          IEEE · ICCUBEA 2025 · PUNE
        </FadeUp>
      </AbsoluteFill>
    </Night>
  );
}

function Clone() {
  const swap = useProgress(110, 30);
  return (
    <Night>
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 40 }}>
        <Label>The task</Label>
        <div style={theme.headline}>
          <Words text="A few seconds of a voice." delay={6} />
          <Words text="Then *any* *sentence* in it." delay={24} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 50, marginTop: 30 }}>
          <div>
            <FadeUp delay={50} style={{ fontFamily: mono, fontSize: 22, color: MUTED, marginBottom: 14 }}>
              reference clip · unseen speaker
            </FadeUp>
            <Wave bars={40} width={560} height={150} delay={54} seed={1} />
          </div>
          <FadeUp delay={90} style={{ fontFamily: sans, fontSize: 60, color: MUTED }}>
            →
          </FadeUp>
          <div style={{ opacity: swap }}>
            <div style={{ fontFamily: mono, fontSize: 22, color: BLUE, marginBottom: 14 }}>synthesised · same voice, new words</div>
            <Wave bars={50} width={700} height={150} delay={110} seed={4} color="#A6DBFF" />
          </div>
        </div>
      </AbsoluteFill>
    </Night>
  );
}

function Recurrence() {
  const frame = useCurrentFrame();
  const step = Math.min(8, Math.max(0, Math.floor((frame - 40) / 14)));
  const attn = useProgress(140, 30);
  const box = (lit: boolean, txt: string) => (
    <div style={{ width: 110, height: 84, borderRadius: 14, border: `1px solid ${lit ? BLUE : "#2A3345"}`, background: lit ? "rgba(79,179,255,0.12)" : "#121826", display: "grid", placeItems: "center", fontFamily: mono, fontSize: 24, color: lit ? "#CFE8FF" : MUTED }}>{txt}</div>
  );
  return (
    <Night>
      <div style={{ position: "absolute", left: 160, top: 130 }}>
        <Label>LSTM vs Transformer</Label>
        <div style={{ ...theme.headline, fontSize: 88, marginTop: 24 }}>
          <Words text="One frame at a time, *or* *all* *at* *once.*" delay={6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 470 }}>
        <FadeUp delay={30} style={{ fontFamily: mono, fontSize: 22, color: MUTED, marginBottom: 18 }}>
          LSTM · waits for the frame before
        </FadeUp>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {box(i < step, `h${i + 1}`)}
              {i < 7 && <span style={{ color: "#4A5670", fontSize: 28 }}>→</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 720, opacity: attn }}>
        <div style={{ fontFamily: mono, fontSize: 22, color: BLUE, marginBottom: 18 }}>Transformer · self-attention, in parallel</div>
        <div style={{ position: "relative", display: "flex", gap: 46 }}>
          {Array.from({ length: 8 }, (_, i) => box(true, `x${i + 1}`))}
          <svg width={1300} height={110} style={{ position: "absolute", left: 0, top: 84 }}>
            {Array.from({ length: 8 }, (_, i) =>
              Array.from({ length: 8 }, (_, j) =>
                i === j ? null : <path key={`${i}-${j}`} d={`M${55 + i * 156} 0 Q ${55 + (i + j) * 78} ${100} ${55 + j * 156} 0`} stroke={`rgba(79,179,255,${0.12 + 0.3 * attn})`} fill="none" strokeWidth={1.5} />,
              ),
            )}
          </svg>
        </div>
      </div>
    </Night>
  );
}

function Training() {
  const frame = useCurrentFrame();
  const pull = interpolate(frame, [50, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const speakers = [
    { color: "#4FB3FF", cx: 1260, cy: 400 },
    { color: "#F4B860", cx: 1580, cy: 640 },
    { color: "#9AE6B4", cx: 1200, cy: 780 },
  ];
  return (
    <Night>
      <div style={{ position: "absolute", left: 160, top: 220, width: 760, display: "flex", flexDirection: "column", gap: 34 }}>
        <Label>Training · GE2E loss</Label>
        <div style={{ ...theme.headline, fontSize: 92 }}>
          <Words text="Same voice together." delay={6} />
          <Words text="*Different* *voices* *apart.*" delay={22} />
        </div>
        <FadeUp delay={50} style={{ fontFamily: sans, fontSize: 32, color: MUTED, lineHeight: 1.45 }}>
          The encoder learns as a speaker verifier, so its embeddings separate who is speaking. That&apos;s the contrastive learning in the title.
        </FadeUp>
      </div>
      {speakers.flatMap((s, si) =>
        Array.from({ length: 7 }, (_, k) => {
          const a = (k / 7) * Math.PI * 2 + si;
          const r0 = 220 + ((k * 37 + si * 53) % 120);
          const r = r0 * (1 - pull) + 40 * pull;
          return <span key={`${si}-${k}`} style={{ position: "absolute", left: s.cx + Math.cos(a) * r - 10, top: s.cy + Math.sin(a) * r * 0.8 - 10, width: 20, height: 20, borderRadius: "50%", background: s.color, boxShadow: `0 0 18px ${s.color}`, opacity: interpolate(frame - 20 - k * 3, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />;
        }),
      )}
    </Night>
  );
}

function Pipeline() {
  const p = useProgress(10, 34);
  return (
    <Night>
      <div style={{ position: "absolute", left: 160, top: 120 }}>
        <Label>Zero-shot synthesis</Label>
        <div style={{ ...theme.headline, fontSize: 84, marginTop: 24 }}>
          <Words text="Embedding in, *new* *voice* out." delay={6} />
        </div>
      </div>
      <Img src={staticFile("speaker-encoder/pipeline.webp")} style={{ position: "absolute", left: 160, top: 360, width: 1600, borderRadius: 18, boxShadow: "0 40px 90px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)", opacity: p, transform: `translateY(${(1 - p) * 120}px)` }} />
    </Night>
  );
}

const WINS = ["Speaker similarity", "Equal error rate", "Model complexity", "Inference latency"];

function Results() {
  return (
    <Night>
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 44 }}>
        <Label>Against the LSTM baseline</Label>
        <div style={theme.headline}>
          <Words text="Better *across* *the* *board.*" delay={6} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "26px 80px", marginTop: 10 }}>
          {WINS.map((w, i) => (
            <FadeUp key={w} delay={40 + i * 12} style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: sans, fontSize: 44, color: "#E8ECF2" }}>
              <span style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(79,179,255,0.15)", border: `1px solid ${BLUE}`, display: "grid", placeItems: "center", color: BLUE, fontSize: 28 }}>↑</span>
              {w}
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={100} style={{ fontFamily: sans, fontSize: 30, color: MUTED }}>
          And no recurrent parts: a simpler pipeline that trains and runs in parallel.
        </FadeUp>
      </AbsoluteFill>
    </Night>
  );
}

function End() {
  return (
    <Night>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: 26 }}>
        <Wave bars={60} width={900} height={90} />
        <div style={{ ...theme.headline, fontSize: 140 }}>
          <Words text="Shubham Patil" delay={6} />
        </div>
        <FadeUp delay={26} style={{ fontFamily: sans, fontSize: 34, color: "#E8ECF2" }}>
          Co-author · published in IEEE Xplore
        </FadeUp>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 26, color: MUTED }}>
          With Arundhati Das, Varsha Patil, Jasmin Hirani, Atharva Kaskar &amp; Yash Varma · SIES GST
        </FadeUp>
      </AbsoluteFill>
    </Night>
  );
}

const SCENES = [
  { Scene: Intro, frames: 140 },
  { Scene: Clone, frames: 200 },
  { Scene: Recurrence, frames: 230 },
  { Scene: Training, frames: 200 },
  { Scene: Pipeline, frames: 170 },
  { Scene: Results, frames: 190 },
  { Scene: End, frames: 140 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade(), fade()];

export const SPEAKER_ENCODER_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function SpeakerEncoder() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
