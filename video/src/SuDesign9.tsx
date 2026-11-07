import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InterTight";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
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

const { fontFamily: serif } = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500"], subsets: ["latin"] });

/** The studio's palette: warm paper, deep brown, and the terracotta of its rooms. */
const INK = "#241A17";
const BROWN = "#1E1715";
const theme: Theme = {
  ink: INK,
  muted: "#7A6E68",
  paper: "#F7F3EE",
  accent: "linear-gradient(95deg, #C08467 0%, #9A5240 100%)",
  glow: "rgba(192,132,103,0.18)",
  sans,
  headline: { fontFamily: serif, fontSize: 108, lineHeight: 1, letterSpacing: "-0.02em" },
};

const LIGHT = "rgba(255,255,255,0.75)";

/** A slow push-in on a photo, darkened so type reads over it. */
function Photo({ src, from = 1.04, to = 1.14, shade = 0.45 }: { src: string; from?: number; to?: number; shade?: number }) {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 200], [from, to]);
  return (
    <AbsoluteFill style={{ background: BROWN }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(30,23,21,${shade * 0.6}) 0%, rgba(30,23,21,${shade}) 100%)` }} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
}

function Intro() {
  const rule = useProgress(30, 40);
  return (
    <AbsoluteFill>
      <Photo src="su-design9/photo-hero.webp" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <Label delay={4} color={LIGHT}>
          Interior design studio · Mumbai
        </Label>
        <div style={{ fontFamily: serif, fontSize: 210, lineHeight: 1, letterSpacing: "-0.03em", marginTop: 34 }}>
          <Words text="Su-Design 9" delay={12} stagger={6} />
        </div>
        <div style={{ width: 420 * rule, height: 2, background: theme.accent, marginTop: 40 }} />
        <FadeUp delay={50} style={{ fontFamily: serif, fontStyle: "italic", fontSize: 54, marginTop: 34 }}>
          Elevating the art of living
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Context() {
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "0 160px", justifyContent: "center", gap: 40 }}>
        <Label>The studio</Label>
        <div style={{ ...theme.headline, fontSize: 124, color: INK }}>
          <Words text="Twelve years of *beautiful* *rooms.*" delay={6} />
          <Words text="Nowhere online to show them." delay={34} />
        </div>
        <FadeUp delay={78} style={{ fontFamily: sans, fontSize: 36, color: theme.muted, maxWidth: 1100, lineHeight: 1.4 }}>
          Residential and commercial interiors across Mumbai and Thane, and no website at all.
        </FadeUp>
      </AbsoluteFill>
    </Paper>
  );
}

function Brief() {
  const enter = useProgress(10, 40);
  return (
    <Paper>
      <Split width={600}>
        <Label>The brief</Label>
        <div style={{ ...theme.headline, color: INK }}>
          <Words text="Written *by* *hand.*" delay={6} />
        </div>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 34, color: theme.muted, lineHeight: 1.4 }}>
          The founder's own notes, on her story and the eight stages of a project, became the site map.
        </FadeUp>
      </Split>
      <Pan
        src="su-design9/brief.webp"
        image={{ width: 1500, height: 680 }}
        width={980}
        height={640}
        progress={useBetween(30, 200)}
        style={{ position: "absolute", left: 840, top: 220, opacity: enter, transform: `translateY(${(1 - enter) * 120}px)` }}
      />
    </Paper>
  );
}

function Moodboard() {
  const enter = useProgress(10, 40);
  return (
    <Paper>
      <Split width={560}>
        <Label>Moodboard</Label>
        <div style={{ ...theme.headline, color: INK }}>
          <Words text="Warm, quiet, *editorial.*" delay={6} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={50}>Warm neutrals, deep browns</Point>
          <Point delay={68}>A light, classical serif</Point>
          <Point delay={86}>Room for the photographs</Point>
        </div>
      </Split>
      <Pan
        src="su-design9/moodboard.webp"
        image={{ width: 2400, height: 651 }}
        width={1040}
        height={640}
        progress={useBetween(20, 210)}
        style={{ position: "absolute", left: 790, top: 220, opacity: enter, transform: `translateY(${(1 - enter) * 120}px)` }}
      />
    </Paper>
  );
}

function Iterations() {
  const enter = useProgress(20, 40);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "110px 160px 0", gap: 40 }}>
        <Label>Iterations</Label>
        <div style={{ ...theme.headline, fontSize: 92, color: INK }}>
          <Words text="A dozen versions, *one* *direction.*" delay={6} />
        </div>
        <Pan
          src="su-design9/iterations.webp"
          image={{ width: 2400, height: 867 }}
          width={1600}
          height={660}
          progress={useBetween(40, 220)}
          style={{ opacity: enter, transform: `translateY(${(1 - enter) * 100}px)` }}
        />
      </AbsoluteFill>
    </Paper>
  );
}

/** The site's before-and-after slider, dragged across and back on its own. */
function VisionToReality() {
  const frame = useCurrentFrame();
  const enter = useProgress(10, 40);
  // Start on the empty shell, sweep to the finished room, settle in the middle.
  const split = interpolate(frame, [50, 110, 150, 200], [1, 0.08, 0.08, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t * t * (3 - 2 * t),
  });
  const W = 820;
  const H = 820;
  const tag = { position: "absolute", top: 22, padding: "8px 16px", borderRadius: 6, fontFamily: sans, fontSize: 18, letterSpacing: "0.14em", textTransform: "uppercase" } as const;
  return (
    <AbsoluteFill style={{ background: BROWN }}>
      <Grain opacity={0.08} />
      <Split width={560}>
        <Label color={LIGHT}>On the homepage</Label>
        <div style={{ ...theme.headline, color: "#fff" }}>
          <Words text="Vision *to* *reality.*" delay={6} />
        </div>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 34, color: LIGHT, lineHeight: 1.4 }}>
          Drag between the empty shell and the finished room. It says more than any paragraph could.
        </FadeUp>
      </Split>
      <div style={{ position: "absolute", left: 900, top: 130, width: W, height: H, borderRadius: 18, overflow: "hidden", opacity: enter, transform: `translateY(${(1 - enter) * 120}px)`, boxShadow: "0 60px 120px -30px rgba(0,0,0,0.6)" }}>
        <Img src={staticFile("su-design9/photo-after.webp")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <Img
          src={staticFile("su-design9/photo-before.webp")}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", clipPath: `inset(0 0 0 ${(1 - split) * 100}%)` }}
        />
        <span style={{ ...tag, left: 22, background: "#fff", color: INK }}>Su-Design 9</span>
        <span style={{ ...tag, right: 22, background: "rgba(30,23,21,0.8)", color: "#fff", opacity: split > 0.15 ? 1 : 0 }}>Empty space</span>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(1 - split) * 100}%`, width: 3, marginLeft: -1.5, background: "#fff" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 56, height: 56, margin: "-28px 0 0 -28px", borderRadius: "50%", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 22, color: INK }}>
            ‹ ›
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Website() {
  const enter = useProgress(8, 40);
  const phone = useProgress(60, 40);
  const scroll = useBetween(50, 280);
  return (
    <Paper>
      <Split width={560}>
        <Label>The website</Label>
        <div style={{ ...theme.headline, color: INK }}>
          <Words text="Rooms first, *words* *second.*" delay={6} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
          <Point delay={60}>One action: book a consultation</Point>
          <Point delay={80}>Featured work up front</Point>
          <Point delay={100}>Desktop and phone</Point>
        </div>
      </Split>
      <Browser
        src="su-design9/site-home.webp"
        url="su-design9.in"
        width={940}
        viewport={760}
        image={{ width: 1440, height: 3400 }}
        scroll={scroll}
        style={{ position: "absolute", left: 790, top: 140, opacity: enter, transform: `translateY(${(1 - enter) * 160}px)` }}
      />
      <Phone
        src="su-design9/site-mobile.webp"
        image={{ width: 412, height: 2400 }}
        width={290}
        scroll={scroll}
        style={{ position: "absolute", left: 1560, top: 330, opacity: phone, transform: `translateY(${(1 - phone) * 300}px)` }}
      />
    </Paper>
  );
}

function PageCard({ src, url, height, index, scroll }: { src: string; url: string; height: number; index: number; scroll: number }) {
  const enter = useProgress(24 + index * 10, 40);
  return (
    <Browser
      src={src}
      url={url}
      width={500}
      viewport={560}
      image={{ width: 1440, height }}
      scroll={scroll}
      style={{ position: "absolute", left: 160 + index * 550, top: 400, opacity: enter, transform: `translateY(${(1 - enter) * 140}px)` }}
    />
  );
}

function Pages() {
  const pages = [
    { src: "su-design9/site-about.webp", url: "su-design9.in/about", height: 3050 },
    { src: "su-design9/site-services.webp", url: "su-design9.in/services", height: 2600 },
    { src: "su-design9/site-project.webp", url: "su-design9.in/projects/153-skye", height: 2900 },
  ];
  const scroll = useBetween(50, 230);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: "100px 160px 0", gap: 36 }}>
        <Label>And every page after</Label>
        <div style={{ ...theme.headline, fontSize: 92, color: INK }}>
          <Words text="Her story, her services, *her* *rooms.*" delay={6} />
        </div>
      </AbsoluteFill>
      {pages.map((page, i) => (
        <PageCard key={page.src} {...page} index={i} scroll={scroll} />
      ))}
    </Paper>
  );
}

function End() {
  return (
    <AbsoluteFill>
      <Photo src="su-design9/photo-after.webp" shade={0.72} from={1.1} to={1.02} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
        <div style={{ fontFamily: serif, fontSize: 170, lineHeight: 1, letterSpacing: "-0.03em" }}>
          <Words text="Shubham Patil" delay={8} />
        </div>
        <FadeUp delay={30} style={{ fontFamily: sans, fontWeight: 500, fontSize: 36, marginTop: 30 }}>
          Sole designer &amp; developer, Su-Design 9
        </FadeUp>
        <FadeUp delay={40} style={{ fontFamily: sans, fontSize: 28, marginTop: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
          su-design9.in
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const SCENES = [
  { Scene: Intro, frames: 150 },
  { Scene: Context, frames: 165 },
  { Scene: Brief, frames: 210 },
  { Scene: Moodboard, frames: 225 },
  { Scene: Iterations, frames: 225 },
  { Scene: VisionToReality, frames: 240 },
  { Scene: Website, frames: 300 },
  { Scene: Pages, frames: 240 },
  { Scene: End, frames: 150 },
];
const OVERLAP = 18;
const TRANSITIONS = [fade(), fade(), slide({ direction: "from-right" }), slide({ direction: "from-right" }), fade(), fade(), slide({ direction: "from-bottom" }), fade()];

export const SU_DESIGN9_DURATION = scenesDuration(SCENES, TRANSITIONS.length, OVERLAP);

export function SuDesign9() {
  return (
    <ThemeContext.Provider value={theme}>
      <Scenes scenes={SCENES} transitions={TRANSITIONS} overlap={OVERLAP} />
    </ThemeContext.Provider>
  );
}
