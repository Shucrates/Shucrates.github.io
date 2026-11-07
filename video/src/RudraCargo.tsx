import { loadFont as loadSans } from "@remotion/google-fonts/InterTight";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  Browser,
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

const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

/** The app's own look: deep navy, slate greys and the blue of the company's trucks. */
const NAVY = "#0B1E33";
const theme: Theme = {
  ink: NAVY,
  muted: "#5B6B7F",
  paper: "#F5F7FA",
  accent: "linear-gradient(95deg, #1E5FD8 0%, #3E9BE8 100%)",
  glow: "rgba(62,155,232,0.16)",
  sans,
  headline: { fontFamily: sans, fontWeight: 600, fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.035em" },
};
const LIGHT = "rgba(255,255,255,0.72)";

function Navy({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 80% 20%, #1C4E8A 0%, ${NAVY} 55%)` }}>
      <Grain opacity={0.08} />
      {children}
    </AbsoluteFill>
  );
}

function Intro() {
  const frame = useCurrentFrame();
  const number = Math.min(1053, Math.round(interpolate(frame, [30, 90], [1001, 1053], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <Navy>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <Label delay={4} color={LIGHT}>
          Transport &amp; logistics · Mumbai
        </Label>
        <div style={{ ...theme.headline, fontSize: 190, marginTop: 30 }}>
          <Words text="Rudra Cargo" delay={10} stagger={6} />
        </div>
        <FadeUp delay={30} style={{ marginTop: 40, padding: "14px 30px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.25)", fontFamily: sans, fontWeight: 500, fontSize: 40, letterSpacing: "0.06em", fontVariantNumeric: "tabular-nums" }}>
          LR-2026-{String(number).padStart(5, "0")}
        </FadeUp>
      </AbsoluteFill>
    </Navy>
  );
}

function Problem() {
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 44 }}>
        <Label>Before</Label>
        <div style={{ ...theme.headline, fontSize: 112, color: NAVY }}>
          <Words text="Every shipment ran on" delay={6} />
          <Words text="a *handwritten* *receipt.*" delay={22} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={64}>Lorry receipts written from a paper booklet</Point>
          <Point delay={82}>Totals worked out by hand</Point>
          <Point delay={100}>Cash collected, but not tied to any shipment</Point>
        </div>
      </AbsoluteFill>
    </Paper>
  );
}

/** The LR creator's steps, and which captured frames belong to each. */
const STEPS = [
  { name: "Consignor", frames: ["01", "02"] },
  { name: "Consignee", frames: ["03"] },
  { name: "Route & date", frames: ["04"] },
  { name: "Shipment details", frames: ["05"] },
  { name: "Transport", frames: ["06", "07", "08"] },
  { name: "Freight charges", frames: ["09", "10", "11", "12"] },
  { name: "Payment", frames: ["13", "14", "15"] },
];
const SHOTS = STEPS.flatMap((step, i) => step.frames.map((id) => ({ id, step: i })));
const PER_SHOT = 34;
const LR_START = 50;

function LrCreator() {
  const frame = useCurrentFrame();
  const enter = useProgress(10, 40);
  const t = Math.max(0, frame - LR_START) / PER_SHOT;
  const index = Math.min(SHOTS.length - 1, Math.floor(t));
  // Crossfade into each new frame over its first third.
  const blend = index === SHOTS.length - 1 && t >= SHOTS.length ? 1 : Math.min(1, (t - index) * 3);
  const current = SHOTS[index];
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "0 0 0 110px", justifyContent: "center" }}>
        <div style={{ width: 470, display: "flex", flexDirection: "column", gap: 30 }}>
          <Label>The LR creator</Label>
          <div style={{ ...theme.headline, fontSize: 76, color: NAVY }}>
            <Words text="Fill the form, *watch* *the* *docket.*" delay={6} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            {STEPS.map((step, i) => {
              const active = i === current.step && frame >= LR_START;
              const done = i < current.step;
              return (
                <FadeUp key={step.name} delay={30 + i * 4} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: sans, fontSize: 30, fontWeight: active ? 600 : 400, color: active ? NAVY : done ? theme.muted : "#A3AEBB" }}>
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      color: active || done ? "#fff" : "#A3AEBB",
                      background: active ? theme.accent : done ? NAVY : "transparent",
                      border: active || done ? "none" : "2px solid #CBD3DC",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  {step.name}
                </FadeUp>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 660, top: 150, opacity: enter, transform: `translateY(${(1 - enter) * 140}px)` }}>
        <div style={{ position: "relative" }}>
          <Browser src={`rudra-cargo/lr-${SHOTS[Math.max(0, index - 1)].id}.webp`} url="admin.rudracargo.com · New LR" width={1160} viewport={725} image={{ width: 1440, height: 900 }} />
          <Img
            src={staticFile(`rudra-cargo/lr-${current.id}.webp`)}
            style={{ position: "absolute", left: 0, top: 46, width: 1160, height: 725, objectFit: "cover", objectPosition: "top", opacity: blend, borderRadius: "0 0 18px 18px" }}
          />
        </div>
      </div>
    </Paper>
  );
}

function Operations() {
  const enter = useProgress(8, 40);
  const scroll = useBetween(60, 250);
  return (
    <Paper>
      <Split width={560}>
        <Label>Operations</Label>
        <div style={{ ...theme.headline, color: NAVY }}>
          <Words text="Every LR, bill and *rupee* *in* *one* *place.*" delay={6} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={60}>What needs doing, at a glance</Point>
          <Point delay={78}>An audit log of every action</Point>
          <Point delay={96}>Voids stay visible, with a reason</Point>
        </div>
      </Split>
      <Browser
        src="rudra-cargo/admin-dashboard.webp"
        url="admin.rudracargo.com"
        width={1040}
        viewport={760}
        image={{ width: 1440, height: 1381 }}
        scroll={scroll}
        style={{ position: "absolute", left: 790, top: 140, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}
      />
    </Paper>
  );
}

function Cash() {
  const enter = useProgress(8, 40);
  const swap = useBetween(120, 150);
  const frame = { position: "absolute", left: 0, top: 0 } as const;
  return (
    <Navy>
      <Split width={560}>
        <Label color={LIGHT}>Money</Label>
        <div style={{ ...theme.headline, color: "#fff" }}>
          <Words text="Follow *the* *cash.*" delay={6} />
        </div>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 34, color: LIGHT, lineHeight: 1.4 }}>
          Cash expected and cash collected are logged by the person who handled each, so the gap where money went missing is gone.
        </FadeUp>
      </Split>
      <div style={{ position: "absolute", left: 790, top: 170, width: 1040, height: 720, opacity: enter, transform: `translateY(${(1 - enter) * 140}px)` }}>
        <Browser src="rudra-cargo/admin-customers.webp" url="admin.rudracargo.com · Customers" width={1040} viewport={650} image={{ width: 1440, height: 900 }} style={{ ...frame, opacity: 1 - swap }} />
        <Browser src="rudra-cargo/admin-cash-book.webp" url="admin.rudracargo.com · Cash book" width={1040} viewport={650} image={{ width: 1440, height: 900 }} style={{ ...frame, opacity: swap }} />
      </div>
    </Navy>
  );
}

function Tracking() {
  const enter = useProgress(8, 40);
  const phone = useProgress(50, 40);
  return (
    <Paper>
      <Split width={560}>
        <Label>For customers</Label>
        <div style={{ ...theme.headline, color: NAVY }}>
          <Words text="Track it with *the* *LR* *number.*" delay={6} />
        </div>
        <FadeUp delay={44} style={{ fontFamily: sans, fontSize: 34, color: theme.muted, lineHeight: 1.4 }}>
          Every shipment is booked against a digital LR, so customers can follow it from booking to delivery.
        </FadeUp>
      </Split>
      <Browser
        src="rudra-cargo/site-home.webp"
        url="rudracargo.com"
        width={960}
        viewport={600}
        image={{ width: 1440, height: 1339 }}
        style={{ position: "absolute", left: 790, top: 200, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}
      />
      <Phone
        src="rudra-cargo/site-mobile.webp"
        image={{ width: 412, height: 1619 }}
        width={290}
        scroll={useBetween(90, 200)}
        style={{ position: "absolute", left: 1580, top: 330, opacity: phone, transform: `translateY(${(1 - phone) * 300}px)` }}
      />
    </Paper>
  );
}

function End() {
  return (
    <Navy>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <div style={{ ...theme.headline, fontSize: 150 }}>
          <Words text="Shubham Patil" delay={8} />
        </div>
        <FadeUp delay={30} style={{ fontFamily: sans, fontWeight: 500, fontSize: 36, marginTop: 30 }}>
          Sole designer &amp; developer, Rudra Cargo
        </FadeUp>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 28, marginTop: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
          Next.js · Prisma · PostgreSQL
        </FadeUp>
      </AbsoluteFill>
    </Navy>
  );
}

const SCENES = [
  { Scene: Intro, frames: 120 },
  { Scene: Problem, frames: 180 },
  { Scene: LrCreator, frames: LR_START + SHOTS.length * PER_SHOT + 60 },
  { Scene: Operations, frames: 270 },
  { Scene: Cash, frames: 240 },
  { Scene: Tracking, frames: 210 },
  { Scene: End, frames: 135 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), slide({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" }), fade(), fade()];

export const RUDRA_CARGO_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function RudraCargo() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
