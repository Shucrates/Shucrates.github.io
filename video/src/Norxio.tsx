import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadDisplay } from "@remotion/google-fonts/RethinkSans";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import {
  Browser,
  FadeUp,
  Grain,
  Label,
  Pan,
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

const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500"], subsets: ["latin"] });
const { fontFamily: display } = loadDisplay("normal", { weights: ["400", "500"], subsets: ["latin"] });

/** Norxio's own look: the deep navy of its footer and buttons, a brighter blue, Rethink Sans headlines. */
const NAVY = "#09325E";
const theme: Theme = {
  ink: "#181B1D",
  muted: "#5E6873",
  paper: "#F2F6F8",
  accent: "linear-gradient(95deg, #2E6BC6 0%, #5FA8F5 100%)",
  glow: "rgba(95,168,245,0.18)",
  sans,
  headline: { fontFamily: display, fontWeight: 400, fontSize: 96, lineHeight: 1.04, letterSpacing: "-0.035em" },
};

const LIGHT = "rgba(242,248,249,0.74)";

function Navy({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 78% 18%, #1D5BA6 0%, ${NAVY} 52%, #061F3B 100%)` }}>
      <Grain opacity={0.07} />
      {children}
    </AbsoluteFill>
  );
}

function Intro() {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 130], [1.06, 1.16]);
  const logo = useProgress(6, 30);
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <Img src={staticFile("norxio/ship.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(9,50,94,0.55) 0%, rgba(6,31,59,0.88) 100%)` }} />
      <Grain opacity={0.08} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <Img
          src={staticFile("norxio/logo.png")}
          style={{ width: 520, filter: "brightness(0) invert(1)", opacity: logo, transform: `translateY(${(1 - logo) * 30}px)` }}
        />
        <div style={{ ...theme.headline, fontSize: 64, marginTop: 56, color: "#fff" }}>
          <Words text="The *AI* operating layer for global trade payments" delay={26} stagger={3} />
        </div>
        <div style={{ marginTop: 40 }}>
          <Label delay={52} color={LIGHT}>
            Dashboard &amp; website · Design intern · 2026
          </Label>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Problem() {
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 44 }}>
        <Label>The problem</Label>
        <div style={{ ...theme.headline, fontSize: 112, color: theme.ink }}>
          <Words text="Every payment comes" delay={6} />
          <Words text="with *paperwork.*" delay={20} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={60}>Invoices, purchase orders and receipts in different places</Point>
          <Point delay={78}>Matched by hand, one payment at a time</Point>
          <Point delay={96}>Mismatches found after the money has gone</Point>
        </div>
      </AbsoluteFill>
    </Paper>
  );
}

function Dashboard() {
  const enter = useProgress(8, 40);
  const swap = useBetween(95, 130);
  const scroll = useBetween(150, 230);
  const label = { position: "absolute", top: -54, left: 4, fontFamily: sans, fontWeight: 500, fontSize: 22, letterSpacing: "0.16em", textTransform: "uppercase" } as const;
  const frame = { position: "absolute", left: 0, top: 0 } as const;
  return (
    <Paper>
      <Split width={540}>
        <Label>The dashboard</Label>
        <div style={{ ...theme.headline, color: theme.ink }}>
          <Words text="From a wall of widgets to *what* *needs* *you.*" delay={6} />
        </div>
        <FadeUp delay={50} style={{ fontFamily: sans, fontSize: 32, color: theme.muted, lineHeight: 1.4 }}>
          Balances, money in and out, bills due this week, and what Norxio saved against a bank.
        </FadeUp>
      </Split>
      <div style={{ position: "absolute", left: 770, top: 170, width: 1060, height: 760, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}>
        <span style={{ ...label, color: theme.muted, opacity: 1 - swap }}>Before</span>
        <span style={{ ...label, color: "#2E6BC6", opacity: swap }}>After</span>
        <Browser src="norxio/dashboard-before.webp" url="app.norxio.com" width={1060} viewport={700} image={{ width: 1440, height: 1488 }} style={{ ...frame, opacity: 1 - swap }} />
        <Browser
          src="norxio/dashboard.webp"
          url="app.norxio.com"
          width={1060}
          viewport={700}
          image={{ width: 1440, height: 1232 }}
          scroll={scroll}
          style={{ ...frame, opacity: swap, transform: `scale(${0.96 + swap * 0.04})` }}
        />
      </div>
    </Paper>
  );
}

function Process() {
  const pan = useBetween(20, 170);
  const enter = useProgress(4, 30);
  return (
    <Navy>
      <AbsoluteFill style={{ padding: "150px 160px 0", gap: 30, color: "#fff" }}>
        <Label color={LIGHT}>Process</Label>
        <div style={{ ...theme.headline, fontSize: 88 }}>
          <Words text="References, versions, *then* *the* *details.*" delay={6} />
        </div>
      </AbsoluteFill>
      <Pan
        src="norxio/dashboard-board.webp"
        image={{ width: 2400, height: 599 }}
        width={1600}
        height={460}
        progress={pan}
        style={{ position: "absolute", left: 160, top: 470, opacity: enter, transform: `translateY(${(1 - enter) * 80}px)` }}
      />
    </Navy>
  );
}

const STATUSES = [
  { name: "Matched", color: "#1F9D5B", bg: "#E3F5EB" },
  { name: "Needs context", color: "#B7791F", bg: "#FDF1DC" },
  { name: "Manual review", color: "#C53030", bg: "#FBE4E4" },
];

function Reconciliation() {
  const enter = useProgress(8, 40);
  const detail = useProgress(120, 40);
  return (
    <Navy>
      <Split width={560}>
        <Label color={LIGHT}>Reconciliation</Label>
        <div style={{ ...theme.headline, fontSize: 88, color: "#fff" }}>
          <Words text="Check the paperwork *before* *the* *money* *moves.*" delay={6} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          {STATUSES.map((status, i) => (
            <FadeUp
              key={status.name}
              delay={50 + i * 10}
              style={{ fontFamily: sans, fontWeight: 500, fontSize: 22, padding: "9px 18px", borderRadius: 999, color: status.color, background: status.bg }}
            >
              {status.name}
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={90} style={{ fontFamily: sans, fontSize: 30, color: LIGHT, lineHeight: 1.4 }}>
          An AI insight explains each mismatch in plain language, with the documents behind it.
        </FadeUp>
      </Split>
      <Browser
        src="norxio/reconciliation.webp"
        url="app.norxio.com · Reconciliation"
        width={1000}
        viewport={690}
        image={{ width: 1440, height: 1151 }}
        style={{ position: "absolute", left: 790, top: 150, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}
      />
      <div
        style={{
          position: "absolute",
          left: 1290,
          top: 250,
          width: 560,
          height: 760,
          overflow: "hidden",
          borderRadius: 18,
          boxShadow: "0 50px 100px -20px rgba(0,0,0,0.55)",
          opacity: detail,
          transform: `translateX(${(1 - detail) * 260}px)`,
        }}
      >
        <Img src={staticFile("norxio/reconciliation-detail.webp")} style={{ width: 560, display: "block", transform: `translateY(${-useBetween(170, 250) * (560 * (1488 / 1049) - 760)}px)` }} />
      </div>
    </Navy>
  );
}

function Fx() {
  const enter = useProgress(8, 40);
  const swap = useBetween(110, 140);
  const frame = { position: "absolute", left: 0, top: 0 } as const;
  return (
    <Paper>
      <Split width={540}>
        <Label>FX &amp; transactions</Label>
        <div style={{ ...theme.headline, color: theme.ink }}>
          <Words text="Lock a rate, *see* *every* *fee.*" delay={6} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={50}>Spot or forward contracts</Point>
          <Point delay={66}>Your rate beside mid-market</Point>
          <Point delay={82}>Failed payments stay visible</Point>
        </div>
      </Split>
      <div style={{ position: "absolute", left: 770, top: 160, width: 1060, height: 760, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}>
        <Browser
          src="norxio/fx.webp"
          url="app.norxio.com · FX exchange"
          width={1060}
          viewport={700}
          image={{ width: 1440, height: 1347 }}
          scroll={useBetween(40, 110)}
          style={{ ...frame, opacity: 1 - swap }}
        />
        <Browser src="norxio/transactions.webp" url="app.norxio.com · Transactions" width={1060} viewport={700} image={{ width: 1440, height: 1151 }} scroll={useBetween(150, 200)} style={{ ...frame, opacity: swap }} />
      </div>
    </Paper>
  );
}

function Documents() {
  const enter = useProgress(8, 40);
  const invoice = useProgress(70, 40);
  return (
    <Paper>
      <Split width={520}>
        <Label>Documents &amp; invoices</Label>
        <div style={{ ...theme.headline, color: theme.ink }}>
          <Words text="Every file *tied* *to* *a* *payment.*" delay={6} />
        </div>
        <FadeUp delay={50} style={{ fontFamily: sans, fontSize: 32, color: theme.muted, lineHeight: 1.4 }}>
          Invoices go out on a schedule, with reminders before and after the due date.
        </FadeUp>
      </Split>
      <Browser
        src="norxio/documents.webp"
        url="app.norxio.com · Documents"
        width={900}
        viewport={640}
        image={{ width: 1440, height: 1024 }}
        style={{ position: "absolute", left: 740, top: 130, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}
      />
      <Browser
        src="norxio/invoice-send.webp"
        url="app.norxio.com · Invoices"
        width={820}
        viewport={570}
        image={{ width: 1440, height: 1119 }}
        scroll={useBetween(120, 190)}
        style={{ position: "absolute", left: 1010, top: 400, opacity: invoice, transform: `translateY(${(1 - invoice) * 200}px)` }}
      />
    </Paper>
  );
}

function Website() {
  const frame = useCurrentFrame();
  const board = useProgress(4, 30);
  const out = useBetween(90, 115);
  const site = useProgress(105, 40);
  const phone = useProgress(135, 40);
  const zoom = interpolate(frame, [0, 110], [1, 1.12]);
  return (
    <Navy>
      <AbsoluteFill style={{ padding: "0 0 0 160px", justifyContent: "center" }}>
        <div style={{ width: 520, display: "flex", flexDirection: "column", gap: 34, color: "#fff" }}>
          <Label color={LIGHT}>The website</Label>
          <div style={{ ...theme.headline, fontSize: 88 }}>
            <Words text="Dozens of heroes, *one* *calm* *page.*" delay={6} />
          </div>
          <FadeUp delay={50} style={{ fontFamily: sans, fontSize: 30, color: LIGHT, lineHeight: 1.4 }}>
            Ports, cranes and cargo ships, dark and light, until the headline could breathe.
          </FadeUp>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 170,
          width: 1060,
          height: 740,
          overflow: "hidden",
          borderRadius: 18,
          boxShadow: "0 50px 100px -30px rgba(0,0,0,0.5)",
          opacity: board * (1 - out),
        }}
      >
        <Img src={staticFile("norxio/site-iterations.webp")} style={{ width: 1352, display: "block", transformOrigin: "30% 20%", transform: `scale(${zoom})` }} />
      </div>
      <Browser
        src="norxio/site-home.webp"
        url="norxio.com"
        width={960}
        viewport={620}
        image={{ width: 1440, height: 6289 }}
        scroll={useBetween(150, 330) * 0.62}
        style={{ position: "absolute", left: 760, top: 200, opacity: site, transform: `translateY(${(1 - site) * 160}px)` }}
      />
      <Phone
        src="norxio/site-mobile.webp"
        image={{ width: 412, height: 6652 }}
        width={280}
        scroll={useBetween(170, 330) * 0.35}
        style={{ position: "absolute", left: 1580, top: 330, opacity: phone, transform: `translateY(${(1 - phone) * 300}px)` }}
      />
    </Navy>
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
          UI/UX &amp; Frontend Design Intern, Norxio
        </FadeUp>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 28, marginTop: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
          Dashboard · Website · Figma
        </FadeUp>
      </AbsoluteFill>
    </Navy>
  );
}

const SCENES = [
  { Scene: Intro, frames: 120 },
  { Scene: Problem, frames: 170 },
  { Scene: Dashboard, frames: 250 },
  { Scene: Process, frames: 180 },
  { Scene: Reconciliation, frames: 270 },
  { Scene: Fx, frames: 220 },
  { Scene: Documents, frames: 200 },
  { Scene: Website, frames: 340 },
  { Scene: End, frames: 135 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), slide({ direction: "from-right" }), fade(), fade(), slide({ direction: "from-bottom" }), fade(), fade(), fade()];

export const NORXIO_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function Norxio() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
